CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO products (id, name, category, price_cents, image, available) VALUES
(1, 'Açaí Trufado', 'Picolé', 1000, 'assets/acai-trufado.jpg', 1),
(2, 'Mousse de Maracujá', 'Geladinho', 700, 'assets/mousse-maracuja.jpg', 1),
(3, 'Trufado de Maracujá', 'Geladinho', 700, 'assets/trufado-maracuja.jpg', 1),
(4, 'Ninho com Nutella', 'Geladinho', 700, 'assets/ninho-nutella.jpg', 1),
(5, 'Prestígio', 'Geladinho', 700, 'assets/prestigio-geladinho.jpg', 1),
(6, 'Ferrero Rocher', 'Geladinho', 700, 'assets/ferrero-rocher.jpg', 1),
(7, 'Oreo • Ninho & Nutella', 'Picolé', 1000, 'assets/oreo-ninho-nutella.jpg', 1),
(8, 'Pudim', 'Geladinho', 700, 'assets/pudim.jpg', 1),
(9, 'Nutilinho', 'Picolé', 1000, 'assets/nutilinho.jpg', 1),
(10, 'Prestígio Gourmet', 'Picolé', 1000, 'assets/prestigio-picole.jpg', 1),
(11, 'Laka com Oreo', 'Geladinho', 700, 'assets/laka-oreo.jpg', 1),
(12, 'Ninho com Morango', 'Geladinho', 700, 'assets/ninho-morango.jpg', 1),
(13, 'Tablito', 'Geladinho', 700, 'assets/tablito.jpg', 1),
(14, 'Napolitano', 'Picolé', 1000, 'assets/napolitano.jpg', 1),
(15, 'Sensação', 'Picolé', 1000, 'assets/sensacao.jpg', 1);
