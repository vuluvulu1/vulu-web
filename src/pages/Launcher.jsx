import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ANDROID_URL, DOWNLOAD_URL, GITHUB_DOWNLOAD_URL, androidRelease, api, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';
import { HeroTitle } from '../Wordmark.jsx';
import { ReleaseNotes, formatDate } from '../components.jsx';

// Girilen cihaz Android telefonsa APK öne çıkar; diğerlerinde Windows kurulumu
const ON_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/** Launcher sayfası: indirme, kurulum notu ve son sürüm notları. */
export default function Launcher() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    const [android, setAndroid] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); androidRelease().then(setAndroid); }, []);
    const androidFirst = ON_ANDROID && !!android;

    return (
        <>
            <section className="hero">
                <div className="wrap hero-grid">
                <div className="hero-text">
                    <HeroTitle />
                    <div className="hero-actions">
                        {androidFirst && (
                            <a className="btn btn-primary btn-lg" href={ANDROID_URL}>
                                <Icon name="android" size={18} /> Android için indir
                            </a>
                        )}
                        <a className={'btn btn-lg' + (androidFirst ? '' : ' btn-primary')} href={DOWNLOAD_URL}>
                            <Icon name="windows" size={18} /> Windows için indir
                        </a>
                        {android && !androidFirst && (
                            <a className="btn btn-lg" href="#android">
                                <Icon name="android" size={18} /> Android
                            </a>
                        )}
                    </div>
                    <p className="hero-meta">
                        {androidFirst
                            ? <><span className="mono">{android.tag}</span> · Android 8 ve üstü · Deneme sürümü</>
                            : <>{release ? <span className="mono">{release.tag}</span> : 'Beta'} · Windows 10 ve 11</>}
                    </p>
                    <p className="note">
                        Windows SmartScreen uyarısı gösterirse <i>Ek bilgi</i> → <i>Yine de çalıştır</i>.
                        İndirme takılırsa <a href={GITHUB_DOWNLOAD_URL}>GitHub'dan indir</a>.
                        {status !== 'in' && <> Hesabın yoksa <Link to="/kayit">katılma isteği gönder</Link>.</>}
                    </p>
                    <LiveStats />
                </div>
                <div className="hero-shot">
                    <img src={asset('img/home.png')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />
                </div>
                </div>
            </section>

            {release?.notes && (
                <section className="wrap section">
                    <h2 className="section-title">Son sürüm</h2>
                    <p className="muted small"><span className="mono">{release.tag}</span> · {formatDate(release.publishedAt)}</p>
                    <ReleaseNotes text={release.notes} />
                </section>
            )}

            {android && (
                <section className="wrap section start" id="android">
                    <h2 className="section-title">Android</h2>
                    <p className="muted small">
                        <span className="mono">{android.tag}</span> · {formatDate(android.publishedAt)}
                        {android.sizeMb ? <> · {android.sizeMb} MB</> : null} · Android 8 ve üstü
                    </p>
                    <p className="beta-warning">
                        <b>Deneme sürümü.</b> İlk açılışta oyun dosyaları iner (1.20.1 için ~700 MB). Forge ve NeoForge
                        paketleri henüz çalışmıyor. APK'yı kurarken telefon bilinmeyen kaynak izni isteyebilir.
                    </p>
                    {android.notes && <ReleaseNotes text={android.notes} />}
                    <a className="btn btn-primary btn-lg" href={ANDROID_URL}>
                        <Icon name="android" size={18} /> APK'yı indir
                    </a>
                </section>
            )}
        </>
    );
}

const STATS_REFRESH = 30 * 1000;

/** "Şu an 3 oyuncu aktif." satırı (launcher'ı açık olanlar, oyunda olanlar dahil); 30 sn'de bir yenilenir. */
function LiveStats() {
    const [online, setOnline] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const load = () => api.stats().then(s => { if (!cancelled) setOnline(s.online); }).catch(() => {});
        load();
        const id = setInterval(load, STATS_REFRESH);
        return () => { cancelled = true; clearInterval(id); };
    }, []);
    if (online === null) return <p className="live-now placeholder" aria-hidden="true" />;

    return (
        <p className="live-now">
            <span className={'live-dot' + (online > 0 ? ' on' : '')} />
            <span>{online > 0 ? <>Şu an <b>{online}</b> oyuncu launcher'da.</> : 'Şu an launcher\'da kimse yok.'}</span>
        </p>
    );
}
