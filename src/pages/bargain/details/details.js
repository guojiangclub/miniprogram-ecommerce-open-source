import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        userInfo:{},
        show:false,
        rule:'的叫法是看到了福建省的<br/>打飞机速度快放假'
    },
    onLoad: function(options) {
        this.getUserInfo();
        
    },
    showRule(){
        console.log("show")
        this.setData({
            show:true
        })
    },
    closeRule(){
        this.setData({
            show:false
        })
    },
     // 获取用户信息
     getUserInfo() {
         let _this =this
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                _this.setData({
                    userInfo:res.data.data,
                }, () => {
                    if (res.data.data.agent_code) {
                        wx.updateShareMenu();
                    }
                })
            }
        })
    },
    onShow: function() {
        //Do some when page show.
        
    },
    onPullDownRefresh: function() {
        //Do some when page pull down.
        
    }
})