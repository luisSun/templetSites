const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');

router.get(['/', '/main', '/home'], async (req, res) => {
  try {
    const studios = await executeQuery('SELECT DISTINCT studio FROM pn ORDER BY studio');

    const selectedItem = await executeQuery('SELECT * FROM pn ORDER BY id DESC');

    const tagsArray = selectedItem[0]?.tag ? selectedItem[0].tag.split(',') : [];
    const valor = ['Filmes Uncensured', 'javunc', 'javunc', 'jav'];

    res.render('main', { selectedItem, tagsArray, valor, studios });
} catch (error) {
    console.error('Erro ao recuperar dados do item', error);
    res.status(500).send('Erro ao recuperar dados do item');
}
});


router.get('/watch', async (req, res) => {
  res.redirect('/main'); // Redireciona para a rota /main
});

router.get('/watch/:id', async (req, res) => {
    try {
      const itemId = req.params.id;

      const studios = await executeQuery('SELECT DISTINCT studio FROM pn ORDER BY studio');
  
      const selectedItem = await executeQuery('SELECT * FROM pn WHERE id = ?', [itemId]);
      if (!selectedItem || selectedItem.length === 0) {
        throw new Error('Nenhum item encontrado para o ID fornecido.');
      }

      
      const tagsArray = selectedItem[0].tags.split(',');
      //[1=Title, 2=link video, 3=link img, 4=botao ir main]
      const valor = ['Filmes Idol', 'idol', 'idol', 'idol'];
      console.log(tagsArray)
  
      res.render('teste', { selectedItem: selectedItem[0], tagsArray, valor,studios});
    } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
    }
  });

module.exports = router;
