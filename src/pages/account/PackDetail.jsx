import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { loaderName, timeAgo, useLoad } from '../../components.jsx';
import { FeedbackSection } from './Feedback.jsx';
import { PackHistory } from './Packs.jsx';

const TYPE_NAMES = { mod: 'Modlar', resourcepack: 'Kaynak paketleri', shader: 'Shader\'lar', datapack: 'Veri paketleri' };
const mb = bytes => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** Bir paketin tam içeriği: modlar türüne göre, dahil edilen klasörler, değişiklik geçmişi ve geri bildirimler. */
export default function PackDetail() {
    const { id } = useParams();
    const { data: pack, error, loading } = useLoad(() => api.packs().then(list => {
        const found = list.find(p => p.id === id);
        if (!found) throw new Error('Paket bulunamadı.');
        return found;
    }), [id]);
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState('content');

    const groups = useMemo(() => {
        if (!pack) return [];
        const q = query.trim().toLocaleLowerCase('tr');
        const byType = {};
        for (const m of pack.mods) {
            if (q && !(m.title || m.file || '').toLocaleLowerCase('tr').includes(q)) continue;
            (byType[m.type || 'mod'] ||= []).push(m);
        }
        return Object.entries(byType).map(([type, items]) => [type, items.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'tr'))]);
    }, [pack, query]);

    if (loading) return <p className="muted">Yükleniyor…</p>;
    if (error) return <p className="status error">{error}</p>;

    const total = pack.mods.reduce((n, m) => n + (m.size || 0), 0) + (pack.overridesSize || 0);

    return (
        <div className="pack-detail">
            <Link className="back" to="/hesap/paketler">← Tüm paketler</Link>
            <div className="pack-top">
                {pack.hasCover
                    ? <img className="pack-cover" src={api.packCoverUrl(pack)} alt="" />
                    : <span className="pack-cover pack-cover-empty">{pack.name[0]}</span>}
                <div className="pack-info">
                    <h1>{pack.name}</h1>
                    <p className="pack-meta">
                        Minecraft {pack.mcVersion} · {loaderName(pack.loader)}{pack.loaderVersion && ` ${pack.loaderVersion}`} · önerilen {pack.recommendedRamGb} GB RAM
                    </p>
                    {pack.description && <p className="pack-desc">{pack.description}</p>}
                    <p className="pack-meta">
                        <span className="mono">r{pack.revision}</span> · {timeAgo(pack.updatedAt)} güncellendi ·
                        paylaşan <Link to={`/u/${pack.author}`}>{pack.author}</Link> · indirme boyutu yaklaşık {mb(total)}
                    </p>
                    <p className="muted small">Paketi kurmak için launcher'da vulu Packs bölümünü aç.</p>
                </div>
            </div>

            <nav className="tabs">
                <button className={'tab' + (tab === 'content' ? ' active' : '')} onClick={() => setTab('content')}>İçerik ({pack.mods.length})</button>
                <button className={'tab' + (tab === 'history' ? ' active' : '')} onClick={() => setTab('history')}>Değişiklikler ({pack.changelog.length})</button>
                <button className={'tab' + (tab === 'feedback' ? ' active' : '')} onClick={() => setTab('feedback')}>Geri bildirim</button>
            </nav>

            {tab === 'content' && (
                <div className="stack-lg">
                    <input className="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Pakette ara" />
                    {groups.length === 0 && <p className="muted small">Eşleşen bir şey yok.</p>}
                    {groups.map(([type, items]) => (
                        <div key={type}>
                            <h3 className="group-title">{TYPE_NAMES[type] || type} <span className="muted">({items.length})</span></h3>
                            <ul className="mod-list">
                                {items.map(m => (
                                    <li key={m.projectId || m.file}>
                                        {m.iconUrl ? <img src={m.iconUrl} alt="" loading="lazy" /> : <span className="mod-icon-empty" />}
                                        <span className="grow">{m.title || m.file}</span>
                                        <small className="mono muted">{m.versionNumber}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {pack.includes.length > 0 && (
                        <p className="muted small">Pakete ayrıca şu klasörler dahil: {pack.includes.join(', ')}</p>
                    )}
                </div>
            )}
            {tab === 'history' && (pack.changelog.length
                ? <PackHistory changelog={pack.changelog} open />
                : <p className="muted small">Bu paket için henüz değişiklik kaydı yok.</p>)}
            {tab === 'feedback' && <FeedbackSection pack={pack.id} />}
        </div>
    );
}
