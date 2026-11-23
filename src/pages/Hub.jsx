import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asset, githubRelease } from '../api.js';
import { PRODUCTS } from '../products.js';
import { SabitHtml, temaDegiskenleri, useTema } from '../tema.jsx';

/** Ana sayfa: temanın sahnesi (odakta launcher), ardından diğer araçlar, haftanın birincileri ve çevrimiçi sayısı. */
export default function Hub() {
    const tema = useTema();
    return (
        <div className="tema-sayfa" style={temaDegiskenleri(tema)}>
            <SabitHtml html={tema.sahne} className="tema-sahne" />
            <Araclar />
            <HaftaninBirincileri />
        </div>
    );
}

const TOOLS = PRODUCTS.filter(p => p.repo);

function Araclar() {
    const [versions, setVersions] = useState({});
    useEffect(() => {
        for (const p of TOOLS) githubRelease(p.repo, p.asset).then(r => r && setVersions(v => ({ ...v, [p.slug]: r.tag })));
    }, []);
    return (
        <section className="t-araclar" aria-label="Diğer araçlar">
            {TOOLS.map(p => <AracKarti key={p.slug} product={p} version={versions[p.slug]} />)}
        </section>
    );
}

export function AracKarti({ product: p, version }) {
    return (
        <Link to={'/' + p.slug} className="t-kart t-arac">
            <img src={asset(p.shot[0])} alt="" width="160" height="100" loading="lazy" style={{ objectPosition: p.slug === 'server-panel' ? 'left top' : 'center top' }} />
            <span className="t-arac-ad">
                <b>{p.short || p.name}</b>
                <span className="mono">{version || p.platforms}</span>
            </span>
            <span className="t-ok" aria-hidden="true">→</span>
        </Link>
    );
}

const NUMBERS_REFRESH = 30 * 1000;

function HaftaninBirincileri() {
    const [board, setBoard] = useState(null);
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.leaderboard('week').then(setBoard).catch(() => {});
        let cancelled = false;
        const load = () => api.stats().then(s => { if (!cancelled) setStats(s); }).catch(() => {});
        load();
        const id = setInterval(load, NUMBERS_REFRESH);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    const leaders = (board?.categories || []).map(c => ({ key: c.key, name: c.name, row: c.rows[0] })).filter(x => x.row);

    return (
        <section className="t-birinciler" aria-label="Bu haftanın birincileri">
            {leaders.length > 0 && <>
                <p className="t-etiket">bu haftanın birincileri</p>
                <div className="t-birinciler-liste">
                    {leaders.map(l => (
                        <div key={l.key}>
                            <b>{l.row.username}</b>
                            <span>{l.name.toLocaleLowerCase('tr')} · {l.row.display}</span>
                        </div>
                    ))}
                </div>
            </>}
            <p className="t-durum">
                {stats && <><span className={'fire' + (stats.online ? '' : ' out')} />{stats.online ? `${stats.online} kişi çevrimiçi` : 'Şu an çevrimiçi kimse yok'} · </>}
                <Link to="/liderlik">Liderlik tablosu →</Link>
            </p>
        </section>
    );
}
