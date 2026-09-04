import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { PrivateChat, PrivateMessage, ConnectionRequest } from './types';

export const useMessenger = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
       setLoading(false);
       return;
    }

    // 1. Listen to Private Chats (sorted in JS to avoid composite index requirement)
    const chatsQ = query(
      collection(db, 'private_chats'),
      where('participants', 'array-contains', user.uid)
    );
    
    const unsubChats = onSnapshot(chatsQ, (snap) => {
      const fetchedChats = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateChat));
      fetchedChats.sort((a, b) => {
        const timeA = (a as any).lastMessageTime;
        const timeB = (b as any).lastMessageTime;
        const tA = timeA?.toMillis ? timeA.toMillis() : (new Date(timeA || 0).getTime());
        const tB = timeB?.toMillis ? timeB.toMillis() : (new Date(timeB || 0).getTime());
        return tB - tA;
      });
      setChats(fetchedChats);
      setLoading(false);
    }, (err) => {
      console.warn('Chats snapshot warning:', err);
      setLoading(false);
    });

    // 2. Listen to Connection Requests (Pending to me)
    const reqQ = query(
      collection(db, 'connection_requests'),
      where('toUserId', '==', user.uid)
    );
    
    const unsubReqs = onSnapshot(reqQ, (snap) => {
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConnectionRequest));
      setConnectionRequests(reqs.filter(r => r.status === 'pending'));
    }, (err) => {
      console.warn('Connection requests warning:', err);
    });

    return () => {
      unsubChats();
      unsubReqs();
    };
  }, [user]);

  // Read unread messages when a chat is opened
  useEffect(() => {
    if (activeChatId && user) {
       const chatRef = doc(db, 'private_chats', activeChatId);
       updateDoc(chatRef, {
         [`unreadCounts.${user.uid}`]: 0
       }).catch(console.error);
    }
  }, [activeChatId, user]);

  return {
    chats,
    connectionRequests,
    loading,
    activeChatId,
    setActiveChatId
  };
};
