import { useState, useCallback, useEffect } from 'react';
import type { ColorTag, ColorInfo } from '../types';
import { COLOR_MAP, DEFAULT_COLOR_TAG } from '../types';

export function useTheme() {
  const [currentColor, setCurrentColor] = useState<Exclude<ColorTag, '中性'>>(() => {
    const saved = localStorage.getItem('tarot_theme_color');
    if (saved && COLOR_MAP[saved as Exclude<ColorTag, '中性'>]) {
      return saved as Exclude<ColorTag, '中性'>;
    }
    return DEFAULT_COLOR_TAG;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentColor);
    localStorage.setItem('tarot_theme_color', currentColor);
  }, [currentColor]);

  const setColor = useCallback((color: Exclude<ColorTag, '中性'>) => {
    setCurrentColor(color);
  }, []);

  const colorInfo: ColorInfo = COLOR_MAP[currentColor];

  return { currentColor, colorInfo, setColor };
}
