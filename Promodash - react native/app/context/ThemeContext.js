import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Appearance } from "react-native";
import { UserContext } from "./UserContext";
import { updateUserData } from "../../lib/appwrite";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const systemTheme = Appearance.getColorScheme();
    const defaultTheme = systemTheme ? systemTheme.charAt(0).toUpperCase() + systemTheme.slice(1) : "Light";

    const [theme, setTheme] = useState(user?.theme || defaultTheme);

    useEffect(() => {
        if (!loading && user?.theme) {
            setTheme(user.theme);
        }
    }, [user, loading]);

    const toggleTheme = async (newTheme) => {
        try {
            setTheme(newTheme);
            await updateUserData("Theme", newTheme);
        } catch (error) {
            console.error("Error toggling theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ThemeProvider;
