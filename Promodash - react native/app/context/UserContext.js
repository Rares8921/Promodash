/**
 * UserContext.js - Simple implementation with singleton-like behavior
 */
import React, { createContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "../../lib/appwrite";

export const UserContext = createContext(null);

// Singleton-like behavior using module scope
let isInitialized = false;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user data only once across all instances
  useEffect(() => {
    if (isInitialized) return;
    isInitialized = true;
    
    const loadUser = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem("userData");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        const serverUser = await getUserData();

        if (serverUser) {
          setUser(serverUser);
          await AsyncStorage.setItem("userData", JSON.stringify(serverUser));
        } else {
          setUser(null);
          await AsyncStorage.removeItem("userData");
        }
      } catch (err) {
        console.error("Eroare la preluarea userului:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const reloadUser = async () => {
    try {
      setLoading(true);
      const serverUser = await getUserData();
      if (serverUser) {
        setUser(serverUser);
        await AsyncStorage.setItem("userData", JSON.stringify(serverUser));
      } else {
        setUser(null);
        await AsyncStorage.removeItem("userData");
      }
    } catch (err) {
      console.error("Eroare la reloadUser:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, reloadUser }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};