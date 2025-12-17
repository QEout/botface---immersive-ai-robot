import React, { useState, useEffect, useRef } from 'react';
import { BotResponse } from '../types';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  latestResponse: BotResponse | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isLoading, latestResponse }) => {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect for bot response
  useEffect(() => {
    if (latestResponse?.text) {
      let i = 0;
      setDisplayText('');
      const text = latestResponse.text;
      const speed = 30; // ms per char

      const interval = setInterval(() => {
        setDisplayText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
    }
  }, [latestResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // Keep focus on input
  useEffect(() => {
      const focusInput = () => inputRef.current?.focus();
      document.addEventListener('click', focusInput);
      return () => document.removeEventListener('click', focusInput);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Bot Response Area - Centered below face or floating near top */}
      <div className="flex-1 flex flex-col items-center justify-end pb-10">
         {/* Only show if there is text */}
         <div className={`
            max-w-2xl text-center transition-opacity duration-300
            ${latestResponse ? 'opacity-100' : 'opacity-0'}
         `}>
            <p className="text-cyan-100 text-xl md:text-2xl font-medium tracking-wide drop-shadow-[0_0_5px_rgba(200,255,255,0.5)] leading-relaxed">
              {displayText}
              {isLoading && <span className="animate-pulse">_</span>}
            </p>
         </div>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-xl mx-auto mb-4 pointer-events-auto">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full transition-opacity group-hover:bg-cyan-500/20"></div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "思考中..." : "输入对话..."}
            className="w-full bg-black/50 border-b-2 border-cyan-800 text-cyan-500 text-lg px-6 py-4 outline-none 
                       focus:border-cyan-400 focus:text-cyan-100 transition-all placeholder-cyan-900 
                       backdrop-blur-sm text-center font-mono rounded-xl"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-cyan-900">
            [回车]
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
