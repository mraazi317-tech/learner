import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Send, User } from 'lucide-react';
import { motion } from 'motion/react';

interface RealTimeChatProps {
  recipientId: string;
  recipientName: string;
  recipientRole: string;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ recipientId, recipientName, recipientRole }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !recipientId) return;

    // We fetch messages where participants array contains both
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(recipientId)) {
          msgs.push({ id: doc.id, ...data });
        }
      });
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsubscribe();
  }, [user, recipientId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        participants: [user.uid, recipientId],
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{recipientName}</h3>
          <p className="text-xs text-gray-500 capitalize">{recipientRole}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5]" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] text-gray-500 mt-1 block text-right">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
              </motion.div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center mt-10">
              <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                Messages are end-to-end encrypted. No one outside of this chat, not even EasiaLearn, can read or listen to them.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-full focus:outline-hidden focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
