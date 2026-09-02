async function parseBody(request) {
  try { return await request.json(); }
  catch { return null; }
}

function cleanText(value, max = 100) {
  return String(value ?? "").trim().slice(0, max);
}

function validPrice(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0.5 && n <= 9999;
}

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    `SELECT id, name, category, price_cents, image, available, updated_at
     FROM products ORDER BY id ASC`
  ).all();

  return Response.json({
    ok: true,
    products: results.map(p => ({
      id: p.id,
      name: p.name,
      cat: p.category,
      price: p.price_cents / 100,
      img: p.image,
      available: Boolean(p.available),
      updatedAt: p.updated_at
    }))
  }, { headers: { "Cache-Control": "no-store" }});
}

export async function onRequestPost(context) {
  const body = await parseBody(context.request);
  if (!body) return Response.json({ ok:false, error:"Dados inválidos." }, { status:400 });

  const action = cleanText(body.action, 20);

  if (action === "toggle") {
    const id = Number(body.id);
    const available = body.available ? 1 : 0;
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ ok:false, error:"Produto inválido." }, { status:400 });
    }
    const result = await context.env.DB.prepare(
      `UPDATE products SET available=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).bind(available, id).run();

    if (!result.meta.changes) {
      return Response.json({ ok:false, error:"Produto não encontrado." }, { status:404 });
    }
    return Response.json({ ok:true });
  }

  if (action === "create" || action === "update") {
    const name = cleanText(body.name, 80);
    const category = cleanText(body.cat, 40);
    const price = Number(body.price);
    const image = String(body.img ?? "").trim();
    const available = body.available === false ? 0 : 1;

    if (name.length < 2) return Response.json({ok:false,error:"Informe o nome do produto."},{status:400});
    if (!category) return Response.json({ok:false,error:"Informe a categoria."},{status:400});
    if (!validPrice(price)) return Response.json({ok:false,error:"Preço inválido."},{status:400});
    if (!image) return Response.json({ok:false,error:"Adicione uma foto."},{status:400});

    // Allow local static paths or compressed image data URLs only.
    const validImage =
      image.startsWith("assets/") ||
      image.startsWith("data:image/jpeg;base64,") ||
      image.startsWith("data:image/webp;base64,") ||
      image.startsWith("data:image/png;base64,");
    if (!validImage) return Response.json({ok:false,error:"Formato de imagem inválido."},{status:400});

    // Keep D1 rows under control for images uploaded from phones.
    if (image.length > 600000) {
      return Response.json({ok:false,error:"A foto ficou muito grande. Tente outra imagem."},{status:413});
    }

    const priceCents = Math.round(price * 100);

    if (action === "create") {
      const result = await context.env.DB.prepare(
        `INSERT INTO products (name, category, price_cents, image, available, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(name, category, priceCents, image, available).run();

      return Response.json({ ok:true, id:result.meta.last_row_id });
    }

    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ok:false,error:"Produto inválido."},{status:400});
    }

    const result = await context.env.DB.prepare(
      `UPDATE products
       SET name=?, category=?, price_cents=?, image=?, available=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`
    ).bind(name, category, priceCents, image, available, id).run();

    if (!result.meta.changes) {
      return Response.json({ok:false,error:"Produto não encontrado."},{status:404});
    }
    return Response.json({ok:true});
  }

  if (action === "delete") {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ok:false,error:"Produto inválido."},{status:400});
    }
    await context.env.DB.prepare(`DELETE FROM products WHERE id=?`).bind(id).run();
    return Response.json({ok:true});
  }

  return Response.json({ok:false,error:"Ação inválida."},{status:400});
}
