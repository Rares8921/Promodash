import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { UserContext } from "./UserContext";
import { updateUserData } from "../../lib/appwrite";
import i18n from "../../i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const [language, setLanguage] = useState(user?.language || "en");
  const [key, setKey] = useState(0); // Folosit pentru re-rendering

  useEffect(() => {
    if (!loading && user?.language) {
      setLanguage(user.language);
      i18n.locale = user.language;
    }
  }, [user, loading]);

  const changeLanguage = async (newLang) => {
    try {
      setLanguage(newLang);
      i18n.locale = newLang;
      await updateUserData("Language", newLang);
      setKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, key }}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
