import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Check, X, Smartphone, MessageCircle, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const adminPhone = '9632534650';

  if (!isOpen || !user) return null;

  const handleRequest = async (platform: 'whatsapp' | 'telegram') => {
    setLoading(true);
    try {
      // Create request in Firestore
      await addDoc(collection(db, 'pro_requests'), {
        userId: user.uid,
        name: user.name,
        username: user.username,
        easiacode: user.easiacode,
        role: user.role,
        phone: user.phone || '',
        email: user.email,
        status: 'Pending',
        createdAt: serverTimestamp()
      });

      const message = `Hello EasiaLearn Team,
I want to upgrade to EasiaLearn Pro.

Name: ${user.name}
Username: ${user.username}
EasiaCode: ${user.easiacode}
Role: ${user.role}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}

Please activate my Pro account.`;

      const encodedMessage = encodeURIComponent(message);
      
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/91${adminPhone}?text=${encodedMessage}`, '_blank');
      } else {
        // Assuming telegram uses t.me
        window.open(`https://t.me/+91${adminPhone}?text=${encodedMessage}`, '_blank');
      }
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <Star className="w-6 h-6 fill-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Upgrade to EasiaLearn Pro</h2>
          <p className="text-gray-500 mt-2">Unlock unlimited mock tests, AI tutor, and premium certificates.</p>
          <div className="text-3xl font-extrabold text-[#2952CC] mt-4">₹1000 <span className="text-sm text-gray-400 font-medium">/ lifetime</span></div>
        </div>

        <div className="space-y-3 mb-8">
          {['Unlimited AI Tutor Sessions', 'All Premium Mock Tests', 'Downloadable Certificates', 'Priority Teacher Support'].map((feat, i) => (
             <div key={i} className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                 <Check className="w-3 h-3 text-emerald-600" />
               </div>
               <span className="text-sm font-medium text-gray-700">{feat}</span>
             </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-wider mb-2">Request upgrade via</p>
          
          <button
            onClick={() => handleRequest('whatsapp')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-bold shadow-md transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Send via WhatsApp
          </button>
          
          <button
            onClick={() => handleRequest('telegram')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#007AB8] text-white text-sm font-bold shadow-md transition-all"
          >
            <Smartphone className="w-5 h-5" />
            Send via Telegram
          </button>
        </div>
      </motion.div>
    </div>
  );
};
