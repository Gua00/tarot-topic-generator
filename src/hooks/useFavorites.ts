import { useState, useCallback, useEffect } from 'react';
import type { Topic } from '../types';

const FAVORITES_KEY = 'tarot_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Topic[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((t) => t.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((topic: Topic) => {
    setFavorites((prev) => {
      const exists = prev.find((t) => t.id === topic.id);
      if (exists) {
        return prev.filter((t) => t.id !== topic.id);
      }
      return [...prev, topic];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
