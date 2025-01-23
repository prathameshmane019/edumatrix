"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadUserProfile = () => {
      const storedProfile = sessionStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setUser(parsedProfile);
        } catch (error) {
          console.error("Error parsing profile:", error);
        }
      }
      setLoading(false);
    };

    if (status === 'authenticated') {
      if (session?.user) {
        // If we have a session, update the user state and session storage
        const userProfile = { ...session.user };
        setUser(userProfile);
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        setLoading(false);
      } else {
        // If no session user, try to load from session storage
        loadUserProfile();
      }
    } else if (status === 'unauthenticated') {
      setUser(null);
      sessionStorage.removeItem('userProfile');
      setLoading(false);
    } else {
      // If loading, try to load from session storage
      loadUserProfile();
    }
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
