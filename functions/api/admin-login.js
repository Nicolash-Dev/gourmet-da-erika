const enc = new TextEncoder();

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(value))));
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context) {
  const password = context.env.ADMIN_PASSWORD;
  const secret = context.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) {
    return Response.json({ ok: false, error: "Login ainda não configurado." }, { status: 500 });
  }

  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ ok: false, error: "Requisição inválida." }, { status: 400 }); }

  if (!safeEqual(String(body.password || ""), password)) {
    return Response.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const sig = await sign(expires, secret);
  const secure = new URL(context.request.url).protocol === "https:" ? "; Secure" : "";

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `erika_admin=${encodeURIComponent(expires + "." + sig)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`,
      "Cache-Control": "no-store"
    }
  });
}
