import {config, pageLogin, getUrl, sandBox, cookieStorage} from '../../../lib/myapp.js'

Page({
    data: {
      info: '',
        name: '',
        no: '',
        init: false
    },

    onLoad(e) {
        if (e.no) {
            this.setData({
                no: e.no,
                name: e.name
            })
            this.getExpress(e.no)
        } else {
            wx.showModal({
                content: '无物流编号',
                showCancel: false
            })
        }
    },
    getExpress(no) {
        var token = cookieStorage.get('user_token');

        wx.showLoading({
            title: '查询中',
            mask: true
        })
        sandBox.get({
            api: 'api/express/query',
            data: {
                no: no
            },
            header: {
                Authorization: token
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data) {
                    this.setData({
                        info: res.data,
                        init: true
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
        }).catch(err => {
            wx.showModal({
                content: '请求失败',
                showCancel: false
            })
            wx.hideLoading()
        })
    }
})