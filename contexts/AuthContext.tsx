import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkSubscription: (userId: string) => Promise<any>;
  updateSubscription: (userId: string, subscription: any) => Promise<void>;
  upgradeToPro: (userId: string) => Promise<void>;
  resetScanCounter: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    } catch (error) {
      console.warn('Auth state listener failed:', error);
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    console.log('Starting Google login...');
    const provider = new GoogleAuthProvider();
    // Force account selection to avoid issues in embedded browsers
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    console.log('Provider configured, attempting sign in...');
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user.email);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const checkSubscription = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    console.log('Loaded subscription data for user', userId, ':', data);
    return data?.subscription || { plan: 'free', scansUsed: 0, resetDate: new Date().toISOString() };
  };

  const updateSubscription = async (userId: string, subscription: any) => {
    console.log('Updating subscription for user', userId, 'with data:', subscription);
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { subscription }, { merge: true });
    console.log('Subscription updated successfully');
  };

  const upgradeToPro = async (userId: string) => {
    const subscription = {
      plan: 'pro',
      scansUsed: 0,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      purchasedAt: new Date().toISOString()
    };
    await updateSubscription(userId, subscription);
  };

  const resetScanCounter = async (userId: string) => {
    const subscription = {
      plan: 'free',
      scansUsed: 0,
      resetDate: new Date().toISOString()
    };
    await updateSubscription(userId, subscription);
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    checkSubscription,
    updateSubscription,
    upgradeToPro,
    resetScanCounter,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};