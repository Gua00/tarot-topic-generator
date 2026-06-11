import { useState, useCallback, useMemo } from 'react';
import SearchInput from '../components/SearchInput';
import ColorPicker from '../components/ColorPicker';
import TopicCardList from '../components/TopicCardList';
import ActionBar from '../components/ActionBar';
import { useTopics } from '../hooks/useTopics';
import { useBiliSearch } from '../hooks/useBiliSearch';
import { useFavorites } from '../hooks/useFavorites';
import { COLOR_NEIGHBORS } from '../types';
import type { ColorTag, Topic } from '../types';

interface HomePageProps {
  currentColor: Exclude<ColorTag, '中性'>;
  onColorChange: (color: Exclude<ColorTag, '中性'>) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function dedupeByTitle(topics: Topic[]): Topic[] {
  const seen = new Set<string>();
  return topics.filter((t) => {
    const key = t.title.replace(/[？?！!。，,、\s]/g, '').slice(0, 15);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function HomePage({ currentColor, onColorChange }: HomePageProps) {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortByHeat, setSortByHeat] = useState(false);

  // 本地库匹配
  const { results: localResults } = useTopics(searchKeyword, currentColor);
  // B站实时搜索
  const { biliTopics, biliLoading } = useBiliSearch(searchKeyword);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleGenerate = useCallback(() => {
    setSearchKeyword(keyword);
  }, [keyword]);

  // 合并 B站 + 本地库，按颜色优先级分组
  const mergedResults = useMemo(() => {
    const neighbors = COLOR_NEIGHBORS[currentColor] || [];

    // 1. 合并 + 去重（B站数据优先）
    const combined = dedupeByTitle([...biliTopics, ...localResults]);

    // 2. 按颜色分组
    const G1: Topic[] = []; // 精准颜色匹配
    const G2: Topic[] = []; // 邻近色
    const G3: Topic[] = []; // 中性

    for (const t of combined) {
      if (t.colorTag === currentColor) G1.push(t);
      else if (!t.isNeutral && neighbors.includes(t.colorTag as Exclude<ColorTag, '中性'>)) G2.push(t);
      else if (t.isNeutral || t.colorTag === '中性') G3.push(t);
    }

    // 3. 组装：B站来源的排在每组前面
    const sortBiliFirst = (arr: Topic[]) => {
      const bili = arr.filter((t) => t.source === 'bilibili');
      const other = shuffleArray(arr.filter((t) => t.source !== 'bilibili'));
      return [...shuffleArray(bili), ...other];
    };

    const sg1 = sortBiliFirst(G1);
    const sg2 = sortBiliFirst(G2);
    const sg3 = sortBiliFirst(G3);

    const assembled: Topic[] = [];
    assembled.push(...sg1.slice(0, 3));          // 前3条精准
    assembled.push(...sg1.slice(3), ...sg2);     // 中间同色系
    assembled.push(...sg3);                       // 最后中性补齐

    return assembled.slice(0, 10);
  }, [biliTopics, localResults, currentColor]);

  const displayResults = useMemo(() => {
    if (sortByHeat) {
      return [...mergedResults].sort((a, b) => b.hotness - a.hotness);
    }
    return mergedResults;
  }, [mergedResults, sortByHeat]);

  const totalCount = useMemo(() => {
    const all = dedupeByTitle([...biliTopics, ...localResults]);
    return all.length;
  }, [biliTopics, localResults]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl mb-1 text-[var(--text-primary)] tracking-wide"
          style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
        >
          🔮 塔罗话题生成器
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          输入关键词，选择情绪能量，获取大众占卜灵感
          <span className="block text-xs mt-0.5">实时搜罗B站热门话题 + 内置精选话题库</span>
        </p>
      </div>

      <SearchInput
        keyword={keyword}
        onKeywordChange={setKeyword}
        onGenerate={handleGenerate}
      />

      <ColorPicker currentColor={currentColor} onColorChange={onColorChange} />

      {searchKeyword && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              共找到 <span className="text-[var(--accent)] font-medium">{totalCount}</span> 个匹配话题
              {totalCount > 10 && <span className="text-[var(--text-muted)]">（展示10个）</span>}
              {biliLoading && (
                <span className="text-xs text-[var(--text-muted)] ml-2 animate-pulse">
                  📡 实时搜集中…
                </span>
              )}
              {biliTopics.length > 0 && !biliLoading && (
                <span className="text-xs text-[var(--accent)] ml-2">
                  📡 含{biliTopics.length}条实时话题
                </span>
              )}
            </p>
          </div>
          <TopicCardList
            topics={displayResults}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
          {displayResults.length > 0 && (
            <ActionBar
              topics={displayResults}
              sortByHeat={sortByHeat}
              onToggleSort={() => setSortByHeat((p) => !p)}
            />
          )}
        </div>
      )}

      {!searchKeyword && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🃏</p>
          <p className="text-[var(--text-secondary)]">输入关键词并选择颜色后，点击「生成话题」</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">默认选中紫色·神秘灵性，契合塔罗能量场</p>
        </div>
      )}
    </div>
  );
}
