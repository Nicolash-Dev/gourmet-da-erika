export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const id = Number(body.id);
    const available = body.available ? 1 : 0;

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ ok: false, error: "ID inválido." }, { status: 400 });
    }

    const result = await context.env.DB.prepare(
      `UPDATE products
       SET available = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(available, id).run();

    if (!result.meta.changes) {
      return Response.json({ ok: false, error: "Produto não encontrado." }, { status: 404 });
    }

    return Response.json({ ok: true, id, available: Boolean(available) });
  } catch (error) {
    return Response.json({ ok: false, error: "Não foi possível atualizar o produto." }, { status: 500 });
  }
}
