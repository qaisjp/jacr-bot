module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
	port: process.env.OPENSHIFT_NODEJS_PORT || "8347",
	slackUrl: process.env.SLACK_URL || "justachillroom.slack.com",
	slackChannels: process.env.SLACK_CHANNELS || "C0BNC6S4R,C0DGK4HJB,C0A8KBMU7",
	slackMessage: process.env.SLACK_MESSAGE || "Make sure to say hey in #random channel :D",
	slackToken: process.env.SLACK_TOKEN || "xoxp-10291034036-10292039477-10292813365-35fe2f",
	origins: process.env.SITE_ORIGINS || "http://just-a-chill-room.net",
	socialLink: process.env.SOCIAL_LINK || "https://justachillroom.slack.com"
};