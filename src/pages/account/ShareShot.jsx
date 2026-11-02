import { useRef, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { Avatar, useLoad } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { sparkBurst } from '../../effects.jsx';

// Launcher'ın Sosyal sekmesiyle aynı sınırlar (vulu-launcher/Launcher/wwwroot/js/social.js)
const SHOT_MAX_SIDE = 1920, THUMB_MAX_SIDE = 480;
const SHOT_MAX_BYTES = 1100 * 1024, THUMB_MAX_BYTES = 150 * 1024;

/** Uzun kenarı en fazla maxSide olacak şekilde küçültüp WebP'ye (olmazsa JPEG'e) çevirir; sınıra sığana dek kaliteyi düşürür. */
function encode(bitmap, maxSide, maxBytes) {
    let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 8; attempt++) {
        const w = Math.max(1, Math.round(bitmap.width * scale)), h = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const g = canvas.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(bitmap, 0, 0, w, h);
        for (const quality of [0.85, 0.75, 0.65]) {
            let url = canvas.toDataURL('image/webp', quality);
            if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', quality);
            const data = url.slice(url.indexOf(',') + 1);
            if (data.length * 3 / 4 <= maxBytes) return { data, width: w, height: h };
        }
        scale *= 0.8;
    }
    throw new Error('Görüntü yeterince küçültülemedi; daha küçük bir resim dene.');
}

/** Akışın üstündeki paylaşma kutusu: bir resim seç, açıklama ve paket ekle, paylaş. */
export default function ShareShot({ onShared }) {
    const { user } = useAuth();
    const input = useRef(null);
    const [file, setFile] = useState(null);       // { url, bitmap }
    const [caption, setCaption] = useState('');
    const [pack, setPack] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const { data: packs } = useLoad(() => (file ? api.packs() : Promise.resolve(null)), [!!file]);

    async function pick(e) {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        setError(null);
        if (!/^image\/(png|jpeg|webp|gif|bmp)$/.test(f.type)) { setError('PNG, JPEG ya da WebP bir resim seç.'); return; }
        try {
            const bitmap = await createImageBitmap(f);
            if (file) URL.revokeObjectURL(file.url);
            setFile({ url: URL.createObjectURL(f), bitmap });
        } catch {
            setError('Resim açılamadı.');
        }
    }

    function reset() {
        if (file) URL.revokeObjectURL(file.url);
        setFile(null);
        setCaption('');
        setPack('');
        setError(null);
    }

    async function share(e) {
        e.preventDefault();
        const button = e.currentTarget.querySelector('.btn-primary');
        setBusy(true);
        setError(null);
        try {
            const full = encode(file.bitmap, SHOT_MAX_SIDE, SHOT_MAX_BYTES);
            const thumb = encode(file.bitmap, THUMB_MAX_SIDE, THUMB_MAX_BYTES);
            const chosen = packs?.find(p => p.id === pack);
            const shot = await api.postShot({
                image: full.data, thumb: thumb.data, width: full.width, height: full.height,
                caption: caption.trim(),
                packId: chosen?.id, packName: chosen?.name, mcVersion: chosen?.mcVersion,
            });
            sparkBurst(button, 24);
            onShared(shot);
            reset();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className={'share' + (file ? ' open' : '')} aria-label="Ekran görüntüsü paylaş">
            {!file ? (
                <button type="button" className="share-start" onClick={() => input.current?.click()}>
                    <Avatar username={user.username} version={user.avatarVersion} size={36} />
                    <span className="grow">Bir ekran görüntüsü paylaş…</span>
                    <span className="btn btn-sm"><Icon name="upload" size={16} /> Resim seç</span>
                </button>
            ) : (
                <form className="share-form" onSubmit={share}>
                    <img className="share-preview" src={file.url} alt="Seçilen resmin önizlemesi" />
                    <div className="share-fields">
                        <label className="field-label">
                            Açıklama
                            <textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} rows={3} autoFocus
                                placeholder="Nerede, ne oldu? (isteğe bağlı)" />
                        </label>
                        <label className="field-label">
                            Hangi paketten
                            <select value={pack} onChange={e => setPack(e.target.value)}>
                                <option value="">Belirtme</option>
                                {packs?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </label>
                        <div className="row">
                            <small className="muted grow">{caption.length}/200 · Herkes görür, beğenip yorum yazabilir.</small>
                            <button type="button" className="btn btn-quiet btn-sm" onClick={reset} disabled={busy}>Vazgeç</button>
                            <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Paylaşılıyor…' : 'Paylaş'}</button>
                        </div>
                    </div>
                </form>
            )}
            <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" hidden onChange={pick} />
            {error && <p className="status error">{error}</p>}
        </section>
    );
}
