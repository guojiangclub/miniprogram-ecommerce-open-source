import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        name: '',
        phone: '',
        info: '',
        message:'',
        config: ''
    },
    onLoad(){
// 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
    },
    getName(e){
      this.setData({
          name:e.detail.value
      })
    },
    getPhone(e){
        this.setData({
            phone:e.detail.value
        })
    },
    getInfo(e){
        this.setData({
            info:e.detail.value
        })
    },
    jumpHome() {
        wx.switchTab({
            url: '/pages/index/index/index'
        })
    },
    checkValue(e){
        var token =cookieStorage.get('user_token');//获取用户的token
        var message = '';
        if (!this.data.name) {
            message = '请输入您的姓名';
        } else if (!this.data.phone) {
            message = '请输入您的手机号码';
        } else if (this.data.phone !="" && !is.mobile(this.data.phone)) {
            message = '手机号码格式不正确';
        }
        if (message){
            wx.showModal({
                content: message,
                showCancel: false
            });
            return
        }else {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            sandBox.post({
                api: 'api/distribution/register',
                header: {
                    Authorization: token
                },
                data:{
                    name:this.data.name,
                    mobile:this.data.phone,
                    note:this.data.info,
                }
            }).then(res =>{
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        wx.showModal({
                            content: res.message,
                            showCancel: false,
                            success (res){
                                if(res.confirm){
                                    console.log('用户点击确定')
                                    wx.switchTab({
                                        url: '/pages/user/user/user'
                                    })
                                }
                            }
                        })
                    } else {
                        wx.showModal({
                            title:res.message || '请求失败',
                            showCancel: false
                        })
                    }
                } else {
                    wx.showModal({
                        content: '请求失败，请稍后重试',
                        showCancel: false
                    })
                }
                wx.hideLoading();
            }).catch(rej =>{
                wx.showModal({
                    content: '请求失败，请稍后重试',
                    showCancel: false
                })
                wx.hideLoading();
            })
        }

    }
})