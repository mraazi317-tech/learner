import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PrivateChat } from './types';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { BellOff, Ban, AlertTriangle, Image as ImageIcon, FileText, Link2, ChevronRight } from 'lucide-react';

interface Props {
  chat: PrivateChat;
}

export const MessengerInfo: React.FC<Props> = ({ chat }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const otherId = chat.participants.find(p => p !== user?.uid);
    if (!otherId) return;
    getDoc(doc(db, 'users', otherId)).then(s => {
      if (s.exists()) setProfile(s.data() as UserProfile);
    });
  }, [chat, user]);

  if (!profile) return <div className="w-80 border-l border-gray-200 bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-80 border-l border-gray-200 bg-[#F8FAFC] flex flex-col h-full overflow-y-auto shrink-0 hidden lg:flex">
      {/* Profile Header */}
      <div className="bg-white p-6 flex flex-col items-center border-b border-gray-200">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl mb-4 overflow-hidden shadow-sm border-2 border-white">
           {profile.photoURL ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover"/> : profile.name.charAt(0)}
        </div>
        <h2 className="font-bold text-xl text-gray-900 text-center">{profile.name}</h2>
        <p className="text-sm text-gray-500 mb-1">@{profile.username}</p>
        <p className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{profile.easiacode}</p>
      </div>

      {/* Media Links Docs */}
      <div className="mt-2 bg-white border-y border-gray-200">
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition">
           <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
             <ImageIcon className="w-5 h-5 text-gray-400" /> Media, links, and docs
           </div>
           <div className="flex items-center gap-1 text-gray-400">
             <span className="text-xs">0</span>
             <ChevronRight className="w-4 h-4" />
           </div>
        </button>
        <div className="px-4 pb-4 flex gap-2">
           <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6"/></div>
           <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><FileText className="w-6 h-6"/></div>
           <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><Link2 className="w-6 h-6"/></div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-2 bg-white border-y border-gray-200 flex flex-col">
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-sm font-semibold text-gray-700 border-b border-gray-100">
           <div className="flex items-center gap-3">
             <BellOff className="w-5 h-5 text-gray-400" /> Mute notifications
           </div>
        </button>
      </div>

      {/* Actions */}
      <div className="mt-2 bg-white border-y border-gray-200 flex flex-col">
        <button className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition text-sm font-bold text-red-600 border-b border-gray-100">
           <Ban className="w-5 h-5" /> Block {profile.name}
        </button>
        <button className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition text-sm font-bold text-red-600">
           <AlertTriangle className="w-5 h-5" /> Report {profile.name}
        </button>
      </div>
    </div>
  );
};
