var app = getApp();
import {config, is, sandBox, pingpp, cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		order: {},
		order_no: '',
		amount: 0,
		loading: false,
		inputBalance: '',
		balance: '',
		paybalance: {
			balance: 0,
			inputBalance: 0
		},
	},
	onLoad(e){
		if (e.order_no) {
			this.setData({
				order_no: e.order_no
			})
		} else {
			wx.showModal({
				content: '非法进入',
				showCancel: false
			})
		}
	},
	onShow(){
		this.queryOrderDetail(this.data.order_no);
	},
	// 获取订单详情
	queryOrderDetail (order_no) {
		var oauth = cookieStorage.get('user_token')

		sandBox.get({
			api: 'api/order/' + order_no,
			header: {Authorization: oauth},
		}).then(res => {
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status) {
                    this.setData({
                        order: res.data
                    });
				} else {
                    wx.showModal({
                        content: res.message || '获取订单数据失败',
                        showCancel: false
                    })
				}
			} else {
                wx.showModal({
                    content: '获取订单数据失败',
                    showCancel: false
                })
			}

		}).catch(rej => {
			wx.showModal({
				content: '获取订单数据失败',
				showCancel: false
			})
		})
	},

    // 获取openid
    getOpenid() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    sandBox.get({
                        api: 'api/oauth/miniprogram/openid',
                        data: {
                            code: res.code
                        }

                    }).then((res) => {
                        res = res.data
                        resolve(res.data.openid)
                    }).catch(() => {
                        reject('获取openid失败')
                    })
                },
                fail: () => {
                    wx.showModal({
                        content: "接口请求失败",
                        showCancel: false
                    })
                }
            })
        })
    },


	pay() {
		this.setData({
			loading: true
		})
		var oauth = cookieStorage.get('user_token');

		this.getOpenid().then((res) => {
			var data = {
				openid: res,
				order_no: this.data.order_no
			};
			sandBox.post({
				api: `api/shopping/order/charge`,
				data: data,
				header: {
					Authorization: oauth
				}
			}).then((res) => {
				res = res.data;
				if (res.status) {
                    this.charge(true, res.data.charge)
				} else {
					this.charge(false, res.message)
				}
			}).catch((rej) => {
				this.charge(false)
			})
		}).catch(() => {
			this.setData({
				loading: false
			})
			wx.showModal({
				content: '支付失败',
				showCancel: false
			})
		})
	},

    // 支付
    charge(success, charge) {
        if (success) {
            var that = this;
            wx.requestPayment({
                "timeStamp": charge.credential.wechat.timeStamp,
                "nonceStr": charge.credential.wechat.nonceStr,
                "package": charge.credential.wechat.package,
                "signType": charge.credential.wechat.signType,
                "paySign": charge.credential.wechat.paySign,
                success: res => {
                    if (res.errMsg == 'requestPayment:ok') {
                        this.setData({
                            loading: false
                        });
                        wx.redirectTo({
                            url: `/pages/store/success/success?order_no=${that.data.order_no}&amount=${that.data.amount}&charge_id=${charge.charge_id}`
                        })

                    } else {
                        wx.showModal({
                            content: '调用支付失败！',
                            showCancel: false
                        })
                    }
                },
                fail: err => {
                    this.setData({
                        loading: false
                    })
                    console.log(err);
                    if (err.errMsg == 'requestPayment:fail cancel') {
                        wx.redirectTo({
                            url: `/pages/order/detail/detail?no=${that.data.order_no}`
                        })
                    } else {
                        wx.showModal({
                            content: '调用支付失败！',
                            showCancel: false
                        })
                    }
                }
            })

        } else {
            this.setData({
                loading: false
            })
            wx.showModal({
                content: charge || '请求支付失败，请重试！',
                showCancel: false
            })
        }
    },


})