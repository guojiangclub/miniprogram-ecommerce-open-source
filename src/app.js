/**
 * Created by admin on 2017/9/1.
 */
import ToastPannel from './component/birthday/birthday';
import { config, getUrl, pageLogin, sandBox, cookieStorage } from './lib/myapp.js';
App({
    globalData: {
        giftLogin: false,
        share: false, // 分享默认为false
        height: 0,
    },
    unionInFo: {},
    openInFo: {},
    shop_id: '',
    code: '',
    ToastPannel,
    isEmptyObject(e) {
        for (let t in e)
            return !1
        return !0
    },
    onLaunch(e) {
        var referrerInfo = e.referrerInfo;
        if (referrerInfo.appId) {
            cookieStorage.set('referrerInfo', referrerInfo);
        }
        var token = cookieStorage.get('user_token'); // 确保缓存跟当前版本保持一致

        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(res => {
            if (res.hasUpdate) {
                wx.showLoading({
                    title: '正在更新，请稍后',
                    mask: true
                })
            }
        })
        updateManager.onUpdateReady(res => {
            wx.hideLoading();
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        updateManager.onUpdateFailed(err => {
                wx.showModal({
                    title: '更新提示',
                    content: '更新失败',
                })
            })
            // 判断是否由分享进入小程序
        if (e.scene == 1007 || e.scene == 1008) {
            this.globalData.share = true
        } else {
            this.globalData.share = false
        };
        //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
        //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
        //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
        //虽然最后解决了，但是花费了不少时间
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.height = res.statusBarHeight
            }
        })
    },
    onShow(e) {


        console.log(e);
        var url = [
            'pages/store/detail/detail',
            'pages/index/index/index',
            'pages/user/personal/personal'
        ]
        console.log(url.indexOf(e.path));
        // 获取第三方平台配置
        if (wx.getExtConfig) {
            wx.getExtConfig({
                success: res => {
                    if (res.extConfig.appid) {
                        cookieStorage.set('globalConfig', res.extConfig)
                        if (url.indexOf(e.path) == -1) {
                            this.init();
                        }
                    } else {
                        if (url.indexOf(e.path) == -1) {
                            this.init();
                        }
                    }
                }
            })
        } else {
            if (url.indexOf(e.path) == -1) {
                this.init();
            }
        }
        var shop_id = e.query.shop_id;

        if (shop_id) {
            this.shop_id = shop_id;
        }

        var token = cookieStorage.get('user_token');


        if (e.shareTicket) {

            console.log('是通过群进来的1');
            console.log(1);
            cookieStorage.set('shareTicketInfo', e.shareTicket);
        }
        // console.log(2);
    },
    autoLogin(code, agent_code) {
        return new Promise((resolve, reject) => {
            console.log('这个是code', code);
            sandBox.post({
                api: 'api/v2/oauth/miniprogram/login',
                data: {
                    code: code,
                    open_type: 'miniprogram',
                    shop_id: cookieStorage.get('shop_id') || '',
                    agent_code: agent_code || '',
                    clerk_id: cookieStorage.get('clerk_id') || '',
                    agent_code_time: cookieStorage.get('agent_code_time') || '',
                    shop_id_time: cookieStorage.get('shop_id_time') || '',
                },
            }).then(res => {
                console.log('接口返回的', res);
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        if (res.data.access_token) {
                            var access_token = res.data.token_type + ' ' + res.data.access_token;
                            var expires_in = res.data.expires_in || 315360000;
                            cookieStorage.set("user_token", access_token, expires_in);
                        }
                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                    }
                    resolve(res)
                } else {
                    wx.showModal({
                        content: '请求失败，请重试',
                        showCancel: false,
                    })
                    reject()
                }
            }).catch(rej => {
                reject()
                wx.showModal({
                    content: '请求失败，请重试',
                    showCancel: false,
                })
            })
        })

    },
    // 获取群id
    getGid(data, user_id) {
        return new Promise((resolve, reject) => {
            sandBox.get({
                api: 'api/testGid',
                data: {
                    encryptedData: data.encryptedData,
                    code: data.code,
                    iv: encodeURIComponent(data.iv)
                }
            }).then(res => {
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        cookieStorage.set('openGId', res.data.openGId);
                        this.setGid(res.data, user_id)
                    } else {
                        wx.showModal({
                            content: res.message || '获取openGId失败',
                            showCancel: false
                        })
                    }
                    resolve(res)
                } else {
                    wx.showModal({
                        content: '请求失败',
                        showCancel: false
                    })
                    reject()
                }
            }).catch(err => {
                reject()
            })
        })
    },
    setGid(data, user_id) {
        sandBox.post({
            api: 'api/wechat/group',
            data: {
                group_id: data.openGId,
                user_id: user_id || 0
            }

        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    console.log('设置群id成功');
                } else {
                    wx.showModal({
                        content: res.message || '设置openGId失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }

        })
    },

    // 判断生日有礼
    isBirthday() {
        let isLogin = !!cookieStorage.get("user_token");
        let birthdayCache = cookieStorage.get("birthday_gift") || {};
        return new Promise((reslove, reject) => {
            if (isLogin && !birthdayCache.flag) {
                let oauth = cookieStorage.get("user_token");
                sandBox.post({
                    api: "api/home/gift_birthday",
                    header: {
                        Authorization: oauth
                    },
                    data: {}
                }).then(res => {
                    res = res.data;
                    console.log(res);
                    if (res.status && res.data) {
                        var data = {};
                        data.flag = false;
                        data.data = res.data;
                        cookieStorage.set("birthday_gift", data);
                        reslove();
                    } else {
                        reject();
                    }
                    // console.log(res);
                })
            } else {
                reject();
            }
        });
    },
    // 获取初始化数据
    init() {
        sandBox.get({
            api: 'api/system/init'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data)
                }
            }
        })
    },
    // 封装分销相关
});