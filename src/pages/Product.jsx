import { useEffect, useState } from 'react';
import { asset, githubRelease } from '../api.js';
import { formatDate } from '../components.jsx';
import Icon from '../icons.jsx';

const formatMb = bytes => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** vulu Server Panel ve FTB Quests Editor sayfaları: tanım, indirme, özellikler ve kurulum. */
export default function Product({ product: p }) {
    const [release, setRelease] = useState(undefined);   // undefined: yükleniyor, null: alınamadı
    useEffect(() => { githubRelease(p.repo, p.asset).then(setRelease); }, [p]);

    const repoUrl = `https://github.com/vuluvulu1/${p.repo}`;
    const download = release?.download;

    return (
        <>
            <section className="wrap product-hero">
                <img className="product-logo" src={asset(p.logo)} alt="" width="88" height="88" />
                <h1>{p.name}</h1>
                <p className="lead">{p.lead}</p>
                <div className="hero-actions">
                    <a className="btn btn-primary btn-lg" href={download?.url || release?.pageUrl || repoUrl + '/releases/latest'}>
                        <Icon name="download" size={18} /> İndir
                    </a>
                    <a className="btn btn-lg" href={repoUrl} target="_blank" rel="noreferrer">GitHub</a>
                </div>
                <p className="hero-meta">
                    {release
                        ? <><span className="mono">{release.tag}</span> · {formatDate(release.publishedAt)}{download && <> · {formatMb(download.size)}</>} · {p.platforms}</>
                        : p.platforms}
                </p>
            </section>

            <section className="wrap section">
                <h2 className="section-title">Özellikler</h2>
                <dl className="extras">
                    {p.features.map(([title, text]) => (
                        <div key={title}>
                            <dt>{title}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="wrap section start">
                <h2 className="section-title">Kurulum</h2>
                <ol className="steps">
                    {p.steps.map(step => <li key={step}><span>{step}</span></li>)}
                </ol>
                <p className="note">{p.note}</p>
                {release?.pageUrl && (
                    <a className="btn" href={release.pageUrl} target="_blank" rel="noreferrer">Sürüm notları</a>
                )}
            </section>
        </>
    );
}
