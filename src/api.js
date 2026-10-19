// vulu-api istemcisi. Site veritabanına doğrudan bağlanmaz; launcher'la aynı API'yi kullanır,
// böylece hesaplar, kayıt istekleri ve kurallar tek yerde kalır.

// API sitenin yanında, aynı sunucuda /api altında durur (CORS gerekmez). Geliştirirken Vite /api'yi sunucuya yönlendirir.
export const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.BASE_URL + 'api').replace(/\/$/, '');

/** public/ klasöründeki bir dosyanın adresi; site alt klasörde yayınlansa da doğru çalışır. */
export const asset = path => import.meta.env.BASE_URL + path;

// Launcher sürümleri sitenin yanında, sunucudaki /releases/ altında durur (launcher da güncellemeyi oradan alır)
export const DOWNLOAD_URL = asset('releases/vulu-launcher-setup.exe');

// Çevrimiçi durumu API'nin belleğinde tutulur. Kurulu launcher'lar 0.14.0'a kadar Render'daki API'ye bildirdiği
// için arkadaş listesi geçici olarak oradan okunur; launcher'lar VDS'e geçince bu satır API_URL'e döner.
// npm run dev'de Vite /render-api'yi Render'a yönlendirir (Render localhost'a CORS izni vermez).
const PRESENCE_URL = (import.meta.env.VITE_PRESENCE_URL || (import.meta.env.DEV ? '/render-api' : 'https://vulu-api.onrender.com')).replace(/\/$/, '');

const TOKEN_KEY = 'vulu.token';

export function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch { /* gizli pencerede oturum yalnızca bu sekmede kalır */ }
}

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

/**
 * JSON isteği. Render'daki ücretsiz sunucu uykudaysa ilk istek uzun sürebilir;
 * `onSlow` o durumda kullanıcıya açıklama göstermek için birkaç saniye sonra çağrılır.
 */
export async function request(path, { method = 'GET', body, auth = false, onSlow, base = API_URL } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const slowTimer = onSlow ? setTimeout(onSlow, 4000) : null;
    let res;
    try {
        res = await fetch(base + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError('Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.', 0);
    } finally {
        clearTimeout(slowTimer);
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.error || `Sunucu hatası (${res.status}).`, res.status);
    return data;
}

export const api = {
    ping: opts => request('/ping', opts),
    login: (username, password, opts) => request('/auth/login', { method: 'POST', body: { username, password }, ...opts }),
    register: (username, email, password, opts) => request('/auth/register', { method: 'POST', body: { username, email, password }, ...opts }),
    me: () => request('/users/me', { auth: true }),
    avatarUrl: (username, version) => `${API_URL}/users/${encodeURIComponent(username)}/avatar?v=${version}`,

    users: () => request('/users', { auth: true }),
    /** Şu an çevrimiçi olanlar; durum sunucusuna ulaşılamazsa null. */
    presence: () => request('/users/presence', { auth: true, base: PRESENCE_URL }).catch(() => null),
    announcement: () => request('/announcements', { auth: true }).then(d => d.announcement),

    packs: () => request('/packs', { auth: true }),
    packCoverUrl: pack => `${API_URL}/packs/${pack.id}/cover?v=${pack.revision}`,

    shots: before => request('/shots' + (before ? `?before=${encodeURIComponent(before)}` : ''), { auth: true }),
    shotComments: id => request(`/shots/${id}/comments`, { auth: true }),
    addComment: (id, text) => request(`/shots/${id}/comments`, { method: 'POST', body: { text }, auth: true }),
    deleteComment: (id, commentId) => request(`/shots/${id}/comments/${commentId}`, { method: 'DELETE', auth: true }),
    likeShot: (id, like) => request(`/shots/${id}/like`, { method: 'POST', body: { like }, auth: true }),
    shotImagePath: (id, size) => `/shots/${id}/${size}`,
};

/**
 * Giriş gerektiren bir resmi indirip tarayıcıda gösterilebilecek bir adres (blob:) döndürür.
 * <img> etiketi Authorization başlığı gönderemediği için ekran görüntüleri bu yolla yüklenir.
 */
export async function fetchAuthImage(path) {
    const res = await fetch(API_URL + path, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new ApiError('Resim yüklenemedi.', res.status);
    return URL.createObjectURL(await res.blob());
}

const githubCache = new Map();

/** GitHub'daki son sürüm: etiket, tarih ve (eşleşen) indirme dosyası. Alınamazsa null. */
export function githubRelease(repo, assetPattern) {
    if (!githubCache.has(repo)) {
        githubCache.set(repo, fetch(`https://api.github.com/repos/vuluvulu1/${repo}/releases/latest`)
            .then(res => (res.ok ? res.json() : null))
            .catch(() => null));
    }
    return githubCache.get(repo).then(data => {
        if (!data) return null;
        const file = (data.assets || []).find(a => assetPattern.test(a.name));
        return {
            tag: data.tag_name,
            publishedAt: data.published_at,
            pageUrl: data.html_url,
            download: file ? { url: file.browser_download_url, name: file.name, size: file.size } : null,
        };
    });
}

/** Sunucudaki son sürümün etiketi (ör. "v0.13.0"); alınamazsa null. */
export async function latestRelease() {
    try {
        const res = await fetch(asset('releases/release.json'));
        if (!res.ok) return null;
        const data = await res.json();
        return { tag: `v${data.version}`, publishedAt: data.publishedAt };
    } catch {
        return null;
    }
}
