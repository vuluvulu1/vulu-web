import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { Avatar, formatDate, timeAgo, useUsers } from '../../components.jsx';
import { FeedbackItem } from './Feedback.jsx';

/** Admin paneli: katılma istekleri, duyuru, açık geri bildirimler, kullanıcılar ve veritabanı alanı. */
export default function Admin() {
    const { user } = useAuth();
    if (!user.isAdmin) return <Navigate to="/hesap" replace />;
    return (
        <div className="admin">
            <Registrations />
            <AnnouncementEditor />
            <OpenFeedback />
            <Users />
            <Storage />
        </div>
    );
}

function Section({ title, count, children }) {
    return (
        <section className="card admin-section">
            <h2>{title}{count > 0 && <span className="count">{count}</span>}</h2>
            {children}
        </section>
    );
}

function Registrations() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(null);

    useEffect(() => { api.registrations().then(setItems).catch(err => setError(err.message)); }, []);

    async function act(reg, approve) {
        if (!approve && !confirm(`${reg.username} için katılma isteği reddedilsin mi?`)) return;
        setBusy(reg.id);
        setError(null);
        try {
            await (approve ? api.approveRegistration(reg.id) : api.rejectRegistration(reg.id));
            setItems(list => list.filter(r => r.id !== reg.id));
        } catch (err) {
            setError(err.message);
            // İstek başka bir admin tarafından işlenmişse listeden düşer
            if (err.status === 404 || err.status === 409) setItems(list => list.filter(r => r.id !== reg.id));
        } finally {
            setBusy(null);
        }
    }

    return (
        <Section title="Katılma istekleri" count={items?.length}>
            {!items && !error && <p className="muted small">Yükleniyor…</p>}
            {items?.length === 0 && <p className="muted small">Bekleyen istek yok.</p>}
            <ul className="admin-list">
                {items?.map(reg => (
                    <li key={reg.id}>
                        <div className="grow">
                            <b>{reg.username}{!reg.emailVerified && <span className="badge off">e-posta doğrulanmadı</span>}</b>
                            <small className="muted">{reg.email} · {timeAgo(reg.createdAt)}</small>
                        </div>
                        <button className="btn btn-sm" disabled={busy === reg.id} onClick={() => act(reg, false)}>Reddet</button>
                        <button className="btn btn-primary btn-sm" disabled={busy === reg.id || !reg.emailVerified}
                            title={reg.emailVerified ? undefined : 'Bu kişi e-posta adresini doğrulayınca onaylayabilirsin.'}
                            onClick={() => act(reg, true)}>Onayla</button>
                    </li>
                ))}
            </ul>
            {error && <p className="status error">{error}</p>}
        </Section>
    );
}

const DURATIONS = [[0, 'Kaldırılana kadar'], [24, '1 gün'], [72, '3 gün'], [168, '1 hafta'], [720, '30 gün']];

function AnnouncementEditor() {
    const [current, setCurrent] = useState(undefined);
    const [text, setText] = useState('');
    const [hours, setHours] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { api.announcement().then(setCurrent).catch(err => setError(err.message)); }, []);

    async function publish(e) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const { announcement } = await api.postAnnouncement(text.trim(), hours);
            setCurrent(announcement);
            setText('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (!confirm('Duyuru kaldırılsın mı?')) return;
        setBusy(true);
        try {
            await api.deleteAnnouncement(current.id);
            setCurrent(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Section title="Duyuru">
            {current && (
                <div className="announcement">
                    <p>{current.text}</p>
                    <small className="muted">
                        {current.author} · {formatDate(current.createdAt)}
                        {current.expiresAt ? ` · ${formatDate(current.expiresAt)} tarihinde kalkar` : ' · kaldırılana kadar'}
                    </small>
                    <div><button className="btn btn-sm" disabled={busy} onClick={remove}>Kaldır</button></div>
                </div>
            )}
            {current === null && <p className="muted small">Şu an yayında bir duyuru yok.</p>}
            <form className="stack" onSubmit={publish}>
                <textarea value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3}
                    placeholder="Duyuru metni. Launcher'ın ana ekranında ve sitede görünür." />
                <div className="row">
                    <select value={hours} onChange={e => setHours(Number(e.target.value))}>
                        {DURATIONS.map(([h, label]) => <option key={h} value={h}>{label}</option>)}
                    </select>
                    <small className="muted grow">Yeni duyuru eskisinin yerine geçer.</small>
                    <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>Yayınla</button>
                </div>
            </form>
            {error && <p className="status error">{error}</p>}
        </Section>
    );
}

function OpenFeedback() {
    const users = useUsers();
    const [groups, setGroups] = useState(null);   // [{ pack, name, items }]
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [counts, packs] = await Promise.all([api.feedbackCounts(), api.packs()]);
                const names = Object.fromEntries(packs.map(p => [p.id, p.name]));
                const keys = Object.keys(counts).filter(k => counts[k] > 0);
                const lists = await Promise.all(keys.map(k => api.feedback(k)));
                setGroups(keys.map((k, i) => ({
                    pack: k,
                    name: k === 'general' ? 'Genel' : names[k] || 'Silinmiş paket',
                    items: lists[i].filter(f => f.status === 'open'),
                })).filter(g => g.items.length));
            } catch (err) {
                setError(err.message);
            }
        })();
    }, []);

    const total = groups?.reduce((n, g) => n + g.items.length, 0);
    const replace = (pack, item) => setGroups(gs => gs.map(g => (g.pack !== pack ? g : { ...g, items: g.items.map(f => (f.id === item.id ? item : f)) })));
    const drop = (pack, id) => setGroups(gs => gs.map(g => (g.pack !== pack ? g : { ...g, items: g.items.filter(f => f.id !== id) })));

    return (
        <Section title="Açık geri bildirimler" count={total}>
            {!groups && !error && <p className="muted small">Yükleniyor…</p>}
            {groups?.length === 0 && <p className="muted small">Açık geri bildirim yok.</p>}
            {groups?.map(g => (
                <div className="feedback-group" key={g.pack}>
                    <h3>
                        {g.pack === 'general' ? <Link to="/hesap/geri-bildirim">Genel</Link> : <Link to={`/hesap/paketler/${g.pack}`}>{g.name}</Link>}
                    </h3>
                    {g.items.map(item => (
                        <FeedbackItem key={item.id} item={item} users={users}
                            onChange={next => (next.status === 'open' ? replace(g.pack, next) : drop(g.pack, item.id))}
                            onDelete={() => drop(g.pack, item.id)} />
                    ))}
                </div>
            ))}
            {error && <p className="status error">{error}</p>}
        </Section>
    );
}

function Users() {
    const { user: me } = useAuth();
    const users = useUsers();
    const [list, setList] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => { api.adminUsers().then(setList).catch(err => setError(err.message)); }, []);

    async function change(u, changes, question) {
        if (question && !confirm(question)) return;
        setError(null);
        try {
            const next = await api.updateUser(u.id, changes);
            setList(l => l.map(x => (x.id === u.id ? next : x)));
        } catch (err) {
            setError(err.message);
        }
    }

    async function resetPassword(u) {
        const password = prompt(`${u.username} için yeni şifre (6-72 karakter). Kullanıcının açık oturumları kapanır.`);
        if (!password) return;
        await change(u, { password });
    }

    async function remove(u) {
        if (!confirm(`${u.username} kalıcı olarak silinsin mi? Avatarı, mesajları ve ekran görüntüleri de silinir.`)) return;
        setError(null);
        try {
            await api.deleteUser(u.id);
            setList(l => l.filter(x => x.id !== u.id));
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Section title="Kullanıcılar" count={list?.length}>
            {!list && !error && <p className="muted small">Yükleniyor…</p>}
            <ul className="admin-list users-list">
                {list?.map(u => (
                    <li key={u.id} className={u.isActive ? '' : 'inactive'}>
                        <Avatar username={u.username} version={users[u.username]?.avatarVersion} size={30} />
                        <div className="grow">
                            <b><Link to={`/u/${u.username}`}>{u.username}</Link></b>
                            {u.isAdmin && <span className="badge">admin</span>}
                            {!u.isActive && <span className="badge off">kapalı</span>}
                            <small className="muted">
                                {u.email || 'e-posta yok'} · {u.lastSeenAt ? `son görülme ${timeAgo(u.lastSeenAt)}` : 'hiç görülmedi'}
                            </small>
                        </div>
                        {u.username !== me.username && (
                            <div className="row-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => change(u, { isAdmin: !u.isAdmin },
                                    u.isAdmin ? `${u.username} adminlikten çıkarılsın mı?` : `${u.username} admin yapılsın mı?`)}>
                                    {u.isAdmin ? 'Adminliği al' : 'Admin yap'}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => change(u, { isActive: !u.isActive },
                                    u.isActive ? `${u.username} hesabı kapatılsın mı? Giriş yapamaz.` : null)}>
                                    {u.isActive ? 'Kapat' : 'Aç'}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => resetPassword(u)}>Şifre</button>
                                <button className="btn btn-ghost btn-sm danger" onClick={() => remove(u)}>Sil</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            {error && <p className="status error">{error}</p>}
        </Section>
    );
}

const mb = bytes => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

function Storage() {
    const [data, setData] = useState(null);
    useEffect(() => { api.storage().then(setData).catch(() => {}); }, []);
    if (!data) return null;
    const used = data.usedBytes ?? data.parts.reduce((n, p) => n + p.bytes, 0);
    const percent = Math.min(100, Math.round((used / data.limitBytes) * 100));
    return (
        <Section title="Veritabanı alanı">
            <div className="meter"><span style={{ width: `${percent}%` }} /></div>
            <p className="small"><b>{mb(used)}</b> / {mb(data.limitBytes)} kullanılıyor (%{percent})</p>
            <ul className="top-list">
                {data.parts.map(p => <li key={p.key}><span>{p.label}</span><span className="mono muted">{mb(p.bytes)}</span></li>)}
            </ul>
        </Section>
    );
}
