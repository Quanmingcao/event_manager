import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ColorTheme = 'teal' | 'blue' | 'highcontrast';

interface Settings {
  fontSize: FontSize;
  colorTheme: ColorTheme;
  darkMode: boolean;
  accessibilityMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateFontSize: (size: FontSize) => void;
  updateColorTheme: (theme: ColorTheme) => void;
  toggleDarkMode: () => void;
  toggleAccessibilityMode: () => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  fontSize: 'medium',
  colorTheme: 'teal',
  darkMode: false,
  accessibilityMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    root.classList.add(`font-${settings.fontSize}`);
    
    // Color theme
    root.classList.remove('theme-teal', 'theme-blue', 'theme-highcontrast');
    root.classList.add(`theme-${settings.colorTheme}`);
    
    // Dark mode
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Accessibility mode
    if (settings.accessibilityMode) {
      root.classList.add('accessibility-mode');
    } else {
      root.classList.remove('accessibility-mode');
    }
  }, [settings]);

  const updateFontSize = (size: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const updateColorTheme = (theme: ColorTheme) => {
    setSettings(prev => ({ ...prev, colorTheme: theme }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleAccessibilityMode = () => {
    setSettings(prev => ({ ...prev, accessibilityMode: !prev.accessibilityMode }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateFontSize,
        updateColorTheme,
        toggleDarkMode,
        toggleAccessibilityMode,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
