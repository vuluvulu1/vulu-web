import { useEffect, useRef } from 'react';
import { api } from './api.js';

/**
 * Yüklemeden önce resmi küçültür: en fazla maxW×maxH, crop verilirse tam o boyuta kırpar.
 * Zaten küçük olan resimler (ve hareketli GIF'ler) olduğu gibi gönderilir.
 */
export async function shrinkImage(file, { maxW, maxH, crop = false, maxBytes }) {
    const bitmap = await createImageBitmap(file);
    const fits = bitmap.width <= maxW && bitmap.height <= maxH && file.size <= maxBytes;
    if (fits || (file.type === 'image/gif' && file.size <= maxBytes)) { bitmap.close(); return file; }

    let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height, w, h;
    if (crop) {
        // Ortadan, hedef en-boy oranında kırp
        const ratio = maxW / maxH;
        if (sw / sh > ratio) { sw = sh * ratio; sx = (bitmap.width - sw) / 2; } else { sh = sw / ratio; sy = (bitmap.height - sh) / 2; }
        w = Math.min(maxW, sw); h = Math.round(w / ratio);
    } else {
        const scale = Math.min(1, maxW / sw, maxH / sh);
        w = Math.round(sw * scale); h = Math.round(sh * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const g = canvas.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
    bitmap.close();
    for (const quality of [.9, .8, .7, .55]) {
        const blob = await new Promise(r => canvas.toBlob(r, 'image/webp', quality));
        if (blob && blob.size <= maxBytes) return blob;
    }
    throw new Error('Resim küçültülemedi; daha küçük bir resim dene.');
}

// Skin dokusundaki parçalar: [x, y, genişlik, yükseklik] (önden görünüş)
const FRONT = {
    head: [8, 8, 8, 8], hat: [40, 8, 8, 8],
    body: [20, 20, 8, 12], jacket: [20, 36, 8, 12],
    rightArm: [44, 20, 4, 12], rightSleeve: [44, 36, 4, 12],
    leftArm: [36, 52, 4, 12], leftSleeve: [52, 52, 4, 12],
    rightLeg: [4, 20, 4, 12], rightPants: [4, 36, 4, 12],
    leftLeg: [20, 52, 4, 12], leftPants: [4, 52, 4, 12],
};

/** Minecraft skin'inin önden görünüşü (launcher'daki önizlemenin sade hâli). */
export function SkinPreview({ hash, model = 'default', scale = 8 }) {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        const g = canvas.getContext('2d');
        g.clearRect(0, 0, canvas.width, canvas.height);
        if (!hash) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const legacy = img.height === 32;   // eski 64×32 biçim: sol kol ve bacak sağdakinin aynası
            const arm = model === 'slim' ? 3 : 4;
            g.imageSmoothingEnabled = false;
            const part = (key, dx, dy, w = FRONT[key][2], mirrorOf) => {
                const [x, y, , h] = mirrorOf ? FRONT[mirrorOf] : FRONT[key];
                if (mirrorOf) {
                    g.save(); g.translate((dx + w) * scale, dy * scale); g.scale(-1, 1);
                    g.drawImage(img, x, y, w, h, 0, 0, w * scale, h * scale); g.restore();
                } else {
                    g.drawImage(img, x, y, w, h, dx * scale, dy * scale, w * scale, h * scale);
                }
            };
            // Gövde 4 birim sağdan başlar; kollar onun iki yanında
            part('rightLeg', 4, 20); part('leftLeg', 8, 20, 4, legacy ? 'rightLeg' : null);
            part('body', 4, 8);
            part('rightArm', 4 - arm, 8, arm); part('leftArm', 12, 8, arm, legacy ? 'rightArm' : null);
            part('head', 4, 0);
            if (!legacy) {
                part('rightPants', 4, 20); part('leftPants', 8, 20);
                part('jacket', 4, 8);
                part('rightSleeve', 4 - arm, 8, arm); part('leftSleeve', 12, 8, arm);
            }
            part('hat', 4, 0);
        };
        img.src = api.skinUrl(hash);
    }, [hash, model, scale]);
    return <canvas ref={ref} className="skin-preview" width={16 * scale} height={32 * scale} aria-label="Skin önizlemesi" />;
}
