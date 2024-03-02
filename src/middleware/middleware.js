// middleware.js
const express = require('express');

const staticMiddleware = express.static(__dirname + '/public/');

const mediaMiddleware = express.static('F:\\Documentos\\Cursos\\#2024 - Cursos\\JS\\midia', {
  setHeaders: (res, path) => {
    if (path.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t');
    } else if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.wmv')) {
        res.setHeader('Content-Type', 'video/x-ms-wmv');
    }
  }
});

const pnMiddleware = express.static('F:\\movies\\pn', {
  setHeaders: (res, path) => {
    if (path.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t');
    } else if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.wmv')) {
        res.setHeader('Content-Type', 'video/x-ms-wmv');
    }
  }
});

const pnmdMiddleware = express.static('F:\\movies\\pn\\midia', {
  setHeaders: (res, path) => {
    if (path.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t');
    } else if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.wmv')) {
        res.setHeader('Content-Type', 'video/x-ms-wmv');
    }
  }
});


module.exports = {
  staticMiddleware,
  mediaMiddleware,
  pnMiddleware,
  pnmdMiddleware
  // ... Add other middleware functions as needed ...
};
