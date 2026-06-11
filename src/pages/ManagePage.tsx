import { useState, useRef } from 'react';
import { Plus, Upload } from 'lucide-react';
import TopicCardList from '../components/TopicCardList';
import { useFavorites } from '../hooks/useFavorites';
import { useUserTopics } from '../hooks/useTopics';
import { CATEGORIES, COLOR_TAGS, UP_MASTERS } from '../types';
import type { Category, ColorTag, Topic } from '../types';

export default function ManagePage() {
  const { userTopics, addTopic, removeTopic, importTopics } = useUserTopics();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    category: '通用' as Category,
    colorTag: '紫色' as ColorTag,
    upMaster: '龙女塔罗',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const topic: Topic = {
      id: 'u_' + Date.now(),
      title: form.title.trim(),
      category: form.category,
      colorTag: form.colorTag,
      hotness: Math.floor(Math.random() * 5000) + 100,
      upMaster: form.upMaster,
      isNeutral: form.colorTag === '中性',
      source: 'user',
    };
    addTopic(topic);
    setForm((prev) => ({ ...prev, title: '' }));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const topics: Topic[] = Array.isArray(data) ? data : data.topics || [];
        importTopics(
          topics.map((t) => ({
            ...t,
            source: 'user' as const,
            id: t.id || 'u_' + Date.now() + Math.random(),
          }))
        );
      } catch {
        alert('文件格式错误，请导入有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const inputClass =
    'px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-border)] transition-all text-sm';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl mb-1 text-[var(--text-primary)] tracking-wide"
          style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
        >
          ➕ 话题管理
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          手动添加话题，或导入 JSON 话题库
        </p>
      </div>

      {/* Add form */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-base)] rounded-[var(--radius-card)] p-4 space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
          <Plus size={16} className="text-[var(--accent)]" />
          添加新话题
        </h3>
        <input
          type="text"
          placeholder="输入话题文本，如：他最近在想我吗？"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className={`${inputClass} w-full`}
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={form.colorTag}
            onChange={(e) => setForm((p) => ({ ...p, colorTag: e.target.value as ColorTag }))}
            className={inputClass}
          >
            {[...COLOR_TAGS, '中性'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={form.upMaster}
            onChange={(e) => setForm((p) => ({ ...p, upMaster: e.target.value }))}
            className={inputClass}
          >
            {UP_MASTERS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={!form.title.trim()}
          className="w-full btn-accent px-4 py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          添加到话题库
        </button>
      </div>

      {/* Import */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--card-bg)] border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all text-sm"
        >
          <Upload size={16} />
          导入 JSON 话题库
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      {/* User topics list */}
      <div className="space-y-2">
        <p className="text-sm text-[var(--text-muted)]">
          我的话题（{userTopics.length} 条）
        </p>
        <TopicCardList
          topics={userTopics}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          showDelete
          onDelete={removeTopic}
        />
      </div>
    </div>
  );
}
