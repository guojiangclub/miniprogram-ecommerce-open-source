var app = getApp();
import {config, is, sandBox, cookieStorage} from '../../../lib/myapp.js'
Page({

	data: {
		order: {},
		order_no: '',
		channel: 'wx_lite',
		amount: 0,
		loading: false,
		inputBalance: '',
		balance: '',
		paybalance: {
			balance: 0,
			inputBalance: 0
		},
		countMoney: '',
		config: '',
        report: true,
		formId: '',
		init: false
	},

	onLoad(e){
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
		this.setData({
				order_no: e.order_no,
				loading: false
			})
	},
	onShow(){
		this.queryUserSum();
	},
	jumpOrderDetail() {
        wx.redirectTo({
            url: `/pages/order/detail/detail?no=${this.data.order_no}`
        })
	},
	modifyBalance(e) {
		var val = e.detail.value;
		var min = 0;
		var balance = this.paybalance(val);
		var max = (balance.balance / 100).toFixed(2);
		if (!val) {
			val = ''
		} else if (/\S*$/.test(val)) {
			val = val.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
		}
		if (Number(val) < min) {
			val = min
		} else if (Number(val) > max) {
			val = max
		}
		this.setData({
			inputBalance: val
		})
		this.paybalance(val);
		this.countMoney();
		return val
	},
	useAll() {
		var balance = this.paybalance(this.data.order.total / 100);
		this.setData({
			inputBalance: (balance.balance / 100).toFixed(2)
		});
		this.countMoney();
	},
	cancel() {
		this.setData({
			inputBalance: '',
			channel: 'wx_lite'
		});
		this.countMoney();
	},
	paybalance(val) {
		var total = this.data.order.total;
		var balance = Math.min(this.data.balance, total);
		var inputBalance = val;
		/*if ((inputBalance * 100) == balance && balance != 0) {
			this.setData({
				channel: 'balance'
			})
		} else {
			this.setData({
				channel: 'wx_lite'
			})
		}*/
		var data = {
			balance,
			inputBalance
		}
		this.setData({
			paybalance: data
		})
		return data
	},
	queryOrderDetail (order_no) {
		var oauth = cookieStorage.get('user_token')

		sandBox.get({
			api: `api/order/${order_no}`,
			header: {Authorization: oauth},
		}).then(res => {
			if (res.statusCode == 200) {
                res = res.data;
				if (res.status) {
                    cookieStorage.set('service_retreat', res.data)

                    this.setData({
                        order: res.data,
                        init: true
                    });
                    this.paybalance(0);
				} else {
                    wx.showModal({
                        content: res.message || '获取订单数据失败',
                        showCancel: false
                    })
				}

                wx.hideLoading()
			} else {
                wx.showModal({
                    content: '获取订单数据失败',
                    showCancel: false
                })
                wx.hideLoading()
			}

		}).catch(rej => {
            wx.hideLoading()
			wx.showModal({
				content: '获取订单数据失败',
				showCancel: false
			})
		})
	},

	// 新版支付
	newcharge(success, charge) {
		if (success) {
			var that = this;

			if (charge.pay_scene == 'test') {
				wx.showModal({
					content: '不支持模拟支付',
					showCancel: false
				})
				this.setData({
					loading: false
				})
			} else {
				wx.requestPayment({
					"timeStamp": charge.wechat.timeStamp,
					"nonceStr": charge.wechat.nonceStr,
					"package": charge.wechat.package,
					"signType": charge.wechat.signType,
					"paySign": charge.wechat.paySign,
					success: res => {
						if (res.errMsg == 'requestPayment:ok') {
							this.setData({
								loading: false
							});
							wx.redirectTo({
								url: `/pages/store/success/success?order_no=${that.data.order_no}&amount=${that.data.amount}&channel=${that.data.channel}&formId=${this.data.formId}`
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
			}
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

	// 纯余额支付
	balanceCharge() {
		this.setData({
			loading: false
		})
        console.log('id=', this.data.formId);
        wx.redirectTo({
			url: `/pages/store/success/success?order_no=${this.data.order_no}&amount=${this.data.amount}&channel=${this.data.channel}&formId=${this.data.formId}`
		})
	},
	// 查询用户余额信息
	queryUserSum() {
		var oauth = cookieStorage.get('user_token');
		wx.showLoading({
			title: '加载中',
			mask: true
		})
		sandBox.get({
			api: 'api/users/balance/sum',
            header: {Authorization: oauth},
		}).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        balance: res.data.sum
                    })
                    this.queryOrderDetail(this.data.order_no);
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.hideLoading()
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
		})
	},
	getOpenid() {
		return new Promise((resolve, reject) => {
			wx.login({
				success: (res) => {

					sandBox.post({
                        api:`api/v2/oauth/miniprogram/openid`,
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
    formSubmit(e) {
        if (this.data.loading) return;

		this.setData({
			loading: true
		})
		var oauth = cookieStorage.get('user_token');

		this.getOpenid().then((res) => {
			var data = {
				channel: this.data.channel,
				openid: res,
				order_no: this.data.order_no,
				balance: Number(this.data.inputBalance)
			};
            if(cookieStorage.get('agent_code')) {
                data.agent_code=cookieStorage.get('agent_code')
            }
			sandBox.post({
				api: `api/shopping/order/charge`,
				data: data,
				header: {
					Authorization: oauth
				}
			}).then((res) => {
				res = res.data;
				if (res.status) {
                    this.setData({
                        formId: e.detail.formId || ''
                    })
					if (res.data.name == 'pingxx') {
						wx.showModal({
                            content: '不支持pingxx支付！',
                            showCancel: false
						})
					} else if (res.data.name == 'balance') {
						this.balanceCharge()
					} else {
						this.newcharge(true, res.data.charge)
					}
				} else {
					this.newcharge(false, res.message)
				}
			}).catch((rej) => {
                this.newcharge(false)
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
	countMoney() {
		this.setData({
			countMoney: (this.data.order.total / 100 - this.data.inputBalance).toFixed(2)
		})
	}
})