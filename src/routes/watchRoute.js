const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');

router.get(['/'], async (req, res) => {
  try {

    const id = req.params.id; // Corrigido para req.params.id

    const selectedItem = await executeQuery('SELECT * FROM pn WHERE id = 19');
    console.log(selectedItem)

  
    res.render('main', { selectedItem: selectedItem[0]});
  } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
  }
});

router.get(['/jav/assistir/:id'], async (req, res) => {
  try {

    const id = req.params.id; // Corrigido para req.params.id

    const selectedItem = await executeQuery('SELECT * FROM pn WHERE id = ?',[id]);
    console.log(selectedItem)

  
    res.render('teste', { selectedItem: selectedItem});
  } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
  }
});


module.exports = router;

