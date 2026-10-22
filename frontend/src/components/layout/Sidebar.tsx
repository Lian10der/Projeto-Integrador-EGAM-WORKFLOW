"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/integracao-email", label: "Integração de E-mail" },
  { href: "/dashboard", label: "Home" },
  { href: "/projetos", label: "Explorar Projetos", badge: "6" },
  { href: "/clientes", label: "Clientes" },
  { href: "/kanban", label: "KanBan" },
  { href: "/parcerias", label: "Parcerias" },
  { href: "/investimentos", label: "Investimentos" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Navegação principal">
        <ul className="sidebar__list">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="sidebar__item">
                <Link
                  href={item.href}
                  className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="sidebar__badge">{item.badge}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <Link href="#" className="sidebar__link">
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}