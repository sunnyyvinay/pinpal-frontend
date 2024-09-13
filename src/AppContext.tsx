import React, { createContext, useState, ReactNode, useContext } from 'react';
import GetLocation, { isLocationError } from 'react-native-get-location';

// Define the type for your context
type ContextType = {
  region: {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number};
  setRegion: (value: {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number}) => void;
  dragMode: boolean;
  setDragMode: (value: boolean) => void;
  darkTheme: boolean;
  setDarkTheme: (value: boolean) => void;
};

// Create the context with a default value
const Context = createContext<ContextType | undefined>(undefined);

// Create a provider component
export const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const [region, setRegion] = useState<{latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number}>({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.05, longitudeDelta: 0.05});

  return (
    <Context.Provider value={{ region, setRegion, dragMode, setDragMode, darkTheme, setDarkTheme }}>
      {children}
    </Context.Provider>
  );
};

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useAppContext must be used within a ContextProvider');
  }
  return context;
};
