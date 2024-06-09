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

router.get('/atrizes/', async (req, res) => {
  try {
    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');
    
    const results = await executeQuery('SELECT DISTINCT atriz FROM pn');
    let allTags = results.map(result => result.atriz).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = Array.from(new Set(allTags));
    //console.log(results)
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
    console.log(uniqueTags)
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
    console.log(uniqueTags)
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
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    console.log(itemId)

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const totalItems = await executeQuery(`SELECT COUNT(*) AS total FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "A"ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, [itemId]);
    const totalPages = Math.ceil(totalItems[0].total / limit);
    

    const selectedItem = await executeQuery(`SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "a" ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, [itemId]);
    console.log(selectedItem)

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
      const studioArray = selectedItem[0].studio.split(',');

      const results = await executeQuery('SELECT DISTINCT tags FROM pn');
      let allTags = results.map(result => result.tags).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
      const uniqueTags = Array.from(new Set(allTags));

      const resultStudio = await executeQuery('SELECT DISTINCT studio FROM pn');
      const uniqueStudios = resultStudio.map(item => item.studio); // Extract 'studio' property

      const resultAtriz = await executeQuery('SELECT DISTINCT atriz FROM pn');
      const uniqueAtriz = resultAtriz.map(item => item.atriz);

      res.render('teste', { selectedItem: selectedItem[0],
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

/*
router.get(['/gal'], async (req, res) => {
  try {
    res.render('galerias');
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

router.get(['/gal2'], async (req, res) => {
  try {
    res.render('galerias');
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});
*/

module.exports = router;
