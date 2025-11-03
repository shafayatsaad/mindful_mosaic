"use client";

import React, { createContext, useContext, useState, useMemo, Dispatch, SetStateAction } from 'react';

interface BackgroundColorContextType {
  backgroundColor: string;
  setBackgroundColor: Dispatch<SetStateAction<string>>;
}

const BackgroundColorContext = createContext<BackgroundColorContextType | undefined>(undefined);

export function BackgroundColorProvider({ children }: { children: React.ReactNode }) {
  const [backgroundColor, setBackgroundColor] = useState<string>(''); // Initial color is transparent/default

  const value = useMemo(() => ({
    backgroundColor,
    setBackgroundColor,
  }), [backgroundColor]);

  return (
    <BackgroundColorContext.Provider value={value}>
      {children}
    </BackgroundColorContext.Provider>
  );
}

export function useBackgroundColor() {
  const context = useContext(BackgroundColorContext);
  if (context === undefined) {
    throw new Error('useBackgroundColor must be used within a BackgroundColorProvider');
  }
  return context;
}
