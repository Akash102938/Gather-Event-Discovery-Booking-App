import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<string, string> = {
  primary: 'bg-teal text-paper hover:bg-teal/90',
  secondary: 'bg-sand text-ink hover:bg-sand/80',
  danger: 'bg-ember text-paper hover:bg-ember/90',
  ghost: 'bg-transparent text-teal border border-teal hover:bg-teal/10',
};

export default function PrimaryButton({
  variant = 'primary',
  isLoading,
  fullWidth,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-card px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
