'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/api';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/licenses', label: 'Licencias' },
  { href: '/plans', label: 'Planes' },
  { href: '/logs', label: 'Logs' },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <aside className="sidebar">
      <div className="brand">Go<span>Proxy</span></div>
      <nav className="nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button className="btn logout" onClick={() => logout()}>Cerrar sesión</button>
    </aside>
  );
}
