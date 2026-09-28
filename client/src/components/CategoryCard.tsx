const ICONS: Record<string, string> = {
  Music: '♪',
  Sports: '●',
  Technology: '◧',
  Business: '◆',
  Education: '✎',
  Workshops: '⚒',
  Entertainment: '★',
};

export default function CategoryCard({
  category,
  active,
  onClick,
}: {
  category: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex min-w-[92px] flex-col items-center gap-2 rounded-card border px-4 py-3 text-sm font-medium transition-colors ${
        active ? 'border-teal bg-teal text-paper' : 'border-ink/10 bg-white text-ink hover:border-teal/40'
      }`}
    >
      <span className="text-lg">{ICONS[category] ?? '◎'}</span>
      {category}
    </button>
  );
}
