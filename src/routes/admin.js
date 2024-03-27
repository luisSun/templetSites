const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');


router.get(['/adm'], async (req, res) => {
  try {
      const limit = 12;
      const page = req.query.page || 1;
      const offset = (page - 1) * limit;

      const selectedItemA = await executeQuery(`SELECT * FROM pn ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);
      const selectedItemI = await executeQuery('SELECT * FROM pn WHERE ativo = "A"');

      const totalItems = await executeQuery('SELECT COUNT(*) AS total FROM pn');
      const totalPages = Math.ceil(totalItems[0].total / limit);

      if (!selectedItemA || selectedItemA.length === 0) {
          throw new Error('Nenhum item encontrado para o ID fornecido.');
      }

      res.render('admin', { selectedItemA: selectedItemA, selectedItemI: selectedItemI, page: page, totalPages: totalPages });
  } catch (error) {
      console.error('Erro ao recuperar dados do item', error);
      res.status(500).send('Erro ao recuperar dados do item');
  }
});


/*
//Rota para Adicionar novo Conteudo
//GET
*/
router.get(['/adm/add'], async (req, res) => {
    try {
        // Assuming selectedItem is defined elsewhere
        res.render('cadastrar');
    } catch (error) {
        console.error('Erro ao recuperar dados do item', error);
        res.status(500).send('Erro ao recuperar dados do item');
    }
});

router.get('/autocompletar', async (req, res) => {
    const studio = req.query.studio;
    const termos = studio.split(',').map(termo => termo.trim());
    const ultimoTermo = termos.pop();
    const query = 'SELECT DISTINCT studio FROM pn WHERE studio LIKE ? LIMIT 5';
    try {
        const results = await executeQuery(query, [`%${ultimoTermo}%`]);
        console.log(results)
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar dados para autocompletar', error);
        res.status(500).json({ error: 'Erro ao buscar dados para autocompletar' });
    }
});


/*
//Rota para Adicionar novo Conteudo
//POST
*/

router.post('/add', async (req, res) => {
  console.log(req.body)
  try {
      const { title, studio, atriz, capa, midia, tipoMidia, tags, ativo } = req.body;
      const midiac = midia + '.' + tipoMidia;
      // Tratamento das tags
      const formattedTags = tags.split(',').map(tag => {
        // Remover espaços em branco antes e depois da tag
        tag = tag.trim();
    
        // Converter a primeira letra de cada palavra para maiúscula
        tag = tag.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    
        return tag;
    }).filter(tag => tag !== '').join(', ');
  
      // Insira os dados no banco de dados
      await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, studio, atriz, capa, midiac, formattedTags, ativo]);
      
      res.redirect('/'); // Redireciona para a página principal após adicionar o item
  } catch (error) {
      console.error('Erro ao adicionar item', error);
      res.status(500).send('Erro ao adicionar item');
  }
});

/*
//Rota para EDITAR Conteudo
//GET
*/

router.post(['/adm/editar'], async (req, res) => {
  const { id, title, atriz, studio, tags, cover, midia, ativo } = req.body;
  console.log(title, atriz, studio, tags, midia, ativo)
  const formattedTags = tags.split(',').map(tag => {
    // Remover espaços em branco antes e depois da tag
    tag = tag.trim();

    // Converter a primeira letra de cada palavra para maiúscula
    tag = tag.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    return tag;
}).filter(tag => tag !== '').join(', ');


  // Insira os dados no banco de dados
  await executeQuery('UPDATE pn SET title = ?, studio = ?, atriz = ?, cover = ?, midia = ?, tags = ?, ativo = ? WHERE id = ?', [title, studio, atriz, cover, midia, formattedTags, ativo, id]);
      // Enviar resposta ao cliente
      res.send('<script>alert("Imagens enviadas com sucesso!"); window.location.href = "/adm";</script>');
});

  module.exports = router;
