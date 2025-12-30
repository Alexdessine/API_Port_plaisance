require('dotenv').config({ path: './src/config/env/.env' });

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const mongodb = require('./config/db/mongo');
mongodb.initClientDbConnection();

const app = express();

/* ------------------ Swagger JSON ------------------ */
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ------------------ Middlewares globaux ------------------ */
app.use(logger('dev'));
app.use(cors({ origin: '*', exposedHeaders: ['Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* IMPORTANT : methodOverride AVANT les routes web (formulaires) */
app.use(methodOverride('_method'));

/* ------------------ Auth view (inject user) ------------------ */
const authView = require('./middlewares/auth-view');
app.use(authView.injectUserIfAny);

/* ------------------ Web (EJS) ------------------ */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout');

/* Sécurité: éviter "title is not defined" */
app.use((req, res, next) => {
    res.locals.title = res.locals.title || 'API Port Russell';
    next();
});

/* Routes WEB */
const webHomeRouter = require('./routes/web/index');
const webDashboardRouter = require('./routes/web/dashboard');
const webAuthRouter = require('./routes/web/auth');
const webUsersRouter = require('./routes/web/users');
const webCatwaysRouter = require('./routes/web/catways');
const webReservationsRouter = require('./routes/web/reservations');

app.use('/auth', webAuthRouter);
app.use('/', webHomeRouter);
app.use('/dashboard', webDashboardRouter);
app.use('/users', webUsersRouter);
app.use('/catways', webCatwaysRouter);
app.use('/reservations', webReservationsRouter);
app.use('/catways/:catwayNumber/reservations', webReservationsRouter);

/* ------------------ API (JSON) ------------------ */
/* Monte l’API sous /api pour éviter les collisions avec le web */
const usersRouter = require('./routes/api/users');
const catwaysRouter = require('./routes/api/catways');
const reservationsRouter = require('./routes/api/reservations');
const authRouter = require('./routes/api/auth'); // si tu l'as bien séparé

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/catways', catwaysRouter);

/* Si ton reservationsRouter est fait pour mergeParams + catwayNumber */
app.use('/api/catways/:catwayNumber/reservations', reservationsRouter);

/* Si tu veux aussi une liste globale */
app.use('/api/reservations', reservationsRouter);

/* ------------------ 404 ------------------ */
app.use((req, res) => {
    // Si c'est une route API => JSON, sinon une page web simple (au choix)
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
        return res.status(404).json({ name: 'API', version: '1.0', status: 404, message: 'not_found' });
    }
    return res.status(404).render('index', {
        title: 'Accueil',
        isAuthenticated: res.locals.isAuthenticated || false,
        user: res.locals.user || null,
        error: 'Page introuvable',
    });
});

module.exports = app;
