import { Copy, Download } from 'lucide-react';
import TopicCardList from '../components/TopicCardList';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();

  const handleCopyAll = async () => {
    if (favorites.length === 0) return;
    const text = favorites.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const handleExportTxt = () => {
    if (favorites.length === 0) return;
    const text = favorites
      .map(
        (t, i) =>
          `${i + 1}. ${t.title}\n   UP主：${t.upMaster} | 情绪：${t.colorTag} | 分类：${t.category} | 热度：${t.hotness}`
      )
      .join('\n\n');
    const blob = new Blob([`塔罗话题收藏列表\n导出时间：${new Date().toLocaleString()}\n\n${text}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `塔罗话题收藏_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl mb-1 text-[var(--text-primary)] tracking-wide"
          style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
        >
          ❤️ 我的收藏
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          共收藏了 <span className="text-[var(--accent)] font-medium">{favorites.length}</span> 个话题
        </p>
      </div>

      <TopicCardList
        topics={favorites}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        showDelete
        onDelete={removeFavorite}
      />

      {favorites.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleCopyAll}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--card-bg)] border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all text-sm"
          >
            <Copy size={16} />
            一键复制
          </button>
          <button
            onClick={handleExportTxt}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-btn)] btn-accent text-sm"
          >
            <Download size={16} />
            导出 TXT
          </button>
        </div>
      )}
    </div>
  );
}
