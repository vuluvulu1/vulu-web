// Liderlik tablosu: vulu sunucusunun istatistiklerinden (API: /progress/leaderboard). Herkese açık.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Empty, timeAgo, useLoad } from '../components.jsx';
import { TemaArkaPlan, temaDegiskenleri } from '../tema.jsx';

const PERIODS = [['week', 'Bu hafta'], ['season', 'Sezon'], ['all', 'Tüm zamanlar']];

// Kategori adına göre çizgi simge (API emoji gönderir; emojiler her sistemde farklı göründüğü için kullanılmaz)
const SIMGELER = [
    [/oyna|süre/i, <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></>],
    [/elmas/i, <><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M9 3l3 18 3-18" /></>],
    [/ölüm|öl/i, <><path d="M12 3a7 7 0 0 0-7 7v4l2 2v3h10v-3l2-2v-4a7 7 0 0 0-7-7z" /><circle cx="9" cy="11" r="1.5" /><circle cx="15" cy="11" r="1.5" /></>],
    [/gez|yol|mesafe/i, <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>],
];
function Simge({ name }) {
    const hit = SIMGELER.find(([re]) => re.test(name));
    if (!hit) return null;
    return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">{hit[1]}</svg>;
}

export default function Leaderboard() {
    const [period, setPeriod] = useState('week');
    const { status } = useAuth();
    const { data, error, loading } = useLoad(() => api.leaderboard(period), [period]);
    const date = (iso, opts) => new Date(iso).toLocaleString('tr-TR', opts);
    const Name = ({ r }) => (status === 'in' ? <Link to={`/u/${r.username}`}>{r.username}</Link> : <span>{r.username}</span>);

    return (
        <section className="tema-kahraman lb" style={temaDegiskenleri()}>
            <TemaArkaPlan karartma={false} />
            <div className="tema-ust" aria-hidden="true" />
            <div className="lb-ic">
                <header className="lb-head">
                    <div>
                        <p className="t-etiket">vulu sunucusu</p>
                        <h1 className="t-baslik">Liderlik</h1>
                        {data && (
                            <p className="t-meta">
                                {period === 'week' && `${date(data.weekEnd, { day: 'numeric', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit' })} sıfırlanır · birinciler Haftanın Şampiyonu pelerinini alır`}
                                {period === 'season' && (data.season ? `${data.season.name} · ${date(data.season.endsAt, { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde biter` : 'Şu an süren bir sezon yok')}
                                {period === 'all' && 'vulu sunucusunda bugüne kadar'}
                                {data.updatedAt && ` · son güncelleme ${timeAgo(data.updatedAt)}`}
                            </p>
                        )}
                    </div>
                    <div className="lb-donem" role="tablist" aria-label="Dönem">
                        {PERIODS.map(([key, label]) => (
                            <button key={key} type="button" role="tab" aria-selected={period === key} className={period === key ? 'on' : ''} onClick={() => setPeriod(key)}>{label}</button>
                        ))}
                    </div>
                </header>

                {error && <Empty icon="users" title="Tablo alınamadı">{error}</Empty>}
                {loading && !data && <div className="lb-grid">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 280 }} />)}</div>}
                {data && period === 'week' && data.lastWeek?.winners.some(w => w.winner) && (
                    <p className="lb-gecen">
                        <b>Geçen haftanın şampiyonları:</b>{' '}
                        {data.lastWeek.winners.filter(w => w.winner).map(w => `${w.name} ${w.winner.username}`).join(' · ')}
                    </p>
                )}
                {data && (
                    <div className="lb-grid">
                        {data.categories.map(c => {
                            const [first, ...rest] = c.rows;
                            return (
                                <article key={c.key} className="t-kart lb-kart">
                                    <h2><Simge name={c.name} />{c.name}</h2>
                                    {!first ? <p className="t-not">Henüz kimse yok.</p> : <>
                                        <div className="lb-birinci">
                                            <Avatar username={first.username} version={first.avatarVersion} size={52} />
                                            <span className="lb-birinci-ad"><small>birinci</small><b><Name r={first} /></b></span>
                                            <span className="lb-deger">{first.display}</span>
                                        </div>
                                        <ol className="lb-rows">
                                            {rest.map(r => (
                                                <li key={r.username}>
                                                    <span className="lb-rank">{r.rank}</span>
                                                    <Avatar username={r.username} version={r.avatarVersion} size={28} />
                                                    <span className="grow"><Name r={r} /></span>
                                                    <span className="mono">{r.display}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </>}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
