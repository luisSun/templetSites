const express = require('express');
const app = express();
const path = require('path');

const homeRouter = require('./src/routes/homeRoute');
const watchRouter = require('./src/routes/watchRoute.js');

const middleware = require('./src/middleware/middleware.js');

//const loginRouter = require('./src/routes/loginroute.js');

const PORT = process.env.PORT || 8083;

app.use(express.static(path.join(__dirname, 'public')));



app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');

app.use(express.static(__dirname + '/public/'));

app.use(middleware.staticMiddleware);
app.use('/media', middleware.mediaMiddleware);
app.use('/pn', middleware.pnMiddleware);

app.use('/', homeRouter);
//app.use('/watch', watchRouter);

app.use((req, res, next) => {
  res.status(404).render('pag404');
});


app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
