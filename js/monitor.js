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

var greenhouseMonitor = weatherData => {
    this.hours = weatherData.hours.map(item => util.getHour(item.time));

    this.tempGraph = {
        draw: node => {
            const hoursData = [['Hours', 'External']].concat(weatherData.hours.map((item, index) => {
                return [
                    this.hours[index],
                    item.temp
                ]
            }))
            var data = google.visualization.arrayToDataTable(hoursData);

            var options = {
                curveType: 'function',
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

    this.onSliderChange = percentage => {
        
        this.updateMark(percentage)
        
        // const opacity = util.transformRanges(pos, [0, 100], [0, 1])
        // $('body').css('background-color', `rgba(0,0,0,${opacity})`)
    }

    this.updateMark = percentage => {
        let data
        const pos = util.transformRanges(percentage, [0, 100], [0, 23])

        data = this.tempGraph.getValue(pos)
        this.tempGraph.updateMark(data.temp)

        data = this.sunlightGraph.getValue(pos)
        this.sunlightGraph.updateMark(data)

        data = this.waterGraph.getValue(pos)
        this.waterGraph.updateMark(data.pop)
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
            const currentHour = util.getHour(weatherData.date)
            const currentPos = util.transformRanges(currentHour, [0, 23], [0, 100])
            this.updateMark(currentPos)
            $( "#slider" ).slider({
                value: currentPos,
                slide: (event, ui) => {
                    this.onSliderChange(ui.value)
                }
            });
        }
    }
    
    const render = (parts = []) => {
        parts.forEach(item => {
            this.renderer[item]()
        })
    }

    google.charts.load('current', {'packages':['corechart']});
    render(['temp', 'sunlight', 'water', 'slider'])
}

(function($) {
    if(dummyData) {
        greenhouseMonitor(dummyData)
    } else {
        $.ajax({
            dataType: "json",
            url: apiEndPoints.weather,
            success: data => {
                greenhouseMonitor(data)
            }
        })
    }
    
})(jQuery)