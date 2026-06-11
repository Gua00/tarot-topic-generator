import { Copy, ArrowUpDown } from 'lucide-react';
import type { Topic } from '../types';

interface ActionBarProps {
  topics: Topic[];
  sortByHeat: boolean;
  onToggleSort: () => void;
}

export default function ActionBar({ topics, sortByHeat, onToggleSort }: ActionBarProps) {
  const handleCopyAll = async () => {
    if (topics.length === 0) return;
    const text = topics.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopyAll}
        disabled={topics.length === 0}
        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--card-bg)] border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Copy size={16} />
        一键复制全部
      </button>
      <button
        onClick={onToggleSort}
        disabled={topics.length === 0}
        className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-btn)] border transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
          sortByHeat
            ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent)]'
            : 'bg-[var(--card-bg)] border-[var(--border-base)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]'
        }`}
      >
        <ArrowUpDown size={16} />
        热度排序
      </button>
    </div>
  );
}
