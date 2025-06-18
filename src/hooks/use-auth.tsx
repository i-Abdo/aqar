
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/client'; // Ensure this path is correct
import type { CustomUser } from '@/types';
import { doc, getDoc, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import { db } from '@/lib/firebase/client';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore(); // Cleanup previous Firestore listener
        unsubscribeFirestore = undefined;
      }

      if (firebaseUser) {
        setLoading(true); // Set loading true while fetching/listening to Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const customData = userDocSnap.data();
            setUser({ 
                ...firebaseUser, 
                ...customData, 
                isTrusted: customData.isTrusted === undefined ? true : customData.isTrusted // Default to true if undefined
            } as CustomUser);
            setIsAdmin(customData.isAdmin === true);
          } else {
            // User exists in Auth but not Firestore. 
            // This case should ideally be handled during signup (AuthForm creates the doc).
            // If doc is deleted manually, this is a fallback.
            setUser(firebaseUser as CustomUser); 
            setIsAdmin(false); 
            console.warn(`User document for UID ${firebaseUser.uid} not found in Firestore during onSnapshot.`);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUser(firebaseUser as CustomUser); // Fallback to auth data if Firestore listen fails
          setIsAdmin(false);
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsAdmin(false);
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
      // setUser and setIsAdmin will be handled by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      // setLoading(false) will be handled by onAuthStateChanged when user becomes null
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
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
