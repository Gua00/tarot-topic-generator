import { useState, useCallback, useMemo } from 'react';
import SearchInput from '../components/SearchInput';
import ColorPicker from '../components/ColorPicker';
import TopicCardList from '../components/TopicCardList';
import ActionBar from '../components/ActionBar';
import { useBiliSearch } from '../hooks/useBiliSearch';
import { useFavorites } from '../hooks/useFavorites';
import { COLOR_NEIGHBORS } from '../types';
import type { ColorTag, Topic } from '../types';

interface HomePageProps {
  currentColor: Exclude<ColorTag, '中性'>;
  onColorChange: (color: Exclude<ColorTag, '中性'>) => void;
}

export default function HomePage({ currentColor, onColorChange }: HomePageProps) {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [upFilter, setUpFilter] = useState('');
  const [activeUpFilter, setActiveUpFilter] = useState('');
  const [sortByHeat, setSortByHeat] = useState(false);

  // 全部来自B站实时搜索 —— 每条链接都精确对应原视频
  const { biliTopics, biliLoading } = useBiliSearch(searchKeyword, activeUpFilter);
  const { isFavorite, toggleFavorite } = useFavorites();

  const hasActiveSearch = searchKeyword !== '' || activeUpFilter !== '';

  const handleGenerate = useCallback(() => {
    setSearchKeyword(keyword);
    setActiveUpFilter(upFilter);
  }, [keyword, upFilter]);

  // B站实时结果按颜色优先级分组排列
  const groupedResults = useMemo(() => {
    const neighbors = COLOR_NEIGHBORS[currentColor] || [];
    const G1: Topic[] = [];
    const G2: Topic[] = [];
    const G3: Topic[] = [];

    for (const t of biliTopics) {
      if (t.colorTag === currentColor) G1.push(t);
      else if (!t.isNeutral && neighbors.includes(t.colorTag as Exclude<ColorTag, '中性'>)) G2.push(t);
      else if (t.isNeutral || t.colorTag === '中性') G3.push(t);
    }

    return [...G1, ...G2, ...G3];
  }, [biliTopics, currentColor]);

  const displayResults = useMemo(() => {
    if (sortByHeat) {
      return [...groupedResults].sort((a, b) => b.hotness - a.hotness);
    }
    return groupedResults;
  }, [groupedResults, sortByHeat]);

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
          <span className="block text-xs mt-0.5">📡 全部来自B站实时抓取，链接 = 原视频</span>
        </p>
      </div>

      <SearchInput
        keyword={keyword}
        onKeywordChange={setKeyword}
        upFilter={upFilter}
        onUpFilterChange={setUpFilter}
        onGenerate={handleGenerate}
      />

      <ColorPicker currentColor={currentColor} onColorChange={onColorChange} />

      {hasActiveSearch && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              {biliLoading ? (
                <span className="animate-pulse">📡 实时搜集中…</span>
              ) : (
                <>
                  共找到 <span className="text-[var(--accent)] font-medium">{biliTopics.length}</span> 条B站实时话题
                </>
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

      {!hasActiveSearch && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🃏</p>
          <p className="text-[var(--text-secondary)]">输入关键词并选择颜色后，点击「生成话题」</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">全量B站实时数据，每条链接精确直达原视频</p>
        </div>
      )}
    </div>
  );
}
