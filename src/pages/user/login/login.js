import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        codes:{
            total:60,
            access_token:null,
            codeText:"获取验证码"
        },
        tellphone:"",
        identifyingcode:"",
        sending:false,
        checked:false,
        url:"",
        showLoading: false,
        message:"",
        open_id: '',
        brand: config.BRAND.name,
        code: '',
    },
    changeChecked(e){
        this.setData({
            checked:!this.data.checked
        })
    },
    changeCode(e){
        this.setData({
            tellphone: e.detail.value
        })
    },
    changeIdentifyCode(e){
        this.setData({
            identifyingcode: e.detail.value
        })
    },
    random(){
        return Math.random().toString(36).substr(2,24);
    },
    onLoad(e){
        if (e.url) {
            this.setData({
                url:decodeURIComponent(e.url)
            });
        }
        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });
        if(token){
            wx.switchTab({
                url: '/pages/user/user/user'
            })
        }
    },
    // 获取验证码
    getCode(){
        if(this.data.sending) return;
        var randoms=this.random();
        this.setData({
            sending:true,
            'codes.codeText':"短信发送中",
            'codes.access_token':randoms
        });
        var fn;
        fn=this.getLoginCode;
        fn(()=>{
            var total =this.data.codes.total;
            this.setData({
                'codes.codeText':total+"秒后再发送"
            });
            var timer =setInterval(()=>{
                total--;
                this.setData({
                    'codes.codeText':total+"秒后再发送"
                });
                if(total<1){
                    this.setData({
                        sending:false,
                        'codes.codeText':"获取验证码"
                    });
                    clearInterval(timer);
                }
            },1000);
        },()=>{
            this.setData({
                sending:false,
                'codes.codeText':"获取验证码"
            });
        });
    },
    getLoginCode(resolve,reject){
        var message =null;
        if(!is.has(this.data.tellphone)){
            message = "请输入您的手机号";
        } else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        }
        if(message){
            this.setData({
                message:message
            });
            reject();
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        sandBox.post({
            api:"api/sms/verify-code",
            data:{
                mobile:this.data.tellphone,
                access_token:this.data.codes.access_token
            },
        }).then(res =>{
            if(res.data.success){
                resolve();
            }
            else{
                reject();
            }
        })
        // resolve();
    },

    submit(){
        var message=null;
        if(!is.has(this.data.tellphone)){
            message = "请输入您的手机号";
        } else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        } else if(!is.has(this.data.identifyingcode)){
            message="请填写验证码";
        } else if(!is.has(this.data.checked)){
            message="请同意此协议";
        }
        if(message){
            this.setData({
                message:message
            });
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        this.setData({
            showLoading: true
        })
        this.quickLogin();
    },
    // 手机号加验证码登录
    quickLogin(){
        var open_id = cookieStorage.get('open_id');
        var that=this;
        var data={
            grant_type: 'sms_token',
            access_token:that.data.codes.access_token,
            mobile:that.data.tellphone,
            code:that.data.identifyingcode,
            open_id: open_id,
        };
        sandBox.post({
            api:"api/oauth/sms",
            data:data,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var result=res.data;
                    if(result.access_token){
                        result.access_token =result.token_type + ' ' + result.access_token;
                        var expires_in = result.expires_in || 315360000;
                        cookieStorage.set("user_token",result.access_token,expires_in);
                        // 判断来源
                        if (this.data.url) {
                            // 判断需要跳回的页面是否为tabbar页面
                            var path = [
                                'pages/index/index/index',
                                'pages/index/classification/classification',
                                'pages/store/tabCart/tabCart',
                                'pages/user/user/user'
                            ];
                            var pathIndex = path.indexOf(this.data.url);
                            if (pathIndex == -1) {
                                wx.redirectTo({
                                    url:"/"+this.data.url
                                })
                            } else {
                                wx.switchTab({
                                    url:"/"+this.data.url
                                })
                            }
                        } else {
                            wx.switchTab({
                                url: '/pages/user/user/user'
                            })
                        }
                    }
                } else {
                    wx.showModal({
                        content: res.message || "验证码不正确",
                        showCancel: false
                    });
                }

               /* var result=res;
                if(result.access_token){
                    result.access_token =result.token_type + ' ' + result.access_token;
                    var expires_in = result.expires_in || 315360000;
                    cookieStorage.set("user_token",result.access_token,expires_in);
                    // 判断来源
                    if (this.data.url) {
                        // 判断需要跳回的页面是否为tabbar页面
                        var path = [
                            'pages/index/index/index',
                            'pages/index/classification/classification',
                            'pages/store/tabCart/tabCart',
                            'pages/user/user/user'
                        ];
                        var pathIndex = path.indexOf(this.data.url);
                        if (pathIndex == -1) {
                            wx.redirectTo({
                                url:"/"+this.data.url
                            })
                        } else {
                            wx.switchTab({
                                url:"/"+this.data.url
                            })
                        }
                    } else {
                        wx.switchTab({
                            url: '/pages/user/user/user'
                        })
                    }
                }*/
            } else {
                wx.showModal({
                    content:  "请求失败",
                    showCancel: false
                });
            }
            this.setData({
                showLoading: false
            })
        }).catch(rej =>{
            wx.showModal({
                content:  "请求失败",
                showCancel: false
            });
            this.setData({
                showLoading: false
            })
        })
    }
});
