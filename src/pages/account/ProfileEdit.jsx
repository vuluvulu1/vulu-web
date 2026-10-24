import { useRef, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { Avatar } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { SkinPreview, shrinkImage } from '../../images.jsx';

// Kendi profiline bakarken yerinde düzenleme: banner, avatar, hakkında ve skin.

const IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif';

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
    async function run(action) {
        setBusy(true);
        setError(null);
        try { await action(); } catch (err) { setError(err.message); } finally { setBusy(false); }
    }
    return { input, busy, error, setError, pick, onChange, run };
}

/** Banner'ın sağ üstündeki düğmeler. */
export function BannerControls() {
    const { user, updateProfile } = useAuth();
    const banner = useUpload(async file => updateProfile(await api.setBanner(await shrinkImage(file, { maxW: 1500, maxH: 500, crop: true, maxBytes: 1.5 * 1024 * 1024 }))));
    return (
        <div className="pf-banner-actions">
            <button className="btn btn-sm" disabled={banner.busy} onClick={banner.pick}>
                <Icon name="image" size={16} /> {banner.busy ? 'Yükleniyor…' : user.bannerVersion > 0 ? 'Banner değiştir' : 'Banner ekle'}
            </button>
            {user.bannerVersion > 0 && (
                <button className="btn btn-sm" disabled={banner.busy} onClick={() => banner.run(async () => updateProfile(await api.removeBanner()))}>Kaldır</button>
            )}
            <input ref={banner.input} type="file" accept={IMAGE_TYPES} hidden onChange={banner.onChange} />
            {banner.error && <p className="status error pf-float-error">{banner.error}</p>}
        </div>
    );
}

/** Tıklanınca yeni resim seçtiren avatar; altında kaldırma bağlantısı. */
export function AvatarControl({ size }) {
    const { user, updateProfile } = useAuth();
    const avatar = useUpload(async file => updateProfile(await api.setAvatar(await shrinkImage(file, { maxW: 256, maxH: 256, crop: true, maxBytes: 1024 * 1024 }))));
    return (
        <div className="pf-avatar-edit">
            <button className="pf-avatar-btn" disabled={avatar.busy} onClick={avatar.pick} title="Profil resmini değiştir">
                <Avatar username={user.username} version={user.avatarVersion} size={size} />
                <span className="pf-avatar-over"><Icon name="camera" size={22} />{avatar.busy ? 'Yükleniyor…' : 'Değiştir'}</span>
            </button>
            {user.avatarVersion > 0 && (
                <button className="link-btn" disabled={avatar.busy} onClick={() => avatar.run(async () => updateProfile(await api.removeAvatar()))}>Resmi kaldır</button>
            )}
            <input ref={avatar.input} type="file" accept={IMAGE_TYPES} hidden onChange={avatar.onChange} />
            {avatar.error && <p className="status error">{avatar.error}</p>}
        </div>
    );
}

/** Hakkında yazısı: önce düz metin, "Düzenle" ile metin kutusu. */
export function BioEditor() {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || '');
    const [state, setState] = useState(null);   // null | 'saving' | hata metni

    async function save(e) {
        e.preventDefault();
        setState('saving');
        try {
            updateProfile(await api.setBio(bio.trim()));
            setState(null);
            setEditing(false);
        } catch (err) {
            setState(err.message);
        }
    }

    if (!editing) {
        return (
            <>
                <p className={'pf-bio' + (user.bio ? '' : ' empty')}>{user.bio || 'Kendinden kısaca bahset; profilinde herkes görür.'}</p>
                <button className="btn btn-sm pf-section-action" onClick={() => { setBio(user.bio || ''); setEditing(true); }}>Düzenle</button>
            </>
        );
    }

    return (
        <form className="stack" onSubmit={save}>
            <textarea value={bio} onChange={e => { setBio(e.target.value); setState(null); }} maxLength={300} rows={4} autoFocus
                placeholder="Profilinde görünecek kısa bir açıklama." />
            <div className="row">
                <small className="muted grow">{bio.length}/300</small>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Vazgeç</button>
                <button className="btn btn-primary btn-sm" disabled={state === 'saving' || bio.trim() === (user.bio || '')}>Kaydet</button>
            </div>
            {state && state !== 'saving' && <p className="status error">{state}</p>}
        </form>
    );
}

/** Skin önizlemesi ve (kendi profilindeyse) yükleme, model ve sıfırlama. */
export function SkinStage({ profile, own }) {
    return (
        <>
            <div className="pf-skin-stage">
                {profile.skinHash
                    ? <SkinPreview hash={profile.skinHash} model={profile.skinModel} scale={8} />
                    : <span className="muted small">Varsayılan skin</span>}
            </div>
            {own && <SkinControls />}
        </>
    );
}

function SkinControls() {
    const { user, updateProfile } = useAuth();
    const [model, setModel] = useState(user.skinModel || 'default');
    const skin = useUpload(async file => {
        if (file.type !== 'image/png') throw new Error('Skin PNG olmalı.');
        updateProfile(await api.setSkin(file, model));
    });

    function changeModel(next) {
        setModel(next);
        if (user.skinHash) skin.run(async () => updateProfile(await api.setSkinModel(next)));
    }

    function reset() {
        if (confirm('Varsayılan skine dönülsün mü?')) skin.run(async () => updateProfile(await api.removeSkin()));
    }

    return (
        <div className="pf-skin-controls">
            <div className="segmented">
                <button type="button" className={model === 'default' ? 'on' : ''} onClick={() => changeModel('default')}>Klasik</button>
                <button type="button" className={model === 'slim' ? 'on' : ''} onClick={() => changeModel('slim')}>İnce</button>
            </div>
            <div className="row">
                <button className="btn btn-sm" disabled={skin.busy} onClick={skin.pick}>{skin.busy ? 'Yükleniyor…' : 'Skin yükle'}</button>
                {user.skinHash && <button className="btn btn-ghost btn-sm" disabled={skin.busy} onClick={reset}>Varsayılana dön</button>}
            </div>
            <small className="muted">64×64 piksel bir PNG olmalı. Skinin oyunda ve sunucularda görünür.</small>
            <input ref={skin.input} type="file" accept="image/png" hidden onChange={skin.onChange} />
            {skin.error && <p className="status error">{skin.error}</p>}
        </div>
    );
}
