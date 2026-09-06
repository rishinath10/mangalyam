import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const baseInput =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#8A1C1C] focus:ring-2 focus:ring-[#8A1C1C]/15 disabled:bg-neutral-50 disabled:text-neutral-400";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600"
    >
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-red-600">{children}</p>;
}

export function Input({
  label,
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        {...props}
        aria-invalid={error ? true : undefined}
        className={baseInput}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function Textarea({
  label,
  error,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea id={id} {...props} className={`${baseInput} resize-y`} />
      <FieldError>{error}</FieldError>
    </div>
  );
}
