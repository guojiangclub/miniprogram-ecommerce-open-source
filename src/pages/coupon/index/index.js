import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        width: 0,
        tabList: [
            {
                title: '未使用',
                init: false,
                page: 0,
                more: true
            },
            {
                title: '已使用',
                init: false,
                page: 0,
                more: true
            },
            {
                title: '已过期',
                init: false,
                page: 0,
                more: true
            }
        ],
        dataList: {
            0: [],
            1: [],
            2: []
        }
    },
    onLoad(e) {
        if (e.type) {
            this.setData({
                activeIndex: e.type
            })
        };
        this.queryCouponList();
    },
    onShow(e) {
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    width: res.windowWidth / this.data.tabList.length,
                    sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
                })
            }
        });
    },
    tabClick(e) {
        var status = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: status
        });
        if (!this.data.tabList[status].init) {
            this.queryCouponList(status);
        }
    },
    onReachBottom(e) {
        var status = this.data.activeIndex
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].more) {
            this.queryCouponList(status,page);
        } else {
            wx.showToast({
               icon: 'none',
                title: '再拉也没有啦'
            });
        }
    },
    jumpDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/coupon/onDetail/onDetail?id=' + id
        })
    },
    // 查询优惠券列表
    queryCouponList(type = 0, page = 1) {

        wx.showLoading({
            title: "加载中",
            mask: true
        });
        var types = [
            'valid',
            'invalid',
            'used'
        ][type]

        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/coupon',
            header: {
                Authorization: token
            },
            data: {
                page,
                type: types
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;

                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[${type}]`;
                    this.setData({
                        [`dataList.${type}[${page - 1}]`] : res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.page`]: current_page,
                        [`${tabList}.more`]: current_page < total_pages,
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading()
            wx.showModal({
                content: res.message || '请求失败',
                showCancel: false
            })
        })

    }
})