import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SpeechError = 'network' | 'not-allowed' | 'no-speech' | 'aborted' | null;

export const useSpeechRecognition = () => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<SpeechError>(null);
  // Hard-lock: after a blocking error (network/not-allowed) we refuse all
  // automatic or accidental restarts until the user explicitly clears the lock.
  const errorLockRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const hasSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    console.log('[Voice] SpeechRecognition supported:', hasSpeech);
    console.log('[Voice] Running on:', window.location.protocol, window.location.hostname);

    if (!hasSpeech) {
      console.error('[Voice] ❌ Speech recognition NOT supported in this browser/context.');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
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
      recognition.stop();
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] ❌ Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setSpeechError('not-allowed');
        errorLockRef.current = true; // hard lock – needs explicit retry
        console.error('[Voice] Microphone permission denied. Hard-locking mic.');
      } else if (event.error === 'network') {
        setSpeechError('network');
        errorLockRef.current = true; // hard lock – needs explicit retry
        console.error('[Voice] Network error. Hard-locking mic until user retries.');
      } else if (event.error === 'no-speech') {
        setSpeechError('no-speech');
        // no-speech is soft — user can try again immediately
      } else if (event.error === 'aborted') {
        setSpeechError(null);
      }

      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[Voice] 🔴 Recognition ended.');
      isListeningRef.current = false;
      setIsListening(false);
      // ⚠️ NO auto-restart here under any circumstances.
    };

    recognitionRef.current = recognition;
    console.log('[Voice] ✅ SpeechRecognition instance created successfully.');
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('[Voice] ❌ Cannot start: SpeechRecognition not initialized.');
      return;
    }
    // Refuse start while hard-locked (network / not-allowed error pending)
    if (errorLockRef.current) {
      console.warn('[Voice] 🔒 Hard-locked after error. Call clearError() first.');
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
    const mappedLang = langMap[currentLang] || 'en-IN';
    recognitionRef.current.lang = mappedLang;

    console.log(`[Voice] 🟢 Starting listening... (lang: ${mappedLang})`);
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('[Voice] ❌ Error calling recognition.start():', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log('[Voice] 🛑 Manually stopping recognition...');
      recognitionRef.current.stop();
    }
  }, []);

  // User explicitly wants to retry after an error — release the lock.
  const clearError = useCallback(() => {
    errorLockRef.current = false;
    setSpeechError(null);
  }, []);

  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  return { isListening, transcript, setTranscript, startListening, stopListening, isSupported, speechError, clearError };
};
