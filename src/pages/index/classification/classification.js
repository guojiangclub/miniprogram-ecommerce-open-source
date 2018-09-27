/**
 * Created by lcfevr on 2018/5/23.
 */
import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        info:'',
    },
    onLoad() {
        this.getIndexData();
    },
    jumpLink(e) {
        var src = e.currentTarget.dataset.src
        if (!src) return
        wx.navigateTo({
            url: src
        })
    },
    getIndexData() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        sandBox.get({
            api:'api/category'
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