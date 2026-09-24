interface Props {
  password: string;
}

export function PasswordStrength({ password }: Props) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(password) },
    { label: 'Contains a number', ok: /\d/.test(password) },
  ];

  return (
    <ul className="space-y-1 text-xs">
      {checks.map((c) => (
        <li
          key={c.label}
          className={c.ok ? 'text-green-600' : 'text-slate-400'}
        >
          {c.ok ? '✓' : '○'} {c.label}
        </li>
      ))}
    </ul>
  );
}