// Liderlik tablosu: vulu sunucusunun istatistiklerinden (API: /progress/leaderboard). Herkese açık.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Empty, timeAgo, useLoad } from '../components.jsx';

const PERIODS = [['week', 'Bu hafta'], ['season', 'Sezon'], ['all', 'Tüm zamanlar']];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
    const [period, setPeriod] = useState('week');
    const { status } = useAuth();
    const { data, error, loading } = useLoad(() => api.leaderboard(period), [period]);
    const date = (iso, opts) => new Date(iso).toLocaleString('tr-TR', opts);

    return (
        <section className="wrap app lb">
            <header className="lb-head">
                <div>
                    <h1>Liderlik</h1>
                    <p className="muted">Her haftanın birincileri <b>Haftanın Şampiyonu</b> pelerinini alır.</p>
                </div>
                <div className="segmented" role="tablist">
                    {PERIODS.map(([key, label]) => (
                        <button key={key} type="button" role="tab" aria-selected={period === key} className={period === key ? 'on' : ''} onClick={() => setPeriod(key)}>{label}</button>
                    ))}
                </div>
            </header>

            {error && <Empty icon="users" title="Tablo alınamadı">{error}</Empty>}
            {loading && !data && <div className="lb-grid">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}</div>}
            {data && (
                <>
                    <p className="muted small">
                        {period === 'week' && `${date(data.weekEnd, { day: 'numeric', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit' })} sıfırlanır.`}
                        {period === 'season' && (data.season ? `${data.season.name} · ${date(data.season.endsAt, { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde biter.` : 'Şu an süren bir sezon yok.')}
                        {period === 'all' && 'vulu sunucusunda bugüne kadar.'}
                        {data.updatedAt && ` Son güncelleme ${timeAgo(data.updatedAt)}.`}
                    </p>
                    {period === 'week' && data.lastWeek?.winners.some(w => w.winner) && (
                        <div className="lb-champions">
                            <b>Geçen haftanın şampiyonları</b>
                            {data.lastWeek.winners.filter(w => w.winner).map(w => (
                                <span key={w.key} className="tag">{w.icon} {w.name}: <b>{w.winner.username}</b> · {w.winner.display}</span>
                            ))}
                        </div>
                    )}
                    <div className="lb-grid">
                        {data.categories.map(c => (
                            <article key={c.key} className="pf-section lb-card">
                                <h2><span aria-hidden="true">{c.icon}</span> {c.name}</h2>
                                {c.rows.length === 0
                                    ? <p className="muted small">Henüz kimse yok. İlk sen ol!</p>
                                    : <ol className="lb-rows">
                                        {c.rows.map(r => (
                                            <li key={r.username} className={r.rank <= 3 ? 'top' : ''}>
                                                <span className="lb-rank">{MEDALS[r.rank - 1] || r.rank}</span>
                                                <Avatar username={r.username} version={r.avatarVersion} size={28} />
                                                {status === 'in'
                                                    ? <Link className="grow" to={`/u/${r.username}`}>{r.username}</Link>
                                                    : <span className="grow">{r.username}</span>}
                                                <span className="mono">{r.display}</span>
                                            </li>
                                        ))}
                                    </ol>}
                            </article>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
