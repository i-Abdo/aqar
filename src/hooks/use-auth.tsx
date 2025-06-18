
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/client';
import type { CustomUser, UserTrustLevel } from '@/types';
import { doc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase/client';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAdmin: boolean;
  trustLevel: UserTrustLevel | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trustLevel, setTrustLevel] = useState<UserTrustLevel | null>(null);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = undefined;
      }

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const customData = userDocSnap.data();
            const userData: CustomUser = {
              ...firebaseUser,
              uid: firebaseUser.uid, // ensure uid from firebaseUser is prioritized
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              phoneNumber: firebaseUser.phoneNumber,
              isAnonymous: firebaseUser.isAnonymous,
              metadata: firebaseUser.metadata,
              providerData: firebaseUser.providerData,
              refreshToken: firebaseUser.refreshToken,
              tenantId: firebaseUser.tenantId,
              providerId: firebaseUser.providerId,
              planId: customData.planId,
              isAdmin: customData.isAdmin === true,
              trustLevel: customData.trustLevel || 'normal',
              createdAt: customData.createdAt ? (customData.createdAt as Timestamp).toDate() : new Date(),
            };
            setUser(userData);
            setIsAdmin(customData.isAdmin === true);
            setTrustLevel(customData.trustLevel || 'normal');
          } else {
            const defaultTrustLevel: UserTrustLevel = 'normal';
            setUser({ 
              ...firebaseUser, 
              trustLevel: defaultTrustLevel,
              isAdmin: false, 
            } as CustomUser);
            setIsAdmin(false);
            setTrustLevel(defaultTrustLevel);
            console.warn(`User document for UID ${firebaseUser.uid} not found in Firestore. Using defaults.`);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          const defaultTrustLevel: UserTrustLevel = 'normal';
          setUser({ ...firebaseUser, trustLevel: defaultTrustLevel, isAdmin: false } as CustomUser);
          setIsAdmin(false);
          setTrustLevel(defaultTrustLevel);
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        setTrustLevel(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, trustLevel, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
