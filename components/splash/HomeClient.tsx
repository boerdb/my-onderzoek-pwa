"use client";

import { useState, useEffect } from "react";
import { SearchPage } from "@/components/search/SearchPage";
import { SplashScreen } from "./SplashScreen";

const SPLASH_KEY = "medsummary:splash-seen";

export function HomeClient() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SPLASH_KEY);
    if (!alreadySeen) {
      setShowSplash(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowSplash(false);
    sessionStorage.setItem(SPLASH_KEY, "1");
  };

  return (
    <>
      {showSplash && <SplashScreen onDismiss={handleDismiss} />}
      <SearchPage />
    </>
  );
}
