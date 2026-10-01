"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NavTrailValue = {
  parentHref: string;
  parentLabel: string;
  current: string;
  /** Element whose scroll range drives the nav progress line. */
  progressId: string;
};

type NavTrailContextValue = {
  trail: NavTrailValue | null;
  setTrail: (trail: NavTrailValue | null) => void;
};

const NavTrailContext = createContext<NavTrailContextValue | null>(null);

export function NavTrailProvider({ children }: { children: ReactNode }) {
  const [trail, setTrailState] = useState<NavTrailValue | null>(null);
  const setTrail = useCallback((next: NavTrailValue | null) => {
    setTrailState(next);
  }, []);
  const value = useMemo(() => ({ trail, setTrail }), [trail, setTrail]);

  return (
    <NavTrailContext.Provider value={value}>{children}</NavTrailContext.Provider>
  );
}

export function useNavTrail() {
  const context = useContext(NavTrailContext);
  if (!context) {
    throw new Error("useNavTrail must be used within NavTrailProvider");
  }
  return context;
}

/** Registers the in-nav breadcrumb + progress for this page. Renders nothing. */
export function NavTrail(props: NavTrailValue) {
  const { setTrail } = useNavTrail();
  const { parentHref, parentLabel, current, progressId } = props;

  useEffect(() => {
    setTrail({ parentHref, parentLabel, current, progressId });
    return () => setTrail(null);
  }, [parentHref, parentLabel, current, progressId, setTrail]);

  return null;
}
