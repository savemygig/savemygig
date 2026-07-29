/**
 * GET /api/confirm?t=<token>   (self-hosted double opt-in, step 2 of 2)
 *
 * The visitor clicks the link we emailed them. We verify the signed token
 * (see _token.js), and only then add the contact to Brevo and send them to
 * the card. Nothing was stored before this click, so an unconfirmed email
 * never touches the list.
 *
 * A valid click always lands on /card-ready (where the PDF lives), even if
 * the Brevo write hiccups, because the person did their part. A bad or
 * expired link goes to /card, which is free and public and where they can
 * ask again.
 */

import { verifyToken } from './_token.js';
import { getOrCreateUser, makeSessionToken, sessionCookie } from './_auth.js';

const LIST_ID = 3; // "Emergency Card subscribers"
const REDIRECT_URL = 'https://www.savemygig.com/card-ready';
const SITE = 'https://www.savemygig.com';

const redirect = (url, cookie) => {
  const headers = { location: url };
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(null, { status: 302, headers });
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');

  if (!env.BREVO_API_KEY) {
    return redirect(`${SITE}/card?e=config`);
  }

  const data = await verifyToken(token, env.BREVO_API_KEY);
  if (!data) {
    // Forged, malformed, or expired link. Send them to the free card.
    return redirect(`${SITE}/card?e=expired`);
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        listIds: [LIST_ID],
        updateEnabled: true, // idempotent: a repeat click just updates
        attributes: { SOURCE: data.source },
      }),
    });

    if (!res.ok) {
      let detail = '';
      try { detail = JSON.stringify(await res.json()); } catch (e) { /* ignore */ }
      // duplicate_parameter = already on the list, which is a success for us.
      console.log('confirm: brevo contacts status', res.status, detail);
    }
  } catch (err) {
    console.log('confirm: brevo contacts threw', String(err));
  }

  // Land them where their intent was. Someone who unlocked the checklist and
  // then confirmed used to be dumped on /card-ready, a page about a different
  // product, which reads as a bait-and-switch.
  //
  // THE FRAGMENT IS A MAGIC LINK (Antonio: re-registering per device "is
  // quite stupid", and he is right). A valid click on this link proves the
  // person owns the address, so the destination page registers THIS device:
  // open the same email on a new phone, tap the same button, that phone is
  // in. The email travels in the URL fragment, which never reaches server
  // logs or analytics, and the page strips it immediately after reading it.
  const frag = '#reg=' + btoa(encodeURIComponent(data.email))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dest = String(data.source || '').startsWith('checklist')
    ? `${SITE}/checklist?confirmed=1${frag}`
    : `${REDIRECT_URL}${frag}`;

  // ACCOUNTS (Antonio's Option 1, 2026-07-29): this click just proved the
  // address, which is exactly the proof an account needs. So the same click
  // now also creates the account and signs THIS device in — registration
  // and account become one thing, with zero extra steps. The artist name
  // travels inside the signed token (set at registration), so the account
  // is born already knowing what to call the DJ. No owner notification
  // here: subscribe.js sent it at registration time. Best effort: if the
  // DB or session secret is missing, the card/checklist flow behaves
  // exactly as it always did.
  let cookie = null;
  try {
    if (env.DB && env.SESSION_SECRET) {
      const user = await getOrCreateUser(env.DB, data.email, null);
      if (data.artist && !user.artist) {
        await env.DB.prepare(
          "UPDATE users SET artist = ?1, instagram = COALESCE(NULLIF(?2, ''), instagram) WHERE id = ?3"
        ).bind(String(data.artist).slice(0, 80), String(data.instagram || '').slice(0, 80), user.id).run();
      }
      cookie = sessionCookie(await makeSessionToken(user.id, user.email, env.SESSION_SECRET));
    }
  } catch (err) {
    console.log('confirm: account creation failed, confirm still honored', String(err));
  }
  return redirect(dest, cookie);
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return new Response('method not allowed', { status: 405 });
}
