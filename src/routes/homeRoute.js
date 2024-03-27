const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');

router.get(['/', '/main', '/home'], async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 16;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const selectedItem = await executeQuery(`SELECT * FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);

    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE ativo = "A"');
    const totalPages = Math.ceil(totalItems[0].total / limit);

    res.render('main', { selectedItem, studios, totalPages });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

// TAGS
router.get('/main/tags/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const totalItems = await executeQuery(`SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A"ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    const selectedItem = await executeQuery(`SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A"ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, [itemId]);

    if (!selectedItem || selectedItem.length === 0) {
      throw new Error('Nenhum item encontrado para o ID fornecido.');
    }

    res.render('main', { selectedItem: selectedItem, studios, totalPages });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
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

      const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');
      const tagsArray = selectedItem[0].tags.split(',');
      const atrizArray = selectedItem[0].atriz.split(',');

      res.render('teste', { selectedItem: selectedItem[0], tagsArray, studios, atrizArray });
  } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
  }
});

// Rota de pesquisa por Atriz
router.get('/main/atriz/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, atriz) AND ativo = "A"', [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    const selectedItem = await executeQuery('SELECT * FROM pn WHERE FIND_IN_SET(?, atriz) AND ativo = "A" ORDER BY id DESC LIMIT ?, ?', [itemId, offset, limit]);

    if (!selectedItem || selectedItem.length === 0) {
      throw new Error('Nenhum item encontrado para o ID fornecido.');
    }

    res.render('main', { selectedItem: selectedItem, studios, totalPages });  // Passando totalPages para o template
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

//Rota studios
router.get('/main/studios/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, studio) AND ativo = "A"', [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    const selectedItem = await executeQuery('SELECT * FROM pn WHERE FIND_IN_SET(?, studio) AND ativo = "A" ORDER BY id DESC LIMIT ?, ?', [itemId, offset, limit]);

    if (!selectedItem || selectedItem.length === 0) {
      throw new Error('Nenhum item encontrado para o ID fornecido.');
    }

    res.render('main', { selectedItem: selectedItem, studios, totalPages });  // Passando totalPages para o template
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});


module.exports = router;
