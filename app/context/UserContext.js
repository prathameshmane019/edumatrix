import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

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

  const fetchUserProfile = async () => {
    try {
      console.log(session);
      
      if (!session?.user?._id || !session?.user?.role) {
        return null;
      }

      const role = session.user.role === "admin" 
        ? "department"
        : session.user.role === "superadmin" 
          ? "institute" 
          : session.user.role;

      const res = await axios.get(`/api/v2/${role}?_id=${session.user._id}`);
      const profileData = Array.isArray(res.data) ? res.data[0] : res.data;
      
      return {
        ...profileData,
        role: session.user.role,
        hasActiveSubscription: session.user.hasActiveSubscription,
        subscribedServices: session.user.subscribedServices,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      setLoading(true);

      if (status === 'authenticated') {
        // Try to get from sessionStorage first
        const storedProfile = sessionStorage.getItem('userProfile');
        let freshProfile
        if (storedProfile) {
          try {
            const parsedProfile = JSON.parse(storedProfile);
            if (mounted) {
              setUser(parsedProfile);
              setLoading(false);
            }
          } catch (error) {
            console.error("Error parsing stored profile:", error);
            sessionStorage.removeItem('userProfile');
          }
        }
        
        else{
         freshProfile = await fetchUserProfile();
        }

        // Fetch fresh data regardless of storage
        
        if (mounted && freshProfile) {
          sessionStorage.setItem('userProfile', JSON.stringify(freshProfile));
          setUser(freshProfile);
        }
      } else if (status === 'unauthenticated') {
        if (mounted) {
          setUser(null);
          sessionStorage.removeItem('userProfile');
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      mounted = false;
    };
  }, [status]);

  const contextValue = {
    user,
    loading,
    setUser: (newUserData) => {
      setUser(newUserData);
      if (newUserData) {
        sessionStorage.setItem('userProfile', JSON.stringify(newUserData));
      } else {
        sessionStorage.removeItem('userProfile');
      }
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};