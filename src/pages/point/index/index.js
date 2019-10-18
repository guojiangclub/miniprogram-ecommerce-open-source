import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'

Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        width: 0,
        tabList: [
            {
                title: "收入",
                init: false,
                page: 0,
                more: true,
            },
            {

                title: "支出",
                init: false,
                page: 0,
                more: true,
            }
        ],
        dataList: {
            0: [],
            1: []
        },
        point: {

        },
        config: ''
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var config = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: config
        })
        if (e.type) {
            this.setData({
                activeIndex: e.type
            })
        }
        this.queryPointListBalance(this.data.activeIndex);
        this.queryUserPoint('default');
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
    // 点击切换
    tabClick(e) {
        var status = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: status
        });
        if (!this.data.tabList[status].init) {
            // wx.showLoading({
            //     title: "加载中",
            //     mask: true
            // });

            this.queryPointListBalance(status);
        }

    },
    onReachBottom(e) {
        var status = this.data.activeIndex
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].more) {
            this.queryPointListBalance(status,page);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    // 查询积分列表
    queryPointListBalance(status = 0, page = 1) {
        var token = cookieStorage.get('user_token');

        wx.showLoading({
            title: "加载中",
            mask: true
        });

        var balance = status ? 'out' : 'in';
        var params = balance ? { balance } : {};

        params.page = page;
        params.type = 'default';

        sandBox.get({
            api: 'api/users/point/list',
            header: {
                Authorization: token
            },
            data: params
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[${status}]`;
                    this.setData({
                        [`dataList.${status}[${page - 1}]`] : res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.page`]: current_page,
                        [`${tabList}.more`]: current_page < total_pages,
                        [`${tabList}.show`]: false
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
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content: '请求失败',
                showCancel: false
            })
        })
    },
    // 查询用户积分
    queryUserPoint(type) {
        var token = cookieStorage.get('user_token');

        sandBox.get({
            api:'api/users/point',
            header:{
                Authorization:token
            },
            data:{
                type: type
            }
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    point: res
                })
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
        })

    },
	jump() {
        wx.navigateTo({
          url: '/pages/pointStore/index/index'
        })
    }

})
