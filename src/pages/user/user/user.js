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
