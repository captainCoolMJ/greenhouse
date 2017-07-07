var express = require('express');
var app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
var http = require('https')

var CronJob = require('cron').CronJob;
var cronInstance = new (require('cron-converter'))();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
			parts.light.schedule.do(date);
			parts.water.schedule.do(date);

			// console.log('You will see this message every second');
		}, null, true, 'America/Los_Angeles');
	},
	temperature: {
		value: 0,
		schedule: {
			list: {
				'0-25 * * * *': 40,
				'47 * * * *': 35
			},
			default: 30,
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
				console.log('setting temperature to ', value);
				parts.temperature.value = value;	
			}
		}
	},
	water: {
		value: 0,
		schedule: {
			list: {
				'50-55 * * * *': 1000,
				'25-30 * * * *': 1000
			},
			default: 0,
			do: function (date) {
				var match = parts.getMatch(parts.water.schedule.list, date);

				if (match !== null) {
					parts.water.set(match);
				}
			}
		},
		get: function () {
			return parts.water.value;

			// Find current hour
		},
		set: function (value) {
			if (value !== parts.water.get()) {
				parts.water.value = value;
				console.log('setting water to ', value);
				// setTimeout(function () {
				// 	parts.water.value = 0;
				// 	console.log('setting water to ', 0);
				// }, value)
			}
		}
	},
	light: {
		value: 0,
		schedule: {
			list: {
				'30-40 * * * *': 1,
				'41-50 * * * *': 0
			},
			default: 0,
			do: function (date) {
				var match = parts.getMatch(parts.light.schedule.list, date);

				if (match !== null) {
					parts.light.set(match);
				}
			}
		},
		get: function () {
			return parts.light.value;
		},
		set: function (value) {
			if (value !== parts.light.get()) {
				console.log('setting light to ', value);
				parts.light.value = value;	
			}
		}
	}
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
	.post(function (req, res) {

		var body = req.body;

		if (body['day-all'] === 'all') {
			body['day-select'] = '*';
		} else if (body['day-select'] && body['day-select'].length) {
			body['day-select'] = body['day-select'].join(',');
		} else {
			body['day-select'] = '*';
		}

		// date.getMinutes(),
		// 		date.getHours(),
		// 		date.getDate(),
		// 		date.getMonth(),
		// 		date.getDay()

		var str = ['*', '*', '*', '*', body['day-select']].join(' ');

		parts.temperature.schedule.list[str] = 100;

		res.json({
			success: true
		})
	})

app.use('/api', router);

parts.initialize();
app.listen(port);
console.log('Magic happens on port ' + port);