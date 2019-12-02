/**
 * Created by lcfevr on 2018/5/16.
 */
import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
import Rater from '../../../component/rater/rater';

Page({
    data: {
        status: {
            0: 0,
            1: 0,
            2: 0,
            3: 0
        },
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        width: 0,
        tabList: [
            {
                title: "待评价",
                init: false,
                line: false,
                statusNum: {
                    page: 0,
                    more: true,
                },
                show: false
            },
            {
                title: "已评价",
                init: false,
                line: false,
                statusNum: {
                    page: 0,
                    more: true,
                },
                show: false
            }
        ],
        dataList: {
            0: [],
            1: [],
        },
        orderList: {

        },
        typeList: {
            0: '已完成'
        },
        showText: '正在加载下一页数据',
    },
    onLoad(e) {

    },
    onShow(){
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    width: res.windowWidth / this.data.tabList.length,
                    sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
                })
            }
        });
        this.orderList()
    },
    tabClick(e) {
        var status = e.currentTarget.id;
        console.log(status);
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: status
        });
        if (status == 0) {
            if (!this.data.tabList[status].init) {
                wx.showLoading({
                    title: "加载中",
                    mask: true
                });

                this.orderList();

            }
        } else if (status == 1) {
            if (!this.data.tabList[status].init) {
                wx.showLoading({
                    title: "加载中",
                    mask: true
                });

                this.commentList();

            }
        }

    },
    jump(e) {
        wx.navigateTo({
            url: '/pages/order/detail/detail?no=' + e.currentTarget.dataset.no
        })
    },
    jumps(e) {
        wx.navigateTo({
            url: '/pages/order/evaluate/evaluate?no=' + e.currentTarget.dataset.no
        })
        console.log(1);
    },
    jumpDetail(e) {
        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + e.currentTarget.dataset.id
        })
    },
    onReachBottom(e) {
        var status = this.data.activeIndex;
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].more) {
            if (status == 0) {
                this.setData({
                    [`${tabList}.show`]: true
                })
                this.orderList(page);
            } else if (status == 1) {
                this.setData({
                    [`${tabList}.show`]: true
                })
                this.commentList(page)
            }
        } else {
            wx.showToast({
                title: '再拉也没有啦'
            });
        }
    },
    //获取已评价列表
    commentList(page = 1) {
        sandBox.get({
            api: 'api/comment/list',
            header: {
                Authorization: cookieStorage.get('user_token')
            },
            data: {
                page: page
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    console.log(res.data);
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[1]`;
                    this.setData({
                        [`dataList[1][${page - 1}]`]: res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.page`]: current_page,
                        [`${tabList}.more`]: current_page < total_pages
                    })
                    res.data.forEach((v) => {
                        Rater.init(`${v.id}`, {
                            value: v.point,
                            disabled: true,
                            activeColor: '#EA4448',
                            fontSize: 14
                        })
                    })

                } else {
                    wx.showToast({
                        title: "请求失败",
                        image: '../../../assets/image/error.png'
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej =>{
            wx.showToast({
                title: "请求失败",
                image: '../../../assets/image/error.png'
            })
            wx.hideLoading()
        })
    },
    // 获取订单列表
    orderList(page = 1, type = 0) {
        var token = cookieStorage.get('user_token');
        var params = { };
        params.status = 4,
        params.page = page;
        params.type = type;
        params.channel  = '';

        sandBox.get({
            api: 'api/order/list',
            header: {
                Authorization: token
            },
            data: params,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    console.log(res.data);
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[0]`;
                    this.setData({
                        [`dataList[0][${page - 1}]`]: res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.page`]: current_page,
                        [`${tabList}.more`]: current_page < total_pages
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        image: '../../../assets/image/error.png'
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej =>{
            wx.showToast({
                title: "请求失败",
                image: '../../../assets/image/error.png'
            })
            wx.hideLoading()
        })
    },
})