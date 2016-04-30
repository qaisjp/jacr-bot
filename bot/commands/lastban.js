module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    //if the user has name in the bot.devs array, or their role is one from bot.rank
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        bot.db.models.bans.find().sort({
            time: -1
        }).limit(1).populate("_person").exec((err, doc) => {
            if (err) {
                bot.log("error", "BOT", err);
            } else {
                if (doc) {
                    doc = doc[0];
                    bot.sendChat(bot.identifier + "username: " + doc._person.username + ", id: " + doc._person.uid + ", banned by: " + doc._person.ban.by + ", ban count: " + doc._person.ban.count);
                } else {
                    bot.sendChat(bot.identifier + "no ban history");
                }
            }
        });
    }
};