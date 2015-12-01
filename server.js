var restify = require('restify'),
	request = require('request'),
	config = require('./config'),
	pkg = require('./package.json');

require('./bot/index.js');

var server = restify.createServer({
	name: 'Betabot Server',
	version: pkg.version
});
server.use(restify.CORS({
	origins: [config.origins]
}));
server.use(restify.fullResponse());
server.use(restify.bodyParser({
	mapParams: false
}));
server.use(restify.gzipResponse());
server.listen(config.port, config.ipaddress, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('%s: %s Server started on http://%s:%s', Date(Date.now()), server.name, host, port);
});
server.get('/', function (req, res, next) {
	res.json({
		code: "online",
		message: "Betabot API Server Online. Don't ask me if the Bot is though D:",
		version: pkg.version
	});
	return next();
});
server.post('/invite', function (req, res, next) {
	if (req.body.email) {
		request.post({
			url: 'https://' + config.slackUrl + '/api/users.admin.invite',
			form: {
				email: req.body.email,
				channels: config.slackChannels,
				token: config.slackToken,
				extra_message: config.slackMessage,
				set_active: true,
				_attempts: 1
			}
		}, function (err, httpResponse, body) {
			if (err) {
				res.json({
					code: "something_wrong",
					message: err
				});
			}
			body = JSON.parse(body);
			if (body.ok) {
				res.json({
					code: "invite_sent",
					message: "invite has been sent to: " + req.body.email
				})
			} else {
				if (body.error === "already_invited") {
					res.json({
						code: "already_invited",
						message: "already invited you silly sausage!"
					});
				} else if (body.error === "invalid_email") {
					res.json({
						code: "invalid_email",
						message: "invalid email entered you silly sausage!"
					});
				} else if (body.error === "already_in_team") {
					res.json({
						code: "already_in_team",
						message: "already in the team you silly sausage!"
					})
				} else {
					res.json({
						code: "slack_error",
						message: body.error
					})
				}
			}
		});
	} else {
		res.json({
			code: "email_required",
			message: "no email entered you silly sausage!"
		});
	}
	return next();
});

server.get('/users', function (req, res, next) {
	request.post({
		url: 'https://' + config.slackUrl + '/api/users.list',
		form: {
			token: config.slackToken,
			presence: 1
		}
	}, function (err, httpResponse, body) {
		if (err) {
			res.json({
				code: "something_wrong",
				message: err
			});
		}
		body = JSON.parse(body);
		if (body.ok) {
			users = body.members;
			users = users.filter(function (x) {
				return !x.is_bot && !x.deleted;
			});
			var total = users.length;
			users = users.filter(function (x) {
				return x.presence === "active";
			});
			var online = users.length;
			res.json({
				code: "ok",
				users: {
					total: total,
					online: online
				}
			});
		}
	});
});

server.get('/badge.svg', function (req, res, next) {
	request.post({
		url: 'https://' + config.slackUrl + '/api/users.list',
		form: {
			token: config.slackToken,
			presence: 1
		}
	}, function (err, httpResponse, body) {
		if (err) {
			res.json({
				code: "something_wrong",
				message: err
			});
		}
		body = JSON.parse(body);
		if (body.ok) {
			users = body.members;
			users = users.filter(function (x) {
				return !x.is_bot && !x.deleted;
			});
			var total = users.length;
			users = users.filter(function (x) {
				return x.presence === "active";
			});
			var online = users.length;
			request.get('https://img.shields.io/badge/Slack-' + online + '%2F' + total + '-E01563.svg', function (err, httpResonse, body) {
				if (err) {
					res.json({
						code: "something_wrong",
						message: err
					});
				}
				res.writeHead('200', {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'max-age=0, no-cache'
				});
				res.write(body);
				res.end();
				next();
			});
		}
	});
});

server.get('/badge-social.svg', function (req, res, next) {
	request.post({
		url: 'https://' + config.slackUrl + '/api/users.list',
		form: {
			token: config.slackToken,
			presence: 1
		}
	}, function (err, httpResponse, body) {
		if (err) {
			res.json({
				code: "something_wrong",
				message: err
			});
		}
		body = JSON.parse(body);
		if (body.ok) {
			users = body.members;
			users = users.filter(function (x) {
				return !x.is_bot && !x.deleted;
			});
			var total = users.length;
			users = users.filter(function (x) {
				return x.presence === "active";
			});
			var online = users.length;
			request.get('https://img.shields.io/badge/Slack-' + online + '%2F' + total + '-E01563.svg?style=social&link=' + config.socialLink + '&link=' + config.socialLink + '&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8%2BPHN2ZyB3aWR0aD0iMTE4cHgiIGhlaWdodD0iMTE4cHgiIHZpZXdCb3g9IjAgMCAxMTggMTE4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4gICAgICAgIDx0aXRsZT5Hcm91cDwvdGl0bGU%2BICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZGVmcz48L2RlZnM%2BICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHNrZXRjaDp0eXBlPSJNU1BhZ2UiPiAgICAgICAgPGcgaWQ9IkFydGJvYXJkLTEiIHNrZXRjaDp0eXBlPSJNU0FydGJvYXJkR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00Mi4wMDAwMDAsIC00Ny4wMDAwMDApIj4gICAgICAgICAgICA8ZyBpZD0iR3JvdXAiIHNrZXRjaDp0eXBlPSJNU0xheWVyR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQyLjAwMDAwMCwgNDguMDAwMDAwKSI%2BICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMC4yNTgsNjEuODU5IEM1Ljg2Myw2MS44OTIgMi4xNCw1OS4yNzMgMC43NjgsNTUuMTg2IEMwLjcxNSw1NS4wMjcgMC42NjksNTQuODcyIDAuNjI1LDU0LjcyIEMtMC44NzEsNDkuNDg0IDIuMDMsNDQuMDA4IDcuMjMsNDIuMjU1IEw5MC42MTMsMTQuMzIgQzkxLjYyNywxNC4wMjkgOTIuNjQ4LDEzLjg4MSA5My42NTksMTMuODc0IEM5OC4xNywxMy44MzggMTAxLjk5NiwxNi41MTUgMTAzLjQwMywyMC42OSBMMTAzLjUyNywyMS4wOTMgQzEwNS4wODYsMjYuNTQ1IDEwMS4yMTEsMzEuNDEzIDk2LjU2OCwzMi45NzMgQzk2LjU2NCwzMi45NzUgOTUuNzIxLDMzLjI2MiAxMy42NDYsNjEuMjgyIEMxMi41MzUsNjEuNjU4IDExLjM5Niw2MS44NDkgMTAuMjU4LDYxLjg1OSIgaWQ9IkZpbGwtOSIgZmlsbD0iIzcwQ0FEQiIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjQuMTU3LDEwMi44NjcgQzE5LjcyOSwxMDIuODk5IDE1Ljk5MiwxMDAuMzE3IDE0LjYzNiw5Ni4yODkgQzE0LjU4Niw5Ni4xMzQgMTQuNTM3LDk1Ljk3OSAxNC40OTQsOTUuODI1IEMxMi45NzcsOTAuNTI3IDE1Ljg3NCw4NC45OTQgMjEuMDksODMuMjM3IEwxMDQuNDc4LDU1LjA0NSBDMTA1LjU1NCw1NC42ODYgMTA2LjY2Nyw1NC41IDEwNy43ODUsNTQuNDkxIEMxMTIuMjI3LDU0LjQ1NyAxMTYuMTI5LDU3LjE3IDExNy41MDYsNjEuMjQ1IEwxMTcuNjM0LDYxLjY3IEMxMTguNDM4LDY0LjQ4NCAxMTcuOTYzLDY3LjY1MSAxMTYuMzYzLDcwLjE0OCBDMTE1LjE2OCw3Mi4wMDcgMTExLjQwNCw3My42NDIgMTExLjQwNCw3My42NDIgTDI3LjY5OCwxMDIuMjYxIEMyNi41MzMsMTAyLjY1MSAyNS4zNDMsMTAyLjg1NiAyNC4xNTcsMTAyLjg2NyIgaWQ9IkZpbGwtMTYiIGZpbGw9IiNFMDE3NjUiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTkzLjU3MiwxMDMuMDQzIEM4OS4xMjUsMTAzLjA3OSA4NS4xODYsMTAwLjI3MiA4My43Nyw5Ni4wNjcgTDU1Ljk0LDEzLjQwMiBMNTUuODAxLDEyLjkzNyBDNTQuMjk0LDcuNjY3IDU3LjE5MiwyLjE2OCA2Mi4zOTEsMC40MTUgQzYzLjQzLDAuMDY1IDY0LjUwNiwtMC4xMTggNjUuNTg4LC0wLjEyNyBDNjcuMTk2LC0wLjEzOSA2OC43NTIsMC4yMjMgNzAuMjE3LDAuOTQ3IEM3Mi42NjcsMi4xNjcgNzQuNSw0LjI2NyA3NS4zNzUsNi44NiBMMTAzLjIwMyw4OS41MTggTDEwMy4yODQsODkuNzgzIEMxMDQuODQ2LDk1LjI1NiAxMDEuOTUzLDEwMC43NTkgOTYuNzU2LDEwMi41MDkgQzk1LjcyNSwxMDIuODU0IDk0LjY1MywxMDMuMDM1IDkzLjU3MiwxMDMuMDQzIiBpZD0iRmlsbC0xNyIgZmlsbD0iI0U4QTcyMyIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNTIuMjA1LDExNi45NjkgQzQ3Ljc1OCwxMTcuMDAzIDQzLjgxNiwxMTQuMTk3IDQyLjM5OCwxMDkuOTg2IEwxNC41NzUsMjcuMzIzIEMxNC41MjcsMjcuMTcgMTQuNDgsMjcuMDIgMTQuNDM1LDI2Ljg2MyBDMTIuOTMxLDIxLjU5MyAxNS44MjEsMTYuMDkzIDIxLjAxOCwxNC4zNCBDMjIuMDUzLDEzLjk5NSAyMy4xMjQsMTMuODE0IDI0LjIwNSwxMy44MDUgQzI4LjY1MiwxMy43NzEgMzIuNTkyLDE2LjU3NyAzNC4wMSwyMC43ODQgTDYxLjgzNCwxMDMuNDQ5IEM2MS44ODYsMTAzLjU5NSA2MS45MzMsMTAzLjc1MyA2MS45NzUsMTAzLjkwNiBDNjMuNDgyLDEwOS4xNzkgNjAuNTksMTE0LjY4MiA1NS4zODYsMTE2LjQzNSBDNTQuMzUzLDExNi43OCA1My4yODQsMTE2Ljk2IDUyLjIwNSwxMTYuOTY5IiBpZD0iRmlsbC0xOCIgZmlsbD0iIzNFQjg5MCIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNzkuODUyLDg0LjQyOSBMOTkuMjU3LDc3Ljc5NCBMOTIuOTE0LDU4Ljk1NSBMNzMuNDg2LDY1LjUyMiBMNzkuODUyLDg0LjQyOSIgaWQ9IkZpbGwtMTkiIGZpbGw9IiNDQzFGMjciIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPjwvcGF0aD4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTM4LjU0OSw5OC41NTEgTDU3Ljk1Miw5MS45MTcgTDUxLjU2Miw3Mi45MzUgTDMyLjEzOCw3OS41MDIgTDM4LjU0OSw5OC41NTEiIGlkPSJGaWxsLTIwIiBmaWxsPSIjMzYxMjM4IiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj48L3BhdGg%2BICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik02Ni4wMzcsNDMuMzk2IEM3NC43NjIsNDAuNDE4IDgwLjk5NCwzOC4yOSA4NS40NDQsMzYuNzcxIEw3OS4xNzYsMTguMTUxIEw1OS43MzIsMjQuNjY1IEw2Ni4wMzcsNDMuMzk2IiBpZD0iRmlsbC0yMSIgZmlsbD0iIzY1ODYzQSIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCI%2BPC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjQuNzMsNTcuNDk4IEMzMS44OTEsNTUuMDU0IDM4LjMzNCw1Mi44NTQgNDQuMTM3LDUwLjg3MyBMMzcuNzkxLDMyLjAxNyBMMTguMzQ4LDM4LjUzIEwyNC43Myw1Ny40OTgiIGlkPSJGaWxsLTIyIiBmaWxsPSIjMUE5MzdEIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj48L3BhdGg%2BICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICA8L2c%2BPC9zdmc%2B', function (err, httpResonse, body) {
				if (err) {
					res.json({
						code: "something_wrong",
						message: err
					});
				}
				res.writeHead('200', {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'max-age=0, no-cache'
				});
				res.write(body);
				res.end();
				next();
			});
		}
	});
});