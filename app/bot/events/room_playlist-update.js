module.exports = function (bot) {
	bot.on("room_playlist-update", function (data) {
		bot.sendMotd();
		if (bot.started) {
			if (typeof (data.media.fkid) !== "undefined") {
				bot.db.models.song.findOne({
					fkid: data.media.fkid
				}, function (err, song) {
					if (err) {
						bot.log("error", "BOT", err);
					} else {
						var skip = function (msg) {
							bot.moderateSkip(function () {
								bot.sendChat(bot.identifier + msg);
							});
						};
						if (!song) {
							var doc = {
								name: data.media.name,
								fkid: data.media.fkid
							};
							song = new bot.db.models.song(doc);
						}
						if (song.op) {
							bot.moderateSkip(function () {
								setTimeout(function () {
									skip("song has been recently flagged as forbidden. you can view the op/forbidden list here: http://just-a-chill-room.net/op-forbidden-list/");
								}, 3000);
							});
						} else if (song.forbidden) {
							bot.moderateSkip(function () {
								setTimeout(function () {
									skip("song has been recently flagged as forbidden. you can view the op/forbidden list here: http://just-a-chill-room.net/op-forbidden-list/");
								}, 3000);
							});
						} else if (song.nsfw) {
							bot.moderateSkip(function () {
								setTimeout(function () {
									skip("song has been recently flagged as NSFW");
								}, 3000);
							});
						} else if (song.unavailable) {
							bot.moderateSkip(function () {
								setTimeout(function () {
									skip("song has been recently flagged as unavailable for all users. please pick another song");
								}, 3000);
							});
						}
						song.plays++;
						song.lastPlay = new Date();
						song.save(function () {
							bot.db.models.person.findOne({
								uid: data.user.id
							}, function (err, person) {
								if (err) {
									bot.log("error", "BOT", err);
								} else {
									if (!person) {
										var doc = {
											uid: data.user.id
										};
										person = new bot.db.models.person(doc);
									}
									var moderator = {
										isMod: false
									};
									if (bot.isMod(data.user)) {
										moderator["type"] = "mod";
										moderator["isMod"] = true;
									} else if (bot.isManager(data.user)) {
										moderator["type"] = "manager";
										moderator["isMod"] = true;
									} else if (bot.isOwner(data.user)) {
										moderator["type"] = "co-owner";
										moderator["isMod"] = true;
									}
									if (moderator.isMod) {
										person.rank.name = moderator.type;
										person.rank.rid = data.user.role;
									}
									person.username = data.user.username;
									person.dubs = data.user.dubs;
									person.save(function () {
										bot.db.models.history.create({
											_song: song._id,
											_person: person._id
										}, function (err) {
											if (err) {
												bot.log("error", "BOT", err);
											}
										});
									});
								}
							});
						});
					}
				});
			}
		} else {
			bot.started = true;
		}

		var date = new Date();
		//for the off chance that the bot is started for the first time during a period where it needs to track emojis
		//need to set a time out to make sure the settings in bot.sendMotd() has been created.
		setTimeout(function () {
			//checks to see if it's within the first hour of the day
			if (date.getUTCHours() === 0) {
				bot.db.models.settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						bot.log("error", "BOT", err);
					}
					if (!doc.emoji.paused) {
						var emojis = [];
						bot.emojis.forEach(function (emoji, index, arr) {
							bot.db.models.emojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									bot.log("error", "BOT", err);
								}
								if (doc) {
									var count = {
										emojiName: emoji,
										count: doc.count
									};
									emojis.push(count);
									doc.count = 0;
									doc.save();
								}
							});
							if (index === arr.length - 1) {
								setTimeout(function () {
									bot.db.models.emojiTrackDays.create({
										emojis: emojis
									}, function (err) {
										if (err) {
											bot.log("error", "BOT", err);
										}

									});
								}, 5000);
							}
						});
						doc.emoji.paused = true;
						doc.save();
					}
				});

				bot.db.models.chat.find({}).sort({
					time: -1
				}).skip(100).remove().exec(function (err) {
					if (err) {
						bot.log("error", "BOT", err);
					}
				});
			} else {
				bot.db.models.settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						bot.log("error", "BOT", err);
					}
					if (doc.emoji.paused) {
						doc.emoji.paused = false;
						doc.save();
					}
				});
			}
		}, 5000);
	});
};
