"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  DEFAULT_CONFIGURATION,
  PetTagConfiguration,
} from "@/src/lib/domain/tag";
import { clearStudioConfiguration, readStudioConfiguration, saveStudioConfiguration } from "@/lib/checkout/studio-persistence";
import { useEffect } from "react";

interface StudioContextType {
  studio: PetTagConfiguration;
  updateStudio: (
    data: Partial<PetTagConfiguration>
  ) => void;
  resetStudio: () => void;
}

const StudioContext =
  createContext<StudioContextType | null>(null);

export function StudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [studio, setStudio] =
    useState<PetTagConfiguration>(
      DEFAULT_CONFIGURATION
    );
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const persisted = readStudioConfiguration();
      if (persisted) setStudio(persisted);
      setHasRestored(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hasRestored) saveStudioConfiguration(studio);
  }, [hasRestored, studio]);

  function updateStudio(
    data: Partial<PetTagConfiguration>
  ) {
    setStudio((prev) => ({
      ...prev,
      ...data,
    }));
  }

  function resetStudio() {
    setStudio(DEFAULT_CONFIGURATION);
    clearStudioConfiguration();
  }

  const value = useMemo(
    () => ({
      studio,
      updateStudio,
      resetStudio,
    }),
    [studio]
  );

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);

  if (!context) {
    throw new Error(
      "useStudio must be used inside StudioProvider"
    );
  }

  return context;
}
