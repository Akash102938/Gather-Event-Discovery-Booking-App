import { useState } from 'react';

export default function SearchBar({
  defaultValue = '',
  onSearch,
  onOpenFilters,
}: {
  defaultValue?: string;
  onSearch: (value: string) => void;
  onOpenFilters?: () => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 items-center gap-2 rounded-card border border-ink/15 bg-white px-3.5 py-2.5">
        <span className="text-ink/40">⌕</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search events, organizers, locations…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </div>
      {onOpenFilters && (
        <button
          type="button"
          onClick={onOpenFilters}
          className="focus-ring flex items-center gap-1.5 rounded-card border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-teal/40"
        >
          Filters
        </button>
      )}
    </form>
  );
}
