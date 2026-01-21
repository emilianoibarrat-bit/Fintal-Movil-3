
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de FINTAL. ¿En qué puedo ayudarte con tus finanzas hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          parts: [{ text: m.content }],
          role: m.role === 'assistant' ? 'model' : 'user'
        })),
        config: {
          systemInstruction: "Eres un asesor financiero experto en México. Tu nombre es FINTAL AI. Eres amable, profesional y proporcionas consejos sobre ahorro, inversión (CETES, bolsa, etc.), impuestos (SAT) y finanzas personales. Mantén las respuestas breves y directas.",
        },
      });

      const aiText = response.text || "Lo siento, tuve un problema procesando tu solicitud.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error al conectar con el servidor. Inténtalo de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-4 sm:p-6 bg-black/20 backdrop-blur-sm transition-all animate-in fade-in">
      <div className="flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-primary px-4 py-4 text-white dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined !text-[24px]">smart_toy</span>
            <span className="font-bold">FINTAL AI Advisor</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-slate-100 dark:bg-zinc-800 dark:text-gray-200 rounded-bl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl px-4 py-2 text-sm animate-pulse">
                Escribiendo...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 dark:border-white/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre inversiones..."
              className="flex-1 bg-slate-100 dark:bg-zinc-800 border-none rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              <span className="material-symbols-outlined !text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
