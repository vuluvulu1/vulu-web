// Basit çizgi ikonlar (24×24, currentColor). Launcher'daki ikonlarla aynı ince çizgi dili.
const PATHS = {
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    play: <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none" />,
    android: <path d="M7.2 9.2h9.6c.7 0 1.2.5 1.2 1.2v6.4c0 .7-.5 1.2-1.2 1.2h-.6V21a1 1 0 0 1-2 0v-3h-4.4v3a1 1 0 0 1-2 0v-3h-.6c-.7 0-1.2-.5-1.2-1.2v-6.4c0-.7.5-1.2 1.2-1.2ZM4.5 9.5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Zm15 0a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1ZM7.3 8.2a4.8 4.8 0 0 1 9.4 0H7.3Zm2.4-5.4.9 1.5m3.7-1.5-.9 1.5" fill="currentColor" stroke="none" />,
    windows: <path d="M3 5.5 10.5 4.5v7H3v-6Zm9-1.2L21 3v8.5h-9V4.3ZM3 12.5h7.5v7L3 18.5v-6Zm9 0h9V21l-9-1.3v-7.2Z" fill="currentColor" stroke="none" />,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
    feed: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16" /><path d="M10 10v10" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></>,
    box: <><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5" /><path d="M12 12v9" /></>,
    chat: <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
    shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />,
    logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="m10 16-4-4 4-4" /><path d="M6 12h10" /></>,
    camera: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.5" /></>,
    heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
    comment: <><path d="M4 5h16v11H9l-5 4V5Z" /></>,
};

export default function Icon({ name, size = 20, className }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {PATHS[name]}
        </svg>
    );
}
