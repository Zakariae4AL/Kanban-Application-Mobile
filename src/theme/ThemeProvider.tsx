import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { storage, THEME_KEY } from '../storage';

export type ThemePreference = 'system' | 'light' | 'dark';

/** Same palette as the web app, with WCAG AA contrast in both themes. */
const light = {
  page: '#F4F7FD',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F7FD',
  text: '#000112',
  muted: '#647186',
  line: '#E4EBFA',
  accent: '#C2453C',
  accentText: '#C2453C',
  accentSoft: 'rgba(194, 69, 60, 0.10)',
  onAccent: '#FFFFFF',
  danger: '#D93A3A',
  dangerBg: '#D93A3A',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const dark: typeof light = {
  page: '#20212C',
  surface: '#2B2C37',
  surfaceAlt: '#20212C',
  text: '#FFFFFF',
  muted: '#9AA5B8',
  line: '#3E3F4E',
  accent: '#C2453C',
  accentText: '#F1948A',
  accentSoft: 'rgba(241, 148, 138, 0.15)',
  onAccent: '#FFFFFF',
  danger: '#F47C7C',
  dangerBg: '#D93A3A',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export type Colors = typeof light;

type ThemeContextValue = {
  colors: Colors;
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void storage.get(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setPreferenceState(saved);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void storage.set(THEME_KEY, next);
  }, []);

  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(
    () => ({ colors: scheme === 'dark' ? dark : light, scheme, preference, setPreference }),
    [scheme, preference, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}

/** Stable colour for the dot of each column. */
const COLUMN_COLORS = [
  '#49C4E5',
  '#8471F2',
  '#67E2AE',
  '#F1948A',
  '#E5A449',
  '#2A3FDB',
  '#C36E6E',
  '#58C463',
  '#B65FC7',
  '#E2C467',
];
export const columnColor = (index: number): string => COLUMN_COLORS[index % COLUMN_COLORS.length]!;
