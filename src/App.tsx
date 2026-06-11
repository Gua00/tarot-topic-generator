import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useContext } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import ManagePage from './pages/ManagePage';
import { useTheme } from './hooks/useTheme';
import { APP_VERSION } from './version';
import type { ColorTag } from './types';

interface ThemeContextType {
  currentColor: Exclude<ColorTag, '中性'>;
  setColor: (color: Exclude<ColorTag, '中性'>) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}

function AppContent() {
  const { currentColor, setColor } = useThemeContext();

  return (
    <div className="min-h-screen bg-[var(--parchment)]">
      <Navbar currentColor={currentColor} />
      <Routes>
        <Route
          path="/"
          element={<HomePage currentColor={currentColor} onColorChange={setColor} />}
        />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
      <footer className="text-center py-4 text-xs text-[var(--text-muted)] space-y-1">
        <p>🔮 塔罗话题生成器 {APP_VERSION} · 灵感来自B站塔罗社区</p>
        <p className="opacity-50">全量B站实时数据 · 链接精确直达原视频</p>
      </footer>
    </div>
  );
}

export default function App() {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={{ currentColor: theme.currentColor, setColor: theme.setColor }}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
