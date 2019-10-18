import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        user:'',
        amount:''

    },
    onLoad(e){
        pageLogin(getUrl(),(token)=>{
            this.queryUserInfo(token);
        })
    },
    changeAmount(e){
        var money= e.detail.value;
        if (!money) {
            money = ''
        } else if (/\S*$/.test(money)) {
            money = money.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
        }
        this.setData({
            amount: money
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
    //获取openid
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
    soonPay(){
        var message='';
        if(this.data.amount == ''){
            message = '请您输入免单金额'
            wx.showModal({
                content:message,
                showCancel:false
            })
        } else {
            //请求接口
            this.submitPay();

        }
    },
    //请求免单支付接口
    submitPay() {
        wx.showLoading({
            title:'加载中'
        });

        this.getOpenid().then(res => {
            var token = cookieStorage.get('user_token');
            var data = {
                amount:this.data.amount*100,
                channel:'wx_lite',
                openid:res
            };

            sandBox.post({
                api:`api/users/balance/charge/amount`,
                data:data,
                header:{
                    Authorization:token
                }
            }).then((res) =>{
                res = res.data;
                if (res.status) {
                    this.newcharge(true, res.data.charge)
                } else {
                    this.newcharge(false, res.message)
                }
            }).catch((rej)=>{
                wx.showModal({
                    content:'请求支付失败，请重试！'
                })
            })

        }).catch(()=>{
            wx.hideLoading();
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
                wx.hideLoading();
            } else {
                wx.requestPayment({
                    "timeStamp": charge.wechat.timeStamp,
                    "nonceStr": charge.wechat.nonceStr,
                    "package": charge.wechat.package,
                    "signType": charge.wechat.signType,
                    "paySign": charge.wechat.paySign,
                    success: res => {
                        if (res.errMsg == 'requestPayment:ok') {
                            wx.hideLoading();
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
                        wx.hideLoading();
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
            wx.hideLoading();
            wx.showModal({
                content: charge || '请求支付失败，请重试！',
                showCancel: false
            })
        }
    },
})