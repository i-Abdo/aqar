
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/client';
import type { CustomUser, UserTrustLevel } from '@/types';
import { doc, getDoc, onSnapshot, Timestamp, collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from '@/lib/firebase/client';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAdmin: boolean;
  trustLevel: UserTrustLevel | null;
  signOut: () => Promise<void>;
  userDashboardNotificationCount: number;
  setUserDashboardNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  adminNotificationCount: number;
  setAdminNotificationCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trustLevel, setTrustLevel] = useState<UserTrustLevel | null>(null);
  const [userDashboardNotificationCount, setUserDashboardNotificationCount] = useState(0);
  const [adminNotificationCount, setAdminNotificationCount] = useState(0);


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
              uid: firebaseUser.uid, 
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
        setUserDashboardNotificationCount(0); 
        setAdminNotificationCount(0); 
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

  // Fetch user dashboard notifications
  useEffect(() => {
    if (user && !loading) {
      const fetchUserNotifications = async () => {
        try {
          const appealsQuery = query(
            collection(db, "property_appeals"),
            where("ownerUserId", "==", user.uid),
            where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"])
          );
          const issuesQuery = query(
            collection(db, "user_issues"),
            where("userId", "==", user.uid),
            where("status", "in", ["in_progress", "resolved"])
          );
          const [appealsSnapshot, issuesSnapshot] = await Promise.all([
            getCountFromServer(appealsQuery),
            getCountFromServer(issuesQuery),
          ]);
          setUserDashboardNotificationCount(appealsSnapshot.data().count + issuesSnapshot.data().count);
        } catch (error) {
          console.error("Error fetching user dashboard notification counts in AuthProvider:", error);
          setUserDashboardNotificationCount(0);
        }
      };
      fetchUserNotifications();
    } else if (!user) {
      setUserDashboardNotificationCount(0);
    }
  }, [user, loading]);

  // Fetch admin notifications
  useEffect(() => {
    if (user && isAdmin && !loading) {
      const fetchAdminNotifications = async () => {
        try {
          const pendingPropsQuery = query(collection(db, "properties"), where("status", "==", "pending"));
          const newReportsQuery = query(collection(db, "reports"), where("status", "==", "new"));
          const newUserIssuesQuery = query(collection(db, "user_issues"), where("status", "==", "new"));
          const newAppealsQuery = query(collection(db, "property_appeals"), where("appealStatus", "==", "new"));

          const [pendingSnapshot, reportsSnapshot, issuesSnapshot, appealsSnapshot] = await Promise.all([
            getCountFromServer(pendingPropsQuery),
            getCountFromServer(newReportsQuery),
            getCountFromServer(newUserIssuesQuery),
            getCountFromServer(newAppealsQuery),
          ]);

          setAdminNotificationCount(
            pendingSnapshot.data().count +
            reportsSnapshot.data().count +
            issuesSnapshot.data().count +
            appealsSnapshot.data().count
          );
        } catch (error) {
          console.error("Error fetching admin notification counts in AuthProvider:", error);
          setAdminNotificationCount(0);
        }
      };
      fetchAdminNotifications();
    } else if (!user || !isAdmin) {
      setAdminNotificationCount(0);
    }
  }, [user, isAdmin, loading]);

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        isAdmin, 
        trustLevel, 
        signOut,
        userDashboardNotificationCount,
        setUserDashboardNotificationCount, // Still provide setter if needed elsewhere, though primary update is here
        adminNotificationCount,
        setAdminNotificationCount // Still provide setter if needed elsewhere
    }}>
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
