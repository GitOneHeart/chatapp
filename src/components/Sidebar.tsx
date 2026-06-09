"use client";

import { useEffect, useRef } from "react";
import type { Conversation } from "@/lib/storage";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  disabled: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

export default function Sidebar({
  conversations,
  activeId,
  disabled,
  isOpen,
  onToggle,
  onNew,
  onSwitch,
  onDelete,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 点击侧边栏外部关闭（移动端）
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onToggle]);

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" />
      )}

      {/* 侧边栏 */}
      <aside
        ref={sidebarRef}
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-[260px]
          flex flex-col bg-gray-50 border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 新建对话按钮 */}
        <div className="p-4">
          <button
            onClick={onNew}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新对话
          </button>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {sorted.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-8">暂无历史对话</p>
          ) : (
            <div className="space-y-1">
              {sorted.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => !disabled && onSwitch(conv.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                    ${
                      conv.id === activeId
                        ? "bg-white shadow-sm border border-gray-200"
                        : "hover:bg-gray-100 border border-transparent"
                    }
                    ${disabled ? "pointer-events-none opacity-50" : ""}
                  `}
                >
                  <span className="text-xs shrink-0">💬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{conv.title}</p>
                    <p className="text-xs text-gray-400">{formatTime(conv.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
