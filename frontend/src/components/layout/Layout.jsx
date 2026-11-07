import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import "./layout.css";

const DESKTOP_QUERY = "(min-width: 768px)";

// Каркас страницы поездки: шапка, навигация по разделам и содержимое.
export default function Layout({ title, tabs, activeTab, onTabChange, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        () => window.matchMedia(DESKTOP_QUERY).matches
    );
    const [shareHint, setShareHint] = useState("");

    function handleSelect(id) {
        onTabChange(id);
        if (!window.matchMedia(DESKTOP_QUERY).matches) setIsSidebarOpen(false);
    }

    async function handleShare() {
        const link = window.location.href;
        try {
            await navigator.clipboard.writeText(link);
            setShareHint("Ссылка скопирована");
        } catch {
            setShareHint("Скопируйте ссылку из адресной строки");
        }
        // Подсказка исчезает сама через пару секунд
        setTimeout(() => setShareHint(""), 2500);
    }

    return (
        <div className="layout">
            <header className="layout-header">
                <button
                    type="button"
                    className="layout-header__icon-btn"
                    onClick={() => setIsSidebarOpen((open) => !open)}
                    aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
                    aria-expanded={isSidebarOpen}
                    aria-controls="layout-sidebar"
                >
                    <Icon name="menu" />
                </button>

                <Link to="/" className="layout-header__icon-btn" aria-label="На главную">
                    ←
                </Link>

                <h1 className="layout-header__title">{title}</h1>

                <div className="layout-header__actions">
                    <button type="button" className="btn btn--secondary" onClick={handleShare}>
                        Поделиться
                    </button>
                    {shareHint && (
                        <p className="layout-header__hint" role="status">
                            {shareHint}
                        </p>
                    )}
                </div>
            </header>

            <div className="layout__body">
                <aside
                    id="layout-sidebar"
                    className={"layout-sidebar" + (isSidebarOpen ? " is-open" : "")}
                >
                    <nav aria-label="Разделы поездки">
                        <ul className="layout-sidebar__list">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button
                                        type="button"
                                        className={
                                            "layout-sidebar__item" + (activeTab === tab.id ? " is-active" : "")
                                        }
                                        aria-current={activeTab === tab.id ? "page" : undefined}
                                        onClick={() => handleSelect(tab.id)}
                                    >
                                        <Icon name={tab.icon} />
                                        <span>{tab.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Затемнение за панелью: показывается только на телефоне (см. CSS) */}
                {isSidebarOpen && (
                    <div
                        className="layout-sidebar__backdrop"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <main className="layout__content">{children}</main>
            </div>
        </div>
    );
}