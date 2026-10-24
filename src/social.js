import { useEffect, useState } from 'react';
import { api } from './api.js';
import { loaderName } from './components.jsx';

// Arkadaş listesi ve çevrimiçi durumu birkaç yerde (kenar çubuğu, akış, profil, arkadaşlar) kullanılır;
// her biri ayrı ayrı istemesin diye tek bir yerde tutulur ve değişince hepsine haber verilir.

let friends = null;                 // { friends, incoming, outgoing } ya da yüklenmediyse null
let friendsLoading = null;
const friendListeners = new Set();

function setFriends(next) {
    friends = next;
    friendListeners.forEach(fn => fn(next));
}

/** Arkadaş listesini sunucudan yeniden alır. */
export function reloadFriends() {
    friendsLoading ||= api.friends()
        .then(setFriends)
        .catch(() => { if (!friends) setFriends({ friends: [], incoming: [], outgoing: [] }); })
        .finally(() => { friendsLoading = null; });
    return friendsLoading;
}

/** Çıkış yapılınca önceki kullanıcının listesi kalmasın. */
export function resetFriends() {
    friends = null;
}

/** { friends, incoming, outgoing }; ilk yüklemede null. */
export function useFriends() {
    const [state, setState] = useState(friends);
    useEffect(() => {
        friendListeners.add(setState);
        if (!friends) reloadFriends();
        else setState(friends);
        return () => { friendListeners.delete(setState); };
    }, []);
    return state;
}

/** Bir kişiyle arkadaşlık durumu: 'friend' | 'incoming' | 'outgoing' | 'none' (yüklenmediyse null). */
export function relationTo(state, username) {
    if (!state) return null;
    if (state.friends.includes(username)) return 'friend';
    if (state.incoming.includes(username)) return 'incoming';
    if (state.outgoing.includes(username)) return 'outgoing';
    return 'none';
}

/** Arkadaşlık işlemi yapıp listeyi tazeler. Hata olursa fırlatır. */
export async function friendAction(kind, username) {
    const call = { request: api.requestFriend, accept: api.acceptFriend, drop: api.dropFriendRequest, remove: api.removeFriend }[kind];
    try { await call(username); } finally { await reloadFriends(); }
}

const PRESENCE_REFRESH = 45 * 1000;
let presence = undefined;            // undefined: yükleniyor, null: alınamadı
let presenceTimer = null;
const presenceListeners = new Set();

function loadPresence() {
    api.presence().then(list => {
        presence = list;
        presenceListeners.forEach(fn => fn(list));
    });
}

/** Şu an çevrimiçi olanlar (launcher'ı açık olanlar); 45 saniyede bir yenilenir. */
export function usePresence() {
    const [state, setState] = useState(presence);
    useEffect(() => {
        presenceListeners.add(setState);
        if (!presenceTimer) { loadPresence(); presenceTimer = setInterval(loadPresence, PRESENCE_REFRESH); }
        return () => {
            presenceListeners.delete(setState);
            if (!presenceListeners.size) { clearInterval(presenceTimer); presenceTimer = null; }
        };
    }, []);
    return state;
}

/** "Oynuyor: ATM9 · Minecraft 1.20.1", "Launcher açık" gibi kısa açıklama. */
export function describePresence(p) {
    if (p.state === 'playing') {
        const what = [p.instance, p.mcVersion && `Minecraft ${p.mcVersion}`, p.loader && loaderName(p.loader)].filter(Boolean).join(' · ');
        return p.server ? `${p.server} sunucusunda oynuyor` : what ? `Oynuyor: ${what}` : 'Oynuyor';
    }
    return p.state === 'launcher' ? 'Launcher açık' : 'Çevrimiçi';
}
