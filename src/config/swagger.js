const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Port Russel",
        version: "1.0.0",
        description: "Documentation de l'API (Catways, Reservations, User, Auth)",
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

const options = {
    swaggerDefinition,
    apis: [
        "./routes/*.js",
        "./services/*js",
        "./models/*.js",
    ],
};

module.exports = swaggerJSDoc(options);