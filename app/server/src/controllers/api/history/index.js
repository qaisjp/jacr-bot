"use strict";

module.exports = (req, reply) => {
    req.server.db.models.history.find().sort({time: -1}).populate("_person", "username").limit(500).populate("_song", "name").exec(function(err, docs) {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            reply({
                statusCode: 200,
                data: docs
            });
        }
    });
};
