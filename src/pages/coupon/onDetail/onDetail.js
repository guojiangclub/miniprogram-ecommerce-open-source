import {config,sandBox,pageLogin,getUrl,cookieStorage} from '../../../lib/myapp.js';

Page({
	data: {
		detail: '',
		is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
		init: false
	},
	onLoad(e) {
		var id = e.id;
		this.queryCouponDetail(id);
	},
	// 查询优惠券详情
	queryCouponDetail(id) {
		wx.showLoading({
			title: "加载中",
			mask: true
		});

		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/coupon/' + id,
			header: {
				Authorization: token
			}

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        detail: res.data,
	                    init: true
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false
                })
            }
			wx.hideLoading()
		}).catch(rej => {
			wx.hideLoading()
			wx.showModal({
				content: '请求失败',
				showCancel: false
			})
		})
	}
})