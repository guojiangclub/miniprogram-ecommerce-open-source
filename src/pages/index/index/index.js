import {config,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data: {
        info:'',
        screenWidth: '',
        imgHeight: ''
    },
    onLoad() {
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
      this.getIndexData();
    },
    imgLoad(e) {
        var height = e.detail.height
        var width = e.detail.width;
        var ratio = width / height;
        var screenWidth = this.data.screenWidth;
        this.setData({
            imgHeight: screenWidth / ratio
        })
    },
    jumpLink(e) {
        var src = e.currentTarget.dataset.src
        if (!src) return
        wx.navigateTo({
            url: src
        })
    },
    jumpDetail(e) {
        var id = e.currentTarget.dataset.id

        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + id
        })
    },
    jumpSearch() {
        wx.navigateTo({
            url: '/pages/store/search/search'
        })
    },
    getIndexData() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        sandBox.get({
            api:'api/home'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;

                if (res.status) {
                    this.setData({
                        info: res.data
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
                showCancel: false
            })
        })
    }
})