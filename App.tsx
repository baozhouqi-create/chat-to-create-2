
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, C2CResponse } from './types';
import { analyzeChatMoment, generateImage } from './geminiService';
import ChatBubble from './components/ChatBubble';
import RemixModal from './components/RemixModal'; // Import the new RemixModal

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Yo! Ready to turn your chats into visuals? Drop something dramatic or descriptive. 🚀",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // State for Remix Modal
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [currentRemixPrompt, setCurrentRemixPrompt] = useState('');
  const [currentRemixMessageId, setCurrentRemixMessageId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const analysis: C2CResponse = await analyzeChatMoment(inputText);
      
      if (analysis.isTriggered && analysis.suggestions) {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, suggestions: analysis.suggestions } 
            : msg
        ));
      } else if (!analysis.isTriggered) {
        // Display the reason from the model if not triggered
        const assistantResponse: ChatMessage = {
          id: Date.now().toString() + '_no_trigger',
          role: 'assistant',
          content: analysis.reason,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantResponse]);
      }
    } catch (err) {
      console.error("HandleSend error:", err);
      // Fallback message for analysis errors
      const errorResponse: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: "Oops! Something went wrong while analyzing your vibe. Try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSuggestion = (messageId: string, prompt: string) => {
    setCurrentRemixMessageId(messageId);
    setCurrentRemixPrompt(prompt);
    setShowRemixModal(true);
  };

  const handleCloseRemixModal = () => {
    setShowRemixModal(false);
    setCurrentRemixPrompt('');
    setCurrentRemixMessageId(null);
  };

  const handleGenerateImage = async (
    prompt: string, 
    base64Image?: string, 
    mimeType?: string
  ) => {
    if (!currentRemixMessageId) return;

    handleCloseRemixModal(); // Close modal immediately

    setMessages(prev => prev.map(msg => 
      msg.id === currentRemixMessageId ? { ...msg, isGenerating: true } : msg
    ));

    try {
      const imageUrl = await generateImage(prompt, base64Image, mimeType);
      if (imageUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === currentRemixMessageId ? { ...msg, generatedImageUrl: imageUrl, isGenerating: false } : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === currentRemixMessageId ? { ...msg, isGenerating: false } : msg
        ));
      }
    } catch (err) {
      console.error("Image Gen trigger error:", err);
      setMessages(prev => prev.map(msg => 
        msg.id === currentRemixMessageId ? { ...msg, isGenerating: false } : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-black border-x border-white/5 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] bg-pink-900/10 blur-[120px] rounded-full"></div>

      {/* Header */}
      <header className="p-4 glass sticky top-0 z-10 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-sparkles text-white text-lg"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Chat-to-Create</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Gen-AI Visualizer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 glass px-2 py-1 rounded-full border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-green-500 font-bold uppercase">Live</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 hide-scrollbar space-y-4"
      >
        {messages.map(msg => (
          <ChatBubble 
            key={msg.id} 
            message={msg} 
            onSelectSuggestion={handleSelectSuggestion} // Pass new handler
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-white/30 text-xs italic ml-2">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span>Analyzing vibes...</span>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-gradient-to-t from-black to-transparent relative z-10">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type 'I'm rotting' or 'Cat in a tux'..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm placeholder:text-white/20"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-white/20 text-white flex items-center justify-center transition-all active:scale-90"
          >
            <i className="fa-solid fa-arrow-up-long"></i>
          </button>
        </div>
        <div className="mt-3 flex justify-center">
          <p className="text-[10px] text-white/20 italic font-medium">
            Try: "I'm screaming crying throwing up right now 💀"
          </p>
        </div>
      </footer>

      {/* Remix Modal */}
      <RemixModal
        isOpen={showRemixModal}
        onClose={handleCloseRemixModal}
        prompt={currentRemixPrompt}
        onGenerate={handleGenerateImage}
        isGenerating={messages.some(msg => msg.id === currentRemixMessageId && msg.isGenerating)}
      />
    </div>
  );
};

export default App;
