import { Link, useLocation } from 'react-router-dom';
import { Heart, PlusCircle, Sparkles } from 'lucide-react';
import { COLOR_MAP } from '../types';
import type { ColorTag } from '../types';

interface NavbarProps {
  currentColor: Exclude<ColorTag, '中性'>;
}

export default function Navbar({ currentColor }: NavbarProps) {
  const location = useLocation();
  const colorInfo = COLOR_MAP[currentColor];

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
      location.pathname === path
        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--parchment-dark)]'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-[var(--parchment)]/95 backdrop-blur-sm border-b border-[var(--border-base)]">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline text-[var(--text-primary)]">
          <span className="text-2xl">🔮</span>
          <span
            className="text-lg tracking-wide hidden sm:inline"
            style={{ fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
          >
            塔罗话题生成器
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className={linkClass('/')}>
            <Sparkles size={16} />
            <span className="hidden sm:inline">生成</span>
          </Link>
          <Link to="/favorites" className={linkClass('/favorites')}>
            <Heart size={16} />
            <span className="hidden sm:inline">收藏</span>
          </Link>
          <Link to="/manage" className={linkClass('/manage')}>
            <PlusCircle size={16} />
            <span className="hidden sm:inline">管理</span>
          </Link>

          {/* Current color indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-[var(--border-base)]">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorInfo.hex }}
              title={`${colorInfo.label} — ${colorInfo.emotion}`}
            />
            <span className="text-xs text-[var(--text-muted)]">{colorInfo.label}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
