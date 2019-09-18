import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        info:'',
        id: '',
        init:false,
        channel:'',
        is_refused:false
    },

    onLoad(e) {
        this.setData({
            id: e.id,
            channel:e.channel
        })

        this.getShearImg();
    },
    getShearImg() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        var token = cookieStorage.get('user_token');
        var pages;
        if(this.data.channel == 'ec'){
            pages = 'pages/coupon/onDetail/onDetail'
        } else {
            pages = 'pages/coupon/offDetail/offDetail'
        }
        sandBox.post({
            api: 'api/coupon/share/agent/image',
            data: {
                coupon_id: this.data.id,
                pages:pages
            },
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        info: res.data,
                        init:true
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(() => {
            wx.hideLoading();
            wx.showModal({
                content: '请求失败',
                showCancel:false
            })
        })
    },
    closeAlert(){
        this.setData({
            is_refused:false
        })
    },

    // 下载图片
    downImg() {
        if (this.data.info.url) {
            wx.showLoading({
                title: '正在下载',
                mask: true
            });
            sandBox.dowloadFile({
                api: this.data.info.url
            }).then(res => {
                if (res.statusCode == 200) {
                    wx.getSetting({
                        success: ret => {
                            // 如果之前没有授权
                            if (!ret.authSetting['scope.writePhotosAlbum']) {
                                wx.authorize({
                                    scope: 'scope.writePhotosAlbum',
                                    success: rej => {
                                        this.saveImg(res.tempFilePath);
                                    },
                                    // 用户拒绝授权
                                    fail: ret => {
                                        this.setData({
                                            is_refused:true
                                        })
                                        wx.hideLoading();
                                    }
                                })
                            } else {
                                this.saveImg(res.tempFilePath);
                            }
                        }
                    })
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '下载图片失败',
                        icon: 'none'
                    })
                }
            },err =>{

            })
        }
    },
    // 保存图片
    saveImg(path) {
        wx.saveImageToPhotosAlbum({
            filePath: path,
            success: res => {
                wx.hideLoading();
            },
            fail: rej => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存图片失败',
                    icon: 'none'
                })
            }
        })
    },
})