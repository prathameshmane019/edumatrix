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


  const fetchUserProfile = async () => {
    if (status === 'authenticated' && session?.user?.role) {
      let role ;
       if (session?.user?.role === "admin") role="department"
       else if(session.user.role=== "superadmin") role ="institute" 
       else role = session.user.role;
      //  console.log(session?.user?.role);

      const { _id } = session?.user;
      const storedProfile = sessionStorage.getItem('userProfile');

      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      } else {
        try {
          console.log(_id);
          const res = await axios.get(`/api/v2/${role}?_id=${_id}`);
          console.log(res.data);

          const profileData = Array.isArray(res.data) ? res.data[0] : res.data; // Ensure userProfile is an object
          profileData.role = session?.user?.role; // Add role to profile data
          sessionStorage.setItem('userProfile', JSON.stringify(profileData));
          setUser(profileData);
          console.log(profileData);

        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      // First try to get from session
      
      // If no session, try to get from sessionStorage
      const storedProfile = sessionStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setUser(parsedProfile);
        } catch (error) {
          console.error("Error parsing profile:", error);
          sessionStorage.removeItem('userProfile'); // Clear invalid data
        }
      }
      else if (session?.user) {
        await fetchUserProfile()
        setLoading(false);
        return;
      }
      else{
        setUser(null);
      sessionStorage.removeItem('userProfile');
      setLoading(false);
      }

      setLoading(false);
    };

    if (status === 'authenticated') {
      loadUserProfile();
    } else if (status === 'unauthenticated') {
      setUser(null);
      sessionStorage.removeItem('userProfile');
      setLoading(false);
    } else {
      // While loading, try to get from sessionStorage
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
    }
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};