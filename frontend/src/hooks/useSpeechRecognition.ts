import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useSpeechRecognition = () => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const debounceTimer = useRef<any>(null);

  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  useEffect(() => {
    const hasSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    console.log('[Voice] SpeechRecognition supported:', hasSpeech);
    console.log('[Voice] Running on:', window.location.protocol, window.location.hostname);

    if (!hasSpeech) {
      console.error('[Voice] ❌ Speech recognition NOT supported in this browser/context.');
      console.error('[Voice] NOTE: Web Speech API requires HTTPS or localhost. If testing on a physical device over HTTP, it will not work.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('[Voice] 🎙️ Microphone started listening...');
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      const t = currentTranscript.trim();
      if (!t) return;

      console.log(`[Voice] 📝 Transcript: "${t}"`);
      setTranscript(t);
      // Stop after capturing final result
      recognition.stop();
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] ❌ Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setSpeechError('not-allowed');
        console.error('[Voice] Microphone permission was DENIED. Please allow microphone access in browser/app settings.');
      } else if (event.error === 'network') {
        setSpeechError('network');
        console.error('[Voice] Network error - Google Speech API requires internet access.');
      } else if (event.error === 'no-speech') {
        setSpeechError('no-speech');
        console.warn('[Voice] No speech detected. Try speaking louder or closer to the mic.');
      } else {
        setSpeechError(event.error);
      }
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[Voice] 🔴 Recognition ended.');
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    console.log('[Voice] ✅ SpeechRecognition instance created successfully.');
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('[Voice] ❌ Cannot start: SpeechRecognition not initialized.');
      return;
    }
    if (isListeningRef.current) {
      console.warn('[Voice] Already listening, skipping start.');
      return;
    }

    setSpeechError(null);
    setTranscript('');

    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'pa': 'pa-IN',
      'gu': 'gu-IN',
      'bn': 'bn-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN'
    };

    const currentLang = i18n.language || 'en';
    const mappedLang = langMap[currentLang] || 'en-US';
    recognitionRef.current.lang = mappedLang;

    console.log(`[Voice] 🟢 Starting listening... (lang: ${mappedLang})`);
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('[Voice] ❌ Error calling recognition.start():', e);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log('[Voice] 🛑 Manually stopping recognition...');
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      recognitionRef.current.stop();
    }
  }, []);

  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  return { isListening, transcript, setTranscript, startListening, stopListening, isSupported, speechError, clearError };
};
