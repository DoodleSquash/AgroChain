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
  const { 
    isListening: isListeningHook, 
    transcript, 
    setTranscript, 
    startListening: startListeningHook, 
    stopListening: stopListeningHook, 
    isSupported: isSupportedHook, 
    speechError, 
    clearError 
  } = useSpeechRecognition();
  
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [schema, setSchema] = useState<string>('');
  const intentCallbackRef = useRef<((intent: any) => void) | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedTranscriptRef = useRef('');

  // Conversational state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const detectedLangRef = useRef('en-IN');

  // MediaRecorder Fallback State
  const [isRecordingLocal, setIsRecordingLocal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const useWhisperFallback = !isSupportedHook || speechError === 'network';

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

    const mainLang = bcp47Lang.split('-')[0].toLowerCase();
    const langVoices = voices.filter(v => 
      v.lang.toLowerCase() === bcp47Lang.toLowerCase() || 
      v.lang.toLowerCase().startsWith(mainLang)
    );

    const femalePatterns = ['female', 'woman', 'zira', 'aditi', 'swara', 'lekha', 'google हिन्दी'];
    
    for (const v of langVoices) {
      const name = v.name.toLowerCase();
      if (femalePatterns.some(p => name.includes(p))) return v;
    }
    
    const indianVoices = voices.filter(v => v.lang.toLowerCase().includes('in'));
    for (const v of indianVoices) {
      const name = v.name.toLowerCase();
      if (femalePatterns.some(p => name.includes(p))) return v;
    }

    if (langVoices.length > 0) return langVoices[0];

    return voices[0] || null;
  };

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
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
    utt.pitch = 1.0;
    
    if (onEnd) {
      utt.onend = () => {
        setTimeout(onEnd, 300);
      };
    }
    
    window.speechSynthesis.speak(utt);
    console.log(`[TTS] Speaking (${utt.lang}): "${text}"`);
  }, []);

  const processText = useCallback(async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    
    console.log(`[VoiceContext] 📝 Processing text: "${textToProcess}"`);
      
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
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[VoiceContext] ❌ Backend returned error:', data.error, data.details || '');
        if (window.speechSynthesis) speak("Sorry, I encountered an error connecting to the server.");
        return;
      }

      if (data.intent?.detectedLanguage) {
        detectedLangRef.current = data.intent.detectedLanguage;
      }

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (window.speechSynthesis) {
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
  }, [schema, i18n.language, messages, speak, navigate, setTranscript]);

  const startLocalRecording = async () => {
    try {
      console.log('[VoiceContext] 🎙️ Initializing MediaRecorder for Whisper fallback...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[VoiceContext] 🛑 MediaRecorder stopped. Packaging audio...');
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioBlob.size === 0) {
          console.warn('[VoiceContext] Audio blob is empty.');
          return;
        }

        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, `audio.${mimeType.split('/')[1] || 'webm'}`);

          console.log(`[VoiceContext] 🧠 Sending audio to Whisper: ${API}/voice/transcribe`);
          const response = await fetch(`${API}/voice/transcribe`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }

          const data = await response.json();
          if (data.text && data.text.trim()) {
            console.log(`[VoiceContext] 📝 Whisper Transcription: "${data.text}"`);
            await processText(data.text);
          } else {
            console.warn('[VoiceContext] Whisper returned empty transcription.');
            if (window.speechSynthesis) speak("Sorry, I could not hear any speech. Please try again.");
          }
        } catch (err: any) {
          console.error('[VoiceContext] ❌ Transcription upload failed:', err.message);
          if (window.speechSynthesis) speak("Sorry, I had trouble processing your voice audio.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecordingLocal(true);
      console.log('[VoiceContext] 🔴 MediaRecorder started recording.');
    } catch (err: any) {
      console.error('[VoiceContext] ❌ Failed to start MediaRecorder:', err.message);
      if (window.speechSynthesis) speak("Microphone access failed. Please enable microphone permissions.");
    }
  };

  const stopLocalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecordingLocal(false);
    }
  };

  const startListening = useCallback(() => {
    if (useWhisperFallback) {
      startLocalRecording();
    } else {
      startListeningHook();
    }
  }, [useWhisperFallback, startListeningHook]);

  const stopListening = useCallback(() => {
    if (isRecordingLocal) {
      stopLocalRecording();
    } else {
      stopListeningHook();
    }
  }, [isRecordingLocal, stopListeningHook]);

  useEffect(() => {
    if (!transcript || isListeningHook || transcript === processedTranscriptRef.current) return;
    processedTranscriptRef.current = transcript;
    processText(transcript);
  }, [transcript, isListeningHook, processText]);

  const isListening = isListeningHook || isRecordingLocal;
  const isSupported = isSupportedHook || !!(typeof window !== 'undefined' && window.navigator?.mediaDevices && typeof window.navigator.mediaDevices.getUserMedia === 'function' && typeof window.MediaRecorder !== 'undefined');

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
