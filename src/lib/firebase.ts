import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const SUPER_ADMIN_EMAILS = [
  'webz3321@gmail.com',
  'mraazi317@gmail.com'
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

// Utils
export const generateEasiaCode = (role: string) => {
  const prefixMap: Record<string, string> = {
    'student': 'STU',
    'teacher': 'TCH',
    'institution': 'INS',
    'admin': 'ADM'
  };
  const prefix = prefixMap[role.toLowerCase()] || 'USR';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EA-${prefix}-${result}`;
};

export const generateUniqueEasiaCode = async (role: string): Promise<string> => {
  const prefixMap: Record<string, string> = {
    'student': 'STU',
    'teacher': 'TCH',
    'institution': 'INS',
    'admin': 'ADM'
  };
  const prefix = prefixMap[role.toLowerCase()] || 'USR';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 5; attempt++) {
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `EA-${prefix}-${result}`;
    try {
      const q = query(collection(db, 'users'), where('easiacode', '==', candidate));
      const snap = await getDocs(q);
      if (snap.empty) {
        return candidate;
      }
    } catch {
      return candidate;
    }
  }

  return `EA-${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  if (!username) return false;
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase().trim()));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
};

