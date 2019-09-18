import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
data:{
    info:{}

},
    onShow(){
    this.getsensus();

    },
    getsensus(){
        sandBox.get({
            api:  'api/distribution/statistics',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if (res.statusCode == 200){
                res = res.data;
                if (res.status){
                    this.setData({
                        order: res.data
                    })

                }else{
                    wx.showModal({
                        title:'请求失败，请稍后重试',
                        showCancel: false
                    })

                }
            }else {
                wx.showModal({
                    title:'请求失败，请稍后重试',
                    showCancel: false
                })
            }

        })
    },
    checkmoney(e){
        wx.navigateTo({
            url: '/pages/distribution/myReceive/myReceive'
        })
    }

})