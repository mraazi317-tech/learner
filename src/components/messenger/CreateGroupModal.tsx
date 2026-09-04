import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { X, Users, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      const code = 'G-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const groupRef = await addDoc(collection(db, 'groups'), {
        name,
        description: desc,
        code,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'group_members'), {
        groupId: groupRef.id,
        userId: user.uid,
        role: 'owner',
        joinedAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-900 text-lg">Create New Group</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="flex justify-center mb-6">
               <button type="button" className="w-20 h-20 bg-gray-100 rounded-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition border-2 border-dashed border-gray-300">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Photo</span>
               </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Group Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition text-sm resize-none"></textarea>
            </div>
            <button type="submit" disabled={loading || !name.trim()} className="w-full mt-4 py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Group & Generate Code'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
