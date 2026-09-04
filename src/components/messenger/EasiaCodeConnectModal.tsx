import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Search, QrCode, X, UserPlus, Check, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';

interface EasiaCodeConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasiaCodeConnectModal: React.FC<EasiaCodeConnectModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [easiaCode, setEasiaCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [foundUserDetails, setFoundUserDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = easiaCode.trim().toUpperCase();
    if (!cleanCode || !user) return;

    setIsSearching(true);
    setError('');
    setFoundUser(null);
    setFoundUserDetails(null);
    setRequestSent(false);

    try {
      const usersRef = collection(db, 'users');
      const allUsersSnap = await getDocs(usersRef);
      
      let matchedDoc: any = null;
      allUsersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const code = (data.easiacode || data.easiaCode || '').trim().toUpperCase();
        if (code === cleanCode) {
          matchedDoc = { id: docSnap.id, ...data };
        }
      });

      if (!matchedDoc) {
        setError(`No user found with EasiaCode "${cleanCode}".`);
        setIsSearching(false);
        return;
      }

      const u = matchedDoc as UserProfile;
      if (u.uid === user.uid) {
        setError('You cannot connect with yourself.');
        setIsSearching(false);
        return;
      }

      // Check pending requests and connections safely without complex composite queries
      try {
        const reqSnap = await getDocs(collection(db, 'connection_requests'));
        const hasPending = reqSnap.docs.some(d => {
          const data = d.data();
          return data.status === 'pending' && 
            ((data.fromUserId === user.uid && data.toUserId === u.uid) || 
             (data.fromUserId === u.uid && data.toUserId === user.uid));
        });
        if (hasPending) {
           setError('A connection request is already pending between you two.');
           setIsSearching(false);
           return;
        }

        const connSnap = await getDocs(collection(db, 'connections'));
        const alreadyConnected = connSnap.docs.some(d => {
          const data = d.data();
          const users = data.users || [];
          return users.includes(user.uid) && users.includes(u.uid);
        });
        if (alreadyConnected) {
           setError('You are already connected with this user.');
           setIsSearching(false);
           return;
        }
      } catch (subErr) {
        console.warn('Connection check warning:', subErr);
      }

      setFoundUser(u);

      // Fetch extra details if available
      try {
        let detailsRef;
        if (u.role === 'student') detailsRef = collection(db, 'students');
        else if (u.role === 'teacher') detailsRef = collection(db, 'teachers');
        else if (u.role === 'institution') detailsRef = collection(db, 'institutions');

        if (detailsRef) {
          const dSnap = await getDocs(detailsRef);
          const detailDoc = dSnap.docs.find(d => {
            const dat = d.data() as any;
            return dat.uid === u.uid || dat.easiacode === cleanCode;
          });
          if (detailDoc) setFoundUserDetails(detailDoc.data() as any);
        }
      } catch (dErr) {
        console.warn('Details fetch warning:', dErr);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !foundUser) return;
    try {
      await addDoc(collection(db, 'connection_requests'), {
        fromUserId: user.uid,
        toUserId: foundUser.uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      // Send notification to recipient's notification bar
      await addDoc(collection(db, 'notifications'), {
        userId: foundUser.uid,
        title: 'New Connection Request',
        description: `${user.name || 'Someone'} wants to connect with you via EasiaCode.`,
        message: `${user.name || 'Someone'} (${user.easiacode || 'User'}) sent you a connection request. Accept to unlock messaging.`,
        time: 'Just now',
        timestamp: serverTimestamp(),
        read: false,
        type: 'connection_request',
        linkTab: 'messages',
        createdAt: serverTimestamp(),
      });

      setRequestSent(true);
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request.');
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
            <h2 className="font-bold text-gray-900 text-lg">Connect via EasiaCode</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="EA-XXX-XXXXXX"
                  value={easiaCode}
                  onChange={(e) => setEasiaCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden uppercase font-mono transition"
                />
              </div>
              <button
                type="button"
                className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition"
                title="Scan QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </form>

            <button
              onClick={handleSearch}
              disabled={isSearching || !easiaCode.trim()}
              className="w-full mt-3 py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            {foundUser && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 border border-gray-100 rounded-2xl bg-white shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden shrink-0">
                     {foundUser.photoURL ? <img src={foundUser.photoURL} alt="" className="w-full h-full object-cover"/> : foundUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{foundUser.name}</h3>
                    <p className="text-sm text-gray-500">@{foundUser.username}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600 capitalize">{foundUser.role}</span>
                    </div>
                  </div>
                </div>

                {foundUserDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    {foundUser.role === 'student' && <p><strong>School:</strong> {foundUserDetails.schoolName}</p>}
                    {foundUser.role === 'teacher' && <p><strong>Institution:</strong> {foundUserDetails.institution}</p>}
                    {foundUser.role === 'institution' && <p><strong>Principal:</strong> {foundUserDetails.principalName}</p>}
                  </div>
                )}

                <button
                  onClick={handleSendRequest}
                  disabled={requestSent}
                  className={`w-full mt-5 py-2.5 flex items-center justify-center gap-2 font-bold rounded-xl transition ${
                    requestSent ? 'bg-green-50 text-green-600' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {requestSent ? (
                    <><Check className="w-4 h-4" /> Request Sent</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Send Connection Request</>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
