import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'

Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        width: 0,
        tabList: [
            {
                title: '累计收益',
                init: false,
                page: 0,
                more: true
            },
            {
                title: "未到账收益",
                init: false,
                page: 0,
                more: true
            }
        ],
        dataList: {
            0: [],
            1: []
        }
    },
    onLoad(e) {
        if (e.type) {
            this.setData({
                activeIndex: e.type
            })
        }
        this.queryReceiveList();
    },
    onShow(e){
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
            this.queryReceiveList(status);
        }
    },
    onReachBottom(e) {
        var status = this.data.activeIndex
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].more) {
            this.queryReceiveList(status,page);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },

    queryReceiveList(type = 0, page = 1) {

        wx.showLoading({
            title: "加载中",
            mask: true
        });

        var token = cookieStorage.get('user_token') || ''
        if (type==0){
            sandBox.get({
                api: 'api/distribution/earnings',
                header: {
                    Authorization: token
                },
                data: {
                    page,
                    type,
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

        }else{
            sandBox.get({
                api: 'api/distribution/unearnings',
                header: {
                    Authorization: token
                },
                data: {
                    page,
                    type,
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

    }
})