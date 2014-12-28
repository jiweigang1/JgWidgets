{
	"chart" : {
		"backgroundColor" : "#ffffff",
		"width" : 375,
		"height" : 247,
		"plotBackgroundColor" : "#ffffff",
		"plotBorderColor" : "#575757",
		"plotBorderWidth" : 1,
		"spacingTop" : 15,
		"spacingBottom" : 10,
		"spacingLeft" : 0,
		"spacingRight" : 10,
		"type" : "area"
	},
	"legend" : {
		"align" : "center",
		"verticalAlign" : "bottom"
	},
	"series" : [{
			"name" : "192.168.1.5",
			"type" : "area",
			"color" : "#5a4099",
			"data" : [{
					"x" : 1397664000000,
					"y" : 21.578,
					"tooltip" : "{\"title\":\"04-17 00:00--04-19 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"21.578\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"62144\"}]}"
				}, {
					"x" : 1398182400000,
					"y" : 14.82,
					"tooltip" : "{\"title\":\"04-23 00:00--04-25 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"14.82\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"42681\"}]}"
				}, {
					"x" : 1399737600000,
					"y" : 0.0020,
					"tooltip" : "{\"title\":\"05-11 00:00--05-13 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.0020\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"6\"}]}"
				}, {
					"x" : 1400083200000,
					"y" : 0.0020,
					"tooltip" : "{\"title\":\"05-15 00:00--05-17 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.0020\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"6\"}]}"
				}, {
					"x" : 1400947200000,
					"y" : 0.245,
					"tooltip" : "{\"title\":\"05-25 00:00--05-27 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.245\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"705\"}]}"
				}, {
					"x" : 1401120000000,
					"y" : 0.021,
					"tooltip" : "{\"title\":\"05-27 00:00--05-29 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.021\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"61\"}]}"
				}, {
					"x" : 1402502400000,
					"y" : 3.14,
					"tooltip" : "{\"title\":\"06-12 00:00--06-14 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"3.14\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"9043\"}]}"
				}
			],
			"params" : "{\"hostId\":3}",
			"marker" : {
				"symbol" : "circle",
				"radius" : 4
			}
		}, {
			"name" : "www.baidu.com",
			"type" : "area",
			"color" : "#77a22f",
			"data" : [{
					"x" : 1399910400000,
					"y" : 1.942,
					"tooltip" : "{\"title\":\"05-13 00:00--05-15 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"1.942\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"5593\"}]}"
				}, {
					"x" : 1400083200000,
					"y" : 0.0010,
					"tooltip" : "{\"title\":\"05-15 00:00--05-17 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.0010\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"2\"}]}"
				}, {
					"x" : 1401120000000,
					"y" : 0.0080,
					"tooltip" : "{\"title\":\"05-27 00:00--05-29 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.0080\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"23\"}]}"
				}, {
					"x" : 1402502400000,
					"y" : 1.914,
					"tooltip" : "{\"title\":\"06-12 00:00--06-14 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"1.914\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"5513\"}]}"
				}
			],
			"params" : "{\"hostId\":21}",
			"marker" : {
				"symbol" : "circle",
				"radius" : 4
			}
		}, {
			"name" : "img.adbox.sina.com.cn",
			"type" : "area",
			"color" : "#00a88f",
			"data" : [{
					"x" : 1398182400000,
					"y" : 0.049,
					"tooltip" : "{\"title\":\"04-23 00:00--04-25 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.049\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"140\"}]}"
				}, {
					"x" : 1400947200000,
					"y" : 0.47,
					"tooltip" : "{\"title\":\"05-25 00:00--05-27 00:00\",\"data\":[{\"title\":\"吞吐率\",\"value\":\"0.47\",\"unit\":\"rpm\"},{\"title\":\"访问量\",\"value\":\"1355\"}]}"
				}
			],
			"params" : "{\"hostId\":1}",
			"marker" : {
				"symbol" : "circle",
				"radius" : 4
			}
		}
	],
	"xAxis" : [{
			"dateTimeLabelFormats" : {
				"millisecond" : "%m-%d<br>%H:%M",
				"second" : "%m-%d<br>%H:%M",
				"minute" : "%m-%d<br>%H:%M",
				"hour" : "%m-%d<br>%H:%M",
				"day" : "%m-%d<br>%H:%M",
				"week" : "%m-%d<br>%H:%M",
				"month" : "%m-%d<br>%H:%M",
				"year" : "%m-%d<br>%H:%M"
			},
			"gridLineColor" : "#c0c0c0",
			"gridLineDashStyle" : "ShortDot",
			"gridLineWidth" : 1,
			"labels" : {
				"color" : "#000000"
			},
			"tickColor" : "#000000",
			"title" : {
				"style" : {
					"color" : "#000000"
				},
				"text" : null
			},
			"type" : "datetime"
		}
	],
	"yAxis" : [{
			"gridLineColor" : "#c0c0c0",
			"gridLineDashStyle" : "ShortDot",
			"gridLineWidth" : 1,
			"labels" : {
				"color" : "#000000"
			},
			"min" : 0.0,
			"tickColor" : "#000000",
			"title" : {
				"style" : {
					"color" : "#000000"
				},
				"text" : null
			},
			"tickUnit" : "rpm"
		}
	],
	"aggregateValue" : 1.88
}
