// routes/cursos.js — API de cursos
const router = require('express').Router();
const db     = require('../db/connection');
const { authMiddleware, adminMiddleware, cursoAccesoMiddleware } = require('../middleware/auth');

// ── GET /api/cursos — Todos los cursos ────────
router.get('/', async (req, res) => {
  try {
    const { categoria, modalidad, buscar } = req.query;

    let sql = `
      SELECT c.*, cat.nombre AS categoria_nombre, cat.slug AS categoria_slug,
             cat.color AS categoria_color, cat.icono AS categoria_icono
      FROM cursos c
      JOIN categorias cat ON c.categoria_id = cat.id
      WHERE c.activo = 1
    `;
    const params = [];

    if (categoria) {
      sql += ' AND cat.slug = ?';
      params.push(categoria);
    }
    if (modalidad) {
      sql += ' AND c.modalidad = ?';
      params.push(modalidad);
    }
    if (buscar) {
      sql += ' AND (c.nombre LIKE ? OR c.descripcion_corta LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`);
    }

    sql += ' ORDER BY c.destacado DESC, c.orden ASC, c.id ASC';

    const [cursos] = await db.query(sql, params);
    res.json({ cursos, total: cursos.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cursos.' });
  }
});

// ── GET /api/cursos/categorias — Todas las categorías
router.get('/categorias', async (req, res) => {
  try {
    const [cats] = await db.query('SELECT * FROM categorias WHERE activo = 1 ORDER BY id');
    res.json({ categorias: cats });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

// ── GET /api/cursos/:slug — Detalle de un curso
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, cat.nombre AS categoria_nombre, cat.slug AS categoria_slug,
             cat.color AS categoria_color, cat.icono AS categoria_icono
      FROM cursos c
      JOIN categorias cat ON c.categoria_id = cat.id
      WHERE c.slug = ? AND c.activo = 1
    `, [req.params.slug]);

    if (!rows.length) return res.status(404).json({ error: 'Curso no encontrado.' });

    const curso = rows[0];

    // Temario
    const [temario] = await db.query(
      'SELECT tema FROM temario WHERE curso_id = ? ORDER BY orden',
      [curso.id]
    );

    // Dirigido a
    const [dirigido] = await db.query(
      'SELECT item FROM dirigido_a WHERE curso_id = ? ORDER BY orden',
      [curso.id]
    );

    // Módulos + lecciones
    const [modulos] = await db.query(
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden',
      [curso.id]
    );
    for (const mod of modulos) {
      const [lecciones] = await db.query(
        'SELECT id, titulo, tipo, duracion, orden, gratis FROM lecciones WHERE modulo_id = ? ORDER BY orden',
        [mod.id]
      );
      mod.lecciones = lecciones;
    }

    // Cursos relacionados (misma categoría)
    const [relacionados] = await db.query(`
      SELECT id, nombre, slug, emoji, bg_color, precio, precio_original, modalidad
      FROM cursos
      WHERE categoria_id = ? AND id != ? AND activo = 1
      LIMIT 3
    `, [curso.categoria_id, curso.id]);

    res.json({
      curso,
      temario: temario.map(t => t.tema),
      dirigido: dirigido.map(d => d.item),
      modulos,
      relacionados
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el curso.' });
  }
});

// ── GET /api/cursos/:cursoId/lecciones — Contenido (requiere acceso)
router.get('/:cursoId/lecciones', authMiddleware, cursoAccesoMiddleware, async (req, res) => {
  try {
    const [modulos] = await db.query(
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden',
      [req.params.cursoId]
    );
    for (const mod of modulos) {
      const [lecciones] = await db.query(
        'SELECT * FROM lecciones WHERE modulo_id = ? ORDER BY orden',
        [mod.id]
      );
      mod.lecciones = lecciones;
    }
    res.json({ modulos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lecciones.' });
  }
});

// ── POST /api/cursos — Crear curso (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      categoria_id, nombre, slug, descripcion, descripcion_corta,
      emoji, bg_color, duracion, modalidad, nivel,
      precio, precio_original, certificado, nuevo, destacado
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO cursos
        (categoria_id,nombre,slug,descripcion,descripcion_corta,emoji,bg_color,
         duracion,modalidad,nivel,precio,precio_original,certificado,nuevo,destacado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [categoria_id, nombre, slug, descripcion, descripcion_corta, emoji||'📚',
        bg_color||'#E3F2FD', duracion, modalidad||'grabado', nivel||'basico',
        precio, precio_original||null, certificado||1, nuevo||0, destacado||0]);

    res.status(201).json({ message: 'Curso creado.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el curso.' });
  }
});

// ── PUT /api/cursos/:id — Actualizar curso (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const campos = ['nombre','descripcion','descripcion_corta','precio',
                    'precio_original','modalidad','duracion','activo','destacado','nuevo'];
    const values = [];
    const sets   = [];

    campos.forEach(c => {
      if (req.body[c] !== undefined) {
        sets.push(`${c} = ?`);
        values.push(req.body[c]);
      }
    });

    if (!sets.length) return res.status(400).json({ error: 'No hay campos para actualizar.' });

    values.push(req.params.id);
    await db.query(`UPDATE cursos SET ${sets.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Curso actualizado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

module.exports = router;
