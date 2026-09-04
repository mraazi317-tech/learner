import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  auth,
  db,
  googleProvider,
  generateUniqueEasiaCode,
  isSuperAdminEmail,
  checkUsernameExists,
  generateEasiaCode,
} from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { localStore } from '../lib/firebase/config';

export interface GoogleAuthPayload {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface StudentRegistrationData {
  fullName: string;
  username: string;
  phone: string;
  whatsapp?: string;
  guardianName: string;
  schoolName: string;
  class: string;
  medium: string;
  state: string;
}

export interface TeacherRegistrationData {
  fullName: string;
  username: string;
  phone: string;
  whatsapp?: string;
  institutionName: string;
  subject: string;
  qualification?: string;
  experience?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Modal controls
  isAuthModalOpen: boolean;
  openAuthModal: (step?: number | string) => void;
  closeAuthModal: () => void;
  authStep: number;
  setAuthStep: (step: number) => void;

  // Google flow
  pendingGoogleUser: GoogleAuthPayload | null;
  setPendingGoogleUser: (user: GoogleAuthPayload | null) => void;
  signInWithGoogle: () => Promise<{
    success: boolean;
    isNewUser?: boolean;
    user?: UserProfile;
    googleUser?: GoogleAuthPayload;
    error?: string;
  }>;
  loginWithGoogle: (regData?: any) => Promise<{ success: boolean; error?: string }>;

  // Registration
  createStudentAccount: (
    googleUser: GoogleAuthPayload,
    data: StudentRegistrationData
  ) => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  createTeacherAccount: (
    googleUser: GoogleAuthPayload,
    data: TeacherRegistrationData
  ) => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;

  // Management & Admin
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getAllUsers: () => Promise<UserProfile[]>;
  toggleBlockUser: (uid: string, currentStatus: string) => Promise<void>;
  deleteUserFromSystem: (uid: string) => Promise<void>;
  setUserManually: (u: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default seed users for admin table & mock fallback
const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'usr_demo_1',
    fullName: 'Amina Sheikh',
    name: 'Amina Sheikh',
    username: 'amina_sslc',
    email: 'amina.sslc@example.com',
    role: 'student',
    easiacode: 'EA-STU-8K29Q',
    phone: '9845012345',
    whatsapp: '9845012345',
    guardianName: 'Abdul Sheikh',
    school: 'Sacred Heart PU College',
    schoolName: 'Sacred Heart PU College',
    class: 'Class 10 (SSLC)',
    medium: 'English',
    state: 'Karnataka',
    status: 'Active',
    trialEndsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-01-15T09:30:00.000Z',
    profileId: 'prof_8k29q',
    streakDays: 18,
  },
  {
    uid: 'usr_demo_2',
    fullName: 'Rahul Shenoy',
    name: 'Rahul Shenoy',
    username: 'rahul_s',
    email: 'rahul.s@example.com',
    role: 'student',
    easiacode: 'EA-STU-4M77P',
    phone: '9845067890',
    whatsapp: '9845067890',
    guardianName: 'Suresh Shenoy',
    school: 'St. Aloysius High School',
    schoolName: 'St. Aloysius High School',
    class: 'Class 10 (SSLC)',
    medium: 'English',
    state: 'Karnataka',
    status: 'Active',
    trialEndsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-01-20T11:15:00.000Z',
    profileId: 'prof_4m77p',
    streakDays: 12,
  },
  {
    uid: 'usr_demo_3',
    fullName: 'Prof. M. K. Rao',
    name: 'Prof. M. K. Rao',
    username: 'mkrao_physics',
    email: 'mkrao.faculty@example.com',
    role: 'teacher',
    easiacode: 'EA-TCH-5P91X',
    phone: '9448011223',
    whatsapp: '9448011223',
    institution: 'Vidya Mandir Composite PU College',
    institutionName: 'Vidya Mandir Composite PU College',
    subject: 'Physics',
    qualification: 'M.Sc, B.Ed (Physics)',
    experience: '12 Years',
    status: 'Active',
    trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2025-11-02T08:00:00.000Z',
    profileId: 'prof_5p91x',
  },
  {
    uid: 'usr_demo_4',
    fullName: 'Sneha Patil',
    name: 'Sneha Patil',
    username: 'sneha_puc',
    email: 'sneha.p@example.com',
    role: 'student',
    easiacode: 'EA-STU-9W33B',
    phone: '9741022334',
    whatsapp: '9741022334',
    guardianName: 'Venkatesh Patil',
    school: 'Sacred Heart PU College',
    schoolName: 'Sacred Heart PU College',
    class: 'PUC I (Science)',
    medium: 'English',
    state: 'Karnataka',
    status: 'Active',
    trialEndsAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-02-01T14:20:00.000Z',
    profileId: 'prof_9w33b',
    streakDays: 5,
  },
  {
    uid: 'usr_demo_5',
    fullName: 'Zaid Ansari',
    name: 'Zaid Ansari',
    username: 'zaid_ansari',
    email: 'zaid.a@example.com',
    role: 'student',
    easiacode: 'EA-STU-1R44L',
    phone: '9980033445',
    whatsapp: '9980033445',
    guardianName: 'Mohammed Ansari',
    school: 'National High School',
    schoolName: 'National High School',
    class: 'Class 10 (SSLC)',
    medium: 'English',
    state: 'Karnataka',
    status: 'Blocked',
    trialEndsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-01-10T10:00:00.000Z',
    profileId: 'prof_1r44l',
    streakDays: 0,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    return localStore.get<UserProfile | null>('current_user', null);
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<GoogleAuthPayload | null>(null);

  const role: UserRole = user?.role || 'student';
  const isAuthenticated = !!user;

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStore.set('current_user', user);
    } else {
      try {
        localStorage.removeItem('easialearn_current_user');
      } catch {
        // noop
      }
    }
  }, [user]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Check Super Admin
        if (isSuperAdminEmail(firebaseUser.email)) {
          const adminProfile: UserProfile = {
            uid: firebaseUser.uid,
            fullName: 'Super Admin',
            name: 'Super Admin',
            username: 'admin',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'admin',
            easiacode: 'EA-ADM-00001',
            status: 'Active',
            createdAt: new Date().toISOString(),
            trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            profileId: 'prof_admin',
          };
          setUser(adminProfile);
          setAuthLoading(false);
          return;
        }

        // 2. Fetch user from Firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser(data);
          } else {
            // Check if profiles doc exists
            const profRef = doc(db, 'profiles', firebaseUser.uid);
            const profSnap = await getDoc(profRef);
            if (profSnap.exists()) {
              const data = profSnap.data() as UserProfile;
              setUser(data);
            }
          }
        } catch (err) {
          console.warn('Could not read user profile from firestore:', err);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Step 1: Sign in with Google
  const signInWithGoogle = async (): Promise<{
    success: boolean;
    isNewUser?: boolean;
    user?: UserProfile;
    googleUser?: GoogleAuthPayload;
    error?: string;
  }> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = res.user.email || '';
      const uid = res.user.uid;
      const displayName = res.user.displayName || (email.split('@')[0] || 'User');
      const photoURL = res.user.photoURL || undefined;

      // 1. Super Admin
      if (isSuperAdminEmail(email)) {
        const adminProfile: UserProfile = {
          uid,
          fullName: 'Super Admin',
          name: 'Super Admin',
          username: 'admin',
          email,
          photoURL,
          role: 'admin',
          easiacode: 'EA-ADM-00001',
          status: 'Active',
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          profileId: 'prof_admin',
        };
        setUser(adminProfile);
        try {
          await setDoc(doc(db, 'users', uid), adminProfile, { merge: true });
        } catch {
          // ignore
        }
        return { success: true, isNewUser: false, user: adminProfile };
      }

      // 2. Check if user already exists in Firestore
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const existingData = snap.data() as UserProfile;
        // User already has completed profile
        if (existingData.role && existingData.easiacode) {
          setUser(existingData);
          return { success: true, isNewUser: false, user: existingData };
        }
      }

      // 3. User is new or profile incomplete -> store pending Google details
      const gUser: GoogleAuthPayload = {
        uid,
        email,
        displayName,
        photoURL,
      };
      setPendingGoogleUser(gUser);
      return { success: true, isNewUser: true, googleUser: gUser };
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      return {
        success: false,
        error: err.message || 'Google authentication failed. Please try again.',
      };
    }
  };

  // Backwards compatible loginWithGoogle
  const loginWithGoogle = async () => {
    const res = await signInWithGoogle();
    if (res.success && !res.isNewUser) {
      setIsAuthModalOpen(false);
      return { success: true };
    }
    if (res.success && res.isNewUser) {
      setAuthStep(2);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Step 3 (Student): Create Student Account
  const createStudentAccount = async (
    googleUser: GoogleAuthPayload,
    data: StudentRegistrationData
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
    try {
      const easiacode = await generateUniqueEasiaCode('student');
      const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const createdAt = new Date().toISOString();

      const newProfile: UserProfile = {
        uid: googleUser.uid,
        fullName: data.fullName.trim(),
        name: data.fullName.trim(),
        username: data.username.trim().toLowerCase(),
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        role: 'student',
        easiacode,
        profileId,
        phone: data.phone.trim(),
        whatsapp: data.whatsapp?.trim() || data.phone.trim(),
        guardianName: data.guardianName.trim(),
        school: data.schoolName.trim(),
        schoolName: data.schoolName.trim(),
        class: data.class,
        medium: data.medium,
        state: data.state,
        status: 'Active',
        trialEndsAt,
        createdAt,
        streakDays: 1,
      };

      // Write to Firestore collections
      try {
        await setDoc(doc(db, 'users', googleUser.uid), newProfile);
        await setDoc(doc(db, 'profiles', googleUser.uid), newProfile);
        await setDoc(doc(db, 'students', googleUser.uid), {
          uid: googleUser.uid,
          role: 'student',
          fullName: data.fullName.trim(),
          username: data.username.trim().toLowerCase(),
          email: googleUser.email,
          phone: data.phone.trim(),
          whatsapp: data.whatsapp?.trim() || data.phone.trim(),
          guardianName: data.guardianName.trim(),
          school: data.schoolName.trim(),
          schoolName: data.schoolName.trim(),
          class: data.class,
          medium: data.medium,
          state: data.state,
          photoURL: googleUser.photoURL || '',
          easiacode,
          profileId,
          trialEndsAt,
          createdAt,
          status: 'Active',
        });
      } catch (firestoreErr) {
        console.warn('Firestore write warning:', firestoreErr);
      }

      // Add to local list of users for admin visibility
      const storedUsers = localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
      const updatedList = [newProfile, ...storedUsers.filter((u) => u.uid !== newProfile.uid)];
      localStore.set('users_list', updatedList);

      setUser(newProfile);
      setPendingGoogleUser(null);
      return { success: true, profile: newProfile };
    } catch (err: any) {
      console.error('Create Student Account error:', err);
      return { success: false, error: err.message || 'Failed to create student account' };
    }
  };

  // Step 3 (Teacher): Create Teacher Account
  const createTeacherAccount = async (
    googleUser: GoogleAuthPayload,
    data: TeacherRegistrationData
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
    try {
      const easiacode = await generateUniqueEasiaCode('teacher');
      const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const createdAt = new Date().toISOString();

      const newProfile: UserProfile = {
        uid: googleUser.uid,
        fullName: data.fullName.trim(),
        name: data.fullName.trim(),
        username: data.username.trim().toLowerCase(),
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        role: 'teacher',
        easiacode,
        profileId,
        phone: data.phone.trim(),
        whatsapp: data.whatsapp?.trim() || data.phone.trim(),
        institution: data.institutionName.trim(),
        institutionName: data.institutionName.trim(),
        subject: data.subject.trim(),
        qualification: data.qualification?.trim() || '',
        experience: data.experience?.trim() || '',
        status: 'Active',
        trialEndsAt,
        createdAt,
      };

      try {
        await setDoc(doc(db, 'users', googleUser.uid), newProfile);
        await setDoc(doc(db, 'profiles', googleUser.uid), newProfile);
        await setDoc(doc(db, 'teachers', googleUser.uid), {
          uid: googleUser.uid,
          role: 'teacher',
          fullName: data.fullName.trim(),
          username: data.username.trim().toLowerCase(),
          email: googleUser.email,
          phone: data.phone.trim(),
          whatsapp: data.whatsapp?.trim() || data.phone.trim(),
          institution: data.institutionName.trim(),
          institutionName: data.institutionName.trim(),
          subject: data.subject.trim(),
          qualification: data.qualification?.trim() || '',
          experience: data.experience?.trim() || '',
          photoURL: googleUser.photoURL || '',
          easiacode,
          profileId,
          trialEndsAt,
          createdAt,
          status: 'Active',
        });
      } catch (firestoreErr) {
        console.warn('Firestore write warning:', firestoreErr);
      }

      const storedUsers = localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
      const updatedList = [newProfile, ...storedUsers.filter((u) => u.uid !== newProfile.uid)];
      localStore.set('users_list', updatedList);

      setUser(newProfile);
      setPendingGoogleUser(null);
      return { success: true, profile: newProfile };
    } catch (err: any) {
      console.error('Create Teacher Account error:', err);
      return { success: false, error: err.message || 'Failed to create teacher account' };
    }
  };

  // Check username availability
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    if (!username || username.trim().length < 3) return false;
    const cleanUser = username.trim().toLowerCase();

    // Check in localStore users list first
    const stored = localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
    if (stored.some((u) => u.username?.toLowerCase() === cleanUser && u.uid !== user?.uid)) {
      return false;
    }

    // Check Firestore
    try {
      const exists = await checkUsernameExists(cleanUser);
      return !exists;
    } catch {
      return true;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setPendingGoogleUser(null);
    localStore.set('current_user', null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      await setDoc(doc(db, 'profiles', user.uid), updates, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Panel User operations
  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const colRef = collection(db, 'users');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreUsers: UserProfile[] = [];
        snap.forEach((d) => {
          firestoreUsers.push(d.data() as UserProfile);
        });
        // Merge with demo users if any missing
        const combined = [...firestoreUsers];
        INITIAL_DEMO_USERS.forEach((demo) => {
          if (!combined.some((u) => u.uid === demo.uid || u.email === demo.email)) {
            combined.push(demo);
          }
        });
        localStore.set('users_list', combined);
        return combined;
      }
    } catch (err) {
      console.warn('Falling back to local users list:', err);
    }
    return localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
  };

  const toggleBlockUser = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
      await updateDoc(doc(db, 'profiles', uid), { status: newStatus });
    } catch (err) {
      console.warn('Could not update status in firestore:', err);
    }
    // Update local list
    const list = localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
    const updated = list.map((u) => (u.uid === uid ? { ...u, status: newStatus as any } : u));
    localStore.set('users_list', updated);
  };

  const deleteUserFromSystem = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'profiles', uid));
      await deleteDoc(doc(db, 'students', uid));
      await deleteDoc(doc(db, 'teachers', uid));
    } catch (err) {
      console.warn('Could not delete user from firestore:', err);
    }
    const list = localStore.get<UserProfile[]>('users_list', INITIAL_DEMO_USERS);
    const updated = list.filter((u) => u.uid !== uid);
    localStore.set('users_list', updated);
  };

  const openAuthModal = (step: number | string = 1) => {
    if (typeof step === 'string') {
      setAuthStep(1);
    } else {
      setAuthStep(step);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        authLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authStep,
        setAuthStep,
        pendingGoogleUser,
        setPendingGoogleUser,
        signInWithGoogle,
        loginWithGoogle,
        createStudentAccount,
        createTeacherAccount,
        checkUsernameAvailable,
        logout,
        updateProfile,
        getAllUsers,
        toggleBlockUser,
        deleteUserFromSystem,
        setUserManually: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
