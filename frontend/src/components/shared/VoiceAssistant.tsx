import { useContext, useEffect, useRef, useState } from 'react';
import { VoiceContext } from '../../context/VoiceContext';

export default function VoiceAssistant() {
  const voice = useContext(VoiceContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!voice) {
      console.error('[VoiceAssistant] ❌ VoiceContext not found. Is VoiceProvider wrapping App?');
    } else if (!voice.isSupported) {
      console.warn('[VoiceAssistant] ⚠️ Speech recognition not supported in this browser/context.');
    }
  }, [voice]);

  // Auto-open panel if there are messages or listening starts
  useEffect(() => {
    if (voice && (voice.isListening || voice.isProcessing || voice.messages.length > 0)) {
      setIsOpen(true);
    }
  }, [voice?.isListening, voice?.isProcessing, voice?.messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [voice?.messages, isOpen]);

  if (!voice || !voice.isSupported) return null;

  const { isListening, isProcessing, startListening, stopListening, messages, clearMessages } = voice;

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <>
      {/* Expanded Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-[9998] w-[calc(100vw-3rem)] max-w-sm bg-surface-container-highest/95 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp origin-bottom-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-primary-600 text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              <span className="font-bold font-headline">AgroBot</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { clearMessages(); setIsOpen(false); stopListening(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" title="Close">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 max-h-64 sm:max-h-80 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {messages.length === 0 && !isListening && !isProcessing && (
              <div className="text-center text-on-surface-variant/70 text-sm py-4">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">mic</span>
                <p>Tap the microphone and say hello!</p>
                <p className="text-xs mt-1">Speak in English, Hindi, Marathi...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-sm' 
                    : 'bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {(isListening || isProcessing) && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-tl-sm shadow-sm flex items-center gap-2">
                  {isListening ? (
                    <>
                      <div className="flex items-end gap-[2px] h-3">
                        <div className="w-[2px] bg-red-500 rounded-full animate-soundbar1 h-2" />
                        <div className="w-[2px] bg-red-500 rounded-full animate-soundbar2 h-3" />
                        <div className="w-[2px] bg-red-500 rounded-full animate-soundbar3 h-2" />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">Listening...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-on-surface-variant">Thinking...</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Mic Button (FAB) */}
      <button
        onClick={() => {
          if (!isOpen) setIsOpen(true);
          toggleMic();
        }}
        disabled={isProcessing}
        className={`
          fixed bottom-8 right-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center
          shadow-2xl transition-all duration-300 
          ${isListening
            ? 'bg-red-500 shadow-red-500/40 scale-110 animate-pulse'
            : isProcessing
              ? 'bg-amber-500 shadow-amber-500/30 cursor-wait'
              : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/30 hover:scale-110 hover:shadow-xl active:scale-95'}
        `}
        title={isListening ? 'Tap to stop' : isProcessing ? 'Processing...' : 'Tap to speak'}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-white text-[28px]">
            {isListening ? 'stop_circle' : 'mic'}
          </span>
        )}
      </button>

      <style>{`
        @keyframes soundbar1 { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        @keyframes soundbar2 { 0%, 100% { height: 10px; } 50% { height: 4px; } }
        @keyframes soundbar3 { 0%, 100% { height: 6px; } 50% { height: 12px; } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-soundbar1 { animation: soundbar1 0.8s ease-in-out infinite; }
        .animate-soundbar2 { animation: soundbar2 0.7s ease-in-out infinite; }
        .animate-soundbar3 { animation: soundbar3 0.9s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1) forwards; }
      `}</style>
    </>
  );
}
