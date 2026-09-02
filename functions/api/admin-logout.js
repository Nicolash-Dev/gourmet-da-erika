export async function onRequestPost(context) {
  const secure = new URL(context.request.url).protocol === "https:" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `erika_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
      "Cache-Control": "no-store"
    }
  });
}
