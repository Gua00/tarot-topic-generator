import { Heart, ExternalLink } from 'lucide-react';
import type { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isFavorite: boolean;
  onToggleFavorite: (topic: Topic) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

function formatHotness(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w播放`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k播放`;
  return `${n}播放`;
}

function getBiliLink(topic: Topic): string {
  const rawId = topic.id.replace('b_', '');
  // BV号 → /video/BVxxx，AV号 → /video/av123
  return `https://www.bilibili.com/video/${rawId}`;
}

export default function TopicCard({
  topic,
  isFavorite,
  onToggleFavorite,
  showDelete,
  onDelete,
}: TopicCardProps) {
  const isBili = topic.id.startsWith('b_');

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-card)] p-4 card-glow group">
      <div className="flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[var(--text-primary)] leading-relaxed mb-2 text-[15px]"
            style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
          >
            {topic.title}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-[var(--text-muted)]">🔮 {topic.upMaster}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">
              {topic.colorTag === '中性' ? '通用' : topic.colorTag} · {topic.category}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              📊 {formatHotness(topic.hotness)}
            </span>
            {isBili && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-600">
                📡 B站实时
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2">
          {/* B站链接 — 仅B站实时数据有精确视频链接 */}
          {isBili && (
            <a
              href={getBiliLink(topic)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full transition-all duration-200 hover:bg-[var(--accent-light)] text-[var(--text-muted)] hover:text-[var(--accent)]"
              title="在B站打开原视频"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={() => onToggleFavorite(topic)}
            className="p-1.5 rounded-full transition-all duration-200 hover:bg-[var(--accent-light)]"
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <Heart
              size={18}
              className={`transition-colors duration-200 ${
                isFavorite
                  ? 'fill-[var(--accent)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]'
              }`}
            />
          </button>
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(topic.id)}
              className="p-1 rounded-full text-[var(--text-muted)] hover:text-red-500 transition-colors"
              title="删除"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
