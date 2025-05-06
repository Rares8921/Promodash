import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from 'prop-types';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteStores, setFavoriteStores] = useState([]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favoriteStores");
      const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      setFavoriteStores(parsedFavorites);
    } catch (error) {
      console.error("Error in fetching favorites:", error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleFavoriteStore = async (store) => {
    let updatedFavorites;
    if (favoriteStores.some((s) => s.id === store.id)) {
      updatedFavorites = favoriteStores.filter((s) => s.id !== store.id);
    } else {
      updatedFavorites = [...favoriteStores, store];
    }
    setFavoriteStores(updatedFavorites);
    await AsyncStorage.setItem("favoriteStores", JSON.stringify(updatedFavorites));
  };

  const refreshFavorites = () => {
    loadFavorites();
  };

  return (
    <FavoritesContext.Provider value={{ favoriteStores, toggleFavoriteStore, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
