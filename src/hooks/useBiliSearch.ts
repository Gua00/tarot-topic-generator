import { useState, useEffect, useRef } from 'react';
import type { Topic } from '../types';

interface BiliSearchResult {
  topics: Topic[];
  total: number;
  cached: boolean;
  error?: string;
}

const BILI_CACHE = new Map<string, { data: BiliSearchResult; ts: number }>();
const BILI_CACHE_TTL = 30 * 60 * 1000; // 本地缓存 30 分钟

export function useBiliSearch(keyword: string) {
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 检查本地缓存
    const cacheKey = `bili_${kw}`;
    const cached = BILI_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < BILI_CACHE_TTL) {
      setResults(cached.data.topics);
      setFromCache(true);
      setLoading(false);
      return;
    }

    // 取消上一次请求
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`/api/search?keyword=${encodeURIComponent(kw)}&page=1`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: BiliSearchResult) => {
        if (controller.signal.aborted) return;
        setResults(data.topics || []);
        setFromCache(data.cached);
        setLoading(false);
        // 存入本地缓存
        BILI_CACHE.set(cacheKey, { data, ts: Date.now() });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message);
        setLoading(false);
        setResults([]);
      });

    return () => controller.abort();
  }, [keyword]);

  return { biliTopics: results, biliLoading: loading, biliError: error, fromCache };
}
