"use client";

import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  type Conversation,
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
} from "@/lib/storage";

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "新对话";
  const text = firstUser.parts
    ?.filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
  return text ? text.slice(0, 30) : "新对话";
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 初始化：从 localStorage 加载
  useEffect(() => {
    const list = loadConversations();
    setConversations(list);
    const savedActiveId = loadActiveId();
    if (savedActiveId && list.some((c) => c.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else if (list.length > 0) {
      setActiveId(list[0].id);
    } else {
      setActiveId(null);
    }
    setLoaded(true);
  }, []);

  // 写回 localStorage
  useEffect(() => {
    if (!loaded) return;
    saveConversations(conversations);
  }, [conversations, loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (activeId) {
      saveActiveId(activeId);
    }
  }, [activeId, loaded]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // 创建新对话
  const newConversation = useCallback(() => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  // 更新当前对话的消息
  const updateMessages = useCallback(
    (messages: UIMessage[]) => {
      if (!activeId) return;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages,
            title: makeTitle(messages),
            updatedAt: Date.now(),
          };
        })
      );
    },
    [activeId]
  );

  // 切换对话
  const switchConversation = useCallback(
    (id: string) => {
      if (conversations.some((c) => c.id === id)) {
        setActiveId(id);
      }
    },
    [conversations]
  );

  // 删除对话
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) {
          // 删的是当前对话，自动切到最近的
          const idx = prev.findIndex((c) => c.id === id);
          const fallback = next[Math.min(idx, next.length - 1)] ?? null;
          setActiveId(fallback?.id ?? null);
        }
        return next;
      });
    },
    [activeId]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    loaded,
    newConversation,
    updateMessages,
    switchConversation,
    deleteConversation,
  };
}
