/**
 * LE app.js reste le plus simple possible.
 * On initialise ici la connexion à MongoDB.
 * On utilise le package CORS installé précédemment en acceptant toutes les origines et en exposant le header "Authorization"
 * (pour récupérer lr token d'authentification côté client)
 * On déclare notre route principale avec pour url de base "/".
 * On ajoute un retour en cas de requête sur une route inexistante (404)
 */
require('dotenv').config({
    path: './src/config/env/.env'
});
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');



const indexRouter = require('./routes/index');
const mongodb = require('./config/db/mongo');

const path = require('path');

mongodb.initClientDbConnection();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
    exposedHeaders: ['Authorization'],
    origin: '*'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authView = require('./middlewares/auth-view');

app.use(authView.injectUserIfAny);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);

app.use(function (req, res, next) {
    res.status(404).json({ name: 'API', version: '1.0', status: 404, message: 'not_found' });
});

module.exports = app;
