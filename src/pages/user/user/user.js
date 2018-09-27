import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        detail:"",
        orderInfo:"",
        token:"",
    },
    onShow(){
        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });
        if(token){
            this.gitUserInfo();
            this.getCenter();
        }
    },
    jump(e){
        if(!this.data.token){
            return this.jumpLogin();
        }
        var status=e.currentTarget.dataset.status;
        wx.navigateTo({
            url: '/pages/order/index/index?type='+status
        })
    },
    jumpItem(e) {
        if(!this.data.token){
            return this.jumpLogin();
        }
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    jumpLogin(){
        wx.navigateTo({
            url: '/pages/user/register/register'
        })
    },
    bindgetuserinfo(e) {
        console.log(e);
        // 说明用户同意授权
        if (e.detail.userInfo) {
            this.updateUserInfo(e.detail.userInfo)
        }
    },
    // 更新用户信息
    updateUserInfo(e){
        wx.showLoading({
            title: '更新中',
            mask: true
        })
        sandBox.post({
            api: 'api/users/update/info',
            header:{
                Authorization:cookieStorage.get('user_token')
            },

            data:{
                nick_name:e.nickName,
                sex:e.gender == 1 ? '男' : '女',
                avatar:e.avatarUrl,
            },
        }).then(res =>{
            console.log(res);
            if(res.statusCode==200){
                res = res.data;
                if (res.status) {
                    wx.showToast({
                        title:'修改成功',
                        duration: 1500,
                        success:()=>{
                            setTimeout(()=>{
                                this.gitUserInfo();
                            },1500);
                        }
                    })
                } else {
                    wx.showModal({
                        content:res.message ||  "更新失败",
                        showCancel: false
                    });
                }
                wx.hideLoading();
            }
            else{
                wx.showModal({
                    content:"更新失败",
                    showCancel: false
                });
                wx.hideLoading();
            }
        })
    },
    // 获取用户信息
    gitUserInfo() {
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    detail:res.data.data
                })
            }
        })
    },
    //获取页面信息
    getCenter(){
        var token=cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/users/ucenter',
            header:{
                Authorization:token
            },
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    orderInfo:res.data.data
                })
            }
        })
    }

})
