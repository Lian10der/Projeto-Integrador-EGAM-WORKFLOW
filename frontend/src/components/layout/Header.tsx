"use client";

import Link from "next/link";

export function Header() {
    return (
        <>
            <header className="header">
                <div className="sidebar__brand">
                    <div className="sidebar__avatar">IG</div>
                    <div className="sidebar__brand-text">
                        <span className="sidebar__title">IGAM WorkFlow</span>
                        <span className="sidebar__email">admin@igamworkflow.com</span>
                    </div>
                </div>
                <div className="dashboard-header__actions">
                    <div className="search-box">
                        <span>🔍</span>
                        <input type="text" placeholder="Pesquisar Projetos" />
                    </div>
                    <Link href="/projetos/novo" className="button">
                        + Criar Projeto
                    </Link>

                    <span className="header-icon">
                        🔔
                        <span className="header-icon__badge" />
                    </span>
                    <span className="header-icon">⋯</span>
                </div>
            </header>
        </>
    );
}