import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Users, UserPlus, Check, X as XIcon, MessageSquare } from 'lucide-react';
import { PrivateChat, ConnectionRequest } from './types';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { EasiaCodeConnectModal } from './EasiaCodeConnectModal';
import { CreateGroupModal } from './CreateGroupModal';

interface Props {
  chats: PrivateChat[];
  requests: ConnectionRequest[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

export const MessengerSidebar: React.FC<Props> = ({ chats, requests, activeChatId, onSelectChat }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    // Fetch profiles for chats
    const fetchProfiles = async () => {
      if (!user) return;
      const newProfiles = { ...profiles };
      let changed = false;

      for (const chat of chats) {
        const otherId = chat.participants.find(p => p !== user.uid);
        if (otherId && !newProfiles[otherId]) {
          const snap = await getDoc(doc(db, 'users', otherId));
          if (snap.exists()) {
            newProfiles[otherId] = snap.data() as UserProfile;
            changed = true;
          }
        }
      }
      for (const req of requests) {
         if (!newProfiles[req.fromUserId]) {
            const snap = await getDoc(doc(db, 'users', req.fromUserId));
            if (snap.exists()) {
               newProfiles[req.fromUserId] = snap.data() as UserProfile;
               changed = true;
            }
         }
      }
      
      if (changed) setProfiles(newProfiles);
    };
    fetchProfiles();
  }, [chats, requests, user]);

  const handleAcceptRequest = async (req: ConnectionRequest) => {
    if (!user || !req.id) return;
    try {
      // 1. Update request status
      await updateDoc(doc(db, 'connection_requests', req.id), { status: 'accepted' });
      
      // 2. Add to connections
      // Wait, connections might not exist yet, we can just create a chat.
      // Usually you maintain a 'connections' doc, but a chat is essentially a connection.
      const chatRef = await addDoc(collection(db, 'private_chats'), {
        participants: [user.uid, req.fromUserId],
        lastMessage: 'Connection established',
        lastMessageTime: serverTimestamp(),
        unreadCounts: { [user.uid]: 0, [req.fromUserId]: 0 }
      });

      // 3. Optional: add to connections collection
      await addDoc(collection(db, 'connections'), {
         users: [user.uid, req.fromUserId],
         connectedAt: serverTimestamp()
      });

      onSelectChat(chatRef.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (req: ConnectionRequest) => {
    if (!req.id) return;
    await updateDoc(doc(db, 'connection_requests', req.id), { status: 'declined' });
  };

  return (
    <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsConnectModalOpen(true)}
            className="w-8 h-8 rounded-full bg-[#2952CC] text-white flex items-center justify-center hover:bg-blue-700 transition"
            title="Connect via EasiaCode"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button onClick={() => setIsGroupModalOpen(true)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition" title="Create Group">
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Requests */}
        {requests.length > 0 && (
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Requests ({requests.length})</h3>
            <div className="space-y-2">
              {requests.map(req => {
                const profile = profiles[req.fromUserId];
                if (!profile) return null;
                return (
                  <div key={req.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                         {profile.name.charAt(0)}
                       </div>
                       <div className="truncate">
                         <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
                         <p className="text-[10px] text-blue-600">Wants to connect</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleAcceptRequest(req)} className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200"><Check className="w-4 h-4"/></button>
                      <button onClick={() => handleDeclineRequest(req)} className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"><XIcon className="w-4 h-4"/></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chats */}
        <div className="p-2 space-y-1">
          {chats.length === 0 && requests.length === 0 && (
             <div className="text-center p-6">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet.</p>
                <button onClick={() => setIsConnectModalOpen(true)} className="mt-3 text-xs font-bold text-[#2952CC] hover:underline">Connect with EasiaCode</button>
             </div>
          )}
          {chats.map(chat => {
            const otherId = chat.participants.find(p => p !== user?.uid);
            if (!otherId) return null;
            const profile = profiles[otherId];
            if (!profile) return null;
            
            const isActive = activeChatId === chat.id;
            const unreadCount = (user && chat.unreadCounts?.[user.uid]) || 0;

            let timeStr = '';
            if (chat.lastMessageTime) {
               // Convert to simple time if today, else date
               const d = (chat.lastMessageTime as any).toDate ? (chat.lastMessageTime as any).toDate() : new Date();
               timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id!)}
                className={`w-full p-3 flex items-start gap-3 rounded-xl transition ${isActive ? 'bg-[#2952CC] text-white' : 'hover:bg-gray-50 bg-white text-gray-900'}`}
              >
                <div className="relative shrink-0">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                     {profile.photoURL ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover"/> : profile.name.charAt(0)}
                   </div>
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h4>
                    <span className={`text-[10px] shrink-0 ml-2 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{timeStr}</span>
                  </div>
                  <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'} ${unreadCount > 0 ? 'font-semibold' : ''}`}>
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {unreadCount > 0 && !isActive && (
                  <div className="shrink-0 mt-1">
                    <span className="bg-[#2952CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      <EasiaCodeConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
    </div>
  );
};
