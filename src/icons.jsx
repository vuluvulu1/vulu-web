// Basit çizgi ikonlar (24×24, currentColor). Launcher'daki ikonlarla aynı ince çizgi dili.
const PATHS = {
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    package: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></>,
    server: <><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />,
    archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M10 13h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shirt: <path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0Z" />,
    discord: <><path d="M8 17c-2 .5-4 0-5-1 0-5 1.5-9 3-11 1.5-.8 3-1 4-1l.5 1.5h3L14 4c1 0 2.5.2 4 1 1.5 2 3 6 3 11-1 1-3 1.5-5 1l-1-2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.2-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
    music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
    refresh: <><path d="M20 12a8 8 0 0 1-14.3 4.9" /><path d="M4 12A8 8 0 0 1 18.3 7.1" /><path d="M18 3v4.5h-4.5" /><path d="M6 21v-4.5h4.5" /></>,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    play: <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none" />,
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
