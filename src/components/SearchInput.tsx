import { Search } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Category } from '../types';

interface SearchInputProps {
  keyword: string;
  onKeywordChange: (kw: string) => void;
  onGenerate: () => void;
}

export default function SearchInput({ keyword, onKeywordChange, onGenerate }: SearchInputProps) {
  return (
    <div className="space-y-3">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            placeholder="输入关键词，如：爱情、事业、学业…"
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--card-bg)] border border-[var(--border-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-border)] transition-all text-[15px]"
            style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
          />
        </div>
        <button
          onClick={onGenerate}
          className="btn-accent px-5 py-2.5 rounded-[var(--radius-btn)] font-medium text-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <Search size={16} />
          <span className="hidden sm:inline">生成话题</span>
        </button>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat: Category) => (
          <button
            key={cat}
            onClick={() => onKeywordChange(cat)}
            className={`px-3 py-1 rounded-full text-xs transition-all border ${
              keyword === cat
                ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent)]'
                : 'bg-[var(--card-bg)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
