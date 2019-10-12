import {
    config, getUrl, weapp,
    cookieStorage,
    connect,
    bindActionCreators,
    store,
    actions,
    sandBox
} from '../../lib/myapp.js'
Component({
    options: {
        addGlobalClass: true,
    },
	properties: {
		end: {
			type: String,
			value : null
		},
		starts: {
			type: String,
			value : null
		},
		index: {
			type: Number,
			value : 0
		},
		findex: {
			type: Number,
			value : 0
		},
		server: {
			type: String,
			value : null
		},
		mold: {
			type: String,
			value : 'goods'
		},
        typename: {
			type: String,
			value: '秒杀'
		}
	},
	data: {
		message: '',
		active: false,
		type: 0,
        endtype:0,
		endTime: {
			interval: '',
			day: 0,
			hour: 0,
			minute: 0,
			second:0,
			count: 0,
		},
		startsTime: {
			interval: '',
			day: 0,
			hour: 0,
			minute: 0,
			second:0,
			count: 0,
		},
		config: ''
	},
	methods: {
//    		活动开始的倒计时
		countTime() {
			var d = 86400000,
				h = 3600000,
				n = 60000,
				end = this.data.end,
				server = this.data.server,
				arr = String(end).split(/\D/),
				newArr = String(server).split(/\D/);
			newArr = newArr.map(Number);
			arr = arr.map(Number);

			var serverTime = new Date(newArr[0], newArr[1] - 1, newArr[2], newArr[3], newArr[4], newArr[5]).getTime();
			var endTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
//		        组件才秒杀列表页使用时，没有重新请求列表，服务器时间应该加上未开始倒计时的时间
			if (this.mold == 'list') {
				this.setData({
					serverTime: serverTime + this.data.startsTime.count
				})
			}

//		        计算开始时间跟结束时间的差值
			var timeDiff = endTime - serverTime;
//		        在本地计算倒计时
			var allTime = this.data.endTime.count + 1000
			this.setData({
				'endTime.count': allTime
			})
			var interval = timeDiff - this.data.endTime.count;

			if (interval < d) {
                this.setData({
                    endtype:1
                })
                if (interval < 0) {
//		        	活动结束
                    this.triggerEvent('end', {findex: this.data.findex, index: this.data.index});
                    clearInterval(this.data.endTime.interval);
// 				this.$emit('end',this.index)
                } else {
                    var day = Math.floor(interval / d);
                    Math.floor(interval -= day * d);
                    var hour = Math.floor(interval / h);
                    Math.floor(interval -= hour * h);
                    var minute = Math.floor(interval / n);
                    var second =Math.floor(interval% n/1000);
                    this.setData({
                        'endTime.day': day,
                        'endTime.hour': hour,
                        'endTime.minute': minute,
                        'endTime.second': second
                    })
                }
			} else {
                var month = arr[1] < 10 ? '0' + arr[1] : arr[1],
                    day = arr[2] < 10 ? '0' + arr[2] : arr[2],
                    time = arr[3] < 10 ? '0' + arr[3] : arr[3],
                    minute = arr[4] < 10 ? '0' + arr[4] : arr[4];
                this.setData({
                    endmessage: `${month} 月 ${day} 日，${time} : ${minute} 结束`
                })
			}

		},
//            活动未开始的倒计时
		countStartsTime() {
			var d = 86400000,
				h = 3600000,
				n = 60000,
				sta = this.data.starts,
				server = this.data.server,
				arr = String(sta).split(/\D/),
				newArr = String(server).split(/\D/);
			newArr = newArr.map(Number);
			arr = arr.map(Number);

			var serverTime = new Date(newArr[0], newArr[1] - 1, newArr[2], newArr[3], newArr[4], newArr[5]).getTime();
			var staTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
			var timeDiff = staTime - serverTime;
			var allTime = this.data.startsTime.count + 1000
			this.setData({
				'startsTime.count': allTime
			})
			var interval = timeDiff - this.data.startsTime.count;

//		        var interval = staTime - nowTime;

//		        时间差小于一天
			if (interval < d) {
				this.setData({
					type: 1
				});
				if (interval < 0) {
//			        	代表活动已经开始了，需要执行活动开始倒计时
					var interval = setInterval(() => {
						this.countTime();
					},1000);
					this.setData({
						active: true,
						'endTime.interval': interval
					})
					this.triggerEvent('starts', {findex: this.data.findex, index: this.data.index})
// 					this.$emit('starts',this.index);
//                        清除掉倒计时,以免重复分发事件
					clearInterval(this.data.startsTime.interval);
				} else {
					var day = Math.floor(interval / d);
					Math.floor(interval -= day * d);
					var hour = Math.floor(interval / h);
					Math.floor(interval -= hour * h);
					var minute = Math.floor(interval / n);
					var second =Math.floor(interval% n/1000);
					this.setData({
						'startsTime.day': day,
						'startsTime.hour': hour,
						'startsTime.minute': minute,
						'startsTime.second': second
					})
				}
			} else {
				var month = arr[1] < 10 ? '0' + arr[1] : arr[1],
					day = arr[2] < 10 ? '0' + arr[2] : arr[2],
                    time = arr[3] < 10 ? '0' + arr[3] : arr[3],
                    minute = arr[4] < 10 ? '0' + arr[4] : arr[4];
				this.setData({
					message: `${month} 月 ${day} 日，${time} : ${minute} 开始`
				})
			}
		},
	},
	ready() {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
		var interval = setInterval(() => {
			this.countStartsTime();
		}, 1000);
		this.setData({
			'startsTime.interval': interval
		})
	}
})