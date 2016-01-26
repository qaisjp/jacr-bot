module.exports = function(bot, data) {
    var text = data.params.join(" ");
    text = text.replace(/-+/g, "").replace(/\s+/g, " ").trim();
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        bot.db.models.song.aggregate([
            {
                $match: {
                    $text: {
                        $search: text
                    }
                }
            }, {
                $sort: {
                    score: {
                        $meta: "textScore"
                    }
                }
            }, {
                $project: {
                    score: {
                        $meta: "textScore"
                    },
                    name: 1,
                    plays: 1
                }
            }, {
                $match: {
                    score: {
                        $gt: 0.7
                    }
                }
            }, {
                $limit: 1
            }
        ]).exec(function(err, doc) {
            if (err) {
                bot.sendChat(bot.identifier + "leaf me alone, I has an error");
                bot.log("error", "MONGO", err);
            } else {
                if (doc[0]) {
                    bot.sendChat(bot.identifier + doc[0].name + " has been played " + doc[0].plays + " times before");
                } else {
                    bot.sendChat(bot.identifier + "way to go sailor, that song hasn't been played before");
                }
            }
        });
    } else {
        bot.sendChat(bot.identifier + "aw shucks, you didn't include a search query");
    }
};