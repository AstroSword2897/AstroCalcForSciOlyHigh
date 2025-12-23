'use client';

import { usePathname, useRouter } from 'next/navigation';

const sections = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'formulas', label: 'Formulas' },
  { id: 'converter', label: 'Unit Converter' },
  { id: 'graph', label: 'Graphing' },
  { id: 'frq', label: 'FRQ Helper' },
  { id: 'diagnostics', label: 'Diagnostics' },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = (id) => {
    if (typeof window !== 'undefined' && pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    router.push(`/${id}`);
  };

  return (
    <header className="nav">
      <div className="brand">
        <span className="brand-mark">AstroCalc</span>
        <span className="brand-sub">React Edition</span>
      </div>
      <nav>
        <ul className="nav-list">
          {sections.map((s) => (
            <li key={s.id}>
              <button className="nav-link" onClick={() => goTo(s.id)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
