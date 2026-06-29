import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { API } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceContextType {
  setSchema: (schema: string) => void;
  setOnIntentCallback: (cb: (intent: any) => void) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  isProcessing: boolean;
  isSupported: boolean;
  speechError: string | null;
  clearError: () => void;
  messages: ChatMessage[];
  clearMessages: () => void;
  processText: (text: string) => Promise<void>;
}

export const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isListening, transcript, setTranscript, startListening, stopListening, isSupported, speechError, clearError } = useSpeechRecognition();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [schema, setSchema] = useState<string>('');
  const intentCallbackRef = useRef<((intent: any) => void) | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedTranscriptRef = useRef('');

  // Conversational state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const detectedLangRef = useRef('en-IN');

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setOnIntentCallback = useCallback((cb: (intent: any) => void) => {
    intentCallbackRef.current = cb;
  }, []);

  // Pre-load voices so they are ready
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ── TTS Global Handler ──
  const getBestFemaleVoice = (bcp47Lang: string) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Filter to voices matching the language (e.g. en-IN or hi-IN)
    // fallback to just language code if exact match fails
    const mainLang = bcp47Lang.split('-')[0].toLowerCase();
    const langVoices = voices.filter(v => 
      v.lang.toLowerCase() === bcp47Lang.toLowerCase() || 
      v.lang.toLowerCase().startsWith(mainLang)
    );

    // Known female/Indian voice patterns
    const femalePatterns = ['female', 'woman', 'zira', 'aditi', 'swara', 'lekha', 'google हिन्दी'];
    
    // 1. Try to find a exact lang match + female
    for (const v of langVoices) {
      const name = v.name.toLowerCase();
      if (femalePatterns.some(p => name.includes(p))) return v;
    }
    
    // 2. Try to find any Indian female voice as fallback
    const indianVoices = voices.filter(v => v.lang.toLowerCase().includes('in'));
    for (const v of indianVoices) {
      const name = v.name.toLowerCase();
      if (femalePatterns.some(p => name.includes(p))) return v;
    }

    // 3. Fallback to just language match
    if (langVoices.length > 0) return langVoices[0];

    // 4. Default
    return voices[0] || null;
  };

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel(); // stop any previous speech
    const utt = new SpeechSynthesisUtterance(text);
    
    const bestVoice = getBestFemaleVoice(detectedLangRef.current);
    if (bestVoice) {
      utt.voice = bestVoice;
      utt.lang = bestVoice.lang;
      console.log(`[TTS] Selected Voice: ${bestVoice.name} (${bestVoice.lang})`);
    } else {
      utt.lang = detectedLangRef.current;
    }
    
    utt.rate = 1.0;
    utt.pitch = 1.0; // Sometimes setting pitch slightly higher (1.1) sounds more feminine, but natural voices prefer 1.0
    
    if (onEnd) {
      utt.onend = () => {
        // Small delay before triggering the next action (like restarting mic)
        setTimeout(onEnd, 300);
      };
    }
    
    window.speechSynthesis.speak(utt);
    console.log(`[TTS] Speaking (${utt.lang}): "${text}"`);
  }, []);

  const processText = useCallback(async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    
    console.log(`[VoiceContext] 📝 Processing text: "${textToProcess}"`);
      
    // Add user message to UI
    const newMessages = [...messages, { role: 'user' as const, content: textToProcess }];
    setMessages(newMessages);

    setIsProcessing(true);
    console.log(`[VoiceContext] 🧠 Sending to AI backend: ${API}/voice/intent`);

    try {
      const response = await fetch(`${API}/voice/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToProcess,
          schema,
          language: i18n.language,
          conversationHistory: messages // send past history
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[VoiceContext] ❌ Backend returned error:', data.error, data.details || '');
        if (window.speechSynthesis) speak("Sorry, I encountered an error connecting to the server.");
        return;
      }

      // Update language if detected
      if (data.intent?.detectedLanguage) {
        detectedLangRef.current = data.intent.detectedLanguage;
      }

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (window.speechSynthesis) {
          // No auto-restart — mic only activates on explicit user click
          speak(data.response);
        }
      }

      if (data.intent && data.intent.action === 'GLOBAL_NAVIGATE' && data.intent.fields?.route) {
        console.log('[VoiceContext] 🧭 Global Navigation to:', data.intent.fields.route);
        navigate(data.intent.fields.route);
        return;
      }

      if (data.intent && data.intent.action && intentCallbackRef.current) {
        console.log('[VoiceContext] ✅ Executing intent:', JSON.stringify(data.intent));
        intentCallbackRef.current(data.intent);
      }
    } catch (err) {
      console.error('[VoiceContext] ❌ Fetch failed:', err);
      if (window.speechSynthesis) speak("Sorry, there was a network error.");
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [schema, i18n.language, messages, startListening, speak, navigate, setTranscript]);

  useEffect(() => {
    // Avoid processing the same transcript twice
    if (!transcript || isListening || transcript === processedTranscriptRef.current) return;

    processedTranscriptRef.current = transcript;
    
    processText(transcript);
  }, [transcript, isListening, processText]);

  return (
    <VoiceContext.Provider value={{ 
      setSchema, setOnIntentCallback, 
      isListening, startListening, stopListening, isProcessing, isSupported,
      speechError, clearError,
      messages, clearMessages, processText
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (schema: string, onIntent: (intent: any) => void) => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used within a VoiceProvider");

  const onIntentRef = useRef(onIntent);
  useEffect(() => { onIntentRef.current = onIntent; }, [onIntent]);

  const stableCallback = useCallback((intent: any) => {
    onIntentRef.current(intent);
  }, []);

  useEffect(() => {
    context.setOnIntentCallback(stableCallback);
  }, [stableCallback, context]);

  useEffect(() => {
    context.setSchema(schema);
    return () => {
      context.setSchema('');
    };
  }, [schema, context]);

  return context;
};
