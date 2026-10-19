import { useState } from 'react';
import { api } from '../../api.js';
import { formatDate, loaderName, timeAgo, useLoad } from '../../components.jsx';

/** Bir revizyonda kaç modun eklendiği, güncellendiği ve kaldırıldığı. */
export function ChangeCounts({ change }) {
    const parts = [
        ['add', change.added.length, 'eklendi'],
        ['up', change.updated.length, 'güncellendi'],
        ['del', change.removed.length, 'kaldırıldı'],
    ].filter(([, n]) => n > 0);
    if (!parts.length && !change.filesChanged) return <span className="muted">Mod listesi değişmedi.</span>;
    return (
        <span className="change-counts">
            {parts.map(([kind, n, text]) => <span key={kind}><i className={'sign ' + kind} />{n} mod {text}</span>)}
            {change.filesChanged && <span><i className="sign up" />ayar dosyaları değişti</span>}
        </span>
    );
}

/** vulu Packs: her paketin bilgileri ve değişiklik geçmişi. */
export default function Packs() {
    const { data: packs, error, loading } = useLoad(() => api.packs());

    if (loading) return <p className="muted">Paketler yükleniyor…</p>;
    if (error) return <p className="status error">{error}</p>;
    if (!packs.length) return <p className="muted">Henüz paylaşılmış bir paket yok.</p>;

    return (
        <div className="pack-list">
            {packs.map(pack => <PackCard key={pack.id} pack={pack} />)}
        </div>
    );
}

function PackCard({ pack }) {
    const [coverFailed, setCoverFailed] = useState(false);
    const history = [...pack.changelog].sort((a, b) => b.revision - a.revision);
    const latest = history[0];

    return (
        <article className="pack card">
            <div className="pack-top">
                {pack.hasCover && !coverFailed
                    ? <img className="pack-cover" src={api.packCoverUrl(pack)} alt="" onError={() => setCoverFailed(true)} />
                    : <span className="pack-cover pack-cover-empty">{pack.name[0]}</span>}
                <div className="pack-info">
                    <h3>{pack.name}</h3>
                    <p className="pack-meta">
                        Minecraft {pack.mcVersion} · {loaderName(pack.loader)} · {pack.mods.length} mod · önerilen {pack.recommendedRamGb} GB RAM
                    </p>
                    {pack.description && <p className="pack-desc">{pack.description}</p>}
                    <p className="pack-meta">
                        <span className="mono">r{pack.revision}</span> · {timeAgo(pack.updatedAt)} güncellendi · paylaşan {pack.author}
                    </p>
                </div>
            </div>

            {latest && (
                <div className="pack-latest">
                    <b>Son güncelleme</b>
                    <ChangeCounts change={latest} />
                    {latest.note && <p className="pack-note">{latest.note}</p>}
                </div>
            )}

            {history.length > 0 && (
                <details className="pack-history">
                    <summary>Değişiklik geçmişi ({history.length})</summary>
                    <ol>
                        {history.map(change => (
                            <li key={change.revision}>
                                <div className="change-head">
                                    <b className="mono">r{change.revision}</b>
                                    <span className="muted">{formatDate(change.at)}{change.by && ` · ${change.by}`}</span>
                                </div>
                                {change.note && <p className="pack-note">{change.note}</p>}
                                <ChangeList title="Eklenen" kind="add" items={change.added} />
                                <ChangeList title="Güncellenen" kind="up" items={change.updated.map(u => `${u.title} (${u.from} → ${u.to})`)} />
                                <ChangeList title="Kaldırılan" kind="del" items={change.removed} />
                                {change.filesChanged && <p className="muted small">Ayar dosyaları da değişti.</p>}
                            </li>
                        ))}
                    </ol>
                </details>
            )}
        </article>
    );
}

function ChangeList({ title, kind, items }) {
    if (!items.length) return null;
    return (
        <div className="change-list">
            <span className="change-title"><i className={'sign ' + kind} />{title}</span>
            <span>{items.join(', ')}</span>
        </div>
    );
}
