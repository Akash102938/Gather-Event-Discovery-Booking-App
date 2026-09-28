interface Props {
  title: string;
  message: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink/15 bg-white/50 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-xl text-teal">
        {icon ?? '◎'}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink/60">{message}</p>
      {action}
    </div>
  );
}
