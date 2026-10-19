import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { AuthImage, Avatar, formatDate, loaderName, timeAgo, useLoad, useUsers } from '../../components.jsx';
import { ChangeCounts } from './Packs.jsx';
import { ShotDialog } from './Shots.jsx';

/** Hesabın genel sayfası: duyuru, çevrimiçi olanlar, son paket güncellemeleri ve son ekran görüntüleri. */
export default function Overview() {
    return (
        <div className="overview">
            <Announcement />
            <div className="overview-grid">
                <Online />
                <PackUpdates />
            </div>
            <RecentShots />
        </div>
    );
}

function Announcement() {
    const { data: a } = useLoad(() => api.announcement());
    if (!a) return null;
    return (
        <div className="announcement">
            <span className="announcement-label">Duyuru</span>
            <p>{a.text}</p>
            <small className="muted">{a.author} · {formatDate(a.createdAt)}</small>
        </div>
    );
}

const PRESENCE_REFRESH = 45 * 1000;

function describe(p) {
    if (p.state === 'playing') {
        const what = [p.instance, p.mcVersion && `Minecraft ${p.mcVersion}`, p.loader && loaderName(p.loader)].filter(Boolean).join(' · ');
        return p.server ? `${p.server} sunucusunda oynuyor` : what ? `Oynuyor: ${what}` : 'Oynuyor';
    }
    return p.state === 'launcher' ? 'Launcher açık' : 'Çevrimiçi';
}

function Online() {
    const { user } = useAuth();
    const users = useUsers();
    const [online, setOnline] = useState(undefined);   // undefined: yükleniyor, null: alınamadı

    useEffect(() => {
        let cancelled = false;
        const load = () => api.presence().then(list => { if (!cancelled) setOnline(list); });
        load();
        const timer = setInterval(load, PRESENCE_REFRESH);
        return () => { cancelled = true; clearInterval(timer); };
    }, []);

    const others = online?.filter(p => p.username !== user.username) || [];
    // Oynayanlar önce
    others.sort((a, b) => (a.state === 'playing' ? 0 : 1) - (b.state === 'playing' ? 0 : 1));

    return (
        <div className="card">
            <h2>Şu an çevrimiçi</h2>
            {online === undefined && <p className="muted small">Yükleniyor…</p>}
            {online === null && <p className="muted small">Çevrimiçi durumu şu an alınamadı.</p>}
            {online && !others.length && <p className="muted small">Şu an launcher'ı açık olan kimse yok.</p>}
            <ul className="people">
                {others.map(p => (
                    <li key={p.username}>
                        <Avatar username={p.username} version={users[p.username]?.avatarVersion} size={32} />
                        <div>
                            <b>{p.username}</b>
                            <small className={p.state === 'playing' ? 'playing' : 'muted'}>{describe(p)}</small>
                        </div>
                        <span className={'presence-dot ' + p.state} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function PackUpdates() {
    const { data: packs, error } = useLoad(() => api.packs());
    const recent = (packs || []).slice(0, 4);
    return (
        <div className="card">
            <h2>Son paket güncellemeleri</h2>
            {!packs && !error && <p className="muted small">Yükleniyor…</p>}
            {error && <p className="muted small">{error}</p>}
            {packs && !packs.length && <p className="muted small">Henüz paylaşılmış bir paket yok.</p>}
            <ul className="pack-updates">
                {recent.map(pack => {
                    const latest = [...pack.changelog].sort((a, b) => b.revision - a.revision)[0];
                    return (
                        <li key={pack.id}>
                            <div className="pack-update-head">
                                <b>{pack.name}</b>
                                <small className="muted"><span className="mono">r{pack.revision}</span> · {timeAgo(pack.updatedAt)}</small>
                            </div>
                            {latest ? <ChangeCounts change={latest} /> : <small className="muted">Değişiklik kaydı yok.</small>}
                        </li>
                    );
                })}
            </ul>
            {packs?.length > 0 && <Link className="card-link" to="/hesap/paketler">Tüm paketler →</Link>}
        </div>
    );
}

function RecentShots() {
    const users = useUsers();
    const [shots, setShots] = useState(null);
    const [open, setOpen] = useState(null);

    useEffect(() => { api.shots().then(p => setShots(p.shots.slice(0, 6))).catch(() => setShots([])); }, []);
    if (!shots?.length) return null;

    const update = (id, changes) => setShots(list => list.map(s => (s.id === id ? { ...s, ...changes } : s)));

    return (
        <div className="card">
            <h2>Son ekran görüntüleri</h2>
            <div className="shot-strip">
                {shots.map(shot => (
                    <button className="shot-mini" key={shot.id} onClick={() => setOpen(shot)} title={`${shot.author}${shot.caption ? ': ' + shot.caption : ''}`}>
                        <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} />
                    </button>
                ))}
            </div>
            <Link className="card-link" to="/hesap/ekran-goruntuleri">Tüm ekran görüntüleri →</Link>
            {open && (
                <ShotDialog
                    shot={shots.find(s => s.id === open.id) || open}
                    users={users}
                    onChange={changes => update(open.id, changes)}
                    onClose={() => setOpen(null)}
                />
            )}
        </div>
    );
}
