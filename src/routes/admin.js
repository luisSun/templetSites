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

      const results = await executeQuery('SELECT DISTINCT tags FROM pn');
      let allTags = results.map(result => result.tags).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
      const uniqueTags = Array.from(new Set(allTags));

      const resultStudio = await executeQuery('SELECT DISTINCT studio FROM pn');
      const uniqueStudios = resultStudio.map(item => item.studio); // Extract 'studio' property

      const resultTitle = await executeQuery('SELECT DISTINCT title FROM pn');
      const uniqresultTitle = resultTitle.map(item => item.title); // Extract 'studio' property
      //console.log(uniqresultTitle)

      const resultAtriz = await executeQuery('SELECT DISTINCT atriz FROM pn');
      const uniqueAtriz = resultAtriz.map(item => item.atriz);


      if (!selectedItemA || selectedItemA.length === 0) {
          throw new Error('Nenhum item encontrado para o ID fornecido.');
      }

      res.render('editarcad', { selectedItemA: selectedItemA, selectedItemI: selectedItemI, page: page, totalPages: totalPages, uniqueTags:uniqueTags, uniqueStudios:uniqueStudios, uniqueAtriz:uniqueAtriz, uniqresultTitle:uniqresultTitle });
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
        const results = await executeQuery('SELECT DISTINCT tags FROM pn');
        let allTags = results.map(result => result.tags).join(',').split(/[;,:]/).map(tag => tag.trim()).filter(tag => tag !== '');
        const uniqueTags = Array.from(new Set(allTags));

        const resultStudio = await executeQuery('SELECT DISTINCT studio FROM pn');
        const uniqueStudios = resultStudio.map(item => item.studio); // Extract 'studio' property

        const resultAtriz = await executeQuery('SELECT DISTINCT atriz FROM pn');
        const uniqueAtriz = resultAtriz.map(item => item.atriz);

        res.status(200).render('cadastrar', {uniqueTags: uniqueTags, uniqueStudios:uniqueStudios, uniqueAtriz: uniqueAtriz});
        
    } catch (error) {
        console.error('Erro ao recuperar dados do item', error);
        res.status(500).send('Erro ao recuperar dados do item');
    }
});




/*
//Rota para Adicionar novo Conteudo
//POST
*/

router.post('/add', async (req, res) => {
  //console.log(req.body)
  try {
      const { title, studio, atriz, capa, midia, tipoMidia, tags, ativo } = req.body;
      const midiac = midia + '.' + tipoMidia;
      // Tratamento das tags
      const formattedTags = tags.split(',').map(tag => {
        // Remover espaços em branco antes e depois da tag
        tag = tag.trim();
        
        // Remover todos os espaços em branco da tag
        tag = tag.replace(/\s+/g, '');
      
        // Converter a primeira letra de cada palavra para minúscula
        tag = tag.toLowerCase();
        
        return tag;
      }).filter(tag => tag !== '').join(',');

    const formattedatriz = atriz.split(',').map(name => {
      // Remover espaços em branco antes e depois do nome
      name = name.trim();
  
      // Converter a primeira letra de cada palavra para maiúscula
      name = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  
      return name;
      }).filter(name => name !== '').join(',');

      const formattedStudio = studio.split(',').map(name => {
        // Remover espaços em branco antes e depois do nome
        name = name.trim();
    
        // Converter a primeira letra de cada palavra para maiúscula
        name = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    
        return name;
        }).filter(name => name !== '').join(',');
        console.log(formattedStudio)
  
      // Insira os dados no banco de dados
      await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, formattedStudio, formattedatriz, capa, midiac, formattedTags, ativo]);
      
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
  const { id, title, atriz, studio, tags, cover, midia, tmidia, ativo } = req.body;
  const formattedTags = tags.split(',').map(tag => {
    // Remover espaços em branco antes e depois da tag
    tag = tag.trim();
    
    // Remover todos os espaços em branco da tag
    tag = tag.replace(/\s+/g, '');
  
    // Converter a primeira letra de cada palavra para minúscula
    tag = tag.toLowerCase();
    
    return tag;
  }).filter(tag => tag !== '').join(',');

  // Insira os dados no banco de dados
  await executeQuery('UPDATE pn SET title = ?, studio = ?, atriz = ?, cover = ?, midia = ?, tags = ?, ativo = ? WHERE id = ?', [title, studio, atriz, cover, midia, formattedTags, ativo, id]);
      // Enviar resposta ao cliente
      res.send('<script>alert("Imagens enviadas com sucesso!"); window.location.href = "/adm";</script>');
});

router.post(['/adm/editartag'], async (req, res) => {
  const { id, tags } = req.body;
  const formattedTags = tags.split(',').map(tag => {
    // Remover espaços em branco antes e depois da tag
    tag = tag.trim();
    
    // Remover todos os espaços em branco da tag
    tag = tag.replace(/\s+/g, '');
  
    // Converter a primeira letra de cada palavra para minúscula
    tag = tag.toLowerCase();
    
    return tag;
  }).filter(tag => tag !== '').join(',');

  // Insira os dados no banco de dados
      await executeQuery('UPDATE pn SET tags = ? WHERE id = ?', [formattedTags, id]);
      // Enviar resposta ao cliente
      res.send('<script>alert("Imagens enviadas com sucesso!"); window.location.href = "/adm";</script>');
});


module.exports = router;
