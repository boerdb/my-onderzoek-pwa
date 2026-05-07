"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type AppMode = "medical" | "ebp";

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextValue>({
  mode: "medical",
  setMode: () => {},
});

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("medical");

  useEffect(() => {
    const stored = localStorage.getItem("medsummary:mode") as AppMode | null;
    if (stored === "medical" || stored === "ebp") {
      setModeState(stored);
    }
  }, []);

  const setMode = (m: AppMode) => {
    setModeState(m);
    localStorage.setItem("medsummary:mode", m);
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
