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

async function validSession(request, secret) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)erika_admin=([^;]+)/);
  if (!match) return false;
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length !== 2) return false;
  const [expires, sig] = parts;
  if (!/^\d+$/.test(expires) || Date.now() > Number(expires)) return false;
  return (await sign(expires, secret)) === sig;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const protectedPath = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin-api/");

  if (!protectedPath) return context.next();

  const secret = context.env.ADMIN_SESSION_SECRET;
  if (!secret) return new Response("Configuração de segurança ausente.", { status: 500 });

  if (await validSession(context.request, secret)) return context.next();

  if (path.startsWith("/admin-api/")) {
    return Response.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  return Response.redirect(new URL("/login/", url), 302);
}
