import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

export default function InputField(props: InputProps | TextareaProps) {
  const { label, error, hint, className = '', id, ...rest } = props as any;
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  const baseClasses = `focus-ring w-full rounded-card border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 ${
    error ? 'border-ember' : 'border-ink/15'
  } ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      {props.as === 'textarea' ? (
        <textarea id={fieldId} className={`${baseClasses} min-h-[100px] resize-y`} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={fieldId} className={baseClasses} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error && <span className="text-xs text-ink/50">{hint}</span>}
      {error && <span className="text-xs font-medium text-ember">{error}</span>}
    </div>
  );
}
