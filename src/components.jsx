import { useEffect, useState } from 'react';
import { api, fetchAuthImage } from './api.js';

/** Kullanıcının avatarı; yüklenmemişse ya da açılmazsa adının baş harfi. */
export function Avatar({ username, version, size = 40 }) {
    const [failed, setFailed] = useState(false);
    const style = { width: size, height: size, fontSize: Math.round(size * .4) };
    return (
        <span className="avatar" style={style}>
            {version > 0 && !failed
                ? <img src={api.avatarUrl(username, version)} alt="" onError={() => setFailed(true)} />
                : <span>{username[0].toUpperCase()}</span>}
        </span>
    );
}

/** Giriş gerektiren bir resim (ekran görüntüleri). Yüklenene kadar yer tutucu gösterir. */
export function AuthImage({ path, alt = '', className, width, height }) {
    const [src, setSrc] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let url = null, cancelled = false;
        setSrc(null);
        setFailed(false);
        fetchAuthImage(path)
            .then(u => { if (cancelled) URL.revokeObjectURL(u); else { url = u; setSrc(u); } })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    }, [path]);

    if (!src) return <span className={'img-placeholder ' + (className || '')} style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}>{failed ? 'Resim yüklenemedi' : ''}</span>;
    return <img className={className} src={src} alt={alt} width={width || undefined} height={height || undefined} />;
}

export const formatDate = value => value
    ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

/** "3 dakika önce", "dün", "12 Ekim" gibi kısa zaman. */
export function timeAgo(value) {
    if (!value) return '';
    const diff = (Date.now() - new Date(value).getTime()) / 1000;
    if (diff < 60) return 'az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 2 * 86400) return 'dün';
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} gün önce`;
    return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export const formatHours = seconds => {
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
    return h ? `${h} sa ${m} dk` : `${m} dk`;
};

const LOADER_NAMES = { vanilla: 'Vanilla', fabric: 'Fabric', quilt: 'Quilt', forge: 'Forge', neoforge: 'NeoForge' };
export const loaderName = loader => LOADER_NAMES[loader] || loader;

let usersPromise = null;

/** Üyeler, kullanıcı adına göre (avatar sürümleri için). Sayfa açık kaldıkça bir kez yüklenir. */
export function useUsers() {
    const [users, setUsers] = useState({});
    useEffect(() => {
        usersPromise ||= api.users().catch(() => { usersPromise = null; return []; });
        let cancelled = false;
        usersPromise.then(list => { if (!cancelled) setUsers(Object.fromEntries(list.map(u => [u.username, u]))); });
        return () => { cancelled = true; };
    }, []);
    return users;
}

/** Bir API çağrısının sonucu: { data, error, loading }. deps değişince yeniden yükler. */
export function useLoad(load, deps = []) {
    const [state, setState] = useState({ data: null, error: null, loading: true });
    useEffect(() => {
        let cancelled = false;
        setState(s => ({ ...s, loading: true, error: null }));
        load()
            .then(data => { if (!cancelled) setState({ data, error: null, loading: false }); })
            .catch(err => { if (!cancelled) setState({ data: null, error: err.message || 'Yüklenemedi.', loading: false }); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return state;
}
