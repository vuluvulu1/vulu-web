import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { AuthImage, Avatar, timeAgo } from '../../components.jsx';

/**
 * Ekran görüntüleri, sayfa sayfa (launcher'dan paylaşılanlar). author verilirse yalnızca onunkiler.
 * update(id, değişiklikler) beğeni ve yorum sayısını listede günceller.
 */
export function useShotPages(author) {
    const [shots, setShots] = useState([]);
    const [more, setMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function load(before) {
        setLoading(true);
        setError(null);
        try {
            const page = await api.shots(before, author);
            setShots(list => (before ? [...list, ...page.shots] : page.shots));
            setMore(page.more);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [author]);

    return {
        shots, more, loading, error,
        loadMore: () => load(shots[shots.length - 1].createdAt),
        update: (id, changes) => setShots(list => list.map(s => (s.id === id ? { ...s, ...changes } : s))),
    };
}

export function ShotDialog({ shot, users, onChange, onClose }) {
    const { user } = useAuth();
    const ref = useRef(null);
    const [comments, setComments] = useState(null);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        ref.current?.showModal();
        api.shotComments(shot.id).then(setComments).catch(err => setError(err.message));
    }, [shot.id]);

    async function toggleLike() {
        try {
            const r = await api.likeShot(shot.id, !shot.liked);
            onChange({ likes: r.likes, liked: r.liked });
        } catch (err) {
            setError(err.message);
        }
    }

    async function send(e) {
        e.preventDefault();
        if (!text.trim()) return;
        setBusy(true);
        setError(null);
        try {
            const c = await api.addComment(shot.id, text.trim());
            setComments(list => [...(list || []), c]);
            onChange({ commentCount: c.commentCount });
            setText('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function remove(c) {
        try {
            await api.deleteComment(shot.id, c.id);
            setComments(list => list.filter(x => x.id !== c.id));
            onChange({ commentCount: Math.max(0, shot.commentCount - 1) });
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <dialog ref={ref} className="shot-dialog" onClose={onClose} onClick={e => { if (e.target === ref.current) ref.current.close(); }}>
            <div className="shot-view">
                <AuthImage className="shot-full" path={api.shotImagePath(shot.id, 'image')} width={shot.width} height={shot.height} />
            </div>
            <aside className="shot-side">
                <div className="shot-author">
                    <Avatar username={shot.author} version={users[shot.author]?.avatarVersion} size={36} />
                    <div>
                        <Link to={`/u/${shot.author}`}><b>{shot.author}</b></Link>
                        <small className="muted">
                            {timeAgo(shot.createdAt)}
                            {shot.packName && ` · ${shot.packName}`}
                            {shot.mcVersion && ` · ${shot.mcVersion}`}
                        </small>
                    </div>
                    <button className="btn btn-ghost btn-sm close" onClick={() => ref.current.close()} aria-label="Kapat">✕</button>
                </div>
                {shot.caption && <p className="shot-text">{shot.caption}</p>}
                <button className={'btn btn-sm like' + (shot.liked ? ' liked' : '')} onClick={toggleLike}>
                    ♥ {shot.liked ? 'Beğendin' : 'Beğen'} · {shot.likes}
                </button>

                <div className="comments">
                    {comments === null && !error && <p className="muted small">Yorumlar yükleniyor…</p>}
                    {comments?.length === 0 && <p className="muted small">Henüz yorum yok.</p>}
                    {comments?.map(c => (
                        <div className="comment" key={c.id}>
                            <Avatar username={c.author} version={users[c.author]?.avatarVersion} size={26} />
                            <div>
                                <Link to={`/u/${c.author}`}><b>{c.author}</b></Link> <small className="muted">{timeAgo(c.createdAt)}</small>
                                <p>{c.text}</p>
                            </div>
                            {(c.canDelete || c.author === user.username) && (
                                <button className="comment-delete" onClick={() => remove(c)} aria-label="Yorumu sil">Sil</button>
                            )}
                        </div>
                    ))}
                </div>
                {error && <p className="status error">{error}</p>}
                <form className="comment-form" onSubmit={send}>
                    <input value={text} onChange={e => setText(e.target.value)} maxLength={300} placeholder="Yorum yaz" />
                    <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>Gönder</button>
                </form>
            </aside>
        </dialog>
    );
}
