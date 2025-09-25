const express = require('express');
const router = express.Router();
const executeQuery = require('../db/db');
const multer  = require('multer')
const path = require('path');
//const upload = multer({ dest: 'C:\\Users\\Fernando\\Desktop\\Dump' })
// Função para formatar os nomes como desejado
function formatName(name) {
  return name.split(',').map(part => part.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).filter(part => part !== '').join(',');
}

function getMimeType(file) {
  return file.mimetype.split('/')[1]; // Pega a parte após a barra
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'F:\\movies\\pn'); // Diretório base onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    const { title, studio, atriz } = req.body;
    const formattedTitle = title.trim().replace(/\s+/g, '_');
    const formattedStudio = formatName(studio).split(',')[0]; // Pega apenas a primeira parte antes da vírgula
    const formattedAtriz = formatName(atriz).split(',')[0]; // Pega apenas a primeira parte antes da vírgula
    const fileExt = path.extname(file.originalname);
    const fileName = `${formattedStudio}-${formattedTitle}-${formattedAtriz}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });


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



router.get(['/lista'], async (req, res) => {
  try {
      const selectedItemI = await executeQuery('SELECT * FROM pn WHERE ativo = "A"');

      res.render('lista', { selectedItemI: selectedItemI});
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

router.post('/add', upload.single('avatar'), async (req, res) => {
  //console.log(req.body)
  try {
      const { title, studio, atriz, capa, midia, tipoMidia, tags, ativo } = req.body;
      const midiac = req.file.filename;
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

      // Verifica se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).send('Arquivo não enviado');
      }else{
        console.log(`${req.file.filename} enviado!`);
      }

 
      // Insira os dados no banco de dados
      await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, formattedStudio, formattedatriz, capa, midiac, formattedTags, ativo]);
      
      res.redirect('/'); // Redireciona para a página principal após adicionar o item
  } catch (error) {
      console.error('Erro ao adicionar item', error);
      res.status(500).send('Erro ao adicionar item');
  }
});

router.post('/add-json', async (req, res) => {
  try {
    const { title, studio, atriz, capa, avatar, tags, ativo } = req.body;
    const midiac = avatar; // pegar a URL/base64 do JSON

    // Formata tags, studio e atriz igual antes
    const formattedTags = tags.split(',').map(tag => tag.trim().replace(/\s+/g, '').toLowerCase()).filter(Boolean).join(',');
    const formattedAtriz = atriz.split(',').map(name => name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).filter(Boolean).join(',');
    const formattedStudio = studio.split(',').map(name => name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).filter(Boolean).join(',');

    // Inserção no banco
    await executeQuery('INSERT INTO pn (title, studio, atriz, cover, midia, tags, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, formattedStudio, formattedAtriz, capa, midiac, formattedTags, ativo]);

    res.status(200).json({ message: 'Item adicionado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar item' });
  }
});

/*
//Rota para EDITAR Conteudo
//GET


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
*/

router.post(['/adm/editar'], upload.single('avatar'), async (req, res) => {
  try {
    const { id, title, atriz, studio, tags, cover, midia, ativo } = req.body;

    // Se houver upload de arquivo, use o filename, senão mantenha midia enviado
    const midiac = req.file ? req.file.filename : midia;

    const fields = [];
    const values = [];

    if (title) { fields.push('title = ?'); values.push(title); }

    if (studio) {
      const formattedStudio = studio.split(',').map(name => name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).filter(Boolean).join(',');
      fields.push('studio = ?'); values.push(formattedStudio);
    }

    if (atriz) {
      const formattedAtriz = atriz.split(',').map(name => name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).filter(Boolean).join(',');
      fields.push('atriz = ?'); values.push(formattedAtriz);
    }

    if (tags) {
      const formattedTags = tags.split(',').map(tag => tag.trim().replace(/\s+/g, '').toLowerCase()).filter(Boolean).join(',');
      fields.push('tags = ?'); values.push(formattedTags);
    }

    if (cover) { fields.push('cover = ?'); values.push(cover); }
    if (midiac) { fields.push('midia = ?'); values.push(midiac); }
    if (ativo) { fields.push('ativo = ?'); values.push(ativo); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const query = `UPDATE pn SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await executeQuery(query, values);

    res.send('<script>alert("Item atualizado com sucesso!"); window.location.href = "/adm";</script>');
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).send('Erro ao atualizar item');
  }
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
      res.send('<script>alert("Imagens enviadas com sucesso!"); window.location.href = document.referrer;</script>');
});

router.post(['/adm/editartitle'], async (req, res) => {
  const { id, title } = req.body;

  console.log("Título recebido:", title);
  
  // Garante que title é uma string válida ou define um valor padrão
  let formattedTitle = title ? String(title).trim() : "";
  
  // Só processa o título se ele não estiver vazio
  if (formattedTitle) {
      // Remove espaços duplos apenas se existirem
      if (/\s{2,}/.test(formattedTitle)) {
          formattedTitle = formattedTitle.replace(/\s+/g, ' '); // Remove espaços extras
      }
  
      // Remove caracteres especiais apenas se existirem
      if (/[$'"/\\]/.test(formattedTitle)) {
          formattedTitle = formattedTitle.replace(/[$'"/\\]/g, ''); // Remove caracteres especiais problemáticos
      }
  
      // Capitaliza a primeira letra de cada palavra
      formattedTitle = formattedTitle.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
  
  console.log("Título formatado:", formattedTitle);
  

  // Insira os dados no banco de dados
      await executeQuery('UPDATE pn SET title = ? WHERE id = ?', [formattedTitle, id]);
      // Enviar resposta ao cliente
      res.send('<script>alert("Imagens enviadas com sucesso!"); window.location.href = document.referrer;</script>');


});

module.exports = router;
