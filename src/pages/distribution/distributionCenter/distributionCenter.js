import { is, config, sandBox, cookieStorage } from '../../../lib/myapp.js';
Page({
    data: {
        show_confirm: false,
        show_title: '您暂未绑定支持提现的卡号或账户,是否现在进行绑定？',
        list: {},
        config: ''
    },
    onLoad() {
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
    },
    onShow() {
        this.getmoney();
        this.getBankAccount();
        if (config.BRAND.name == 'nuscents') {
            this.setData({
                show_title: '暂未绑定提现账户，现在去绑。'
            })
        }

    },
    jumpItem(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    withdraw() {

        wx.navigateTo({
            url: '/pages/distribution/cash/cash' //提现页面
        })
        return

        console.log(1);
        if (this.data.info.type == 'customer_wechat') {

        } else {
            if (!this.data.info.hasAccount) {
                wx.showModal({
                    content: this.data.show_title,
                    showCancel: false,
                    success: res => {
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            wx.navigateTo({
                                url: '/pages/wallet/bank-add/bank-add' //进入银行卡添加页面
                            })
                        }
                    }
                })
            } else {
                wx.navigateTo({
                    url: '/pages/distribution/cash/cash' //进入提现页面
                })
            }
        }

    },
    //账户数量
    getBankAccount() {
        // var token = cookieStorage.get('user_token');
        // sandBox.get({
        //     api: 'api/users/BankAccount/show/number',
        //     header: {
        //         Authorization: token
        //     }
        // }).then(res => {
        //     if (res.statusCode == 200) {
        //         res = res.data;
        //         if (res.status) {
        //             this.setData({
        //                 info: res.data
        //             })

        //         } else {
        //             wx.showModal({
        //                 title: '请求失败，请稍后重试',
        //                 showCancel: false
        //             })

        //         }
        //     } else {
        //         wx.showModal({
        //             title: '请求失败，请稍后重试',
        //             showCancel: false
        //         })
        //     }
        // }).catch(rej => {
        //     wx.showModal({
        //         content: '请求失败，请稍后重试',
        //         showCancel: false
        //     })
        // })
    },
    //获取提现数据
    getmoney(e) {
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/distribution/balance',
            header: {
                Authorization: token
            }
        }).then(res => {
            console.log(res, '123');

            if (res.statusCode == 200) {
                var res = res.data;
                if (res.status) {
                    this.setData({
                        list: res.data
                    })
                } else {
                    wx.showModal({
                        title: '请求失败，请稍后重试',
                        showCancel: false
                    })

                }
            } else {
                wx.showModal({
                    title: '请求失败，请稍后重试',
                    showCancel: false
                })
            }
        }).catch(rej => {
            wx.showModal({
                content: '请求失败，请稍后重试',
                showCancel: false
            })
        });
    },
    //跳分销统计
    jumpsensus(e) {
        wx.navigateTo({
            url: '/pages/distribution/sensus/sensus'
        })
    },
    //跳我要推广
    jumpspread(e) {
        wx.navigateTo({
            url: '/pages/distribution/spread/spread'
        })
    },
    //跳vip管理
    jumpvip(e) {
        wx.navigateTo({
            url: '/pages/distribution/vipManage/vipManage'
        })
    },
    //    跳推客中心
    jumpPusher() {
        wx.navigateTo({
            url: '/pages/distribution/pusher/pusher'
        })
    }

})