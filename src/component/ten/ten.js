Component({
	properties: {
		show: {
			type: Boolean,
			observer: '_change'
		},
		num: {
			type: Number,
			value: 10
		}
	},
	data: {
		interval: '',
		lodNum: ''
	},
	methods: {
		close() {
			this.setData({
				num: this.data.lodNum,
				show: false
			})
			clearInterval(this.data.interval);
			this.triggerEvent('endTen');
		},
		_change(newVal, oldVal) {
			// if (newVal) {
			// 	var interval = setInterval(() => {
			// 		var num = this.data.num;
			// 		num--
			// 		this.setData({
			// 			num: num
			// 		});
			// 		if (this.data.num == 0) {
			// 			this.close()
			// 		}
			// 	}, 1000);
			// 	this.setData({
			// 		interval: interval
			// 	})
			// }
		}
	},
	ready() {
		this.setData({
			lodNum: this.data.num
		})
	}
})
