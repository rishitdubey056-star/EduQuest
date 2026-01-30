
import React, { useState, useRef, useEffect } from 'react';
import { askTeacher } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AITeacherProps {
  funMode: boolean;
}

const AITeacher: React.FC<AITeacherProps> = ({ funMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Sup! I am Theo AI, your ultimate study guide. Ready to level up your aura points? Drop a question or a photo of your book! GIF_CODE: 3o7TKSjPqcK9Uj77W0' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (imgBase64?: string) => {
    if (!inputText.trim() && !imgBase64) return;
    const userMsg: ChatMessage = { role: 'user', text: inputText, image: imgBase64 };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    try {
      const responseText = await askTeacher(inputText, funMode, imgBase64);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: err.message || "Oof, my brain lagged. Try sending that again, fam." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const gifMarker = /GIF_CODE:\s*([a-zA-Z0-9]+)/i;
    const match = text.match(gifMarker);
    const mainText = text.replace(gifMarker, '').trim();
    const gifId = match ? match[1] : null;

    return (
      <div className="space-y-4">
        <div className="text-[16px] leading-relaxed font-bold whitespace-pre-wrap break-words text-slate-800">
          {mainText}
        </div>
        {gifId && (
          <div className="mt-4 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 animate-in zoom-in-95 duration-500 max-w-full">
            <img 
              src={`https://i.giphy.com/${gifId}.gif`} 
              alt="Meme" 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[280px] block"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('media.giphy.com')) {
                   target.src = `https://media.giphy.com/media/${gifId}/giphy.gif`;
                } else {
                   target.src = "https://i.giphy.com/3o7TKSjPqcK9Uj77W0.gif";
                }
              }}
            />
            <div className="bg-white/95 p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-t border-slate-50">
              THEO'S VIBE CHECK
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all z-[100] border-4 border-white ${
          isOpen ? 'bg-slate-900 rotate-90 scale-90' : (funMode ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-110 active:scale-95' : 'bg-indigo-600 hover:scale-110 active:scale-95')
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012-2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth={2.5} /></svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[430px] sm:h-[min(820px,88vh)] bg-white sm:rounded-[3.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] z-[95] flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-500 border border-slate-100">
          
          {/* Header matching screenshot */}
          <div className={`p-6 sm:p-7 flex items-center justify-between shadow-lg relative z-10 transition-all duration-500 ${funMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-indigo-600'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                <span role="img" aria-label="fire">🔥</span>
              </div>
              <div className="text-white min-w-0 text-left">
                <h3 className="font-black text-2xl tracking-tighter truncate leading-none mb-1">Theo AI</h3>
                <p className="text-[11px] font-black opacity-95 uppercase tracking-[0.25em] leading-none">
                  {funMode ? "VIBE CHECK: PASSED" : "ACADEMIC MENTOR"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-2.5 bg-white/10 rounded-2xl active:scale-90 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8 bg-slate-50/70 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex w-full animate-in fade-in duration-400 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-3 max-w-[94%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-[10px] font-black shadow-md border-2 ${
                    m.role === 'user' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-indigo-600 border-indigo-50'
                  }`}>
                    {m.role === 'user' ? 'ME' : 'AI'}
                  </div>
                  <div className={`p-5 shadow-xl border relative overflow-hidden break-words transition-all duration-300 ${
                    m.role === 'user' 
                    ? (funMode ? 'bg-purple-600 text-white border-purple-400 rounded-[2rem] rounded-tr-none' : 'bg-indigo-600 text-white border-indigo-400 rounded-[2rem] rounded-tr-none') 
                    : 'bg-white text-slate-900 border-slate-100 rounded-[2rem] rounded-tl-none shadow-indigo-100/30'
                  }`}>
                    {m.image && <img src={m.image} className="mb-4 rounded-3xl max-h-80 w-full object-cover border-4 border-white/10 shadow-2xl" alt="Upload" />}
                    {m.role === 'user' ? <p className="text-[16px] font-bold leading-relaxed">{m.text}</p> : renderMessageContent(m.text)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shadow-sm">AI</div>
                <div className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 animate-pulse shadow-sm">Theo is cooking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input matching screenshot */}
          <div className="p-5 sm:p-8 bg-white border-t border-slate-50 pb-safe">
            <div className={`flex items-center gap-3 bg-slate-100 border-2 rounded-[2.5rem] p-2.5 transition-all duration-500 focus-within:ring-[12px] ${funMode ? 'focus-within:ring-purple-500/5 focus-within:border-purple-400 border-slate-100' : 'focus-within:ring-indigo-500/5 focus-within:border-indigo-500 border-slate-100'}`}>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-4 text-slate-500 bg-white rounded-[1.5rem] shadow-sm border border-slate-200 active:scale-90 hover:text-indigo-600 transition-all"
                title="Camera"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={3} /></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => handleSend(r.result as string); r.readAsDataURL(f); } }} className="hidden" accept="image/*" />
              
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder={funMode ? "TYPE HERE BRUH..." : "ASK YOUR QUESTION..."}
                className="flex-1 bg-transparent border-none py-3.5 px-1 text-[18px] font-black text-slate-900 placeholder:text-slate-400 placeholder:font-black placeholder:text-[11px] placeholder:tracking-[0.25em] focus:ring-0 outline-none"
              />

              <button 
                onClick={() => handleSend()} 
                disabled={!inputText.trim()} 
                className={`p-4.5 rounded-[1.5rem] shadow-2xl shadow-indigo-200/40 transition-all active:scale-90 ${
                  !inputText.trim() 
                  ? 'bg-slate-200 text-slate-400' 
                  : (funMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-indigo-600 text-white')
                }`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AITeacher;
