module.exports = (bot, data) => {
    var tacos = [
        "a spicy taco!",
        "a taco filled with questionable meat, I wouldn't touch that.!",
        "a scrumptious taco full of " +
        "meaty goodness, mmmm",
        "a taco full of rainbows and love!"
    ];
    const taco = tacos[Math.floor(Math.random() * tacos.length)];
    const user = data.user.username;
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        if (data.params.length === 1) {
            if (data.params[0].substr(0, 1) === "@") {
                var recipient = data.params[0];
                bot.sendChat("@" + user + " just sent " + recipient + " " + taco);
            } else {
                bot.sendChat("@" + user + " you need to @[username] to send them a taco");
            }
        } else {
            bot.sendChat("@" + user + " you can only send a taco to one person");
        }
    } else {
        bot.sendChat("@" + user + " you didn't select a user. You need to @[username] to send them a taco");
    }
};
