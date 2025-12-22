"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, ThumbsUp, ThumbsDown, Sparkles, Clock, Trash2, AlertTriangle } from "lucide-react";
import { AiOutlineRobot } from "react-icons/ai";

export default function CustomChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date, loading?: boolean}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [chatConfig, setChatConfig] = useState({
    welcomeMessage: "",
    suggestedQuestions: [] as string[],
    companyName: "Global Tech Software Solutions",
    apiUrl: ""
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const newUserMessageRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  // Scroll to top when new user message is added
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === 'user') {
      // Scroll to top of messages container
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
    }
  }, [messages]);

  useEffect(() => {
    // Initialize chat with config from API
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Get API URL from environment variables
      const apiUrl = `${process.env.NEXT_PUBLIC_CHATBOT_API_URL}`;
      
      // Fetch chat configuration from API
      const configResponse = await fetch(`${apiUrl}/config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setChatConfig(prev => ({
          ...prev,
          welcomeMessage: configData.welcomeMessage || "Hello! How can I assist you today?",
          suggestedQuestions: configData.suggestedQuestions || [],
          companyName: configData.companyName || "Global Tech Software Solutions",
          apiUrl: apiUrl
        }));
        
        // Add welcome message
        setMessages([{
          id: 1,
          text: configData.welcomeMessage || "Hello! How can I assist you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
        
        setApiStatus('connected');
      } else {
        // Fallback if config endpoint doesn't exist
        setMessages([{
          id: 1,
          text: "Hello! How can I assist you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
        setApiStatus('connected');
        setChatConfig(prev => ({...prev, apiUrl: apiUrl}));
      }
    } catch (error) {
      console.error("Chat Initialization Failed:", error);
      // Fallback configuration
      setMessages([{
        id: 1,
        text: "Hello! How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
      setApiStatus('disconnected');
      setChatConfig(prev => ({
        ...prev, 
        apiUrl: `${process.env.NEXT_PUBLIC_CHATBOT_API_URL}`
      }));
    }
  };

  const handleApiIntegration = async (userMessage: string): Promise<string> => {
    try {
      // Construct the full API endpoint URL
      const fullApiUrl = `${chatConfig.apiUrl}`;
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: "globaltech_chat_session",
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats from API
      if (data.reply) {
        return data.reply;
      } else if (data.answer) {
        return data.answer;
      } else if (data.message) {
        return data.message;
      } else if (data.text) {
        return data.text;
      } else if (typeof data === 'string') {
        return data;
      } else {
        return JSON.stringify(data);
      }
      
    } catch (error) {
      console.error("API Integration Error:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userText = inputValue.trim();
    const userMessage = {
      id: messages.length + 1,
      text: userText,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Add temporary loading message
    const loadingMessage = {
      id: messages.length + 2,
      text: "",
      sender: 'bot' as const,
      timestamp: new Date(),
      loading: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const botReply = await handleApiIntegration(userText);
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.loading);
        return [...newMessages, {
          id: newMessages.length + 1,
          text: botReply,
          sender: 'bot' as const,
          timestamp: new Date()
        }];
      });
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.loading);
        return [...newMessages, {
          id: newMessages.length + 1,
          text: "I apologize, but I'm currently unable to connect to our servers. Please try again in a moment.",
          sender: 'bot' as const,
          timestamp: new Date()
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to clear conversation
  const clearConversation = () => {
    // Reset to initial welcome message
    setMessages([{
      id: 1,
      text: chatConfig.welcomeMessage || "Hello! How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setShowConfirmDialog(false);
  };

  // Function to show confirmation dialog
  const showClearConfirmation = () => {
    setShowConfirmDialog(true);
  };

  // Function to cancel clear operation
  const cancelClear = () => {
    setShowConfirmDialog(false);
  };

  // Function to format bot messages for better readability
  const formatBotMessage = (text: string) => {
    // Add line breaks for better readability
    const formattedText = text
      .replace(/\n/g, '<br />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/### (.*?)(<br \/>|$)/g, '<h3>$1</h3>') // Headings
      .replace(/## (.*?)(<br \/>|$)/g, '<h2>$1</h2>') // Headings
      .replace(/# (.*?)(<br \/>|$)/g, '<h1>$1</h1>') // Headings
      .replace(/\d+\.\s(.*?)(<br \/>|$)/g, '<li>$1</li>') // Numbered lists
      .replace(/-\s(.*?)(<br \/>|$)/g, '<li>$1</li>') // Bullet points
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>'); // Wrap lists

    return formattedText;
  };

  return (
    <>
      {/* Enhanced Floating Chat Button with Professional Design */}
      <div className="fixed bottom-28 right-6 z-[9999]">
        <button
          onClick={toggleChat}
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          aria-label="Open AI Chat"
        >        
          {/* Main icon */}
          <div className="relative z-10">
            {open ? (
              <X className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <div className="relative">
                <AiOutlineRobot className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Professional Chat Window with Modern Design */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] w-96 h-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500 ${
          open ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Professional Header with Status */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-7 h-7" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${apiStatus === 'connected' ? 'bg-green-400' : apiStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            </div>
            <div>
              <h4 className="font-bold text-xl flex items-center">
                {chatConfig.companyName} AI
                <Sparkles className="w-5 h-5 ml-2 text-yellow-300" />
              </h4>
              <p className="text-sm opacity-90 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                {apiStatus === 'connected' ? 'Online & Connected' : 
                 apiStatus === 'disconnected' ? 'Connection Issues' : 
                 'Establishing Connection...'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {/* Clear Conversation Button */}
            {messages.length > 1 && (
              <button
                onClick={showClearConfirmation}
                className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Messages Container - scrolls to top on new message */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          {/* Welcome message with quick actions */}
          {messages.length === 1 && (
            <div className="mb-6 animate-fade-in">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-lg">Welcome to {chatConfig.companyName}</h5>
                    <p className="text-gray-600">How can I assist you today?</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {chatConfig.suggestedQuestions.slice(0, 4).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 shadow-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={index === messages.length - 1 ? newUserMessageRef : null}
              className={`flex mb-6 animate-slide-up ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4 self-end flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                {message.loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                ) : (
                  <>
                    {message.sender === 'bot' ? (
                      <div 
                        className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatBotMessage(message.text) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    )}
                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                      message.sender === 'user' ? 'border-blue-400/30' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center text-xs">
                        <Clock className={`w-3 h-3 mr-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`} />
                        <span className={`font-medium ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      {message.sender === 'bot' && !message.loading && (
                        <div className="flex space-x-2">
                          <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
                          </button>
                          <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {message.sender === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center ml-4 self-end flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator for new messages */}
          {isTyping && !messages.some(m => m.loading) && (
            <div className="flex mb-6 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-5 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                  <span className="text-sm text-gray-600">Processing your request...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Conversation?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will delete all messages in this conversation. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelClear}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearConversation}
                    className="flex-1 px-4 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200 bg-white p-5">
          {/* Suggested Questions Row */}
          {messages.length > 1 && !isTyping && (
            <div className="mb-4 animate-fade-in">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {chatConfig.suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-800 transition-all duration-200 shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  setInputValue(e.target.value);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-2xl py-4 px-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 bg-white text-gray-900 placeholder-gray-500 resize-none min-h-[52px] max-h-[120px] shadow-sm"
                rows={1}
                aria-label="Type your message"
              />
              
              {/* Character counter */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                {inputValue.length}/500
              </div>
            </div>
            
            <div className="flex space-x-2">
              
              {/* Send Button with enhanced state */}
              <button
                onClick={handleSend}
                disabled={inputValue.trim() === "" || isTyping}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded-md border border-gray-300">Enter</kbd> to send 
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9997] animate-fade-in"
          onClick={toggleChat}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 12px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 12px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        
        /* Message formatting */
        h1, h2, h3 {
          font-weight: 700;
          margin: 0.7em 0;
        }
        
        h1 {
          font-size: 1.3em;
          color: #2563eb;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        
        h2 {
          font-size: 1.2em;
          color: #2563eb;
        }
        
        h3 {
          font-size: 1.1em;
          color: #2563eb;
        }
        
        strong {
          font-weight: 700;
          color: #1e40af;
        }
        
        em {
          font-style: italic;
        }
        
        ul {
          padding-left: 1.5em;
          margin: 0.7em 0;
        }
        
        li {
          margin: 0.3em 0;
          list-style-type: disc;
        }
      `}</style>
    </>
  );
}