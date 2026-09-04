import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Settings,
  PanelLeftClose,
  MessageSquare,
} from 'lucide-react';
import { ChatSession } from '../../types';

interface WorkspaceSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onPinSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  onToggleCollapse?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onPinSession,
  onDeleteSession,
  onOpenSettings,
  isMobileDrawer,
  onCloseMobileDrawer,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const startOf30Days = startOfToday - 29 * 24 * 60 * 60 * 1000;

  // Search filtering
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = s.title.toLowerCase().includes(q);
    const msgMatch = (s.messages || []).some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  // Segregate into history groups
  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.pinned);

  const todaySessions = unpinnedSessions.filter(
    (s) => (s.updatedAt || s.createdAt || 0) >= startOfToday
  );
  const yesterdaySessions = unpinnedSessions.filter((s) => {
    const t = s.updatedAt || s.createdAt || 0;
    return t >= startOfYesterday && t < startOfToday;
  });
  const last7DaysSessions = unpinnedSessions.filter((s) => {
    const t = s.updatedAt || s.createdAt || 0;
    return t >= startOf7Days && t < startOfYesterday;
  });
  const last30DaysSessions = unpinnedSessions.filter((s) => {
    const t = s.updatedAt || s.createdAt || 0;
    return t >= startOf30Days && t < startOf7Days;
  });
  const olderSessions = unpinnedSessions.filter((s) => {
    const t = s.updatedAt || s.createdAt || 0;
    return t < startOf30Days;
  });

  const formatTimestamp = (timestamp?: number | string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const isToday = date.getTime() >= startOfToday;
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const isYesterday = date.getTime() >= startOfYesterday && date.getTime() < startOfToday;
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setDeleteConfirmId(null);
  };

  const saveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === sessionId) {
      onDeleteSession(sessionId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(sessionId);
      setEditingSessionId(null);
    }
  };

  const handleSelect = (sessionId: string) => {
    onSelectSession(sessionId);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingSessionId;
    const isDeleting = session.id === deleteConfirmId;

    // Get last message text
    const lastMsg =
      session.messages && session.messages.length > 0
        ? session.messages[session.messages.length - 1].text.replace(/\[INSIGHTS:.*?\]/g, '').trim()
        : 'Empty conversation';

    return (
      <div
        key={session.id}
        onClick={() => handleSelect(session.id)}
        className={`group relative flex flex-col p-2.5 rounded-[16px] cursor-pointer text-xs transition-all border ${
          isActive
            ? 'bg-[#EAF2FF] border-[#2952CC]/30 text-[#111111] shadow-2xs font-semibold'
            : 'border-transparent text-[#111111] hover:bg-slate-100 hover:border-slate-200'
        }`}
      >
        {isEditing ? (
          <form
            onSubmit={(e) => saveRename(session.id, e)}
            className="flex items-center gap-1.5 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-[#2952CC] rounded-lg bg-white focus:outline-hidden text-[#111111]"
              autoFocus
            />
            <button
              type="submit"
              onClick={(e) => saveRename(session.id, e)}
              className="p-1 hover:bg-green-100 text-green-700 rounded-md"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelRename}
              className="p-1 hover:bg-slate-200 text-slate-500 rounded-md"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            {/* Top row: Title + Actions */}
            <div className="flex items-center justify-between gap-1.5 w-full">
              <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                {session.pinned && (
                  <Pin className="w-3 h-3 text-[#2952CC] shrink-0 fill-[#2952CC]" />
                )}
                <span className="truncate font-bold text-xs text-[#111111]">{session.title}</span>
              </div>

              {/* Action buttons (Pin, Rename, Delete) */}
              <div
                className={`items-center gap-0.5 shrink-0 ${
                  isActive ? 'flex' : 'hidden group-hover:flex'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinSession(session.id);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    session.pinned
                      ? 'text-[#2952CC] hover:bg-blue-100'
                      : 'text-slate-400 hover:text-[#2952CC] hover:bg-slate-200'
                  }`}
                  title={session.pinned ? 'Unpin' : 'Pin conversation'}
                >
                  <Pin className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => startRename(session, e)}
                  className="p-1 rounded-md text-slate-400 hover:text-[#111111] hover:bg-slate-200 transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(session.id, e)}
                  className={`p-1 rounded-md transition-colors ${
                    isDeleting
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={isDeleting ? 'Click again to confirm delete' : 'Delete'}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Bottom row: Last message preview & Time */}
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#64748B] w-full">
              <span className="truncate flex-1 pr-2">{lastMsg}</span>
              <span className="shrink-0 font-mono text-[10px]">
                {formatTimestamp(session.updatedAt || session.createdAt)}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGroup = (label: string, items: ChatSession[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 mb-4">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          {label} ({items.length})
        </div>
        <div className="space-y-1">{items.map(renderSessionItem)}</div>
      </div>
    );
  };

  return (
    <aside
      className={`w-full sm:w-[300px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col h-full overflow-hidden select-none`}
    >
      {/* 1. Header with Brand & New Chat */}
      <div className="p-4 border-b border-[#F1F5F9] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#111111] leading-tight">EasiaLearn AI Tutor</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2952CC]">
                Pro Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onToggleCollapse && !isMobileDrawer && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors hidden md:flex"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {isMobileDrawer && onCloseMobileDrawer && (
              <button
                onClick={onCloseMobileDrawer}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChatClick}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2952CC] hover:bg-[#1f40a6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Search Conversations */}
      <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#111111] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2952CC] focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. History Groups (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-[#64748B] space-y-2">
            <MessageSquare className="w-7 h-7 mx-auto text-slate-300" />
            <p className="font-semibold text-[#111111]">No conversations found</p>
            <p className="text-[11px]">Start a new chat to ask questions or upload files.</p>
          </div>
        ) : (
          <>
            {renderGroup('Pinned', pinnedSessions)}
            {renderGroup('Today', todaySessions)}
            {renderGroup('Yesterday', yesterdaySessions)}
            {renderGroup('Last 7 Days', last7DaysSessions)}
            {renderGroup('Last 30 Days', last30DaysSessions)}
            {renderGroup('Older History', olderSessions)}
          </>
        )}
      </div>

      {/* 4. Bottom Footer with Settings */}
      <div className="p-3 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#111111] hover:bg-white hover:shadow-2xs transition-all"
        >
          <Settings className="w-4 h-4 text-[#2952CC]" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
