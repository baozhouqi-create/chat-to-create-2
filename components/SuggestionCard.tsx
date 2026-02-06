
import React from 'react';
import { ImageSuggestion } from '../types';

interface SuggestionCardProps {
  suggestion: ImageSuggestion;
  onSelect: (prompt: string) => void; // Changed from onGenerate to onSelect
  disabled?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onSelect, disabled }) => {
  return (
    <button
      onClick={() => onSelect(suggestion.prompt)} // Calls onSelect
      disabled={disabled}
      className={`flex-shrink-0 w-48 p-4 rounded-2xl glass transition-all hover:scale-105 active:scale-95 text-left group border border-white/10 hover:border-purple-500/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="text-sm font-bold mb-2 text-purple-300 group-hover:text-purple-400">
        {suggestion.label}
      </div>
      <p className="text-[10px] text-white/50 line-clamp-3 leading-relaxed">
        {suggestion.prompt}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Create</span>
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
          <i className="fa-solid fa-wand-magic-sparkles text-[10px] text-white/40 group-hover:text-purple-400"></i>
        </div>
      </div>
    </button>
  );
};

export default SuggestionCard;
