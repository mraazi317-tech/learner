import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ChatSession, ChatMessage, GeneratedFilePayload } from '../../types';
import { localStore } from './config';

export interface FirebaseChatSessionDoc {
  id: string;
  sessionId: string;
  title: string;
  userId: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  insights?: any;
}

export interface FirebaseChatMessageDoc {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: any[];
  createdAt: number | string;
  updatedAt: number;
  bookmarked?: boolean;
  language?: string;
  imageUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  generatedFile?: GeneratedFilePayload | null;
}

const LOCAL_SESSIONS_KEY = 'ai_tutor_sessions_v2';
const LOCAL_MESSAGES_PREFIX = 'ai_tutor_messages_';

/**
 * Real-time subscription to chat sessions for the current user (with local persistence fallback)
 */
export function subscribeToChatSessions(
  userId: string | null,
  onUpdate: (sessions: ChatSession[]) => void
): () => void {
  const currentUserId = userId || auth.currentUser?.uid || 'guest_user';
  
  // Load cached sessions first
  const cached = localStore.get<ChatSession[]>(LOCAL_SESSIONS_KEY, []);
  if (cached.length > 0) {
    onUpdate(cached);
  }

  try {
    const sessionsCol = collection(db, 'chat_sessions');
    const q = query(
      sessionsCol,
      where('userId', '==', currentUserId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (!snapshot.empty) {
          const sessions: ChatSession[] = [];
          
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const sid = data.sessionId || docSnap.id;
            
            // Get messages for this session from local cache or firestore
            const cachedMsgs = localStore.get<ChatMessage[]>(`${LOCAL_MESSAGES_PREFIX}${sid}`, []);
            
            sessions.push({
              id: sid,
              title: data.title || 'New Conversation',
              pinned: !!data.pinned,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || Date.now(),
              messages: cachedMsgs,
              insights: data.insights || undefined,
            });
          }
          
          localStore.set(LOCAL_SESSIONS_KEY, sessions);
          onUpdate(sessions);
        } else if (cached.length === 0) {
          onUpdate([]);
        }
      },
      (error) => {
        console.warn('Firestore chat_sessions snapshot error, using local storage:', error.message);
        onUpdate(localStore.get<ChatSession[]>(LOCAL_SESSIONS_KEY, []));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize Firestore onSnapshot listener:', err);
    return () => {};
  }
}

/**
 * Real-time subscription to messages for a single session
 */
export function subscribeToSessionMessages(
  sessionId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  if (!sessionId) return () => {};

  const cached = localStore.get<ChatMessage[]>(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, []);
  if (cached.length > 0) {
    onUpdate(cached);
  }

  try {
    const messagesCol = collection(db, 'chat_messages');
    const q = query(
      messagesCol,
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const msgs: ChatMessage[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sender: data.role || 'assistant',
              text: data.content || '',
              timestamp: typeof data.createdAt === 'number'
                ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : String(data.createdAt || ''),
              bookmarked: !!data.bookmarked,
              language: data.language || 'English',
              imageUrl: data.imageUrl,
              fileName: data.fileName,
              fileType: data.fileType,
              fileSize: data.fileSize,
              generatedFile: data.generatedFile || undefined,
            };
          });

          localStore.set(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, msgs);
          onUpdate(msgs);
        }
      },
      (error) => {
        console.warn(`Firestore chat_messages snapshot error for ${sessionId}:`, error.message);
        onUpdate(localStore.get<ChatMessage[]>(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, []));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not bind to chat_messages:', err);
    return () => {};
  }
}

/**
 * Persists or updates a chat session in Firestore and local storage
 */
export async function syncChatSession(session: ChatSession, userId?: string | null): Promise<void> {
  const currentUserId = userId || auth.currentUser?.uid || 'guest_user';
  
  // 1. Update local storage immediately for zero-latency UI
  const existing = localStore.get<ChatSession[]>(LOCAL_SESSIONS_KEY, []);
  const idx = existing.findIndex((s) => s.id === session.id);
  let updatedList: ChatSession[];
  if (idx >= 0) {
    updatedList = [...existing];
    updatedList[idx] = { ...updatedList[idx], ...session, updatedAt: Date.now() };
  } else {
    updatedList = [{ ...session, updatedAt: Date.now() }, ...existing];
  }
  localStore.set(LOCAL_SESSIONS_KEY, updatedList);

  if (session.messages && session.messages.length > 0) {
    localStore.set(`${LOCAL_MESSAGES_PREFIX}${session.id}`, session.messages);
  }

  // 2. Sync to Firestore in background
  try {
    const sessionRef = doc(db, 'chat_sessions', session.id);
    const lastMsg = session.messages && session.messages.length > 0
      ? session.messages[session.messages.length - 1].text.slice(0, 100)
      : '';

    await setDoc(
      sessionRef,
      {
        id: session.id,
        sessionId: session.id,
        title: session.title,
        userId: currentUserId,
        pinned: !!session.pinned,
        createdAt: session.createdAt || Date.now(),
        updatedAt: Date.now(),
        lastMessage: lastMsg,
        insights: session.insights || null,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore session sync notice:', err);
  }
}

/**
 * Saves a chat message to Firestore and local cache
 */
export async function syncChatMessage(
  sessionId: string,
  message: ChatMessage,
  userId?: string | null
): Promise<void> {
  // 1. Update local cache
  const cachedMsgs = localStore.get<ChatMessage[]>(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, []);
  const mIdx = cachedMsgs.findIndex((m) => m.id === message.id);
  let updatedMsgs: ChatMessage[];
  if (mIdx >= 0) {
    updatedMsgs = [...cachedMsgs];
    updatedMsgs[mIdx] = message;
  } else {
    updatedMsgs = [...cachedMsgs, message];
  }
  localStore.set(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, updatedMsgs);

  // Also update session lastMessage and updatedAt in sessions cache
  const allSessions = localStore.get<ChatSession[]>(LOCAL_SESSIONS_KEY, []);
  const sIdx = allSessions.findIndex((s) => s.id === sessionId);
  if (sIdx >= 0) {
    allSessions[sIdx].updatedAt = Date.now();
    allSessions[sIdx].messages = updatedMsgs;
    localStore.set(LOCAL_SESSIONS_KEY, allSessions);
  }

  // 2. Sync to Firestore
  try {
    const msgRef = doc(db, 'chat_messages', message.id);
    await setDoc(
      msgRef,
      {
        id: message.id,
        sessionId,
        role: message.sender,
        content: message.text,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        bookmarked: !!message.bookmarked,
        language: message.language || 'English',
        imageUrl: message.imageUrl || null,
        fileName: message.fileName || null,
        fileType: message.fileType || null,
        fileSize: message.fileSize || null,
        generatedFile: message.generatedFile || null,
      },
      { merge: true }
    );

    // Update session doc
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await setDoc(
      sessionRef,
      {
        updatedAt: Date.now(),
        lastMessage: message.text.slice(0, 100),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore message sync notice:', err);
  }
}

/**
 * Saves an attachment record in Firestore
 */
export async function syncAttachmentRecord(
  sessionId: string,
  attachment: { id: string; fileName: string; fileType: string; size: string; url?: string }
): Promise<void> {
  try {
    const attRef = doc(db, 'attachments', attachment.id);
    await setDoc(attRef, {
      id: attachment.id,
      sessionId,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      size: attachment.size,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('Firestore attachment sync notice:', err);
  }
}

/**
 * Deletes a session and its associated messages
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  // 1. Remove from local storage
  const existing = localStore.get<ChatSession[]>(LOCAL_SESSIONS_KEY, []);
  localStore.set(
    LOCAL_SESSIONS_KEY,
    existing.filter((s) => s.id !== sessionId)
  );
  try {
    localStorage.removeItem(`easialearn_${LOCAL_MESSAGES_PREFIX}${sessionId}`);
  } catch (e) {
    // ignore
  }

  // 2. Delete from Firestore
  try {
    await deleteDoc(doc(db, 'chat_sessions', sessionId));

    // Delete message documents for this session
    const q = query(collection(db, 'chat_messages'), where('sessionId', '==', sessionId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore delete session notice:', err);
  }
}

/**
 * Deletes all chats for the user
 */
export async function deleteAllChatSessions(userId?: string | null): Promise<void> {
  const currentUserId = userId || auth.currentUser?.uid || 'guest_user';
  
  // Clear local storage
  localStore.set(LOCAL_SESSIONS_KEY, []);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes(LOCAL_MESSAGES_PREFIX)) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    // ignore
  }

  // Delete from Firestore
  try {
    const q = query(collection(db, 'chat_sessions'), where('userId', '==', currentUserId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore delete all sessions notice:', err);
  }
}
