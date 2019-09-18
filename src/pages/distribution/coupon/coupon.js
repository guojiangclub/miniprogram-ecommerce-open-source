import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        width: 0,
        tabList: [
            {
                title: '线上',
                init: false,
                page: 0,
                more: true
            },
            {
                title: '线下',
                init: false,
                page: 0,
                more: true
            }
        ],
        dataList: {
            0: [],
            1: []
        },
        is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
        config: ''
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
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
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    // 跳转线上详情
    jumpDetailOn(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/distribution/onDetail/onDetail?id=' + id + '&is_coupon=' + this.data.is_coupon
        })
    },
    // 跳转线下详情
    jumpDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/distribution/offDetail/offDetail?id=' + id + '&is_coupon=' + this.data.is_coupon
        })
    },
    // 请求优惠券列表
    queryCouponList(type = 0, page = 1) {

        wx.showLoading({
            title: "加载中",
            mask: true
        });

        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/discount/list',
            header: {
                Authorization: token
            },
            data: {
                page,
                type,
                is_coupon: this.data.is_coupon,
                is_agent:1
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

    },
})