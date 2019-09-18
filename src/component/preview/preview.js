Component({
	properties: {
		show: {
			type: Boolean,
			value: false
		},
		list: {
			type: Array,
			value: []
		}
	},
	methods: {
		clone() {
			this.setData({
				show: false
			})
			this.triggerEvent('clone');
		},
		jump(e) {
			var id = e.currentTarget.dataset.id
			wx.navigateTo({
				url:`/pages/store/detail/detail?id=${id}`
			});
			this.triggerEvent('clone');
		},
		go() {
			wx.navigateTo({
				url:"/pages/store/list/list"
			});
			this.triggerEvent('clone');
		}
	}
})