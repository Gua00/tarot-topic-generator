import { useMemo, useState, useCallback } from 'react';
import type { Topic, ColorTag } from '../types';
import { COLOR_NEIGHBORS } from '../types';
import builtinData from '../data/topics.json';

function getAllTopics(): Topic[] {
  const builtin: Topic[] = builtinData.topics as Topic[];
  const userTopics: Topic[] = (() => {
    try {
      const raw = localStorage.getItem('tarot_user_topics');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();
  return [...builtin, ...userTopics];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useTopics(keyword: string, colorTag: Exclude<ColorTag, '中性'>) {
  const [sortByHeat, setSortByHeat] = useState(false);

  const matchResults = useMemo(() => {
    const allTopics = getAllTopics();
    const kw = keyword.trim().toLowerCase();

    // Step 1: Filter by keyword
    let filtered: Topic[];
    if (!kw) {
      // No keyword — only color matching
      filtered = allTopics;
    } else {
      filtered = allTopics.filter((t) => {
        const text = t.title + t.category;
        return text.toLowerCase().includes(kw);
      });
    }

    // Step 2: Group by color match priority
    const neighbors = COLOR_NEIGHBORS[colorTag] || [];
    const G1: Topic[] = []; // Exact color match
    const G2: Topic[] = []; // Neighbor colors
    const G3: Topic[] = []; // Neutral

    for (const t of filtered) {
      if (t.colorTag === colorTag) {
        G1.push(t);
      } else if (!t.isNeutral && neighbors.includes(t.colorTag as Exclude<ColorTag, '中性'>)) {
        G2.push(t);
      } else if (t.isNeutral) {
        G3.push(t);
      }
    }

    // Step 3: Assemble result (max 10)
    const result: Topic[] = [];
    const shuffledG1 = shuffleArray(G1);
    const shuffledG2 = shuffleArray(G2);
    const shuffledG3 = shuffleArray(G3);

    // First 3: must be exact match (if available)
    result.push(...shuffledG1.slice(0, 3));

    // Slots 4-7: remaining G1 + G2
    const remainingG1 = shuffledG1.slice(3);
    result.push(...remainingG1, ...shuffledG2);

    // Slots 8-10: G3 fill
    result.push(...shuffledG3);

    // Cap at 10
    const capped = result.slice(0, 10);
    return capped;
  }, [keyword, colorTag]);

  const sortedResults = useMemo(() => {
    if (sortByHeat) {
      return [...matchResults].sort((a, b) => b.hotness - a.hotness);
    }
    return matchResults;
  }, [matchResults, sortByHeat]);

  const toggleSort = useCallback(() => {
    setSortByHeat((prev) => !prev);
  }, []);

  return {
    results: sortedResults,
    totalCount: matchResults.length,
    sortByHeat,
    toggleSort,
  };
}

export function useUserTopics() {
  const [userTopics, setUserTopics] = useState<Topic[]>(() => {
    try {
      const raw = localStorage.getItem('tarot_user_topics');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const syncToStorage = useCallback((topics: Topic[]) => {
    localStorage.setItem('tarot_user_topics', JSON.stringify(topics));
    setUserTopics(topics);
  }, []);

  const addTopic = useCallback(
    (topic: Topic) => {
      const updated = [...userTopics, topic];
      syncToStorage(updated);
    },
    [userTopics, syncToStorage]
  );

  const removeTopic = useCallback(
    (id: string) => {
      const updated = userTopics.filter((t) => t.id !== id);
      syncToStorage(updated);
    },
    [userTopics, syncToStorage]
  );

  const importTopics = useCallback(
    (topics: Topic[]) => {
      const existingIds = new Set(userTopics.map((t) => t.id));
      const newTopics = topics
        .filter((t) => !existingIds.has(t.id))
        .map((t) => ({ ...t, source: 'user' as const }));
      const updated = [...userTopics, ...newTopics];
      syncToStorage(updated);
    },
    [userTopics, syncToStorage]
  );

  return { userTopics, addTopic, removeTopic, importTopics };
}
