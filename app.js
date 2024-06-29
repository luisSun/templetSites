const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//COSNT USER
const homeRouter = require('./src/routes/homeRoute');
const admRouter = require('./src/routes/admin.js');

const PORT = process.env.PORT || 8079;

const middleware = require('./src/middleware/middleware.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Viwes EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');

//CSS rota
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public/'));

//Midleware
app.use(middleware.staticMiddleware);
app.use('/media', middleware.mediaMiddleware);
app.use('/pn', middleware.pnMiddleware);
app.use('/pn', middleware.pnmdMiddleware);




//Rotas
app.use('/', homeRouter);
app.use('/', admRouter);

//404
app.use((req, res, next) => {
  res.status(404).render('pag404');
});

//Listen
app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
