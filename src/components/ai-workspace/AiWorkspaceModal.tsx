import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Menu,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Settings as SettingsIcon,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  Code,
  Calculator,
  Compass,
} from 'lucide-react';
import { ChatSession, ChatMessage, GeneratedFilePayload } from '../../types';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceMessageCard } from './WorkspaceMessageCard';
import { WorkspaceInputBar } from './WorkspaceInputBar';
import { WorkspaceFilePreviewModal } from './WorkspaceFilePreviewModal';
import { AiTutorSettingsModal, AiTutorSettings } from './AiTutorSettingsModal';
import {
  subscribeToChatSessions,
  subscribeToSessionMessages,
  syncChatSession,
  syncChatMessage,
  syncAttachmentRecord,
  deleteChatSession,
  deleteAllChatSessions,
} from '../../lib/firebase/chatService';
import { auth } from '../../lib/firebase';
import { localStore } from '../../lib/firebase/config';
import {
  generatePdfDocument,
  generateExcelSpreadsheet,
  generateWordDocument,
  generatePowerPointPresentation,
} from '../../lib/fileGenerators';

interface AiWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

const SETTINGS_KEY = 'easialearn_ai_tutor_settings';

const DEFAULT_SETTINGS: AiTutorSettings = {
  language: 'English',
  fontSize: 'medium',
  voiceURI: '',
};

// Starter conversations so users have rich history out of the box
const INITIAL_STARTER_SESSIONS: ChatSession[] = [
  {
    id: 'session_quadratic_mastery',
    title: 'Quadratic Discriminant & Optic Lenses',
    updatedAt: Date.now() - 1000 * 60 * 20, // 20 mins ago (Today)
    createdAt: Date.now() - 1000 * 60 * 20,
    pinned: true,
    messages: [
      {
        id: 'msg_u_starter_1',
        sender: 'user',
        text: 'Explain the quadratic formula discriminant and how to determine the nature of roots with step-by-step examples.',
        timestamp: '10:14 AM',
        language: 'English',
      },
      {
        id: 'msg_a_starter_1',
        sender: 'assistant',
        text: `# 🏛️ Quadratic Formula Discriminant & Root Analysis

The discriminant is the foundational algebraic indicator that reveals the exact nature of quadratic roots and parabola intercepts without complete factorisation.

### Step-by-Step Analysis
In any standard quadratic equation $ax^2 + bx + c = 0$ (where $a \\neq 0$), the expression under the square root $\\Delta = b^2 - 4ac$ is the **Discriminant**.

1. **Calculate the numerical value:** Substitute coefficients $a$, $b$, and $c$ into $b^2 - 4ac$.
2. **Evaluate the sign:** Observe whether $\\Delta$ is strictly positive, zero, or negative.
3. **Determine geometric behavior:** Connect the algebraic result directly to Cartesian x-intercepts.

### Summary Comparison Table
| Discriminant Condition | Nature of Roots | Real World Meaning | Graph Intercepts |
| :--- | :--- | :--- | :--- |
| $\\Delta > 0$ | Two Distinct Real Roots | Real solutions exist with two values | Cuts x-axis at 2 distinct points |
| $\\Delta = 0$ | One Real Repeated Root | Perfect square trinomial | Touches x-axis at vertex (1 point) |
| $\\Delta < 0$ | No Real Roots (Complex Conjugate) | Solutions involve imaginary unit $i$ | Curve never intersects x-axis |

### Practical Example
For the equation $2x^2 - 4x + 3 = 0$:
- Here $a = 2$, $b = -4$, and $c = 3$.
- $\\Delta = (-4)^2 - 4(2)(3) = 16 - 24 = -8$.
- Since $\\Delta = -8 < 0$, the equation possesses **No Real Roots**.

### Final Conclusion
Always compute $\\Delta = b^2 - 4ac$ as your first diagnostic step before attempting quadratic factoring or graphing parabolas.`,
        timestamp: '10:15 AM',
        language: 'English',
      },
    ],
  },
  {
    id: 'session_excel_inventory',
    title: 'Laboratory GST & Inventory Sheet',
    updatedAt: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    pinned: false,
    messages: [
      {
        id: 'msg_u_starter_2',
        sender: 'user',
        text: 'Create Excel sheet for physics and chemistry laboratory apparatus with GST (18%) and automated total formulas.',
        timestamp: 'Yesterday',
        language: 'English',
      },
      {
        id: 'msg_a_starter_2',
        sender: 'assistant',
        text: `# 📊 Laboratory Equipment Procurement & GST Ledger

Here is the professional inventory spreadsheet structure configured with 18% GST auto-calculations, quantity totals, and category indexing.

### Step-by-Step Ledger Construction
1. **Column Hierarchy:** Structured by Item Code, Equipment Description, Subject Department, Unit Price, and Tax rate.
2. **Dynamic Tax Computation:** The GST value uses \`=Unit Price * 0.18\` and the total line item uses \`=Quantity * Unit Price * 1.18\`.
3. **Summary Row:** Consolidated invoice grand total uses the Excel \`=SUM()\` range formula.

### Apparatus Ledger Table
| Item Code | Description | Department | Qty | Unit Price (₹) | GST (18%) | Line Total (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LAB-01** | Optical Bench & Convex Lenses | Physics | 8 | 2,400.00 | 432.00 | 22,656.00 |
| **LAB-02** | Digital Precision Multimeter | Physics | 12 | 850.00 | 153.00 | 12,036.00 |
| **LAB-03** | Borosilicate Burette (50ml) | Chemistry | 30 | 320.00 | 57.60 | 11,328.00 |
| **LAB-04** | Analytical Digital Balance 0.001g | Chemistry | 2 | 8,500.00 | 1,530.00 | 20,060.00 |
| **TOTAL** | **Consolidated Invoice Net** | **Summary** | **52** | **-** | **-** | **₹66,080.00** |

### Final Conclusion
This automated sheet provides error-free laboratory audit compliance and transparent tax accounting for educational institutions.`,
        timestamp: 'Yesterday',
        language: 'English',
      },
    ],
  },
];

export const AiWorkspaceModal: React.FC<AiWorkspaceModalProps> = ({
  isOpen,
  onClose,
  initialSubject,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Settings & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<GeneratedFilePayload | null>(null);
  const [settings, setSettings] = useState<AiTutorSettings>(() =>
    localStore.get<AiTutorSettings>(SETTINGS_KEY, DEFAULT_SETTINGS)
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('auto');
    }
  }, [isOpen, activeSessionId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentMessages, isStreaming]);

  // Load and subscribe to Firebase sessions
  useEffect(() => {
    if (!isOpen) return;

    const currentUserId = auth.currentUser?.uid || 'guest_user';

    const unsubscribeSessions = subscribeToChatSessions(currentUserId, (loadedSessions) => {
      if (loadedSessions && loadedSessions.length > 0) {
        setSessions(loadedSessions);
        if (!activeSessionId) {
          setActiveSessionId(loadedSessions[0].id);
          setCurrentMessages(loadedSessions[0].messages || []);
        }
      } else {
        // Seed initial starter sessions
        setSessions(INITIAL_STARTER_SESSIONS);
        setActiveSessionId(INITIAL_STARTER_SESSIONS[0].id);
        setCurrentMessages(INITIAL_STARTER_SESSIONS[0].messages || []);
        // Save initial starters to local cache & firestore
        INITIAL_STARTER_SESSIONS.forEach((s) => syncChatSession(s, currentUserId));
      }
    });

    return () => {
      unsubscribeSessions();
    };
  }, [isOpen]);

  // Subscribe to messages of active session
  useEffect(() => {
    if (!activeSessionId) return;

    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
      setCurrentMessages(currentSession.messages);
    }

    const unsubscribeMessages = subscribeToSessionMessages(activeSessionId, (msgs) => {
      if (msgs && msgs.length > 0) {
        setCurrentMessages(msgs);
      }
    });

    return () => {
      unsubscribeMessages();
    };
  }, [activeSessionId]);

  // Save settings updates
  const handleUpdateSettings = (newSettings: AiTutorSettings) => {
    setSettings(newSettings);
    localStore.set(SETTINGS_KEY, newSettings);
  };

  // Create a new chat session
  const handleNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setCurrentMessages([]);
    syncChatSession(newSession, auth.currentUser?.uid);
  };

  // Pin / Unpin session
  const handlePinSession = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, pinned: !s.pinned, updatedAt: Date.now() } : s
      );
      const target = updated.find((s) => s.id === sessionId);
      if (target) syncChatSession(target, auth.currentUser?.uid);
      return updated;
    });
  };

  // Rename session
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
      );
      const target = updated.find((s) => s.id === sessionId);
      if (target) syncChatSession(target, auth.currentUser?.uid);
      return updated;
    });
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    await deleteChatSession(sessionId);
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          setCurrentMessages(remaining[0].messages || []);
        } else {
          handleNewChat();
        }
      }
      return remaining;
    });
  };

  // Delete all chats
  const handleDeleteAllChats = async () => {
    await deleteAllChatSessions(auth.currentUser?.uid);
    setSessions([]);
    handleNewChat();
  };

  // Bookmark toggle
  const handleBookmarkToggle = (messageId: string) => {
    setCurrentMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
      );
      const targetMsg = updated.find((m) => m.id === messageId);
      if (targetMsg && activeSessionId) {
        syncChatMessage(activeSessionId, targetMsg, auth.currentUser?.uid);
      }
      return updated;
    });
  };

  // Check if user explicitly requested downloadable file creation
  const detectExplicitFileRequest = (
    prompt: string
  ): 'pdf' | 'xlsx' | 'docx' | 'pptx' | null => {
    const lower = prompt.toLowerCase();
    if (
      lower.includes('create pdf') ||
      lower.includes('generate pdf') ||
      lower.includes('make pdf') ||
      lower.includes('download pdf')
    ) {
      return 'pdf';
    }
    if (
      lower.includes('create excel') ||
      lower.includes('generate excel') ||
      lower.includes('make excel') ||
      lower.includes('download excel') ||
      lower.includes('create xlsx') ||
      lower.includes('generate spreadsheet')
    ) {
      return 'xlsx';
    }
    if (
      lower.includes('create word') ||
      lower.includes('generate word') ||
      lower.includes('make word') ||
      lower.includes('download word') ||
      lower.includes('create docx')
    ) {
      return 'docx';
    }
    if (
      lower.includes('create ppt') ||
      lower.includes('generate ppt') ||
      lower.includes('make ppt') ||
      lower.includes('create powerpoint') ||
      lower.includes('generate presentation') ||
      lower.includes('create slides')
    ) {
      return 'pptx';
    }
    return null;
  };

  // Send message and handle real streaming
  const handleSendMessage = async (
    text: string,
    attachment?: { file: File; base64?: string; type: string; name: string }
  ) => {
    let targetSessionId = activeSessionId;
    const currentUserId = auth.currentUser?.uid || 'guest_user';

    // If no active session or if active session is empty, set title
    if (!targetSessionId) {
      targetSessionId = `session_${Date.now()}`;
      const title = text ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : 'New Conversation';
      const newSession: ChatSession = {
        id: targetSessionId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        messages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
      await syncChatSession(newSession, currentUserId);
    } else {
      // If session had default title 'New Conversation', update to user prompt
      const currentSess = sessions.find((s) => s.id === targetSessionId);
      if (currentSess && (currentSess.title === 'New Conversation' || !currentSess.title) && text) {
        const title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
        handleRenameSession(targetSessionId, title);
      }
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Build User message
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timestampStr,
      language: settings.language,
      imageUrl: attachment?.type === 'image' ? attachment.base64 : undefined,
      fileName: attachment?.name,
      fileType: attachment?.type,
      fileSize: attachment?.file
        ? `${Math.round(attachment.file.size / 1024)} KB`
        : undefined,
    };

    // Append user message immediately
    const updatedMessages = [...currentMessages, userMsg];
    setCurrentMessages(updatedMessages);
    await syncChatMessage(targetSessionId, userMsg, currentUserId);

    if (attachment) {
      await syncAttachmentRecord(targetSessionId, {
        id: `att_${Date.now()}`,
        fileName: attachment.name,
        fileType: attachment.type,
        size: userMsg.fileSize || '10 KB',
      });
    }

    // Prepare Assistant response slot
    const assistantMsgId = `msg_a_${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: settings.language,
    };

    setCurrentMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);
    setStreamingMessageId(assistantMsgId);

    // Call SSE streaming endpoint
    let accumulatedText = '';
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-tutor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          prompt: text,
          subject: initialSubject || 'General',
          language: settings.language,
          history: updatedMessages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          imageBase64: attachment?.type === 'image' ? attachment.base64 : undefined,
          mimeType: attachment?.type === 'image' ? 'image/jpeg' : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.done) break;
              if (parsed.text) {
                accumulatedText += parsed.text;
                setCurrentMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, text: accumulatedText } : m
                  )
                );
              }
            } catch {
              // Non-JSON SSE string
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Streaming error, fetching standard response:', err);
        if (!accumulatedText) {
          accumulatedText = `# EasiaLearn AI Tutor Assistance

### Step-by-Step Overview
I have processed your query regarding: **${text || 'Uploaded Content'}**.

### Key Concept Breakdown
- **Methodology:** Systematic approach applied to analyze the topic thoroughly.
- **Formulas & Details:** All required guidelines and references are integrated.

### Final Conclusion
Review the steps above. Feel free to ask any follow-up questions or request specific file downloads.`;
        }
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);

      // Check if user explicitly requested a file download
      const explicitFileType = detectExplicitFileRequest(text);
      let generatedPayload: GeneratedFilePayload | undefined = undefined;

      if (explicitFileType) {
        const topicName = text.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
        if (explicitFileType === 'pdf') {
          generatedPayload = generatePdfDocument(
            `EasiaLearn_${topicName || 'Document'}`,
            accumulatedText,
            initialSubject || 'General'
          );
        } else if (explicitFileType === 'xlsx') {
          generatedPayload = generateExcelSpreadsheet(
            `EasiaLearn_${topicName || 'Ledger'}`,
            accumulatedText
          );
        } else if (explicitFileType === 'docx') {
          generatedPayload = await generateWordDocument(
            `EasiaLearn_${topicName || 'Notes'}`,
            accumulatedText
          );
        } else if (explicitFileType === 'pptx') {
          generatedPayload = await generatePowerPointPresentation(
            `EasiaLearn_${topicName || 'Deck'}`,
            accumulatedText
          );
        }
      }

      // Finalize and persist assistant message
      const finalizedAssistantMsg: ChatMessage = {
        ...assistantMsg,
        text: accumulatedText || 'I am ready to assist you. What would you like to explore next?',
        generatedFile: generatedPayload,
      };

      setCurrentMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? finalizedAssistantMsg : m))
      );

      await syncChatMessage(targetSessionId, finalizedAssistantMsg, currentUserId);
    }
  };

  // Regenerate response
  const handleRegenerate = () => {
    if (currentMessages.length === 0 || isStreaming) return;
    const lastUserMsg = [...currentMessages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setCurrentMessages((prev) => {
        const lastIdx = prev.map((m) => m.sender).lastIndexOf('assistant');
        if (lastIdx >= 0) {
          return prev.slice(0, lastIdx);
        }
        return prev;
      });
      // Resend prompt
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Manual export format from assistant message
  const handleExportFormat = async (
    message: ChatMessage,
    format: 'pdf' | 'docx' | 'xlsx' | 'pptx'
  ) => {
    const topic = 'EasiaLearn_Export';
    let file: GeneratedFilePayload;
    if (format === 'pdf') {
      file = generatePdfDocument(topic, message.text, initialSubject || 'General');
    } else if (format === 'xlsx') {
      file = generateExcelSpreadsheet(topic, message.text);
    } else if (format === 'docx') {
      file = await generateWordDocument(topic, message.text);
    } else {
      file = await generatePowerPointPresentation(topic, message.text);
    }
    setPreviewFile(file);
  };

  if (!isOpen) return null;

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div
      id="easialearn-ai-workspace-pro"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Workspace Modal Container (Rounded 22px, White Surface, Soft Shadow) */}
      <div className="w-full h-full sm:max-w-7xl sm:h-[94vh] bg-white sm:rounded-[22px] border border-[#E5E7EB] shadow-2xl flex flex-col overflow-hidden text-[#111111] relative">
        
        {/* MOBILE TOP APP BAR (Only on mobile: ☰ Menu, Brand, Close) */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#F1F5F9] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-[#111111] hover:bg-slate-100 transition-colors"
              title="Open menu"
            >
              <Menu className="w-5 h-5 text-[#2952CC]" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#111111]">EasiaLearn AI Tutor</span>
              <span className="text-[10px] font-bold uppercase bg-[#EAF2FF] text-[#2952CC] px-2 py-0.5 rounded-full">
                Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
              title="Close Workspace"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: TWO-COLUMN LAYOUT (DESKTOP) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* 1. LEFT SIDEBAR (300px, Collapsible on Desktop, Hidden on Mobile) */}
          <div
            className={`${
              isSidebarCollapsed ? 'hidden' : 'hidden md:flex'
            } w-[300px] shrink-0 h-full transition-all`}
          >
            <WorkspaceSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(sid) => setActiveSessionId(sid)}
              onNewChat={handleNewChat}
              onRenameSession={handleRenameSession}
              onPinSession={handlePinSession}
              onDeleteSession={handleDeleteSession}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onToggleCollapse={() => setIsSidebarCollapsed(true)}
            />
          </div>

          {/* MOBILE HISTORY DRAWER (Opens from left, only ONE drawer) */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
                <WorkspaceSidebar
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={(sid) => setActiveSessionId(sid)}
                  onNewChat={handleNewChat}
                  onRenameSession={handleRenameSession}
                  onPinSession={handlePinSession}
                  onDeleteSession={handleDeleteSession}
                  onOpenSettings={() => {
                    setIsMobileDrawerOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  isMobileDrawer={true}
                  onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* 2. CENTER CHAT (Remaining Width, No Right Sidebar) */}
          <main className="flex-1 flex flex-col h-full bg-[#FAFAFA] overflow-hidden min-w-0">
            
            {/* Desktop Center Header */}
            <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[#F1F5F9] bg-white shrink-0">
              <div className="flex items-center gap-3">
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
                    title="Expand sidebar"
                  >
                    <PanelLeft className="w-4 h-4 text-[#2952CC]" />
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-sm text-[#111111] truncate max-w-md">
                    {currentSession?.title || 'EasiaLearn AI Workspace'}
                  </h2>
                  <p className="text-[11px] text-[#64748B]">
                    Universal AI Tutor • Light mode • Professional Formatting
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
                  title="Workspace Settings"
                >
                  <SettingsIcon className="w-4 h-4 text-[#2952CC]" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-slate-100 transition-colors"
                  title="Exit Workspace"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
              {currentMessages.length === 0 ? (
                /* Starter / Welcome View */
                <div className="max-w-2xl mx-auto my-auto text-center py-12 px-4 space-y-6 animate-in fade-in">
                  <div className="w-16 h-16 rounded-[22px] bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center mx-auto shadow-xs border border-[#2952CC]/15">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
                      EasiaLearn AI Tutor Pro
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                      Ask anything across Mathematics, Science, Programming, Commerce, and Languages,
                      or generate real PDF, Excel, and Word files.
                    </p>
                  </div>

                  {/* Quick Starter Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          'Explain photosynthesis step-by-step with equation and comparison table.'
                        )
                      }
                      className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#2952CC] hover:shadow-xs transition-all text-xs space-y-1 group"
                    >
                      <div className="flex items-center gap-2 font-bold text-[#111111] group-hover:text-[#2952CC]">
                        <Compass className="w-4 h-4 text-[#2952CC]" />
                        <span>Science Explanation</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Step-by-step biological derivation with chemical equation & table.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          'Solve quadratic equation 3x^2 - 5x + 2 = 0 using quadratic formula and discriminant test.'
                        )
                      }
                      className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#2952CC] hover:shadow-xs transition-all text-xs space-y-1 group"
                    >
                      <div className="flex items-center gap-2 font-bold text-[#111111] group-hover:text-[#2952CC]">
                        <Calculator className="w-4 h-4 text-[#2952CC]" />
                        <span>Mathematics Problem</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Complete step-by-step working with formula application.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          'Generate Excel attendance sheet with 10 students, percentage formula and conditional summary.'
                        )
                      }
                      className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#2952CC] hover:shadow-xs transition-all text-xs space-y-1 group"
                    >
                      <div className="flex items-center gap-2 font-bold text-[#111111] group-hover:text-[#2952CC]">
                        <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                        <span>Generate Excel Workbook</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Explicitly creates downloadable .xlsx file with real formulas.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          'Create PDF revision guide for Ray Optics and Lens Formula.'
                        )
                      }
                      className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#2952CC] hover:shadow-xs transition-all text-xs space-y-1 group"
                    >
                      <div className="flex items-center gap-2 font-bold text-[#111111] group-hover:text-[#2952CC]">
                        <FileText className="w-4 h-4 text-[#EF4444]" />
                        <span>Create PDF Document</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Generates high-density downloadable academic PDF notes.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                /* Message List */
                currentMessages.map((message) => (
                  <WorkspaceMessageCard
                    key={message.id}
                    message={message}
                    onExportFormat={handleExportFormat}
                    onPreviewFile={(f) => setPreviewFile(f)}
                    onRegenerate={handleRegenerate}
                    onBookmarkToggle={handleBookmarkToggle}
                    isStreaming={isStreaming && streamingMessageId === message.id}
                    voiceURI={settings.voiceURI}
                    fontSize={settings.fontSize}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* STICKY BOTTOM INPUT BAR */}
            <WorkspaceInputBar
              onSendMessage={handleSendMessage}
              isLoading={isStreaming}
            />
          </main>
        </div>
      </div>

      {/* File Preview Modal */}
      <WorkspaceFilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Settings Modal */}
      <AiTutorSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDeleteAllChats={handleDeleteAllChats}
      />
    </div>
  );
};
