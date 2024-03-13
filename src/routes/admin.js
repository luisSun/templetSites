const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');


router.get(['/adm'], async (req, res) => {
    try {

      const selectedItemA = await executeQuery('SELECT * FROM pn WHERE ativo = "A" ORDER BY id DESC LIMIT 3 ');
      const selectedItemI = await executeQuery('SELECT * FROM pn WHERE ativo = "A"');

    if (!selectedItemA || selectedItemA.length === 0) {
      throw new Error('Nenhum item encontrado para o ID fornecido.');
    }
  
      res.render('admin', { selectedItemA: selectedItemA, selectedItemI: selectedItemI });
    } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
    }
  });

  router.get(['/adm/add'], async (req, res) => {
    try {
        // Assuming selectedItem is defined elsewhere
        res.render('cadastrar');
    } catch (error) {
        console.error('Erro ao recuperar dados do item', error);
        res.status(500).send('Erro ao recuperar dados do item');
    }
});


  // Rota para lidar com o envio do formulário
  router.post('/add', async (req, res) => {

    console.log(req.body)
    try {
        const { title, studio, atriz, capa, midia, tipoMidia, tags, ativo } = req.body;
        const midiac = midia + '.' + tipoMidia;
    
        // Insira os dados no banco de dados
        await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, studio, atriz, capa, midiac, tags, ativo]);
        
        res.redirect('/'); // Redireciona para a página principal após adicionar o item
    } catch (error) {
        console.error('Erro ao adicionar item', error);
        res.status(500).send('Erro ao adicionar item');
    }
});

router.get(['/adm/inativo'], async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn ORDER BY studio');

    const selectedItem = await executeQuery(`SELECT * FROM pn WHERE ativo = "I" ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);

    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE ativo = "I"');
    const totalPages = Math.ceil(totalItems[0].total / limit);

    const tagsArray = selectedItem[0]?.tag ? selectedItem[0].tag.split(',') : [];
    const valor = ['Filmes Uncensured', 'javunc', 'javunc', 'jav'];

    res.render('main', { selectedItem, tagsArray, valor, studios, totalPages });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

router.get(['/adm/inativo/:id'], async (req, res) => {
  try {
    const itemId = req.params.id;
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const studios = await executeQuery('SELECT DISTINCT studio FROM pn WHERE ativo = "A" ORDER BY studio');

    const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE tags LIKE ? AND ativo = "I"', [`%${itemId}%`]);
    const totalPages = Math.ceil(totalItems[0].total / limit);

    const selectedItem = await executeQuery('SELECT * FROM pn WHERE FIND_IN_SET(?, tags) AND ativo = "I"', [itemId]);

    if (!selectedItem || selectedItem.length === 0) {
      throw new Error('Nenhum item encontrado para o ID fornecido.');
    }
    
    //[1=Title, 2=link video, 3=link img, 4=botao ir main]
    const valor = ['Filmes Idol', 'idol', 'idol', 'idol'];
    console.log(selectedItem)

    res.render('teste', { selectedItem: selectedItem, valor, studios, totalPages });
  } catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
  }
});

  module.exports = router;
