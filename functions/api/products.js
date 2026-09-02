export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT id, name, category, price_cents, image, available
       FROM products
       ORDER BY id ASC`
    ).all();

    const products = results.map((p) => ({
      id: p.id,
      name: p.name,
      cat: p.category,
      price: p.price_cents / 100,
      img: p.image,
      available: Boolean(p.available)
    }));

    return Response.json({ ok: true, products }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: "Falha ao carregar produtos." }, { status: 500 });
  }
}
