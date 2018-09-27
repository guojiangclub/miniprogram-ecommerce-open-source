import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        code: '',
        url: '',
        logo: config.BRAND.logo,
        open_id: ''
    },
    onLoad(e){
        if (e.url) {
            this.setData({
                url: decodeURIComponent(e.url)
            })
        }
    },
    onShow() {
        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });
        if(token){
            wx.switchTab({
                url: '/pages/user/user/user'
            })
        } else {
            this.wxLogin();
        }

    },
    // 利用code登录
    autoLogin(code) {
        console.log(code);
        sandBox.post({
            api: 'api/oauth/MiniProgramLogin',
            data: {
                code: code
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                // 如果是返回open_id,就把open_id存起来
                if (res.data && res.data.open_id) {
                    this.setData({
                        open_id: res.data.open_id
                    });
                    cookieStorage.set('open_id', res.data.open_id);
                    wx.hideLoading();
                }
                // 如果接口返回token就直接登录，如果没有则弹出授权
                if (res.data && res.data.access_token) {
                    wx.hideLoading();
                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set("user_token", access_token, expires_in);
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
                if (!res.status) {
                    wx.hideLoading();
                    wx.showModal({
                        content:res.message || '请求失败，请重试',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                this.wxLogin();
                            }
                        }
                    })
                }

            } else {
                wx.hideLoading();
                wx.showModal({
                    content:'请求失败，请重试',
                    showCancel: false,
                    success: res=>{
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            this.wxLogin();
                        }
                    }
                })
            }
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content:'请求失败，请重试',
                showCancel: false,
                success: res=>{
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        this.wxLogin();
                    }
                }
            })
        })
    },
    wxLogin() {
        wx.showLoading({
            title: '正在自动登录',
            mask: true
        })
        wx.login({
            success: res => {
                if (res.code) {
                    this.setData({
                        code: res.code
                    })
                    this.autoLogin(res.code);
                } else {
                    wx.showToast({
                        title: '获取code失败',
                        image: '../../../assets/image/error.png'
                    })
                }
            }
        })
    },
    jumpLogin(){
        if (this.data.url) {
            wx.navigateTo({
                url: '/pages/user/loginType/loginType?url=' + this.data.url
            })
        } else {
            wx.navigateTo({
                url: '/pages/user/login/login'
            })
        }

    },
    // 获取用户手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.setData({
                            code: res.code
                        }, res => {
                            this.phone(e);
                        })
                    } else {
                        wx.showModal({
                            content: " 获取code失败",
                            showCancel: false
                        })
                    }
                }
            });
            // this.phone(e)
            return
        } else {
            this.jumpLogin();
        }
    },
    // 利用手机号登录
    phone(e) {
        sandBox.post({
            api: 'api/oauth/MiniProgramMobileLogin',
            data: {
                open_type:'miniprogram',
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                open_id: this.data.open_id
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data.access_token) {
                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set("user_token", access_token, expires_in);
                    if (this.data.url) {
                        var path = [
                            'pages/index/index/index',
                            'pages/index/classification/classification',
                            'pages/store/tabCart/tabCart',
                            'pages/user/personal/personal'
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
                } else {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败，请重试',
                    showCancel: false
                })
            }
        }).catch(rej => {
            wx.showModal({
                content: '请求失败，请重试',
                showCancel: false
            })
        })
    }
})