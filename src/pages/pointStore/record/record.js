/**
 * Created by lcfevr on 2018/4/16.
 */
import {pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
        page: 1,
        recordList: [],
        meta: '',
        show: false,
        reveal: false

    },
    onReady() {
        this.recordList(this.data.page);
    },
    jump(e){
        console.log(e);
        wx.navigateTo({
            url: '/pages/pointStore/orderdetail/orderdetail?no=' + e.currentTarget.dataset.no
        })
    },
    recordList (page =1) {
        var token = cookieStorage.get('user_token');
        var oauth = token;
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        sandBox.get({
            api:'api/order/point/list',
            header: {
                Authorization: oauth
            },
            data:{
                page:page
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    // 商品列表页赋值
                    this.setData({
                        [`recordList.${page - 1}`]: res.data,
                        meta: res.meta
                    })
                    if (res.data != '') {
                        this.setData({
                            reveal: false
                        })
                    } else {
                        this.setData({
                            reveal: true
                        })
                    }
                } else {
                    wx.showModal({
                        title: '',
                        content: res.message,
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }

            this.setData({
                show: false
            })
            wx.hideLoading();
        }).catch(rej => {
            wx.showModal({
                content: "请求失败",
                showCancel: false
            })

            this.setData({
                show: false
            })
            wx.hideLoading();
        })
    },
})
