import type { Label } from '../../types/issue';

/**
 * A coloured label pill.
 *
 * The text colour is derived from the label's own colour so light labels stay readable — using the
 * standard luminance formula rather than a naive brightness average.
 */
export function LabelChip({ label, onClick, active }: { label: Label; onClick?: () => void; active?: boolean }) {
  const hex = /^[0-9a-fA-F]{6}$/.test(label.color) ? label.color : 'cccccc';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const text = luminance > 0.6 ? '#1f2937' : '#ffffff';

  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      onClick={onClick}
      title={label.description ?? undefined}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        active ? 'ring-2 ring-gitbase-primary' : ''
      }`}
      style={{ backgroundColor: `#${hex}`, color: text }}
    >
      {label.name}
    </Tag>
  );
}
