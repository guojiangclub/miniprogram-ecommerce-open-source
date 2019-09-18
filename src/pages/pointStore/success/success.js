import {
    sandBox,
    cookieStorage,
} from '../../../lib/myapp.js'
Page({

    data: {
        isOK: null,
        order_info: {},
        order_no: "",
        config: ''
    },
    onLoad(e){
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
        console.log(e);
        var data = {
            order_no : e.order_no
        }
        this.setData({
            order_no : e.order_no
        })
        this.queryPaymentStatus(data);
    },
    jumpStore(){
        wx.redirectTo({
            url: '/pages/pointStore/index/index'
        })
    },
    jumpOrder(){
        wx.redirectTo({
            url: '/pages/pointStore/orderdetail/orderdetail?no=' + this.data.order_no
        })
    },
    queryPaymentStatus(data){
        var oauth = cookieStorage.get('user_token')

        sandBox.post({
            api: `api/shopping/order/paid`,
            header: {Authorization: oauth},
            data: data

        }).then(res =>{
            res = res.data

            if (res.status) {
                this.setData({
                    isOK : !!(res && res.status && res.data.order.pay_status == 1)
                })
                if (this.data.isOK) {
                    this.setData({
                        order_info :{
                            pointTotal: res.data.pointInfo.pointTotal,  // 当前积分
                            pointUsed: res.data.pointInfo.pointUsed     // 消耗积分
                        }
                    })
                }

            } else {
                wx.showModal({
                    content: res.message || '兑换失败',
                    showCancel: false
                })
                this.setData({
                    isOK: false
                })
            }
        })
    },

})