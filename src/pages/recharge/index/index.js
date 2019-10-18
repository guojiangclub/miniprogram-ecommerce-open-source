const app = getApp();

import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data:{
        num:'',
        schemes:[],
        user:"",
        token:"",
        channel:'wx_lite',
        initInfo: ''
    },
    onLoad(e){
        app.init();
        setTimeout(() => {
            const initInfo = cookieStorage.get('init');
            if (initInfo.vip_plan_status) {
                wx.setNavigationBarTitle({
                    title: '加入助力首百VIP'
                })
			}
            this.setData({
                initInfo: initInfo
            })
		}, 1000)

        pageLogin(getUrl(),(token)=>{
            this.setData({
                'token':token
            });
            this.querySchemes();
            this.queryUserInfo(token);
            this.queryUserSum(token);
        });

    },
    queryUserSum(token){
         // 获取用户余额
        sandBox.get({
            api:'api/users/balance/sum',
            header:{
                Authorization:token
            }
        }).then(res=>{
            if(res.statusCode==200){
                this.setData({
                    num:res.data.data.sum
                })
            }
            else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
        })
    },
    getOpenid() {
        return new Promise((resolve,reject)=>{
            wx.login({
                success:(res)=>{

                    sandBox.post({
                        api:`api/v2/oauth/miniprogram/openid`,
                        data: {
                            code: res.code
                        }

                    }).then((res)=>{
                        res = res.data
                        resolve(res.data.openid)
                    }).catch(()=>{
                        reject('获取openid失败')
                    })
                },
                fail:()=>{
                    wx.showModal({
                        title:"接口请求失败"
                    })
                }
            })
        })
    },
    querySchemes(){
        sandBox.get({
            api:'api/users/balance/schemes',

        }).then(res=>{
            if(res.statusCode==200){
                this.setData({
                    schemes:res.data.data
                })
                // this.schemes=res.data.data;
            }
            else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
        })
    },
    queryUserInfo(token){
        sandBox.get({
            api:'api/me',
            header:{
                Authorization:token
            }
        }).then(res=>{
            if(res.statusCode==200){
                this.setData({
                    user:res.data.data
                })
            }
            else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
        })
    },
	urlPath(url){
		// console.log()
		let data={};
		let query=url.slice(url.indexOf("?")+1);
		query=query.split("&");
		query.forEach((val)=>{
			data[val.slice(0,val.indexOf("="))]=val.slice(val.indexOf("=")+1);
		});
		// console.log(query);
		return data;
	},

	submitPay(e) {
		wx.showLoading();

		this.getOpenid().then(res => {
			var oauth = cookieStorage.get('user_token');
			var data = {
				amount:e.currentTarget.dataset.amount,
				pay_amount:e.currentTarget.dataset.payment,
				channel:this.data.channel,
				openid:res,
				recharge_rule_id:e.currentTarget.dataset.id
			};

			sandBox.post({
				api:`api/users/balance/charge`,
				data:data,
				header:{
					Authorization:oauth
				}
			}).then((res) =>{
				res = res.data;
				if (res.status) {
					if (res.data.name == 'pingxx') {
                        wx.showModal({
                            content: '不支持pxx支付',
                            showCancel: false
                        })
					} else {
						this.newcharge(true, res.data.charge)
					}

				} else {
					this.newcharge(false, res.message)
				}
			}).catch((rej)=>{
                this.newcharge(false)
			})

		}).catch(()=>{
			this.setData({
				loading: false
			})
			wx.showModal({
				content: '支付失败',
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
								url: `/pages/recharge/success/success?order_no=${charge.order_no}`
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
							wx.switchTab({
								url: `/pages/user/personal/personal`
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
})