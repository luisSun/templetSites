const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');


router.get(['/', '/main', '/home'], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Garante que seja um número
    const limit = 16;
    const offset = (page - 1) * limit;

    console.log(`Página solicitada: ${page}`);

    const studios = await executeQuery(`SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 90`);

    // 🔹 Consulta Paginada - Proteção contra SQL Injection
    const selectedItem = await executeQuery(
      'SELECT * FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const selectAll = await executeQuery(`SELECT * FROM pn WHERE ativo = "A" ORDER BY id DESC`);

    // 🔹 Total de páginas corrigido (sem ORDER BY ou LIMIT na contagem)
    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE ativo = "A"');
    const totalPages = Math.ceil(totalItems[0].total / limit);

    // Envia para o template
    res.render('main', { selectedItem, studios, totalPages, page, selectAll });

  } catch (error) {
    console.error('Erro ao recuperar dados:', error);
    res.status(500).send('Erro ao recuperar dados.');
  }
});


router.get('/atrizes/', async (req, res) => {
  try {
    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');
    
    const results = await executeQuery('SELECT DISTINCT atriz FROM pn');
    let allTags = results.map(result => result.atriz).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = Array.from(new Set(allTags));

    const value = ['atriz']

    res.render('tags', {studios, uniqueTags:uniqueTags, value:value });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

router.get('/studios', async (req, res) => {
  try {
    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');
    
    const results = await executeQuery('SELECT DISTINCT studio FROM pn');
    let allTags = results.map(result => result.studio).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = Array.from(new Set(allTags));

    const value = ['studios']

    res.render('tags', {studios, uniqueTags:uniqueTags, value:value });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

// TAGS
router.get('/tags/', async (req, res) => {
  try {
    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');
    
    const results = await executeQuery('SELECT DISTINCT tags FROM pn');
    let allTags = results.map(result => result.tags).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = Array.from(new Set(allTags));
    
    const value = ['tags']

    res.render('tags', {studios, uniqueTags:uniqueTags, value:value });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

router.get('/main/tags/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = parseInt(req.query.page) || 1;  // Certifica que `page` é um número
    const limit = 16;
    const offset = (page - 1) * limit;

    const studios = await executeQuery(`SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 90`);

    // 🔹 Corrigido: Conta o total sem ORDER BY / LIMIT / OFFSET
    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A"', [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    // 🔹 Consulta paginada corretamente
    const selectedItem = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A" ORDER BY id DESC LIMIT ? OFFSET ?',
      [itemId, limit, offset]
    );

    // 🔹 Consulta sem paginação (se precisar de todos os itens)
    const selectAll = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A" ORDER BY id DESC',
      [itemId]
    );

    if (!selectedItem || selectedItem.length === 0) {
      return res.status(404).send('Nenhum item encontrado para o ID fornecido.');
    }

    const auxiliar=[itemId,'tags']

    res.render('main_aux', { selectedItem, selectAll, studios, totalPages, page, auxiliar });

  } catch (error) {
    console.error('Erro ao recuperar dados do item:', error);
    res.status(500).send('Erro ao recuperar dados do item.');
  }
});


//Watch Router
router.get('/watch', async (req, res) => {
  res.redirect('/main'); // Redireciona para a rota /main
});

router.get('/watch/:id', async (req, res) => {
  try {
      const itemId = req.params.id;

      const selectedItem = await executeQuery('SELECT * FROM pn WHERE id = ? AND ativo = "A"', [itemId]);

      if (!selectedItem || selectedItem.length === 0) {
          return res.redirect('/main');
      }

      const studios = await executeQuery(`SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 50`);
      const tagsArray = selectedItem[0].tags.split(',');
      const atrizArray = selectedItem[0].atriz.split(',');
      const studioArray = selectedItem[0].studio.split(',');

      const results = await executeQuery('SELECT DISTINCT tags FROM pn');
      let allTags = results.map(result => result.tags).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
      const uniqueTags = Array.from(new Set(allTags));

      const resultStudio = await executeQuery('SELECT DISTINCT studio FROM pn');
      const uniqueStudios = resultStudio.map(item => item.studio); // Extract 'studio' property

      const resultAtriz = await executeQuery('SELECT DISTINCT atriz FROM pn');
      const uniqueAtriz = resultAtriz.map(item => item.atriz);

      res.render('watchMain', { selectedItem: selectedItem[0],
        tagsArray,
        studios,
        atrizArray,
        uniqueTags:uniqueTags,
        uniqueAtriz:uniqueAtriz,
        uniqueStudios:uniqueStudios,
        studioArray});
  } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
  }
});

/*Watch Random
*/

router.get('/random', async (req, res) => {
  try {
    // pega só o id aleatório
    const result = await executeQuery(
      'SELECT id FROM pn WHERE ativo = "A" ORDER BY RAND() LIMIT 1'
    );

    if (!result || result.length === 0) {
      return res.redirect('/main');
    }

    const randomId = result[0].id;

    // redireciona para a rota /watch/:id
    res.redirect(`/watch/${randomId}`);
  } catch (error) {
    console.error('Erro ao selecionar item aleatório', error);
    res.status(500).send('Erro ao selecionar item aleatório');
  }
});


// Rota de pesquisa por Atriz
router.get('/main/atriz/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = parseInt(req.query.page) || 1; // Garante que seja um número
    const limit = 16;
    const offset = (page - 1) * limit;

    //console.log(`Atriz ID: ${itemId} | Página: ${page}`);

    // 🔹 Obtém os estúdios únicos
    const studios = await executeQuery(`SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 90`);

    // 🔹 Obtém o total de itens (SEM ORDER BY, LIMIT ou OFFSET)
    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, atriz) AND ativo = "A"', [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    // 🔹 Obtém os itens paginados de forma segura
    const selectedItem = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, atriz) AND ativo = "A" ORDER BY id DESC LIMIT ? OFFSET ?',
      [itemId, limit, offset]
    );

    // 🔹 Se não encontrar nada, retorna erro 404
    if (!selectedItem || selectedItem.length === 0) {
      return res.status(404).send('Nenhum item encontrado para o ID fornecido.');
    }

        // 🔹 Consulta sem paginação (se precisar de todos os itens)
    const selectAll = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A" ORDER BY id DESC',
      [itemId]
    );

    const auxiliar=[itemId,'atriz']

    // Envia os dados para o template
    res.render('main_aux', { selectedItem, studios, totalPages, page, selectAll, auxiliar });

  } catch (error) {
    console.error('Erro ao recuperar dados do item:', error);
    res.status(500).send('Erro ao recuperar dados do item.');
  }
});


//Rota studios
router.get('/main/studios/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 16;
    const offset = (page - 1) * limit;

    console.log(`Estúdio: ${itemId} | Página: ${page}`);

    // 🔹 Obtém os 50 estúdios mais recentes
    const studios = await executeQuery(`SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 50`);

    // 🔹 Conta o total de itens (sem ORDER BY)
    const totalItems = await executeQuery(
      'SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, studio) AND ativo = "A"',
      [itemId]
    );
    const totalPages = Math.ceil(totalItems[0].total / limit);

    // 🔹 Obtém os itens paginados corretamente
    const selectedItem = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, studio) AND ativo = "A" ORDER BY id DESC LIMIT ? OFFSET ?',
      [itemId, limit, offset]
    );


    console.log(selectedItem)
    // 🔹 Se não houver itens, retorna erro 404
    if (!selectedItem || selectedItem.length === 0) {
      return res.status(404).send('Nenhum item encontrado para o estúdio fornecido.');
    }

    const selectAll = await executeQuery(
      'SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A" ORDER BY id DESC',
      [itemId]
    );

    const auxiliar=[itemId,'studios']

    res.render('main_aux', { selectedItem, studios, totalPages, page,valuepag: itemId,selectAll,auxiliar });

  } catch (error) {
    console.error('Erro ao recuperar dados do estúdio:', error);
    res.status(500).send('Erro ao recuperar dados do estúdio.');
  }
});


module.exports = router;
