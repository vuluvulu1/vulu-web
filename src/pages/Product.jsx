import { useEffect, useState } from 'react';
import { asset, githubRelease } from '../api.js';
import { ReleaseNotes, formatDate } from '../components.jsx';
import Icon from '../icons.jsx';
import { PRODUCTS } from '../products.js';
import { TemaGorsel, TemaKahraman } from '../tema.jsx';
import { AracKarti } from './Hub.jsx';

const formatMb = bytes => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** vulu Server Panel ve FTB Quests Editor sayfaları: indirme, kurulum ve son sürüm. Arka plan temadan gelir. */
export default function Product({ product: p }) {
    const [release, setRelease] = useState(undefined);   // undefined: yükleniyor, null: alınamadı
    useEffect(() => { githubRelease(p.repo, p.asset).then(setRelease); }, [p]);

    const repoUrl = `https://github.com/vuluvulu1/${p.repo}`;
    const download = release?.download;
    const others = PRODUCTS.filter(x => x.slug !== p.slug);

    return (
        <>
            <TemaKahraman
                sol={<>
                    <img className="t-simge" src={asset(p.logo)} alt="" width="60" height="60" />
                    <p className="t-etiket">{p.slug === 'ftbquests-editor' ? 'FTB' : 'vulu'}</p>
                    <h1 className="t-baslik">{p.short}</h1>
                    <p className="t-giris">{p.lead}</p>
                    <div className="t-dugmeler">
                        <a className="btn-altin" href={download?.url || release?.pageUrl || repoUrl + '/releases/latest'}><Icon name="download" size={20} /> İndir</a>
                        <a className="btn-cizgi" href={repoUrl} target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                    <p className="t-meta">
                        {release
                            ? <><span>{release.tag}</span> · {formatDate(release.publishedAt)}{download && <> · {formatMb(download.size)}</>} · {p.platforms}</>
                            : p.platforms}
                    </p>
                </>}
                sag={<TemaGorsel src={asset(p.shot[0])} alt={p.shot[1]} width="2400" height="1500" />}
            />
            <div className="t-govde">
                <section className="t-blok">
                    <h2>Kurulum</h2>
                    <div>
                        <ol className="t-adimlar">{p.steps.map(step => <li key={step}>{step}</li>)}</ol>
                        <p className="t-not">{p.note}</p>
                    </div>
                </section>
                {release?.notes && (
                    <section className="t-blok">
                        <h2>Son sürüm</h2>
                        <div>
                            <p className="t-meta"><span>{release.tag}</span> · {formatDate(release.publishedAt)}</p>
                            <ReleaseNotes text={release.notes} />
                            <a href={release.pageUrl} target="_blank" rel="noreferrer">Tüm sürümler →</a>
                        </div>
                    </section>
                )}
                <section className="t-araclar t-araclar-govde" aria-label="Diğer uygulamalar">
                    {others.map(x => <AracKarti key={x.slug} product={x} />)}
                </section>
            </div>
        </>
    );
}
