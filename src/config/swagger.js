const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Library Management Application',
            version: '1.0.0',
            description: 'This is a library management application',
            contact: {
                name: "API Support",
                url: "https://github.com/elifkizilky",
                email: "elifkizilky@gmail.com"
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server"
            },
        ],
    },
    // Path to the API docs
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
