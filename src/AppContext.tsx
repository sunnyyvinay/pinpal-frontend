import React, { createContext, useState, ReactNode, useContext } from 'react';

type Region = {latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number};
type DragOptions = {mode: number, location: {latitude: number, longitude: number}, pin_index: number};

// Define the type for your context
type ContextType = {
  region: Region;
  setRegion: (value: Region) => void;
  dragMode: DragOptions;
  setDragMode: (value: DragOptions) => void;
  darkTheme: boolean;
  setDarkTheme: (value: boolean) => void;
};

// Create the context with a default value
const Context = createContext<ContextType | undefined>(undefined);

// Create a provider component
export const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<Region>({latitude: 34.0699, longitude: 118.4438, latitudeDelta: 0.03, longitudeDelta: 0.03});
  const [dragMode, setDragMode] = useState<DragOptions>({mode: 0, location: {latitude: 0, longitude: 0}, pin_index: -1});
  const [darkTheme, setDarkTheme] = useState<boolean>(false);

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
