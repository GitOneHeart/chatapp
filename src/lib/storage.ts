import type { UIMessage } from "ai";

export interface Conversation {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "chat_conversations";
const ACTIVE_KEY = "chat_active_id";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(list: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage 满或不可用，静默失败
  }
}

export function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}

export function removeActiveId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_KEY);
}
