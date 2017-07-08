var express = require('express');
var app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
var http = require('https');
var path = require('path');
var server = require('http').Server(app);
var socketio = require('socket.io');

var CronJob = require('cron').CronJob;
var cronInstance = new (require('cron-converter'))();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/css', express.static(path.resolve(__dirname, '..', 'css')))
app.use('/js', express.static(path.resolve(__dirname, '..', 'js')))
app.use('/vendor', express.static(path.resolve(__dirname, '..', 'vendor')))

var apiConfig = {
	baseUrl: "https://69433abe-5db8-462f-bf19-9e96fe3f6334:8EVKVhsBGD@twcservice.eu-gb.mybluemix.net/api/weather/v1/"
};

var port = process.env.PORT || 8888;
var router = express.Router();

// var forecast = {
// 	getHours
// }

var parts = {
	getMatch: function (list, date) {
		for (var prop in list) {
			var setVal = list[prop]

			cronInstance.fromString(prop);
			var timeArr = cronInstance.toArray();
			var dateMatched = [
				date.getMinutes(),
				date.getHours(),
				date.getDate(),
				date.getMonth(),
				date.getDay()
			]

			var matched = true;

			for (var i=0; i<timeArr.length; i++) {
				if (timeArr[i].indexOf(dateMatched[i]) < 0) {
					matched = false;
					break;
				}
			}

			if (matched) {
				return setVal;
			}
		}

		return null
	},
	initialize: function () {
		new CronJob('* * * * * *', function () {
			var date = new Date()

			parts.temperature.schedule.do(date);
			// parts.light.schedule.do(date);
			// parts.water.schedule.do(date);

			// console.log('You will see this message every second');
		}, null, true, 'America/Los_Angeles');
	},
	temperature: {
		value: 0,
		schedule: {
			list: {},
			default: 21,
			do: function (date) {
				var match = parts.getMatch(parts.temperature.schedule.list, date);

				if (match !== null) {
					parts.temperature.set(match);
				} else {
					parts.temperature.set(parts.temperature.schedule.default);
				}
			}
		},
		get: function () {
			return parts.temperature.value;
		},
		set: function (value) {
			if (value !== parts.temperature.get()) {
				console.log('setting temperature to', value);
				parts.temperature.value = value;	
			}
		}
	},
	// water: {
	// 	value: 0,
	// 	schedule: {
	// 		list: {
	// 			'50-55 * * * *': 1000,
	// 			'25-30 * * * *': 1000
	// 		},
	// 		default: 0,
	// 		do: function (date) {
	// 			var match = parts.getMatch(parts.water.schedule.list, date);

	// 			if (match !== null) {
	// 				parts.water.set(match);
	// 			}
	// 		}
	// 	},
	// 	get: function () {
	// 		return parts.water.value;

	// 		// Find current hour
	// 	},
	// 	set: function (value) {
	// 		if (value !== parts.water.get()) {
	// 			parts.water.value = value;
	// 			console.log('setting water to ', value);
	// 			// setTimeout(function () {
	// 			// 	parts.water.value = 0;
	// 			// 	console.log('setting water to ', 0);
	// 			// }, value)
	// 		}
	// 	}
	// },
	// light: {
	// 	value: 0,
	// 	schedule: {
	// 		list: {
	// 			'30-40 * * * *': 1,
	// 			'41-50 * * * *': 0
	// 		},
	// 		default: 0,
	// 		do: function (date) {
	// 			var match = parts.getMatch(parts.light.schedule.list, date);

	// 			if (match !== null) {
	// 				parts.light.set(match);
	// 			}
	// 		}
	// 	},
	// 	get: function () {
	// 		return parts.light.value;
	// 	},
	// 	set: function (value) {
	// 		if (value !== parts.light.get()) {
	// 			console.log('setting light to ', value);
	// 			parts.light.value = value;	
	// 		}
	// 	}
	// }
}

var parser = {
	hour: function (rawJSON) {
		return {
			time: new Date(rawJSON.fcst_valid_local),
			temp: rawJSON.temp,
			humidity: rawJSON.rh,
			pop: rawJSON.pop,
		}
	},
	day: function (rawJSON) {
		return {
			date: "",
			sunrise: "",
			sunset: "",
			hours: rawJSON.forecasts.map(parser.hour),
			meta: {
				"location": {
					name: "",
					country: "",
					id: null
				}
			}
		}
	}
};

var getJSON = function (url) {
	return new Promise(function (resolve, reject) {
		http.get(url, function (res) {
			res.setEncoding('utf8');
			let rawData = '';

		  	res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
			    try {
			      resolve(JSON.parse(rawData))
			    } catch (e) {
					reject(e);
			    }
			});
		})
	})
};

app.get('/', function (req, res) {
  res.sendfile(path.resolve(__dirname, '..', 'monitor.html'));
});

app.get('/configure', function (req, res) {
  res.sendfile(path.resolve(__dirname, '..', 'setup-manual.html'));
});

app.get('/subscribe', function (req, res) {
  res.sendfile(path.resolve(__dirname, '..', 'setup-city.html'));
});

router.route('/locations')
	.get(function (req, res) {
		res.json({
			locations: [
				{
					name: "asdf",
					country: "asdf",
					id: 123
				}
			]
		})
	});

router.route('/:latlong/weather')
	.get(function (req, res) {

		var latlong = req.params.latlong.split(',')

		// var latitude = 51.507;
		// var longitude = -0.128;

		Promise.all([
			getJSON(`${apiConfig.baseUrl}/geocode/${latlong[0]}/${latlong[1]}/forecast/daily/3day.json`),
			getJSON(`${apiConfig.baseUrl}/geocode/${latlong[0]}/${latlong[1]}/forecast/hourly/48hour.json`)
		]).then(function (resArr) {
			var resObj = {}

			var day = resArr[0]

			// var curWeather = resArr[0];


			Object.assign(resObj, parser.day(resArr[1]));

			resObj.date = new Date(day.forecasts[0].fcst_valid_local)
			resObj.sunrise = new Date(day.forecasts[0].sunrise);
			resObj.sunset = new Date(day.forecasts[0].sunset);

			resObj.meta = {};
			resObj.meta.location = {};
			// resObj.meta.location.name = curWeather.name;
			// resObj.meta.location.country = curWeather.sys.country;
			// resObj.meta.location.id = curWeather.id;

			res.json(resObj)
		}).catch(function (e) {
			console.log(e)
		});
	});

router.route('/configure')
	.get(function (req, res) {
		var data = [];

		for (var i=0; i<=23; i++) {
			var date = new Date()

			date.setHours(i);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);

			var val = parts.getMatch(parts.temperature.schedule.list, date)

			if (val === null) {
				data.push({
					date: date,
					val: parts.temperature.schedule.default
				});
			} else {
				data.push({
					date: date,
					val: val
				});
			}
		}

		res.json({
			dates: data
		});
	})
	.post(function (req, res) {
		var body = req.body;

		var tfHour = 0;
		var tfMin = 0;

		var ttHour = 23;
		var ttMin = 59

		var mnRange = 0;
		var hrRange = 0;

		if (body['temp-day-all'] === 'all') {
			body['temp-day-select'] = '*';
		} else if (body['temp-day-select'] && body['temp-day-select'] instanceof Array && body['temp-day-select'].length) {
			body['temp-day-select'] = body['temp-day-select'].join(',');
		} else if (body['temp-day-select']) {
			body['temp-day-select'] = [body['temp-day-select']];
		} else {
			body['temp-day-select'] = '*';
		}

		if (body['temp-time-from']) {
			tfHour = parseInt(body['temp-time-from'].substr(0, 2));
			tfMin = parseInt(body['temp-time-from'].slice(-2));
		}

		if (body['temp-time-to']) {
			ttHour = parseInt(body['temp-time-to'].substr(0, 2));
			ttMin = parseInt(body['temp-time-to'].slice(-2));
		}

		if (ttHour !== tfHour) {
			hrRange = [tfHour, ttHour].join('-');
		} else {
			hrRange = '*';
		}

		if (ttMin !== ttMin) {
			mnRange = [tfMin, ttHour].join('-');
		} else {
			mnRange = '*';
		}

		var str = [mnRange, hrRange, '*', '*', body['temp-day-select']].join(' ');

		parts.temperature.schedule.list = {};
		parts.temperature.schedule.list[[
			mnRange, 
			hrRange, 
			'*', 
			'*', 
			body['temp-day-select']
		].join(' ')] = parseInt(body['temp']);

		res.json({
			success: true
		})
	})

app.use('/api', router);

parts.initialize();
server.listen(port);

var getSchedule = function () {
	var data = [];

	for (var i=0; i<=23; i++) {
		var date = new Date()

		date.setHours(i);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		var val = parts.getMatch(parts.temperature.schedule.list, date)

		if (val === null) {
			data.push({
				date: date,
				val: parts.temperature.schedule.default
			});
		} else {
			data.push({
				date: date,
				val: val
			});
		}
	}

	return data;
}

socketio.listen(server).on('connection', function (socket) {

	socket.on('update', function () {
		socket.broadcast.emit('schedule', {
			temperature: getSchedule()
		});
	})

	socket.emit('schedule', {
		temperature: getSchedule()
	});

});
console.log('Magic happens on port ' + port);