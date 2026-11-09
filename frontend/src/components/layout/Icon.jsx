// иконки для навигации без сторонних библиотек.
const PATHS = {
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    back: <path d="M19 12H5M12 19l-7-7 7-7" />,
    route: (
        <>
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" />
        </>
    ),
    wallet: (
        <>
            <rect x="3" y="6" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
            <circle cx="16.5" cy="14.5" r="1" />
        </>
    ),
    plane: <path d="m22 2-7 20-4-9-9-4Z M22 2 11 13" />,
    checklist: (
        <>
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
        </>
    ),
    users: (
        <>
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20a6 6 0 0 1 12 0" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M17 14a5 5 0 0 1 4 5" />
        </>
    ),
};

export default function Icon({ name }) {
    return (
        <svg
            className="layout-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {PATHS[name]}
        </svg>
    );
}