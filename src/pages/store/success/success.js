import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		info: {},
		order_no: '',
		isOK: true,
        charge_id: ''
	},
	onLoad(e) {
		this.setData({
			order_no: e.order_no,
			amount:e.amount,
            charge_id: e.charge_id
		});
		pageLogin(getUrl(), () => {
			this.queryOrderType(e.order_no);
		});
		wx.showLoading();
	},
	jump() {
        wx.redirectTo({
            url: '/pages/order/detail/detail?no=' + this.data.order_no
        })
	},
	queryOrderType(no) {
		var token = cookieStorage.get('user_token');
		sandBox.post({
			api: 'api/shopping/order/paid',
			header: {
				Authorization: token
			},
			data: {
				order_no: no,
				amount: this.data.amount,
                charge_id: this.data.charge_id
			},

		}).then(res =>{
            if (res.statusCode == 200) {
	            wx.hideLoading();
                res = res.data;

                if (res && res.status && res.data.order.pay_status) {
                    this.setData({
                        info: res.data
                    })
                } else {
                    this.setData({
                        isOK: false
                    })
                    wx.showModal({
                        content: res.message || "订单支付失败",
                        showCancel: false,
	                    success: res => {
		                    if (res.confirm) {
			                    wx.redirectTo({
				                    url: '/pages/user/personal/personal'
			                    })
		                    }
	                    }
                    })
                }
            } else {
	            wx.hideLoading()
                this.setData({
                    isOK: false
                })
                wx.showModal({
                    content: "订单支付失败",
                    showCancel: false,
	                success: res => {
                    	if (res.confirm) {
                    		wx.redirectTo({
			                    url: '/pages/user/personal/personal'
		                    })
	                    }
	                }
                })
            }
		}).catch(rej => {
			wx.hideLoading()
			this.setData({
				isOK: false
			})
			wx.showModal({
				content: "订单支付失败",
				showCancel: false,
				success: res => {
					if (res.confirm) {
						wx.redirectTo({
							url: '/pages/user/personal/personal'
						})
					}
				}
			})
		})
	}
})