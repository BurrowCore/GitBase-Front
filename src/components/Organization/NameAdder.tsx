import { useState } from 'react';

interface NameAdderProps {
  placeholder: string;
  buttonLabel: string;
  onAdd: (name: string) => void;
}

/** One-line "type a name, press Add" control — used for team members and team repositories. */
export function NameAdder({ placeholder, buttonLabel, onAdd }: NameAdderProps) {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    onAdd(name);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 px-3 py-1.5 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
      />
      <button type="submit" className="px-3 py-1.5 rounded-md bg-gitbase-primary text-white text-sm font-medium hover:opacity-90">
        {buttonLabel}
      </button>
    </form>
  );
}
