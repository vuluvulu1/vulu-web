import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, useUsers } from '../../components.jsx';
import { describePresence, friendAction, useFriends, usePresence } from '../../social.js';

/** Arkadaşlar: ekleme, gelen ve gönderilen istekler, arkadaş listesi ve ne oynadıkları. */
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

    if (!friends) return <p className="muted">Yükleniyor…</p>;

    const presenceOf = name => online?.find(p => p.username === name);
    // Çevrimiçi olanlar önce
    const list = [...friends.friends].sort((a, b) => (presenceOf(a) ? 0 : 1) - (presenceOf(b) ? 0 : 1));

    const person = (name, actions, note) => {
        const p = presenceOf(name);
        return (
            <li key={name} className="friend">
                <span className="avatar-dot">
                    <Avatar username={name} version={users[name]?.avatarVersion} size={44} />
                    {p && <span className={'presence-dot ' + p.state} />}
                </span>
                <div className="grow">
                    <Link to={`/u/${name}`}><b>{name}</b></Link>
                    <small className={p?.state === 'playing' ? 'playing' : 'muted'}>{note || (p ? describePresence(p) : 'Çevrimdışı')}</small>
                </div>
                <div className="row-actions">{actions}</div>
            </li>
        );
    };

    return (
        <div className="friends">
            <AddFriend />
            {error && <p className="status error">{error}</p>}

            {friends.incoming.length > 0 && (
                <section className="friends-section">
                    <h2>Gelen istekler <span className="count">{friends.incoming.length}</span></h2>
                    <ul className="friend-list">
                        {friends.incoming.map(name => person(name, <>
                            <button className="btn btn-primary btn-sm" disabled={busy === name} onClick={() => act('accept', name)}>Kabul et</button>
                            <button className="btn btn-ghost btn-sm" disabled={busy === name} onClick={() => act('drop', name)}>Reddet</button>
                        </>, 'Seni arkadaş olarak eklemek istiyor'))}
                    </ul>
                </section>
            )}

            <section className="friends-section">
                <h2>Arkadaşların <span className="muted">{friends.friends.length}</span></h2>
                {!list.length && <p className="muted small">Henüz arkadaşın yok. Yukarıdan kullanıcı adıyla ya da birinin profilinden ekleyebilirsin.</p>}
                <ul className="friend-list">
                    {list.map(name => person(name,
                        <button className="btn btn-ghost btn-sm" disabled={busy === name}
                            onClick={() => { if (confirm(`${name} arkadaşlıktan çıkarılsın mı?`)) act('remove', name); }}>Çıkar</button>))}
                </ul>
            </section>

            {friends.outgoing.length > 0 && (
                <section className="friends-section">
                    <h2>Gönderdiğin istekler</h2>
                    <ul className="friend-list">
                        {friends.outgoing.map(name => person(name,
                            <button className="btn btn-ghost btn-sm" disabled={busy === name} onClick={() => act('drop', name)}>Geri al</button>,
                            'Cevap bekleniyor'))}
                    </ul>
                </section>
            )}
        </div>
    );
}

function AddFriend() {
    const [name, setName] = useState('');
    const [state, setState] = useState(null);   // null | 'busy' | { ok, text }

    async function submit(e) {
        e.preventDefault();
        const username = name.trim();
        if (!username) return;
        setState('busy');
        try {
            await friendAction('request', username);
            setState({ ok: true, text: `${username} kullanıcısına istek gönderildi.` });
            setName('');
        } catch (err) {
            setState({ ok: false, text: err.message });
        }
    }

    return (
        <form className="add-friend" onSubmit={submit}>
            <input value={name} onChange={e => { setName(e.target.value); setState(null); }} placeholder="Kullanıcı adı" maxLength={32} aria-label="Eklenecek kullanıcı adı" />
            <button className="btn btn-primary" disabled={state === 'busy' || !name.trim()}>Arkadaş ekle</button>
            {state?.text && <p className={'status ' + (state.ok ? 'ok' : 'error')}>{state.text}</p>}
        </form>
    );
}
