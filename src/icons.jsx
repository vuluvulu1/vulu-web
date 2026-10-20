// Basit çizgi ikonlar (24×24, currentColor). Launcher'daki ikonlarla aynı ince çizgi dili.
const PATHS = {
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    play: <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none" />,
    android: <path d="M7.2 9.2h9.6c.7 0 1.2.5 1.2 1.2v6.4c0 .7-.5 1.2-1.2 1.2h-.6V21a1 1 0 0 1-2 0v-3h-4.4v3a1 1 0 0 1-2 0v-3h-.6c-.7 0-1.2-.5-1.2-1.2v-6.4c0-.7.5-1.2 1.2-1.2ZM4.5 9.5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Zm15 0a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1ZM7.3 8.2a4.8 4.8 0 0 1 9.4 0H7.3Zm2.4-5.4.9 1.5m3.7-1.5-.9 1.5" fill="currentColor" stroke="none" />,
    windows: <path d="M3 5.5 10.5 4.5v7H3v-6Zm9-1.2L21 3v8.5h-9V4.3ZM3 12.5h7.5v7L3 18.5v-6Zm9 0h9V21l-9-1.3v-7.2Z" fill="currentColor" stroke="none" />,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
};

export default function Icon({ name, size = 20, className }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {PATHS[name]}
        </svg>
    );
}
