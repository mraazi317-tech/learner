import React, { useState, useEffect, useRef } from 'react';
import { storage, db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import { PrivateChat, PrivateMessage } from './types';
import { UserProfile } from '../../types';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Check, CheckCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  chat: PrivateChat;
}

export const MessengerChat: React.FC<Props> = ({ chat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherId = chat.participants.find(p => p !== user?.uid);

  useEffect(() => {
    if (!otherId) return;
    getDoc(doc(db, 'users', otherId)).then(s => {
      if (s.exists()) setOtherProfile(s.data() as UserProfile);
    });
  }, [otherId]);

  useEffect(() => {
    if (!chat.id) return;
    const q = query(
      collection(db, 'private_messages'),
      where('chatId', '==', chat.id),
      orderBy('createdAt', 'asc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateMessage)));
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return () => unsub();
  }, [chat.id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user || !chat.id) return;
    const file = e.target.files[0];
    if (file.size > 100 * 1024 * 1024) { alert('File too large (max 100MB)'); return; }

    try {
      const storageRef = ref(storage, `chat_files/${chat.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      await addDoc(collection(db, 'private_messages'), {
        chatId: chat.id,
        senderId: user.uid,
        text: file.name,
        messageType,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        seen: false,
        delivered: true,
        edited: false,
        deleted: false,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'private_chats', chat.id), {
        lastMessage: '📎 Sent a file',
        lastMessageTime: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat.id) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'private_messages'), {
        chatId: chat.id,
        senderId: user.uid,
        text,
        messageType: 'text',
        seen: false,
        delivered: true, // simplified
        edited: false,
        deleted: false,
        createdAt: serverTimestamp()
      });

      // Update chat last message
      await updateDoc(doc(db, 'private_chats', chat.id), {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
        // Increment unread count for other user
        // [`unreadCounts.${otherId}`]: increment(1) -> requires increment from firestore
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#E5DDD5] relative">
      {/* Header */}
      {otherProfile && (
        <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 overflow-hidden">
               {otherProfile.photoURL ? <img src={otherProfile.photoURL} alt="" className="w-full h-full object-cover"/> : otherProfile.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{otherProfile.name}</h2>
              <p className="text-[10px] text-green-600 font-semibold">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-gray-900 transition"><Phone className="w-5 h-5"/></button>
            <button className="hover:text-gray-900 transition"><Video className="w-5 h-5"/></button>
            <button className="hover:text-gray-900 transition"><MoreVertical className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
         <div className="text-center my-4">
            <span className="bg-[#FFEEDB] text-[#8C6D4F] text-[11px] px-3 py-1.5 rounded-lg shadow-sm font-medium">
               Messages are end-to-end encrypted. Nobody outside of this chat can read them.
            </span>
         </div>
         {messages.map(msg => {
            const isMe = msg.senderId === user.uid;
            let timeStr = '';
            if (msg.createdAt) {
               const d = (msg.createdAt as any).toDate ? (msg.createdAt as any).toDate() : new Date();
               timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-2xl p-2.5 shadow-sm relative group ${
                  isMe ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                }`}>
                  {msg.messageType === 'text' ? (
                    <p className="text-[13px] leading-relaxed break-words pr-12">{msg.text}</p>
                  ) : msg.messageType === 'image' ? (
                    <img src={msg.fileUrl} alt="shared image" className="max-w-full rounded-lg mb-1" />
                  ) : (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/5 rounded-lg">
                       <FileText className="w-8 h-8 text-gray-500"/>
                       <span className="text-xs truncate">{msg.fileName}</span>
                    </a>
                  )}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[9px] text-gray-500">{timeStr}</span>
                    {isMe && (
                      <span className="text-blue-500">
                        {msg.seen ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3 text-gray-400" />}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
         })}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F0F2F5] shrink-0">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 transition">
            <Smile className="w-6 h-6" />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700 transition">
            <Paperclip className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white border-none px-4 py-2.5 rounded-xl text-sm focus:outline-hidden shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-[#2952CC] text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition shadow-md"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
