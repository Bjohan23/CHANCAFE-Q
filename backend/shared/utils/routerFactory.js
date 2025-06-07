const express = require("express");

function createRouter(routes) {
    const router = express.Router();

    routes.forEach((route) => {
        const { method, path, handler } = route;
        router[method](path, handler);
    });

    return router;
}

module.exports = createRouter;
