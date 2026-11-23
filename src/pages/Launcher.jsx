import { useEffect, useState } from 'react';
import { DOWNLOAD_URL, GITHUB_DOWNLOAD_URL, asset, latestRelease } from '../api.js';
import { ReleaseNotes, formatDate } from '../components.jsx';
import Icon from '../icons.jsx';
import { PRODUCTS } from '../products.js';
import { TemaGorsel, TemaKahraman } from '../tema.jsx';
import { AracKarti } from './Hub.jsx';

/** Launcher sayfası: indirme, son sürüm notları ve diğer araçlar. Arka plan o an açık olan temadan gelir. */
export default function Launcher() {
    const [release, setRelease] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); }, []);

    return (
        <>
            <TemaKahraman
                sol={<>
                    <h1 className="t-logo"><img src={asset('img/wordmark-full.svg')} alt="vulu Launcher" width="4401" height="1182" /></h1>
                    <p className="t-giris">Minecraft'ı modlu ya da modsuz oynamak için.</p>
                    <a className="btn-altin" href={DOWNLOAD_URL}><Icon name="windows" size={20} /> Windows için indir</a>
                    <p className="t-meta">{release ? <span>{release.tag}</span> : 'Beta'} · Windows 10 ve 11</p>
                    <p className="t-not">SmartScreen uyarırsa Ek bilgi → Yine de çalıştır · İndirme takılırsa <a href={GITHUB_DOWNLOAD_URL}>GitHub</a></p>
                </>}
                sag={<TemaGorsel src={asset('img/launcher-shot.webp')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />}
            />
            <div className="t-govde">
                {release?.notes && (
                    <section className="t-blok">
                        <h2>Son sürüm</h2>
                        <div>
                            <p className="t-meta"><span>{release.tag}</span> · {formatDate(release.publishedAt)}</p>
                            <ReleaseNotes text={release.notes} />
                        </div>
                    </section>
                )}
                <section className="t-araclar t-araclar-govde" aria-label="Diğer araçlar">
                    {PRODUCTS.filter(p => p.repo).map(p => <AracKarti key={p.slug} product={p} />)}
                </section>
            </div>
        </>
    );
}
