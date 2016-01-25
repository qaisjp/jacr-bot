"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/badge-social");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/badge-social.svg",
        handler: controller
    });
};