/**
 * ThemeContext.js - Modified to prevent multiple visual theme updates
 */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Appearance } from "react-native";
import { UserContext } from "./UserContext";
import { updateUserData } from "../../lib/appwrite"; 

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const systemTheme = Appearance.getColorScheme();
    const defaultTheme = systemTheme ? systemTheme.charAt(0).toUpperCase() + systemTheme.slice(1) : "Light";
    
    // Theme state
    const [theme, setTheme] = useState(user?.theme || defaultTheme);
    
    // Ref to track if a theme update is in progress
    const isUpdatingRef = useRef(false);
    
    // Ref to store the latest requested theme
    const pendingThemeRef = useRef(null);

    // Initialize theme from user data
    useEffect(() => {
        if (!loading && user?.theme && !isUpdatingRef.current) {
            setTheme(user.theme);
        }
    }, [user, loading]);

    // Toggle theme function that prevents multiple visual updates
    const toggleTheme = async (newTheme) => {
        // If already updating, store the request and return
        if (isUpdatingRef.current) {
            pendingThemeRef.current = newTheme;
            return;
        }
        
        // Set updating flag
        isUpdatingRef.current = true;
        
        try {
            // Update in backend first
            const success = await updateUserData("Theme", newTheme);
            
            if (success) {
                // Only update visual theme after backend update is successful
                setTheme(newTheme);
            }
        } catch (error) {
            console.error("Failed to update theme:", error);
        } finally {
            // Clear updating flag
            isUpdatingRef.current = false;
            
            // Process any pending theme update
            if (pendingThemeRef.current) {
                const pendingTheme = pendingThemeRef.current;
                pendingThemeRef.current = null;
                // Process the pending theme update
                toggleTheme(pendingTheme);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;