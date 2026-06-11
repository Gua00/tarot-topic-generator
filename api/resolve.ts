import type { VercelRequest, VercelResponse } from '@vercel/node';

// 简易内存缓存
const bvidCache = new Map<string, string>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const title = (req.query.title as string) || '';
  const up = (req.query.up as string) || '';

  if (!title) {
    return res.json({ bvid: null, error: 'missing title' });
  }

  const cacheKey = title.slice(0, 30);
  const cached = bvidCache.get(cacheKey);
  if (cached) {
    return res.json({ bvid: cached, url: `https://www.bilibili.com/video/${cached}` });
  }

  try {
    // 用精确标题搜索 B站
    const searchQuery = up ? `${up} ${title.slice(0, 20)}` : title.slice(0, 30);
    const searchUrl = new URL('https://api.bilibili.com/x/web-interface/search/type');
    searchUrl.searchParams.set('search_type', 'video');
    searchUrl.searchParams.set('keyword', searchQuery);
    searchUrl.searchParams.set('page_size', '10');
    searchUrl.searchParams.set('order', 'click');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Referer: 'https://www.bilibili.com/',
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.code !== 0) throw new Error(data.message);

    const videos = (data.data?.result || []) as any[];

    // 找标题最匹配的视频
    let bestMatch: any = null;
    let bestScore = 0;

    for (const v of videos) {
      const vt = (v.title || '').replace(/[【】\[\]\s]/g, '');
      const tt = title.replace(/[【】\[\]\s]/g, '');

      // 计分：完全包含 + 长度相近 + UP主匹配
      let score = 0;
      if (vt === tt) {
        score = 100;
      } else if (vt.includes(tt) || tt.includes(vt)) {
        score = 80 + (Math.min(vt.length, tt.length) / Math.max(vt.length, tt.length)) * 20;
      } else {
        // 逐字匹配率
        const common = [...tt].filter((c) => vt.includes(c)).length;
        score = (common / Math.max(tt.length, vt.length)) * 60;
      }

      if (up && v.author && v.author.includes(up)) {
        score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = v;
      }
    }

    if (bestMatch && bestScore > 40) {
      const bvid = bestMatch.bvid || `av${bestMatch.aid}`;
      bvidCache.set(cacheKey, bvid);
      return res.json({ bvid, url: `https://www.bilibili.com/video/${bvid}` });
    }

    // 无匹配，返回搜索链接作为兜底
    const fallbackQuery = encodeURIComponent(title);
    return res.json({
      bvid: null,
      url: `https://search.bilibili.com/all?keyword=${fallbackQuery}&search_type=video`,
    });
  } catch (error: any) {
    console.error('Resolve error:', error.message);
    return res.json({ bvid: null, error: error.message });
  }
}
