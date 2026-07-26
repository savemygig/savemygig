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

const LIST_ID = 3; // "Emergency Card subscribers"
const REDIRECT_URL = 'https://www.savemygig.com/card-ready';
const SITE = 'https://www.savemygig.com';

const redirect = (url) =>
  new Response(null, { status: 302, headers: { location: url } });

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
  const dest = String(data.source || '').startsWith('checklist')
    ? `${SITE}/checklist?confirmed=1`
    : REDIRECT_URL;
  return redirect(dest);
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return new Response('method not allowed', { status: 405 });
}
