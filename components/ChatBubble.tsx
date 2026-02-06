
import React from 'react';
import { ChatMessage } from '../types';
import SuggestionCard from './SuggestionCard';

interface ChatBubbleProps {
  message: ChatMessage;
  onSelectSuggestion: (messageId: string, prompt: string) => void; // New prop for selecting a suggestion
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSelectSuggestion }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none' 
          : 'glass text-white rounded-tl-none'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className="text-[9px] mt-1 opacity-50">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {message.suggestions && message.suggestions.length > 0 && !message.generatedImageUrl && (
        <div className="mt-4 w-full">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest">
              C2C Suggested ✨
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {message.suggestions.map((s, idx) => (
              <SuggestionCard 
                key={idx} 
                suggestion={s} 
                onSelect={(prompt) => onSelectSuggestion(message.id, prompt)} // Calls onSelectSuggestion
                disabled={message.isGenerating}
              />
            ))}
          </div>
        </div>
      )}

      {message.isGenerating && (
        <div className="mt-4 w-64 aspect-square rounded-2xl glass flex flex-col items-center justify-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          <span className="text-[10px] font-medium text-white/50 uppercase tracking-widest italic">Cooking... 🧑‍🍳</span>
        </div>
      )}

      {message.generatedImageUrl && (
        <div className="mt-4 w-64 group relative">
          <img 
            src={message.generatedImageUrl} 
            alt="Generated content" 
            className="w-full aspect-square object-cover rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-4">
            <button 
              onClick={() => window.open(message.generatedImageUrl)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-expand text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
