import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { Avatar, formatDate, formatHours } from '../../components.jsx';
import { SkinPreview, shrinkImage } from '../../images.jsx';

/** Profil düzenleme: banner, avatar, açıklama ve skin. */
export default function Profile() {
    const { user } = useAuth();
    return (
        <div className="profile-edit">
            <p className="muted small">
                Başkalarının gördüğü hâli: <Link to={`/u/${user.username}`}>/u/{user.username}</Link>
            </p>
            <Images />
            <div className="account-grid">
                <Bio />
                <Skin />
                <div className="card">
                    <h2>Oynama süresi</h2>
                    {user.playtime ? (
                        <>
                            <p className="big mono">{formatHours(user.playtime.totalSeconds)}</p>
                            <ul className="top-list">
                                {user.playtime.top.slice(0, 5).map(t => (
                                    <li key={t.name}><span>{t.name}</span><span className="mono muted">{formatHours(t.seconds)}</span></li>
                                ))}
                            </ul>
                        </>
                    ) : <p className="muted">Henüz kayıtlı oynama süresi yok ya da gizlenmiş.</p>}
                    <p className="muted small">Oynama süresi launcher'dan gönderilir.</p>
                </div>
                <div className="card">
                    <h2>Hesap</h2>
                    {user.createdAt && <p className="small">Üyelik: {formatDate(user.createdAt)}</p>}
                    <p className="muted small">
                        Şifre şimdilik launcher'dan değiştirilir. Şifre değişince şifreli mesajların anahtarı da yeni
                        şifreyle yeniden kilitlenmeli; site bunu HTTPS'e geçince yapabilecek.
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Bir dosya seçtirip yükleyen düğme; hata ve meşguliyet durumunu kendisi tutar. */
function useUpload(upload) {
    const input = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const pick = () => input.current?.click();
    async function onChange(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy(true);
        setError(null);
        try { await upload(file); } catch (err) { setError(err.message); } finally { setBusy(false); }
    }
    return { input, busy, error, setError, pick, onChange, setBusy };
}

function Images() {
    const { user, updateProfile } = useAuth();
    const avatar = useUpload(async file => updateProfile(await api.setAvatar(await shrinkImage(file, { maxW: 256, maxH: 256, crop: true, maxBytes: 1024 * 1024 }))));
    const banner = useUpload(async file => updateProfile(await api.setBanner(await shrinkImage(file, { maxW: 1500, maxH: 500, crop: true, maxBytes: 1.5 * 1024 * 1024 }))));

    async function remove(which) {
        const u = which === 'avatar' ? avatar : banner;
        u.setBusy(true);
        try { updateProfile(await (which === 'avatar' ? api.removeAvatar() : api.removeBanner())); }
        catch (err) { u.setError(err.message); }
        finally { u.setBusy(false); }
    }

    return (
        <div className="card profile-images">
            <div className="banner-edit">
                {user.bannerVersion > 0
                    ? <img className="banner" src={api.bannerUrl(user.username, user.bannerVersion)} alt="" />
                    : <div className="banner banner-empty" />}
                <div className="banner-actions">
                    <button className="btn btn-sm" disabled={banner.busy} onClick={banner.pick}>{banner.busy ? 'Yükleniyor…' : 'Banner değiştir'}</button>
                    {user.bannerVersion > 0 && <button className="btn btn-sm" disabled={banner.busy} onClick={() => remove('banner')}>Kaldır</button>}
                </div>
            </div>
            <div className="avatar-edit">
                <Avatar username={user.username} version={user.avatarVersion} size={88} />
                <div className="stack">
                    <b className="profile-name">{user.username}</b>
                    <div className="row">
                        <button className="btn btn-sm" disabled={avatar.busy} onClick={avatar.pick}>{avatar.busy ? 'Yükleniyor…' : 'Avatar değiştir'}</button>
                        {user.avatarVersion > 0 && <button className="btn btn-ghost btn-sm" disabled={avatar.busy} onClick={() => remove('avatar')}>Kaldır</button>}
                    </div>
                    <small className="muted">PNG, JPG, WEBP ya da GIF. Büyük resimler otomatik küçültülür.</small>
                </div>
            </div>
            <input ref={avatar.input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={avatar.onChange} />
            <input ref={banner.input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={banner.onChange} />
            {(avatar.error || banner.error) && <p className="status error">{avatar.error || banner.error}</p>}
        </div>
    );
}

function Bio() {
    const { user, updateProfile } = useAuth();
    const [bio, setBio] = useState(user.bio || '');
    const [state, setState] = useState(null);   // null | 'saving' | 'saved' | hata metni

    async function save(e) {
        e.preventDefault();
        setState('saving');
        try {
            updateProfile(await api.setBio(bio.trim()));
            setState('saved');
        } catch (err) {
            setState(err.message);
        }
    }

    return (
        <form className="card stack" onSubmit={save}>
            <h2>Hakkında</h2>
            <textarea value={bio} onChange={e => { setBio(e.target.value); setState(null); }} maxLength={300} rows={4}
                placeholder="Profilinde görünecek kısa bir açıklama." />
            <div className="row">
                <small className="muted grow">{bio.length}/300</small>
                {state === 'saved' && <small className="muted">Kaydedildi.</small>}
                <button className="btn btn-primary btn-sm" disabled={state === 'saving' || bio.trim() === (user.bio || '')}>Kaydet</button>
            </div>
            {state && !['saving', 'saved'].includes(state) && <p className="status error">{state}</p>}
        </form>
    );
}

function Skin() {
    const { user, updateProfile } = useAuth();
    const [model, setModel] = useState(user.skinModel || 'default');
    const skin = useUpload(async file => {
        if (file.type !== 'image/png') throw new Error('Skin PNG olmalı.');
        updateProfile(await api.setSkin(file, model));
    });

    async function changeModel(next) {
        setModel(next);
        if (!user.skinHash) return;
        try { updateProfile(await api.setSkinModel(next)); } catch (err) { skin.setError(err.message); }
    }

    async function reset() {
        if (!confirm('Varsayılan skine dönülsün mü?')) return;
        try { updateProfile(await api.removeSkin()); } catch (err) { skin.setError(err.message); }
    }

    return (
        <div className="card">
            <h2>Skin</h2>
            <div className="skin-edit">
                {user.skinHash
                    ? <SkinPreview hash={user.skinHash} model={user.skinModel} scale={6} />
                    : <div className="skin-empty muted small">Varsayılan skin</div>}
                <div className="stack">
                    <div className="segmented">
                        <button type="button" className={model === 'default' ? 'on' : ''} onClick={() => changeModel('default')}>Klasik</button>
                        <button type="button" className={model === 'slim' ? 'on' : ''} onClick={() => changeModel('slim')}>İnce</button>
                    </div>
                    <button className="btn btn-sm" disabled={skin.busy} onClick={skin.pick}>{skin.busy ? 'Yükleniyor…' : 'Skin yükle'}</button>
                    {user.skinHash && <button className="btn btn-ghost btn-sm" onClick={reset}>Varsayılana dön</button>}
                    <small className="muted">64×64 PNG. Oyunda ve sunucularda görünür.</small>
                </div>
            </div>
            <input ref={skin.input} type="file" accept="image/png" hidden onChange={skin.onChange} />
            {skin.error && <p className="status error">{skin.error}</p>}
        </div>
    );
}
