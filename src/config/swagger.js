const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const definition = {
    openapi: "3.0.0",
    info: {
        title: "API Port Russel",
        version: "1.0.0",
        description: "Documentation de l'API (Catways, Reservations, User, Auth)",
    },
    servers: [
        { url: "http://localhost:3000", description: "Local server" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    username: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                },
            },
            Catway: {
                type: "object",
                properties: {
                    catwayNumber: { type: "number" },
                    catwayType: { type: "string", enum: ["long", "short"] },
                    catwayState: { type: "string" },
                },
            },
            Reservation: {
                type: "object",
                properties: {
                    catwayNumber: { type: "number" },
                    clientName: { type: "string" },
                    boatName: { type: "string" },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                },
            },
        },
    },
};

module.exports = swaggerJSDoc({
    definition,
    apis: [
        path.join(__dirname, "../routes/*.js"),
        path.join(__dirname, "../services/*.js"),
        path.join(__dirname, "../models/*.js"),
    ],
});
