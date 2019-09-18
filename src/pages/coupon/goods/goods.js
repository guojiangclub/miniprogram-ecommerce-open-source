import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		storeList: []
	},
	onLoad(e) {
		this.queryGoodsList(e.id);
	},

	// 请求商品列表
	queryGoodsList(id) {
		var token = cookieStorage.get('user_token') || '';
		wx.showLoading({
			title: "加载中",
			mask: true
		});
		sandBox.get({
			api: 'api/store/list/' + id + '/coupon',
			header: {
				Authorization: token
			}
		}).then(res => {
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status && res.data.length) {
					this.setData({
						storeList: res.data
					})
				} else {
					wx.redirectTo({
						url: '/pages/store/list/list'
					})
					/*wx.showModal({
						content: res.message || '请求失败',
						showCancel: false
					})*/
				}
			} else {
				wx.redirectTo({
					url: '/pages/store/list/list'
				})
				/*wx.showModal({
					content: res.message || '请求失败',
					showCancel: false
				})*/
			}
			wx.hideLoading();
		}).catch(rej => {
			wx.hideLoading();
			wx.redirectTo({
				url: '/pages/store/list/list'
			})
			/*wx.showModal({
				content: res.message || '请求失败',
				showCancel: false
			})*/
		})
	},
	jump(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/store/detail/detail?id=' + id
		})
	},
})