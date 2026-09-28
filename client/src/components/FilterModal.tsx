import { useState } from 'react';
import { CATEGORIES, EventFilters } from '../types';
import PrimaryButton from './PrimaryButton';
import InputField from './InputField';

export default function FilterModal({
  initial,
  onClose,
  onApply,
  onClear,
}: {
  initial: EventFilters;
  onClose: () => void;
  onApply: (filters: EventFilters) => void;
  onClear: () => void;
}) {
  const [local, setLocal] = useState<EventFilters>(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-paper p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Filter events</h2>
          <button onClick={onClose} className="focus-ring text-xl text-ink/50" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocal((f) => ({ ...f, category: f.category === cat ? undefined : cat }))}
                  className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-medium ${
                    local.category === cat ? 'border-teal bg-teal text-paper' : 'border-ink/15 text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Date"
            type="date"
            value={local.date || ''}
            onChange={(e) => setLocal((f) => ({ ...f, date: e.target.value }))}
          />

          <InputField
            label="Location"
            placeholder="City or venue"
            value={local.location || ''}
            onChange={(e) => setLocal((f) => ({ ...f, location: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Min price"
              type="number"
              min={0}
              value={local.minPrice || ''}
              onChange={(e) => setLocal((f) => ({ ...f, minPrice: e.target.value }))}
            />
            <InputField
              label="Max price"
              type="number"
              min={0}
              value={local.maxPrice || ''}
              onChange={(e) => setLocal((f) => ({ ...f, maxPrice: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={local.available === 'true'}
              onChange={(e) => setLocal((f) => ({ ...f, available: e.target.checked ? 'true' : undefined }))}
              className="h-4 w-4 rounded border-ink/30 text-teal focus:ring-teal"
            />
            Only show events with available seats
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <PrimaryButton
            variant="secondary"
            fullWidth
            onClick={() => {
              setLocal({});
              onClear();
              onClose();
            }}
          >
            Clear filters
          </PrimaryButton>
          <PrimaryButton
            fullWidth
            onClick={() => {
              onApply(local);
              onClose();
            }}
          >
            Apply filters
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
