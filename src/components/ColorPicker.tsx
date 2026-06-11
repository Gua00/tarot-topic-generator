import { COLOR_MAP, COLOR_TAGS } from '../types';
import type { ColorTag } from '../types';

interface ColorPickerProps {
  currentColor: Exclude<ColorTag, '中性'>;
  onColorChange: (color: Exclude<ColorTag, '中性'>) => void;
}

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-muted)]">
        选择情绪能量场：<span className="text-[var(--accent)] font-medium">{COLOR_MAP[currentColor].label} — {COLOR_MAP[currentColor].description}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {COLOR_TAGS.map((color) => {
          const info = COLOR_MAP[color];
          const selected = currentColor === color;
          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`tooltip relative px-3 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                selected
                  ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--parchment)]'
                  : 'border-[var(--border-light)] hover:border-[var(--accent-border)]'
              }`}
              style={{
                backgroundColor: selected ? 'var(--accent-light)' : 'var(--card-bg)',
                color: selected ? 'var(--accent)' : 'var(--text-secondary)',
              }}
              data-tooltip={`${info.label}：${info.example}`}
              title={`${info.label}／${info.emotion} — ${info.example}`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: info.hex }}
              />
              {color}
            </button>
          );
        })}
      </div>
      {/* Selected emotion detail */}
      <div className="text-xs text-[var(--text-muted)] italic px-1">
        💡 示例：{COLOR_MAP[currentColor].example}
      </div>
    </div>
  );
}
