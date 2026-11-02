import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { AuthImage, Avatar, timeAgo } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { sparkBurst } from '../../effects.jsx';

/**
 * Ekran görüntüleri, sayfa sayfa (launcher'dan ya da siteden paylaşılanlar). author verilirse yalnızca onunkiler.
 * update(id, değişiklikler) beğeni ve yorum sayısını listede günceller; add ve remove yeni paylaşılanı ekler ya da silineni çıkarır.
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
        add: shot => setShots(list => [shot, ...list]),
        remove: id => setShots(list => list.filter(s => s.id !== id)),
    };
}

/** Beğen düğmesi: sayıyı hemen değiştirir, sunucu başka bir şey derse onu yazar. */
export function useLike(shot, onChange) {
    const [error, setError] = useState(null);
    async function toggle(e) {
        setError(null);
        const liked = !shot.liked;
        if (liked) sparkBurst(e?.currentTarget?.querySelector('svg') || e?.currentTarget);
        onChange({ liked, likes: shot.likes + (liked ? 1 : -1) });
        try {
            const r = await api.likeShot(shot.id, liked);
            onChange({ likes: r.likes, liked: r.liked });
        } catch (err) {
            onChange({ liked: shot.liked, likes: shot.likes });
            setError(err.message);
        }
    }
    return [toggle, error];
}

/**
 * Büyük görüntü, beğeni ve yorumlar. onPrev/onNext verilirse ok tuşlarıyla listedeki öncekine ya da sonrakine geçilir.
 * onDelete verilirse paylaşan (ya da admin) görüntüyü buradan silebilir.
 */
export function ShotDialog({ shot, users, onChange, onClose, onDelete, onPrev, onNext, focusComment = false }) {
    const { user } = useAuth();
    const ref = useRef(null);
    const input = useRef(null);
    const [comments, setComments] = useState(null);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [toggleLike, likeError] = useLike(shot, onChange);

    useEffect(() => { if (!ref.current?.open) ref.current?.showModal(); }, []);
    useEffect(() => {
        setComments(null);
        setError(null);
        api.shotComments(shot.id).then(setComments).catch(err => setError(err.message));
        if (focusComment) input.current?.focus();
    }, [shot.id]);

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

    async function removeComment(c) {
        try {
            await api.deleteComment(shot.id, c.id);
            setComments(list => list.filter(x => x.id !== c.id));
            onChange({ commentCount: Math.max(0, shot.commentCount - 1) });
        } catch (err) {
            setError(err.message);
        }
    }

    async function removeShot() {
        if (!confirm('Bu ekran görüntüsü silinsin mi? Beğeniler ve yorumlar da silinir.')) return;
        try {
            await api.deleteShot(shot.id);
            onDelete(shot.id);
            ref.current?.close();
        } catch (err) {
            setError(err.message);
        }
    }

    // Yalnızca pencere içindeyken; yazı yazılırken oklar imleci oynatır
    function onKeyDown(e) {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === 'ArrowLeft' && onPrev) { e.preventDefault(); onPrev(); }
        if (e.key === 'ArrowRight' && onNext) { e.preventDefault(); onNext(); }
    }

    return (
        <dialog ref={ref} className="shot-dialog" onClose={onClose} onKeyDown={onKeyDown}
            onClick={e => { if (e.target === ref.current) ref.current.close(); }} aria-label={`${shot.author} paylaştı`}>
            <div className="shot-view">
                <AuthImage key={shot.id} className="shot-full" path={api.shotImagePath(shot.id, 'image')} width={shot.width} height={shot.height}
                    alt={shot.caption || `${shot.author} paylaştı`} />
                {onPrev && <button className="shot-nav prev" onClick={onPrev} aria-label="Önceki görüntü"><Icon name="left" size={22} /></button>}
                {onNext && <button className="shot-nav next" onClick={onNext} aria-label="Sonraki görüntü"><Icon name="right" size={22} /></button>}
            </div>
            <aside className="shot-side">
                <header className="shot-author">
                    <Avatar username={shot.author} version={users[shot.author]?.avatarVersion} size={38} />
                    <div className="grow">
                        <Link to={`/u/${shot.author}`}><b>{shot.author}</b></Link>
                        <small>
                            {timeAgo(shot.createdAt)}
                            {shot.packName && ` · ${shot.packName}`}
                            {shot.mcVersion && ` · ${shot.mcVersion}`}
                        </small>
                    </div>
                    <button className="icon-btn" onClick={() => ref.current.close()} aria-label="Kapat"><Icon name="x" size={20} /></button>
                </header>
                {shot.caption && <p className="shot-caption">{shot.caption}</p>}
                <div className="shot-bar">
                    <button className={'like-btn' + (shot.liked ? ' on' : '')} onClick={toggleLike} aria-pressed={!!shot.liked}>
                        <Icon name="heart" size={18} /> {shot.liked ? 'Beğendin' : 'Beğen'} <span>{shot.likes}</span>
                    </button>
                    {onDelete && shot.canDelete && (
                        <button className="btn btn-quiet btn-sm push-right" onClick={removeShot}><Icon name="trash" size={16} /> Sil</button>
                    )}
                </div>

                <div className="comments">
                    {comments === null && !error && <p className="muted small">Yorumlar yükleniyor…</p>}
                    {comments?.length === 0 && <p className="muted small">Henüz yorum yok.</p>}
                    {comments?.map(c => (
                        <div className="comment" key={c.id}>
                            <Avatar username={c.author} version={users[c.author]?.avatarVersion} size={28} />
                            <div className="grow">
                                <Link to={`/u/${c.author}`}><b>{c.author}</b></Link> <small className="muted">{timeAgo(c.createdAt)}</small>
                                <p>{c.text}</p>
                            </div>
                            {(c.canDelete || c.author === user.username) && (
                                <button className="comment-delete" onClick={() => removeComment(c)} aria-label="Yorumu sil"><Icon name="trash" size={15} /></button>
                            )}
                        </div>
                    ))}
                </div>
                {(error || likeError) && <p className="status error">{error || likeError}</p>}
                <form className="comment-form" onSubmit={send}>
                    <input ref={input} value={text} onChange={e => setText(e.target.value)} maxLength={300} placeholder="Yorum yaz" aria-label="Yorum yaz" />
                    <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>Gönder</button>
                </form>
            </aside>
        </dialog>
    );
}

/**
 * Bir ekran görüntüsü listesi için açık pencere durumu: hangisinin açık olduğu, önceki ve sonraki.
 * open(shot, { comment }) açar; dialog listede olmayan bir görüntüyü de (bildirimden) gösterebilir.
 */
export function useShotViewer(list) {
    const [state, setState] = useState(null);   // { id, shot, comment }
    if (!state) return [null, (shot, opts = {}) => setState({ id: shot.id, shot, comment: !!opts.comment })];
    const index = list.shots.findIndex(s => s.id === state.id);
    const shot = index >= 0 ? list.shots[index] : state.shot;
    const go = i => setState({ id: list.shots[i].id, shot: list.shots[i], comment: false });
    const viewer = {
        shot,
        focusComment: state.comment,
        onClose: () => setState(null),
        onChange: changes => { list.update(shot.id, changes); setState(s => ({ ...s, shot: { ...s.shot, ...changes } })); },
        onDelete: id => list.remove(id),
        onPrev: index > 0 ? () => go(index - 1) : null,
        onNext: index >= 0 && index < list.shots.length - 1 ? () => go(index + 1) : null,
    };
    return [viewer, (s, opts = {}) => setState({ id: s.id, shot: s, comment: !!opts.comment })];
}
