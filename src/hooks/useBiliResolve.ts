import { useState, useEffect, useRef } from 'react';
import type { Topic } from '../types';

// 全局缓存：标题 → bvid URL
const resolveCache = new Map<string, string>();

export function useBiliResolve(topics: Topic[]) {
  const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());
  const resolvedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 只处理本地话题（非 b_ 开头的）
    const localTopics = topics.filter((t) => !t.id.startsWith('b_'));

    if (localTopics.length === 0) return;

    let cancelled = false;

    async function resolveBatch(items: Topic[]) {
      const newMap = new Map(urlMap);

      // 每次并行 3 个请求
      const batchSize = 3;
      for (let i = 0; i < items.length; i += batchSize) {
        if (cancelled) break;
        const batch = items.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(async (topic) => {
            const cacheKey = topic.id;
            if (resolvedRef.current.has(cacheKey)) return null;
            if (resolveCache.has(cacheKey)) {
              resolvedRef.current.add(cacheKey);
              return { id: topic.id, url: resolveCache.get(cacheKey)! };
            }

            try {
              const params = new URLSearchParams({
                title: topic.title,
                up: topic.upMaster,
              });
              const res = await fetch(`/api/resolve?${params}`);
              const data = await res.json();
              if (data.bvid && data.url) {
                resolveCache.set(cacheKey, data.url);
                resolvedRef.current.add(cacheKey);
                return { id: topic.id, url: data.url };
              }
              // 未匹配到也标记为已处理（避免重复请求）
              resolvedRef.current.add(cacheKey);
              return null;
            } catch {
              return null;
            }
          })
        );

        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) {
            newMap.set(r.value.id, r.value.url);
          }
        }
      }

      if (!cancelled) setUrlMap(new Map(newMap));
    }

    resolveBatch(localTopics);
    return () => { cancelled = true; };
  }, [topics.map((t) => t.id).join(',')]);

  return urlMap;
}
