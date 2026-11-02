import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { Avatar, Empty, timeAgo, useUsers } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { describePresence, friendAction, relationTo, useFriends, usePresence } from '../../social.js';

/** Arkadaşlar: gelen istekler, arkadaşlar (oyunda, launcher açık, çevrimdışı) ve yanda üye arayıp ekleme. */
export default function Friends() {
    const friends = useFriends();
    const users = useUsers();
    const online = usePresence();
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);

    async function act(kind, username) {
        setBusy(username);
        setError(null);
        try { await friendAction(kind, username); } catch (err) { setError(err.message); } finally { setBusy(null); }
    }

    if (!friends) return <div className="skeleton" style={{ height: 280 }} aria-label="Yükleniyor" />;

    const presenceOf = name => online?.find(p => p.username === name);
    const groups = [['playing', 'Oyunda'], ['launcher', 'Launcher açık'], ['offline', 'Çevrimdışı']].map(([key, title]) => {
        const names = friends.friends.filter(name => {
            const p = presenceOf(name);
            return key === 'offline' ? !p : key === 'launcher' ? p && p.state !== 'playing' : p?.state === 'playing';
        });
        // Çevrimdışılar en son görülenden başlar
        if (key === 'offline') names.sort((a, b) => new Date(users[b]?.lastSeenAt || 0) - new Date(users[a]?.lastSeenAt || 0));
        return { key, title, names };
    }).filter(g => g.names.length);

    const person = (name, actions, note) => {
        const p = presenceOf(name);
        const last = users[name]?.lastSeenAt;
        return (
            <li key={name} className={'person' + (p ? '' : ' off')}>
                <Avatar username={name} version={users[name]?.avatarVersion} size={44} state={p?.state} />
                <div className="grow">
                    <Link to={`/u/${name}`}><b>{name}</b></Link>
                    <small className={p?.state === 'playing' ? 'playing' : ''}>
                        {note || (p ? describePresence(p) : last ? `Son görülme ${timeAgo(last)}` : 'Çevrimdışı')}
                    </small>
                </div>
                <div className="line-actions">{actions}</div>
            </li>
        );
    };

    return (
        <div className="friends">
            <div className="friends-main">
                {error && <p className="status error">{error}</p>}

                {friends.incoming.length > 0 && (
                    <section className="panel">
                        <h2 className="label">Gelen istekler <span className="num">{friends.incoming.length}</span></h2>
                        <ul className="person-list">
                            {friends.incoming.map(name => person(name, <>
                                <button className="btn btn-primary btn-sm" disabled={busy === name} onClick={() => act('accept', name)}>Kabul et</button>
                                <button className="btn btn-quiet btn-sm" disabled={busy === name} onClick={() => act('drop', name)}>Reddet</button>
                            </>, 'Seni arkadaş olarak eklemek istiyor'))}
                        </ul>
                    </section>
                )}

                {!friends.friends.length && (
                    <Empty icon="users" title="Henüz arkadaşın yok">
                        Yandaki listeden üyeleri bul ve ekle. Arkadaşların kabul edince ne oynadıklarını burada görürsün.
                    </Empty>
                )}

                {groups.map(g => (
                    <section className="panel" key={g.key}>
                        <h2 className="label">{g.title} <span>{g.names.length}</span></h2>
                        <ul className="person-list">
                            {g.names.map(name => person(name,
                                <button className="btn btn-quiet btn-sm" disabled={busy === name}
                                    onClick={() => { if (confirm(`${name} arkadaşlıktan çıkarılsın mı?`)) act('remove', name); }}>Çıkar</button>))}
                        </ul>
                    </section>
                ))}

                {friends.outgoing.length > 0 && (
                    <section className="panel">
                        <h2 className="label">Gönderdiğin istekler</h2>
                        <ul className="person-list">
                            {friends.outgoing.map(name => person(name,
                                <button className="btn btn-quiet btn-sm" disabled={busy === name} onClick={() => act('drop', name)}>Geri al</button>,
                                'Cevap bekleniyor'))}
                        </ul>
                    </section>
                )}
            </div>
            <aside className="friends-side">
                <FindMembers friends={friends} users={users} presenceOf={presenceOf} />
            </aside>
        </div>
    );
}

/** Üye listesinde ad arayıp arkadaş ekleme. Arama boşken son görülen üyeler gösterilir. */
function FindMembers({ friends, users, presenceOf }) {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(null);
    const [msg, setMsg] = useState(null);

    const q = query.trim().toLocaleLowerCase('tr');
    const all = Object.values(users).filter(u => u.username !== user.username);
    const matches = q
        ? all.filter(u => u.username.toLocaleLowerCase('tr').includes(q))
        : all.filter(u => relationTo(friends, u.username) === 'none').slice(0, 8);

    async function add(username) {
        setBusy(username);
        setMsg(null);
        try {
            await friendAction('request', username);
            setMsg({ ok: true, text: `${username} kullanıcısına istek gönderildi.` });
        } catch (err) {
            setMsg({ ok: false, text: err.message });
        } finally {
            setBusy(null);
        }
    }

    return (
        <section className="panel find">
            <h2 className="label">Üye bul</h2>
            <label className="search-box">
                <Icon name="search" size={18} />
                <input value={query} onChange={e => { setQuery(e.target.value); setMsg(null); }} placeholder="Kullanıcı adı" maxLength={32}
                    aria-label="Üyelerde ara" />
            </label>
            {msg && <p className={'status ' + (msg.ok ? 'ok' : 'error')}>{msg.text}</p>}
            {!q && matches.length > 0 && <p className="muted small">Son görülen üyeler</p>}
            {q && !matches.length && <p className="muted small">Bu adla bir üye yok.</p>}
            <ul className="person-list compact">
                {matches.slice(0, 12).map(u => {
                    const relation = relationTo(friends, u.username);
                    const p = presenceOf(u.username);
                    return (
                        <li key={u.username} className="person">
                            <Avatar username={u.username} version={u.avatarVersion} size={34} state={p?.state} />
                            <div className="grow">
                                <Link to={`/u/${u.username}`}><b>{u.username}</b></Link>
                                <small>{p ? describePresence(p) : u.lastSeenAt ? `Son görülme ${timeAgo(u.lastSeenAt)}` : 'Henüz görülmedi'}</small>
                            </div>
                            {relation === 'none' && (
                                <button className="btn btn-sm" disabled={busy === u.username} onClick={() => add(u.username)} aria-label={`${u.username} kullanıcısını ekle`}>
                                    <Icon name="plus" size={15} /> Ekle
                                </button>
                            )}
                            {relation === 'friend' && <span className="tag">arkadaş</span>}
                            {relation === 'outgoing' && <span className="tag">istek gitti</span>}
                            {relation === 'incoming' && <span className="tag hot">seni ekledi</span>}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
