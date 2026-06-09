"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatView from "@/components/ChatView";
import Sidebar from "@/components/Sidebar";
import { useConversations } from "@/hooks/useConversations";

export default function Home() {
  const {
    conversations,
    activeConversation,
    activeId,
    loaded,
    newConversation,
    updateMessages,
    switchConversation,
    deleteConversation,
  } = useConversations();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // 首次加载无对话时自动创建
  const initialized = useRef(false);
  useEffect(() => {
    if (loaded && !initialized.current && conversations.length === 0) {
      initialized.current = true;
      newConversation();
    }
  }, [loaded, conversations.length, newConversation]);

  const handleMessagesChange = useCallback(
    (messages: Parameters<typeof updateMessages>[0]) => {
      updateMessages(messages);
    },
    [updateMessages]
  );

  return (
    <div className="flex h-dvh bg-gray-100">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        disabled={isStreaming}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onNew={newConversation}
        onSwitch={(id) => {
          switchConversation(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
      />

      {/* 聊天主区域 */}
      <main className="flex-1 flex justify-center min-w-0">
        {activeConversation ? (
          <ChatView
            key={activeId}
            initialMessages={activeConversation.messages}
            onMessagesChange={handleMessagesChange}
            onStreamingChange={setIsStreaming}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <p className="text-gray-400">加载中...</p>
          </div>
        )}
      </main>
    </div>
  );
}
