import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		isOK: true,
		text: '',
		amount: 0,
		sum: 0
	},
	onLoad(e) {
        wx.showLoading();
		pageLogin(getUrl(), () => {
            setTimeout(() => {
                this.queryBalanceStatus(e.order_no);
            }, 500)
		})
	},
	jump() {
		wx.redirectTo({
			url: '/pages/recharge/balance/balance'
		})
	},
	queryBalanceStatus(order_no) {
		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/users/balance/paid',
            header: {
                Authorization: token
            },
            data: {
                order_no: order_no
            }
		}).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    isOK: Boolean(res && res.data && res.data.order.pay_status)
                })
                if (this.data.isOK) {
                    this.setData({
                        amount: res.data.order.amount,
                        sum: res.data.sum
                    })

                    if (res.data.order.recharge) {
                        this.setData({
                            text: res.data.order.recharge.title
                        })
                    }
                } else {
                    this.setData({
                        isOK: false
                    })
                    wx.showModal({
                        content: res.message || "充值失败",
                        showCancel: false,
                        success: res => {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/recharge/balance/balance'
                                })
                            }
                        }
                    })
                }
                wx.hideLoading()
            } else {
                wx.hideLoading()
                this.setData({
                    isOK: false
                })
                wx.showModal({
                    title: '',
                    content: "充值失败",
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            wx.redirectTo({
                                url: '/pages/recharge/balance/balance'
                            })
                        }
                    }
                })
            }
		})
	}

})