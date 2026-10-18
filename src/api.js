// vulu-api istemcisi. Site veritabanına doğrudan bağlanmaz; launcher'la aynı API'yi kullanır,
// böylece hesaplar, kayıt istekleri ve kurallar tek yerde kalır.

export const API_URL = (import.meta.env.VITE_API_URL || 'https://vulu-api.onrender.com').replace(/\/$/, '');
export const REPO = 'vuluvulu1/vulu-launcher';
export const DOWNLOAD_URL = `https://github.com/${REPO}/releases/latest/download/vulu-launcher-setup.exe`;

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
export async function request(path, { method = 'GET', body, auth = false, onSlow } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const slowTimer = onSlow ? setTimeout(onSlow, 4000) : null;
    let res;
    try {
        res = await fetch(API_URL + path, {
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
};

/** GitHub'daki son sürümün etiketi (ör. "v0.13.0"); alınamazsa null. */
export async function latestRelease() {
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
        if (!res.ok) return null;
        const data = await res.json();
        return { tag: data.tag_name, publishedAt: data.published_at };
    } catch {
        return null;
    }
}
