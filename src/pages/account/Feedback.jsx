import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { Avatar, timeAgo, useUsers } from '../../components.jsx';

const KINDS = { feedback: 'Geri bildirim', request: 'İstek' };

/** Pakete bağlı olmayan geri bildirimler ve istekler. */
export default function Feedback() {
    return (
        <div className="stack-lg">
            <p className="muted">
                Bir hata mı buldun, bir önerin ya da "şu modpack de eklensin" gibi bir isteğin mi var? Buraya yaz.
                Belirli bir paketle ilgiliyse <Link to="/hesap/paketler">paketin sayfasından</Link> yazarsan takip etmek
                daha kolay olur.
            </p>
            <FeedbackSection pack="general" />
        </div>
    );
}

/** Bir paketin (ya da genelin) geri bildirim listesi ve yazma formu. */
export function FeedbackSection({ pack }) {
    const users = useUsers();
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);
    const [kind, setKind] = useState('feedback');
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [showDone, setShowDone] = useState(false);

    useEffect(() => { api.feedback(pack).then(setItems).catch(err => setError(err.message)); }, [pack]);

    async function send(e) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const item = await api.sendFeedback(pack, kind, text.trim());
            setItems(list => [item, ...(list || [])]);
            setText('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    const open = items?.filter(f => f.status === 'open') || [];
    const done = items?.filter(f => f.status === 'done') || [];
    const replace = next => setItems(list => list.map(f => (f.id === next.id ? next : f)));
    const drop = id => setItems(list => list.filter(f => f.id !== id));

    return (
        <div className="feedback">
            <form className="card stack" onSubmit={send}>
                <div className="segmented">
                    {Object.entries(KINDS).map(([k, label]) => (
                        <button type="button" key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{label}</button>
                    ))}
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)} maxLength={1000} rows={3}
                    placeholder={kind === 'request' ? 'Ne eklenmesini istiyorsun?' : 'Ne oldu, ne öneriyorsun?'} />
                <div className="row">
                    <small className="muted grow">{text.length}/1000</small>
                    <button className="btn btn-primary btn-sm" disabled={busy || text.trim().length < 3}>Gönder</button>
                </div>
            </form>
            {error && <p className="status error">{error}</p>}

            {items === null && !error && <p className="muted small">Yükleniyor…</p>}
            {items && !open.length && <p className="muted small">Açık geri bildirim yok.</p>}
            {open.map(item => <FeedbackItem key={item.id} item={item} users={users} onChange={replace} onDelete={() => drop(item.id)} />)}

            {done.length > 0 && (
                <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowDone(v => !v)}>
                        {showDone ? 'Tamamlananları gizle' : `Tamamlananları göster (${done.length})`}
                    </button>
                    {showDone && done.map(item => <FeedbackItem key={item.id} item={item} users={users} onChange={replace} onDelete={() => drop(item.id)} />)}
                </>
            )}
        </div>
    );
}

/** Tek bir geri bildirim. Adminler yanıt yazıp "yapıldı" olarak işaretleyebilir. */
export function FeedbackItem({ item, users, onChange, onDelete }) {
    const { user } = useAuth();
    const [reply, setReply] = useState(item.reply);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);

    async function update(changes) {
        setError(null);
        try {
            const next = await api.updateFeedback(item.id, changes);
            onChange(next);
            setEditing(false);
        } catch (err) {
            setError(err.message);
        }
    }

    async function remove() {
        if (!confirm('Bu geri bildirim silinsin mi?')) return;
        try {
            await api.deleteFeedback(item.id);
            onDelete();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className={'feedback-item' + (item.status === 'done' ? ' done' : '')}>
            <Avatar username={item.author} version={users[item.author]?.avatarVersion ?? item.authorAvatarVersion} size={30} />
            <div className="grow">
                <div className="feedback-head">
                    <Link to={`/u/${item.author}`}><b>{item.author}</b></Link>
                    <span className={'kind ' + item.kind}>{KINDS[item.kind]}</span>
                    {item.status === 'done' && <span className="kind done">Yapıldı</span>}
                    <small className="muted">{timeAgo(item.createdAt)}</small>
                </div>
                <p className="feedback-text">{item.text}</p>
                {item.reply && !editing && (
                    <p className="feedback-reply"><b>{item.repliedBy}:</b> {item.reply}</p>
                )}
                {editing && (
                    <div className="row">
                        <input className="grow" value={reply} onChange={e => setReply(e.target.value)} maxLength={500} placeholder="Yanıt" />
                        <button className="btn btn-primary btn-sm" onClick={() => update({ reply })}>Kaydet</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setReply(item.reply); }}>Vazgeç</button>
                    </div>
                )}
                {(user.isAdmin || item.canDelete) && !editing && (
                    <div className="feedback-actions">
                        {user.isAdmin && <button onClick={() => setEditing(true)}>{item.reply ? 'Yanıtı düzenle' : 'Yanıtla'}</button>}
                        {user.isAdmin && (
                            <button onClick={() => update({ status: item.status === 'open' ? 'done' : 'open' })}>
                                {item.status === 'open' ? 'Yapıldı olarak işaretle' : 'Yeniden aç'}
                            </button>
                        )}
                        {item.canDelete && <button className="danger" onClick={remove}>Sil</button>}
                    </div>
                )}
                {error && <p className="status error">{error}</p>}
            </div>
        </div>
    );
}
