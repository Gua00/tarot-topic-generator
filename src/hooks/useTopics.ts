import { useMemo, useState, useCallback } from 'react';
import type { Topic, ColorTag } from '../types';
import { COLOR_NEIGHBORS } from '../types';
import builtinData from '../data/topics.json';

// Keyword alias map — 用户常用词 → 匹配的分类/标题关键词
const KEYWORD_ALIASES: Record<string, string[]> = {
  '考试': ['学业', '考试'],
  '恋爱': ['爱情', '恋爱'],
  '工作': ['事业', '工作'],
  '分手': ['复合/前任', '分手', '前任'],
  '暧昧': ['爱情', '暧昧'],
  '赚钱': ['财运', '赚钱'],
  '面试': ['事业', '面试'],
  '健康': ['治愈', '健康', '身心'],
  '朋友': ['人际关系', '朋友'],
  '感情': ['爱情', '复合/前任', '感情'],
  '前任': ['复合/前任', '前任'],
  '复合': ['复合/前任', '复合'],
  '考研': ['学业', '考研'],
  '跳槽': ['事业', '跳槽'],
  '加薪': ['财运', '加薪'],
  '升职': ['事业', '升职'],
  '表白': ['爱情', '表白'],
  '暗恋': ['爱情', '暗恋'],
  '出轨': ['爱情', '人际关系'],
  '压力': ['通用', '事业', '压力'],
  '运势': ['运势预测', '运势'],
  '占卜': ['运势预测', '通用'],
  '财运': ['财运', '财运'],
  '事业': ['事业', '事业'],
  '学业': ['学业', '学业'],
  '爱情': ['爱情', '爱情'],
  '人际关系': ['人际关系', '人际关系'],
};

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

/**
 * Smart keyword matching:
 * 1. Split user input into chunks (support multi-keyword)
 * 2. Expand each chunk via alias map
 * 3. Match against title + category
 */
function matchKeyword(topic: Topic, rawKeyword: string): boolean {
  const kw = rawKeyword.trim().toLowerCase();
  if (!kw) return true;

  // Split by common separators: spaces, commas, Chinese/English punctuation
  const chunks = kw.split(/[\s,，、]+/).filter(Boolean);

  // For each chunk, check if it matches
  return chunks.some((chunk) => {
    // Direct match in title or category
    const searchText = (topic.title + topic.category).toLowerCase();
    if (searchText.includes(chunk)) return true;

    // Check aliases
    const aliases = KEYWORD_ALIASES[chunk];
    if (aliases) {
      return aliases.some((alias) => searchText.includes(alias.toLowerCase()));
    }

    // Single character matching for Chinese (e.g., "试" matches "考试")
    if (chunk.length === 1) {
      return topic.title.includes(chunk);
    }

    // Try matching each individual Chinese character
    // e.g., "前任" → match topic with "前任" or topics containing both "前" and "任"
    const chars = [...chunk].filter((c) => /[一-鿿]/.test(c));
    if (chars.length >= 2) {
      const matchCount = chars.filter((c) => topic.title.includes(c)).length;
      if (matchCount >= chars.length - 1) return true;
    }

    return false;
  });
}

export function useTopics(keyword: string, colorTag: Exclude<ColorTag, '中性'>) {
  const [sortByHeat, setSortByHeat] = useState(false);

  const matchResults = useMemo(() => {
    const allTopics = getAllTopics();
    const kw = keyword.trim().toLowerCase();

    // Step 1: Filter by keyword (smart matching)
    let filtered: Topic[];
    if (!kw) {
      filtered = allTopics;
    } else {
      filtered = allTopics.filter((t) => matchKeyword(t, kw));
    }

    // Step 2: Group by color match priority
    const neighbors = COLOR_NEIGHBORS[colorTag] || [];
    const G1: Topic[] = [];
    const G2: Topic[] = [];
    const G3: Topic[] = [];

    for (const t of filtered) {
      if (t.colorTag === colorTag) {
        G1.push(t);
      } else if (!t.isNeutral && neighbors.includes(t.colorTag as Exclude<ColorTag, '中性'>)) {
        G2.push(t);
      } else if (t.isNeutral) {
        G3.push(t);
      }
    }

    // Smart fallback: if G1+G2+G3 total < 5, expand to include all colors (same keyword)
    if (G1.length + G2.length + G3.length < 5 && kw) {
      const allMatched = allTopics.filter((t) => matchKeyword(t, kw));
      for (const t of allMatched) {
        if (t.colorTag === colorTag && !G1.includes(t)) G1.push(t);
        else if (!t.isNeutral && !G2.includes(t) && !G1.includes(t)) G2.push(t);
        else if (t.isNeutral && !G3.includes(t)) G3.push(t);
      }
    }

    // Step 3: Assemble result
    const result: Topic[] = [];
    const shuffledG1 = shuffleArray(G1);
    const shuffledG2 = shuffleArray(G2);
    const shuffledG3 = shuffleArray(G3);

    result.push(...shuffledG1, ...shuffledG2, ...shuffledG3);

    return result; // 展示全部匹配结果
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
