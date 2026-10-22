// vulu-api istemcisi. Site veritabanına doğrudan bağlanmaz; launcher'la aynı API'yi kullanır,
// böylece hesaplar, kayıt istekleri ve kurallar tek yerde kalır.

// API sitenin yanında, aynı sunucuda /api altında durur (CORS gerekmez). Geliştirirken Vite /api'yi sunucuya yönlendirir.
export const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.BASE_URL + 'api').replace(/\/$/, '');

/** public/ klasöründeki bir dosyanın adresi; site alt klasörde yayınlansa da doğru çalışır. */
export const asset = path => import.meta.env.BASE_URL + path;

// İndirme düğmeleri API'nin sayacından geçer: sayaç artar, sonra /releases/ altındaki dosyaya yönlendirilir.
// (Launcher ve Android uygulaması kendi güncellemelerini doğrudan /releases/'ten alır; onlar sayılmaz.)
export const DOWNLOAD_URL = `${API_URL}/download/windows`;
export const ANDROID_URL = `${API_URL}/download/android`;


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
 * JSON isteği. Bağlantı yavaşsa ya da sunucu yeniden başlıyorsa istek uzun sürebilir;
 * `onSlow` o durumda kullanıcıya açıklama göstermek için birkaç saniye sonra çağrılır.
 */
export async function request(path, { method = 'GET', body, raw, auth = false, onSlow, base = API_URL } = {}) {
    const headers = {};
    if (raw) headers['Content-Type'] = raw.type || 'application/octet-stream';
    else if (body !== undefined) headers['Content-Type'] = 'application/json';
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
            body: raw || (body === undefined ? undefined : JSON.stringify(body)),
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
    verifyEmail: token => request('/auth/verify-email', { method: 'POST', body: { token } }),
    resendVerification: email => request('/auth/resend-verification', { method: 'POST', body: { email } }),
    me: () => request('/users/me', { auth: true }),
    /** Herkese açık sayılar: üye, paket, ekran görüntüsü, çevrimiçi ve oyunda olanlar. */
    stats: () => request('/stats'),
    avatarUrl: (username, version) => `${API_URL}/users/${encodeURIComponent(username)}/avatar?v=${version}`,

    users: () => request('/users', { auth: true }),
    /** Şu an çevrimiçi olanlar; durum sunucusuna ulaşılamazsa null. */
    presence: () => request('/users/presence', { auth: true }).catch(() => null),
    announcement: () => request('/announcements', { auth: true }).then(d => d.announcement),

    packs: () => request('/packs', { auth: true }),
    packCoverUrl: pack => `${API_URL}/packs/${pack.id}/cover?v=${pack.revision}`,

    shots: (before, author) => {
        const q = new URLSearchParams();
        if (before) q.set('before', before);
        if (author) q.set('author', author);
        return request('/shots' + (q.size ? `?${q}` : ''), { auth: true });
    },
    shotComments: id => request(`/shots/${id}/comments`, { auth: true }),
    addComment: (id, text) => request(`/shots/${id}/comments`, { method: 'POST', body: { text }, auth: true }),
    deleteComment: (id, commentId) => request(`/shots/${id}/comments/${commentId}`, { method: 'DELETE', auth: true }),
    likeShot: (id, like) => request(`/shots/${id}/like`, { method: 'POST', body: { like }, auth: true }),
    shotImagePath: (id, size) => `/shots/${id}/${size}`,

    // Profiller
    profile: username => request(`/users/${encodeURIComponent(username)}`, { auth: true }),
    bannerUrl: (username, version) => `${API_URL}/users/${encodeURIComponent(username)}/banner?v=${version}`,
    skinUrl: hash => `${API_URL}/yggdrasil/textures/${hash}`,
    setBio: bio => request('/users/me', { method: 'PUT', body: { bio }, auth: true }),
    setAvatar: file => request('/users/me/avatar', { method: 'PUT', raw: file, auth: true }),
    removeAvatar: () => request('/users/me/avatar', { method: 'DELETE', auth: true }),
    setBanner: file => request('/users/me/banner', { method: 'PUT', raw: file, auth: true }),
    removeBanner: () => request('/users/me/banner', { method: 'DELETE', auth: true }),
    setSkin: (file, model) => request(`/users/me/skin?model=${model}`, { method: 'PUT', raw: file, auth: true }),
    setSkinModel: model => request('/users/me/skin/model', { method: 'PUT', body: { model }, auth: true }),
    removeSkin: () => request('/users/me/skin', { method: 'DELETE', auth: true }),

    // Geri bildirim: pack = paket kimliği ya da 'general'
    feedback: pack => request(`/feedback?pack=${encodeURIComponent(pack)}`, { auth: true }),
    feedbackCounts: () => request('/feedback/counts', { auth: true }),
    sendFeedback: (pack, kind, text) => request('/feedback', { method: 'POST', body: { pack, kind, text }, auth: true }),
    updateFeedback: (id, changes) => request(`/feedback/${id}`, { method: 'PATCH', body: changes, auth: true }),
    deleteFeedback: id => request(`/feedback/${id}`, { method: 'DELETE', auth: true }),

    // Admin
    registrations: () => request('/admin/registrations', { auth: true }),
    approveRegistration: id => request(`/admin/registrations/${id}/approve`, { method: 'POST', auth: true }),
    rejectRegistration: id => request(`/admin/registrations/${id}/reject`, { method: 'POST', auth: true }),
    adminUsers: () => request('/admin/users', { auth: true }),
    updateUser: (id, changes) => request(`/admin/users/${id}`, { method: 'PATCH', body: changes, auth: true }),
    deleteUser: id => request(`/admin/users/${id}`, { method: 'DELETE', auth: true }),
    storage: () => request('/admin/storage', { auth: true }),
    postAnnouncement: (text, hours) => request('/announcements', { method: 'POST', body: { text, hours }, auth: true }),
    deleteAnnouncement: id => request(`/announcements/${id}`, { method: 'DELETE', auth: true }),
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
            notes: data.body || '',
            download: file ? { url: file.browser_download_url, name: file.name, size: file.size } : null,
        };
    });
}

/** Android APK'sının sürümü ve notları; henüz yayınlanmadıysa null. */
export async function androidRelease() {
    try {
        const res = await fetch(asset('releases/android/android.json'));
        if (!res.ok) return null;
        const data = await res.json();
        return { tag: `v${data.version}`, publishedAt: data.publishedAt, notes: data.notes || '', sizeMb: data.size ? Math.round(data.size / 1048576) : null };
    } catch {
        return null;
    }
}

/** Sunucudaki son sürümün etiketi (ör. "v0.13.0"); alınamazsa null. */
export async function latestRelease() {
    try {
        const res = await fetch(asset('releases/release.json'));
        if (!res.ok) return null;
        const data = await res.json();
        return { tag: `v${data.version}`, publishedAt: data.publishedAt, notes: data.notes || '' };
    } catch {
        return null;
    }
}
