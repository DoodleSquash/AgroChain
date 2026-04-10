import { useContext, useEffect, useRef, useState } from 'react';
import { VoiceContext } from '../../context/VoiceContext';

export default function VoiceAssistant() {
  const voice = useContext(VoiceContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  // Drag state
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);

  const onDragStart = (e: React.MouseEvent) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPanelPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => { dragRef.current.dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

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
        <div
          ref={panelRef}
          className="fixed z-[9998] w-[calc(100vw-3rem)] max-w-sm bg-surface-container-highest/95 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp origin-bottom-right"
          style={panelPos
            ? { left: panelPos.x, top: panelPos.y, bottom: 'auto', right: 'auto' }
            : { bottom: '7rem', right: '1.5rem' }
          }
        >
          
          {/* Header – drag handle */}
          <div
            className="flex items-center justify-between px-5 py-3 bg-primary-600 text-white cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onDragStart}
          >
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

          {/* Text Input Fallback */}
          <div className="p-3 bg-surface-container-low border-t border-outline-variant/20">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (inputText.trim()) {
                  voice.processText(inputText);
                  setInputText('');
                }
              }}
              className="relative"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                disabled={isProcessing}
                className="w-full bg-white border border-outline-variant/30 text-sm text-on-surface rounded-full pl-4 pr-10 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-70"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-primary-600 disabled:text-on-surface-variant/40 hover:bg-primary-50 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
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
