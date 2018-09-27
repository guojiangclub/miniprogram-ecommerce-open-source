import {config, pageLogin, getUrl, sandBox, cookieStorage} from '../../../lib/myapp.js'

Page({
    data: {
        url: '',
        id: ''
    },
    onLoad(e) {
        if (e.id) {
            this.setData({
                id: e.id
            })

            this.getImg();
        } else {
            wx.showModal({
                content: '参数错误',
                showCancel: false
            })
        }
    },
    getImg() {
        var token = cookieStorage.get('user_token') || '';
        wx.showLoading({
            title: '生成中',
            mask: true
        })
        sandBox.get({
            api: 'api/store/detail/' + this.data.id + '/share/img',
            header: {
                Authorization: token
            },
            data: {
                page: 'pages/store/detail/detail'
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        url: res.data
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
    // 下载图片
    downImg() {
        if (this.data.url) {
            wx.showLoading({
                title: '正在下载',
                mask: true
            });
            wx.downloadFile({
                url: this.data.url,
                success: res => {
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
                                            wx.openSetting({
                                                success: res => {
                                                    if (!res.authSetting['scope.writePhotosAlbum']) {
                                                        wx.openSetting({
                                                            success: res => {

                                                            }
                                                        })
                                                    }
                                                }
                                            })
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

                }
            });
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