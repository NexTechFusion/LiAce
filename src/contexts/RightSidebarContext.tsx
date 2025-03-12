import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context shape
interface RightSidebarContextType {
  customEndpoint: string;
  setCustomEndpoint: (endpoint: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  modelProvider: string;
  setModelProvider: (provider: string) => void;
  useAutocorrecting: boolean;
  setUserAutocorrecting: (use: boolean) => void;
  enableReplacements: boolean;
  setEnableReplacements: (enable: boolean) => void;
  enableContinuations: boolean;
  setEnableContinuations: (enable: boolean) => void;
}

// Create the context with default values
const RightSidebarContext = createContext<RightSidebarContextType>({
  customEndpoint: '',
  setCustomEndpoint: () => {},
  selectedModel: 'gpt-3.5-turbo',
  setSelectedModel: () => {},
  modelProvider: 'openai',
  setModelProvider: () => {},
  useAutocorrecting: false,
  setUserAutocorrecting: () => {},
  enableReplacements: true,
  setEnableReplacements: () => {},
  enableContinuations: true,
  setEnableContinuations: () => {},
});

// Provider component
interface RightSidebarProviderProps {
  children: ReactNode;
}

export const RightSidebarProvider: React.FC<RightSidebarProviderProps> = ({ children }) => {
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [modelProvider, setModelProvider] = useState('openai');
  const [useAutocorrecting, setuseAutocorrecting] = useState(false);
  const [enableReplacements, setEnableReplacements] = useState(true);
  const [enableContinuations, setEnableContinuations] = useState(true);

  return (
    <RightSidebarContext.Provider
      value={{
        customEndpoint,
        setCustomEndpoint,
        selectedModel,
        setSelectedModel,
        modelProvider,
        setModelProvider,
        useAutocorrecting: useAutocorrecting,
        setUserAutocorrecting: setuseAutocorrecting,
        enableReplacements,
        setEnableReplacements,
        enableContinuations,
        setEnableContinuations,
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  );
};

// Custom hook to use the context
export const useRightSidebarSettings = () => useContext(RightSidebarContext); 