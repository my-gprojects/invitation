/** Shared guest helpers for invitation + scanner */
window.GuestUtils = {
  getGuestNameFromUrl() {
    const raw = new URLSearchParams(window.location.search).get('t');
    if (!raw?.trim()) return null;
    return this.formatName(decodeURIComponent(raw.trim()));
  },

  formatName(raw) {
    return raw
      .replace(/\+/g, ' ')
      .replace(/[-_]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  makeUniqueKey(name) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tamu';

    let hash = 2166136261;
    for (let i = 0; i < name.length; i++) {
      hash ^= name.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `INV-${slug}-${(hash >>> 0).toString(36)}`;
  },

  /** Compact payload encoded in QR */
  encodePayload(uniqueKey, nama) {
    return JSON.stringify({ k: uniqueKey, n: nama });
  },

  decodePayload(text) {
    const raw = String(text || '').trim();
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      if (data?.k && data?.n) {
        return { unique_key: String(data.k), nama: String(data.n) };
      }
    } catch (_) {
      // fall through
    }

    // fallback: unique_key|nama or unique_key only
    if (raw.includes('|')) {
      const [k, ...rest] = raw.split('|');
      return { unique_key: k.trim(), nama: rest.join('|').trim() || k.trim() };
    }

    if (raw.startsWith('INV-')) {
      return { unique_key: raw, nama: raw.replace(/^INV-/, '').replace(/-[a-z0-9]+$/i, '').replace(/-/g, ' ') };
    }

    return null;
  },

  async checkIn({ unique_key, nama, jumlah_orang }) {
    const url = window.WEDDING_CONFIG?.appsScriptUrl;
    if (!url) {
      throw new Error('Apps Script URL belum diisi di config.js');
    }

    const body = {
      action: 'checkin',
      unique_key,
      nama,
      status: 1,
      jumlah_orang: Number(jumlah_orang) || 1,
    };

    // text/plain avoids CORS preflight with Apps Script
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || 'Gagal menyimpan ke Google Sheet');
    }
    return data;
  },
};
