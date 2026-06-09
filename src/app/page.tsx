'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const isReady = status === 'ready';
  const isStreaming = status === 'streaming';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !isReady) return;
    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || !isReady) return;
      sendMessage({ text: input });
      setInput('');
    }
  };

  const roleConfig: Record<string, { label: string; color: string }> = {
    user: { label: '邱桂升', color: 'bg-blue-500 text-white' },
    assistant: { label: '大聪明', color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <div className="flex justify-center h-dvh bg-gray-100">
      {/* 固定宽度的主卡片，宽度始终为 max-w-2xl */}
      <div className="w-full max-w-2xl flex flex-col h-dvh bg-white shadow-lg">
        {/* 顶部标题栏 */}
        <header className="shrink-0 sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
                丁
              </div>
              <div>
                <h1 className="text-base font-medium text-gray-900">大聪明</h1>
                <p className="text-xs text-gray-400">
                  {isStreaming ? '正在输入...' : '在线'}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                清空消息
              </button>
            )}
          </div>
        </header>

        {/* 消息区域 */}
        <div
          ref={msgContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="px-6 py-6 flex flex-col gap-5 min-h-full">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 px-4 -mt-16">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-rose-500 flex items-center justify-center text-white text-4xl font-medium mb-6 shadow-xl shadow-pink-200/50 ring-4 ring-pink-50">
                  丁
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">大聪明</h2>
                <p className="text-base text-gray-400 mb-8">
                  有什么想聊的，随时跟我说～
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {[
                    { icon: '💡', title: '获取灵感', desc: '聊聊你的想法' },
                    { icon: '📝', title: '写作计划', desc: '帮你润色文字' },
                    { icon: '🧠', title: '育儿教育', desc: '解答你的疑问' },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => sendMessage({ text: item.title })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors text-center"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{item.title}</span>
                      <span className="text-xs text-gray-400">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              const config = roleConfig[m.role] ?? { label: m.role, color: 'bg-gray-100' };
              const isLastAssistant =
                !isUser && i === messages.length - 1 && isStreaming;

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : ''}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium shrink-0 mt-1">
                      {config.label.charAt(0)}
                    </div>
                  )}
                  <div className={isUser ? 'max-w-[80%]' : 'flex-1'}>
                    <p className={`text-xs mb-1.5 ${isUser ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                      {config.label}
                    </p>
                    <div
                      className={`inline-block min-w-[120px] rounded-2xl px-4 py-2.5 leading-relaxed text-sm break-words whitespace-pre-wrap ${
                        isUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {m.parts
                        ?.filter((part) => part.type === 'text')
                        ?.map((part, j) => <span key={j}>{part.text}</span>)}
                      {isLastAssistant && (
                        <span className="inline-flex gap-0.5 ml-1 align-middle">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <footer className="shrink-0 border-t bg-white">
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-5 py-3 bg-gray-100 rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
                placeholder="输入消息，Enter 发送"
                disabled={!isReady}
              />
              <button
                type="submit"
                disabled={!isReady || !input.trim()}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
