import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export const UserContext = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const saved = await AsyncStorage.getItem('loggedInUser');
      if (saved) setUser(JSON.parse(saved));
    };
    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
