const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');


router.get(['/adm'], async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = 12;
      const offset = (page - 1) * limit;
  
      const studios = await executeQuery('SELECT DISTINCT studio FROM pn ORDER BY studio');
  
      const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn WHERE ativo = "A"');
      const totalPages = Math.ceil(totalItems[0].total / limit);
  
      res.render('admin', { studios, totalPages });
    } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
    }
  });

  // Rota para lidar com o envio do formulário
  router.post('/add', async (req, res) => {

    console.log(req.body)
    try {
        const { title, studio, atriz, capa, tipoMidia, tags, ativo } = req.body;
        const midia = capa + '.' + tipoMidia;
    
        // Insira os dados no banco de dados
        await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, studio, atriz, capa, midia, tags, ativo]);
        
        res.redirect('/'); // Redireciona para a página principal após adicionar o item
    } catch (error) {
        console.error('Erro ao adicionar item', error);
        res.status(500).send('Erro ao adicionar item');
    }
});

  module.exports = router;
