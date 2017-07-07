var CronJob = require('cron').CronJob;
// var gpio = require('gpio')

// var waterLevels = {
// 	curVal: 0,
// 	isEmpty: false,
// 	get: function () {

// 	},
// 	set: function () {
// 		waterLevels.curVal = curVal;

// 		gpio.set(10)
// 	}
// }

new CronJob('0,30 * * * * *', function () {

	// Check levels
	// 	set appropriately

	console.log('You will see this message every 30 seconds');
}, null, true, 'America/Los_Angeles');
