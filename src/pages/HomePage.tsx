import { useState, useCallback } from 'react';
import SearchInput from '../components/SearchInput';
import ColorPicker from '../components/ColorPicker';
import TopicCardList from '../components/TopicCardList';
import ActionBar from '../components/ActionBar';
import { useTopics } from '../hooks/useTopics';
import { useFavorites } from '../hooks/useFavorites';
import type { ColorTag } from '../types';

interface HomePageProps {
  currentColor: Exclude<ColorTag, '中性'>;
  onColorChange: (color: Exclude<ColorTag, '中性'>) => void;
}

export default function HomePage({ currentColor, onColorChange }: HomePageProps) {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { results, totalCount, sortByHeat, toggleSort } = useTopics(searchKeyword, currentColor);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleGenerate = useCallback(() => {
    setSearchKeyword(keyword);
  }, [keyword]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl mb-1 text-[var(--text-primary)] tracking-wide"
          style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
        >
          🔮 塔罗话题生成器
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          输入关键词，选择情绪能量，获取大众占卜灵感
        </p>
      </div>

      {/* Search */}
      <SearchInput
        keyword={keyword}
        onKeywordChange={setKeyword}
        onGenerate={handleGenerate}
      />

      {/* Color Picker */}
      <ColorPicker currentColor={currentColor} onColorChange={onColorChange} />

      {/* Results */}
      {searchKeyword && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              共找到 <span className="text-[var(--accent)] font-medium">{totalCount}</span> 个匹配话题
              {totalCount > 10 && <span className="text-[var(--text-muted)]">（展示10个）</span>}
            </p>
          </div>
          <TopicCardList
            topics={results}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
          {results.length > 0 && (
            <ActionBar
              topics={results}
              sortByHeat={sortByHeat}
              onToggleSort={toggleSort}
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
