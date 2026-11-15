// Profildeki ilerleme bölümleri: 3B skin, seviye ve sezon görevleri, vulu Pelerinleri, rozetler ve dolap.
// Sayılar vulu sunucusunun istatistiklerinden gelir (API: /progress).
import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useLoad } from '../components.jsx';

/** Dönen 3B karakter; sürükleyerek çevrilir. three.js yalnızca tarayıcıda yüklenir (ön çizimde değil). */
export function Skin3D({ skinHash, model, capeHash, height = 300 }) {
    const canvas = useRef(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let cleanup = null, cancelled = false;
        import('../skin3d.js')
            .then(m => m.mountSkin(canvas.current, {
                skinUrl: skinHash ? api.skinUrl(skinHash) : null,
                capeUrl: capeHash ? api.skinUrl(capeHash) : null,
                slim: model === 'slim',
            }))
            .then(fn => { if (cancelled) fn(); else cleanup = fn; })
            .catch(() => !cancelled && setFailed(true));
        return () => { cancelled = true; cleanup?.(); };
    }, [skinHash, model, capeHash]);
    if (failed) return <span className="muted small">3B görünüm bu tarayıcıda açılamadı.</span>;
    return <canvas ref={canvas} className="skin3d" style={{ height }} aria-label="3B skin görünümü, çevirmek için sürükle" />;
}

const pct = (value, from, to) => `${Math.round(Math.max(0, Math.min(1, to > from ? (value - from) / (to - from) : 0)) * 100)}%`;

function questText(q) {
    if (q.done) return 'Tamamlandı ✓';
    if (q.key === 'yola-cikis') return `${Math.floor(q.value / 72000)} / ${q.target / 72000} saat`;
    if (q.key === 'gezgin') return `${(q.value / 100000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} / ${q.target / 100000} km`;
    return `${q.value} / ${q.target}`;
}

/** Seviye, sezon görevleri, pelerinler ve rozetler. onCape: takılı pelerin değişince (3B görünüm yenilensin). */
export function ProgressSections({ username, isMe, onCape }) {
    const { data, error, loading } = useLoad(() => api.progress(isMe ? null : username), [username, isMe]);
    const [capeKey, setCapeKey] = useState(null);
    const [note, setNote] = useState(null);
    if (loading || error || !data) return null;
    const worn = capeKey ?? data.capeKey;
    const capes = isMe ? data.capes : data.capes.filter(c => c.owned);

    async function wear(cape) {
        if (!isMe) return;
        if (!cape.owned) { setNote(`${cape.name}: ${cape.earn}`); return; }
        const key = worn === cape.key ? '' : cape.key;
        try {
            await api.setCape(key);
            setCapeKey(key);
            setNote(key ? `${cape.name} takıldı. Oyunda bir sonraki girişinde herkes görür.` : 'Pelerin çıkarıldı.');
            onCape?.(key ? cape.hash : '');
        } catch (err) { setNote(err.message); }
    }

    const s = data.season;
    return (
        <>
            <section className="pf-section pg-level">
                <h2>Seviye</h2>
                <div className="pg-level-row">
                    <span className="pg-level-badge">{data.level}</span>
                    <div className="grow">
                        <span className="pf-bar"><span style={{ width: pct(data.xp, data.from, data.to) }} /></span>
                        <p className="muted small mono">{data.xp.toLocaleString('tr-TR')} / {data.to.toLocaleString('tr-TR')} XP</p>
                        <p className="small">
                            {data.played
                                ? `${data.totals.playtime} oynadı · ${data.totals.diamonds} elmas · ${data.totals.distance} yol · ${data.totals.advancements} başarım · ${data.totals.deaths} ölüm`
                                : isMe ? 'vulu sunucusunda oynayınca seviyen burada görünür.' : 'Henüz vulu sunucusunda oynamamış.'}
                        </p>
                    </div>
                </div>
                {s && (
                    <div className="pg-season">
                        <h3>{s.name} <span className="tag">Sezon seviyesi {s.level}</span></h3>
                        <span className="pf-bar"><span style={{ width: pct(s.xp, s.from, s.to) }} /></span>
                        <p className="muted small">
                            {new Date(s.endsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihinde biter.
                            Bütün görevler ya da sezon seviyesi {s.capeLevel}: sezon pelerini.
                        </p>
                        <ul className="pg-quests">
                            {s.quests.map(q => (
                                <li key={q.key} className={q.done ? 'done' : ''}>
                                    <span className="pg-quest-icon" aria-hidden="true">{q.icon}</span>
                                    <span className="grow">
                                        <b>{q.name}</b>
                                        <small className="muted">{q.desc}</small>
                                        <span className="pf-bar"><span style={{ width: pct(q.value, 0, q.target) }} /></span>
                                        <small>{questText(q)}</small>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {capes.length > 0 && (
                <section className="pf-section">
                    <h2>Pelerinler <span className="muted">{data.capes.filter(c => c.owned).length}</span></h2>
                    {isMe && <p className="muted small">Pelerinler satılmaz: oynayarak, sezon görevleriyle ve etkinlik kazanarak alınır. Taktığın pelerini oyunda herkes görür.</p>}
                    <div className="pg-capes">
                        {capes.map(c => (
                            <button key={c.key} type="button" className={'pg-cape' + (c.owned ? '' : ' locked') + (worn === c.key ? ' worn' : '')}
                                onClick={() => wear(c)} title={c.owned ? c.name : `${c.name}: ${c.earn}`} disabled={!isMe}>
                                <span className="pg-cape-art" style={{ backgroundImage: `url(${c.texture})` }} aria-hidden="true" />
                                <b>{c.name}</b>
                                <small>{worn === c.key ? 'Takılı' : c.owned ? (isMe ? 'Tak' : '') : 'Kilitli'}</small>
                            </button>
                        ))}
                    </div>
                    {note && <p className="status small">{note}</p>}
                </section>
            )}

            {data.badges.length > 0 && (
                <section className="pf-section">
                    <h2>Rozetler <span className="muted">{data.badges.length}</span></h2>
                    <div className="pg-badges">
                        {data.badges.map(b => (
                            <span key={b.key} className="pg-badge" title={b.desc}>
                                <span aria-hidden="true">{b.icon}</span> {b.name}{b.count > 1 && <small> ×{b.count}</small>}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

/** Dolap: yüklenen skinler, tek tıkla giyilir (kendi profilinde). */
export function Wardrobe() {
    const { updateProfile } = useAuth();
    const [state, setState] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => { api.wardrobe().then(setState).catch(err => setError(err.message)); }, []);
    if (error) return <p className="status error small">{error}</p>;
    if (!state) return null;

    async function wear(skin) {
        if (skin.hash === state.current) return;
        try {
            setState(await api.wearSkin(skin.hash));
            updateProfile(await api.me());
        } catch (err) { setError(err.message); }
    }
    async function remove(skin) {
        if (!confirm(`"${skin.name}" dolabından çıkarılsın mı?`)) return;
        try { setState(await api.removeFromWardrobe(skin.hash)); } catch (err) { setError(err.message); }
    }

    return (
        <div className="pg-wardrobe">
            <p className="small"><b>Dolap</b> <span className="muted mono">{state.skins.length}/{state.max}</span></p>
            {state.skins.length === 0
                ? <p className="muted small">Yüklediğin skinler burada saklanır; aralarında tek tıkla geçersin.</p>
                : <div className="pg-wardrobe-list">
                    {state.skins.map(skin => (
                        <span key={skin.hash} className={'pg-wardrobe-item' + (skin.hash === state.current ? ' worn' : '')}>
                            <button type="button" onClick={() => wear(skin)} title={skin.hash === state.current ? `${skin.name} (giyili)` : `${skin.name}: giy`}>
                                <span className="pg-skin-face" style={{ backgroundImage: `url(${api.skinUrl(skin.hash)})` }} aria-hidden="true" />
                                <small>{skin.name}</small>
                            </button>
                            <button type="button" className="pg-wardrobe-x" onClick={() => remove(skin)} aria-label={`${skin.name} dolaptan çıkar`}>×</button>
                        </span>
                    ))}
                </div>}
        </div>
    );
}
