require('dotenv').config({ path: './src/config/env/.env' });

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');

const mongodb = require('./config/db/mongo');
mongodb.initClientDbConnection();

const app = express();

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares globaux
app.use(cors({ exposedHeaders: ['Authorization'], origin: '*' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// methodOverride AVANT les routes (important pour EJS forms)
app.use(methodOverride('_method'));

// Auth view (inject user if any)
const authView = require('./middlewares/auth-view');
app.use(authView.injectUserIfAny);

// Layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Routes WEB
const webRouter = require('./routes/web/index');
app.use('/', webRouter);

// Routes API
app.use('/users', require('./routes/api/users'));
app.use('/catways', require('./routes/api/catways'));
app.use('/reservations', require('./routes/api/reservations'));
app.use('/catways/:catwayNumber/reservations', require('./routes/api/reservations'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 (si tu veux différencier web/api plus tard, on pourra améliorer)
app.use((req, res) => {
    res.status(404).json({ name: 'API', version: '1.0', status: 404, message: 'not_found' });
});

module.exports = app;
