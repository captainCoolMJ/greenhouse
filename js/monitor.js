const apiEndPoints = {
    weather: 'http://192.168.255.195:8888/api/weather'
}

const util = {
    transformRanges: (num, old_list = [0, 1], new_list = [0, 1]) => {
      var new_num = 0,
          old_min = old_list[0],
          old_max = old_list[1],
          new_min = new_list[0],
          new_max = new_list[1];
      new_num = ( (num - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min;
      if(new_num < new_list[0] && new_num < new_list[1]) {
        return Math.min(new_list[0], new_list[1]);
      } else if(new_num > new_list[1] && new_num > new_list[0]) {
        return Math.max(new_list[1], new_list[0]);
      } else {
        return new_num;
      }
    },
    getHour: dataStr => {
        return (new Date(dataStr)).getUTCHours()
    }
}

const dummyData = {
    "date": "2017-01-30T15:20:00.000Z",
    "sunrise": "2017-01-30T07:40:37.000Z",
    "sunset": "2017-01-30T16:47:55.000Z",
    hours: [
        {
            "time": "2017-01-30T00:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T01:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 80
        },
        {
            "time": "2017-01-30T02:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 80
        },
        {
            "time": "2017-01-30T03:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 90
        },
        {
            "time": "2017-01-30T04:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T05:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T06:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T07:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T08:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T09:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T10:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T11:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T12:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T13:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T14:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T15:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T16:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T17:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T18:00:00.000Z",
            "temp": 261.45,
            "humidity": 79,
            "pop": 30
        },
        {
            "time": "2017-01-30T19:00:00.000Z",
            "temp": 265.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T20:00:00.000Z",
            "temp": 270.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T21:00:00.000Z",
            "temp": 280.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T22:00:00.000Z",
            "temp": 281.41,
            "humidity": 76,
            "pop": 30
        },
        {
            "time": "2017-01-30T23:00:00.000Z",
            "temp": 250.41,
            "humidity": 76,
            "pop": 30
        }
    ]
}

class GreenhouseMonitor {

    constructor(weatherData) {
        this.weatherData = weatherData
        this.internalData = {}
        this.hours = weatherData.hours.map(item => util.getHour(item.time));
        this.tempGraph = {
            draw: node => {
                let internalTemp = []
                if(this.internalData.temperature) {
                    internalTemp = this.internalData.temperature.reduce((prev, current) => {
                        prev.push(current.val)
                        return prev
                    }, [])
                }
                const hoursData = [['Hours', 'Temperature']].concat(weatherData.hours.map((item, index) => {
                    return [
                        this.hours[index],
                        // item.temp,
                        internalTemp[index] || 0
                    ]
                }))
                var data = google.visualization.arrayToDataTable(hoursData);

                var options = {
                    curveType: 'none',
                    legend: { position: 'bottom' }
                };

                var chart = new google.visualization.LineChart(node);

                chart.draw(data, options);
            },
            getValue: pos => {
                if(!this.internalData.temperature) {
                    return {}
                }
                return this.internalData.temperature.find(item => {
                    return Math.round(pos) === item.hour
                })
            },
            updateMark: value => {
                $('#monitor-temp').closest('.item').find('mark').text(value)
            }
        }
        this.sunlightGraph = {
            draw: node => {
                const sunriseHour = util.getHour(weatherData.sunrise)
                const sunsetHour = util.getHour(weatherData.sunset)

                const hoursData = [['Hours', 'Sunlight']].concat(weatherData.hours.map((item, index) => {
                    const hour = this.hours[index]
                    const isSunThere = (hour >= sunriseHour && hour <= sunsetHour) ? 1 : 0
                    return [
                        hour,
                        isSunThere
                    ]
                }))
                var data = google.visualization.arrayToDataTable(hoursData);

                var options = {
                    title: 'Sunlight',
                    curveType: 'none',
                    legend: { position: 'bottom' }
                };

                var chart = new google.visualization.LineChart(node);

                chart.draw(data, options);
            },
            getValue: pos => {
                const sunriseHour = util.getHour(weatherData.sunrise)
                const sunsetHour = util.getHour(weatherData.sunset)
                return (pos >= sunriseHour && pos <= sunsetHour) ? 1 : 0
            },
            updateMark: value => {
                $('#monitor-sunlight').closest('.item').find('mark').text(value ? 'ON' : 'OFF')
            }
        }
        this.waterGraph = { 
            draw: node => {
                const precipitation = weatherData.pop

                const hoursData = [['Hours', 'Raining']].concat(weatherData.hours.map((item, index) => {
                    return [
                        this.hours[index],
                        item.pop >= 80 ? 1 : 0
                    ]
                }))
                var data = google.visualization.arrayToDataTable(hoursData);

                var options = {
                    title: 'Water',
                    curveType: 'none',
                    legend: { position: 'bottom' }
                };

                var chart = new google.visualization.LineChart(node);

                chart.draw(data, options);
            },
            getValue: pos => {
                return weatherData.hours.find(item => {
                    const hour = util.getHour(item.time)
                    return Math.round(pos) === hour
                })
            },
            updateMark: value => {
                $('#monitor-water').closest('.item').find('mark').text(value >= 80 ? 'ON' : 'OFF')
            }
        }
        this.updateMark = percentage => {
            if(!percentage) {
                percentage = $(this.sliderSelector).slider('value')
            }
            let data
            const pos = util.transformRanges(percentage, [0, 100], [0, 23])

            data = this.tempGraph.getValue(pos)
            this.tempGraph.updateMark(data.val)

            data = this.sunlightGraph.getValue(pos)
            this.sunlightGraph.updateMark(data)

            data = this.waterGraph.getValue(pos)
            this.waterGraph.updateMark(data.pop)
        }
        this.slider = {
            init: selector => {
                this.sliderSelector = selector
                const currentHour = util.getHour(weatherData.date)
                const currentPos = util.transformRanges(currentHour, [0, 23], [0, 100])
                this.updateMark(currentPos)
                $(selector).slider({
                    value: currentPos,
                    slide: (event, ui) => {
                        this.slider.onSliderChange(ui.value)
                    }
                });
            },
            onSliderChange: percentage => {
                this.updateMark(percentage)
            }
        }
        this.renderer = {
            temp: () => {
                const $target = $('#monitor-temp')
                $target.children().remove()
                google.charts.setOnLoadCallback(() => {
                    this.tempGraph.draw($target[0])
                });
            },
            sunlight: () => {
                const $target = $('#monitor-sunlight')
                $target.children().remove()
                google.charts.setOnLoadCallback(() => {
                    this.sunlightGraph.draw($target[0])
                });
            },
            water: () => {
                const $target = $('#monitor-water')
                $target.children().remove()
                google.charts.setOnLoadCallback(() => {
                    this.waterGraph.draw($target[0])
                });
            },
            slider: () => {
                this.slider.init('#slider')
            }
        }
    }

    render(parts = []) {
        parts.forEach(item => {
            this.renderer[item]()
        })
    }

    displayInternaldata({ temperature }) {
        temperature = temperature.map(temp => {
            temp.hour = util.getHour(temp.date)
            return temp
        })
        temperature.sort((a, b) => {
            if( a.hour === b.hour ) {
                return 0
            }
            return a.hour < b.hour ? -1 : 1
        })
        this.internalData.temperature = temperature
        this.render(['temp'])
        this.updateMark()
    }

    init() {
        google.charts.load('current', {'packages':['corechart']});
        this.render(['temp', 'sunlight', 'water', 'slider'])
    }
}

(function($) {
    let greenhouseMonitor
    if(dummyData) {
        greenhouseMonitor = new GreenhouseMonitor(dummyData)
        greenhouseMonitor.init()
    } else {
        $.ajax({
            dataType: "json",
            url: apiEndPoints.weather,
            success: data => {
                greenhouseMonitor = new GreenhouseMonitor(data)
                greenhouseMonitor.init()
            }
        })
    }

    var iosocket = io.connect();

    iosocket.on('connect', function () {
        iosocket.on('schedule', function (res) {
            greenhouseMonitor.displayInternaldata(res)
        });
    });
    
}(jQuery))