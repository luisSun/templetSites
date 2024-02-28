const express = require('express');
const app = express();

//const middleware = require('./src/middleware/middleware.js');

//const loginRouter = require('./src/routes/loginroute.js');

const PORT = process.env.PORT || 8083;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');
app.use(express.static('F:\\Documentos\\Cursos\\#2024 - Cursos\\JS\\midia'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.render('main');
});

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
