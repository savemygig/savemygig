/**
 * Signed opt-in tokens for our self-hosted double opt-in.
 *
 * A token is  base64url(payload) + "." + base64url(HMAC-SHA256(payload)).
 * The payload carries the email, the form source, and an expiry timestamp,
 * so a confirmation link is worthless after 7 days and cannot be forged
 * without the secret. Web Crypto only, so it runs on Cloudflare Pages
 * Functions with no dependencies.
 *
 * The signing secret is env.BREVO_API_KEY. We reuse it deliberately: it is
 * already present as an encrypted Pages secret, it never leaves the server,
 * and it means no new secret to manage.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function makeToken(email, source, secret) {
  const payload = {
    e: email,
    s: source || 'unknown',
    x: Date.now() + WEEK_MS,
  };
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payloadBytes));
  return `${b64urlEncode(payloadBytes)}.${b64urlEncode(sig)}`;
}

export async function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return null;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  let payloadBytes, sigBytes;
  try {
    payloadBytes = b64urlDecode(parts[0]);
    sigBytes = b64urlDecode(parts[1]);
  } catch (err) {
    return null;
  }

  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
  if (!ok) return null;

  let payload;
  try {
    payload = JSON.parse(dec.decode(payloadBytes));
  } catch (err) {
    return null;
  }

  if (!payload || !payload.e || !payload.x) return null;
  if (Date.now() > payload.x) return null; // link expired

  return { email: payload.e, source: payload.s || 'unknown' };
}
