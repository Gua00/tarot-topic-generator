import TopicCard from './TopicCard';
import type { Topic } from '../types';

interface TopicCardListProps {
  topics: Topic[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (topic: Topic) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  resolvedUrls?: Map<string, string>;
}

export default function TopicCardList({
  topics,
  isFavorite,
  onToggleFavorite,
  showDelete,
  onDelete,
  resolvedUrls,
}: TopicCardListProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔮</p>
        <p className="text-[var(--text-secondary)]">暂无相关话题</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">试试换个关键词或颜色</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isFavorite={isFavorite(topic.id)}
          onToggleFavorite={onToggleFavorite}
          showDelete={showDelete}
          onDelete={onDelete}
          resolvedUrl={resolvedUrls?.get(topic.id)}
        />
      ))}
    </div>
  );
}
