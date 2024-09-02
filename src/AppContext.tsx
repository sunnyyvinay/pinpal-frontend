import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the type for your context
type ContextType = {
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

  return (
    <Context.Provider value={{ dragMode, setDragMode, darkTheme, setDarkTheme }}>
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
