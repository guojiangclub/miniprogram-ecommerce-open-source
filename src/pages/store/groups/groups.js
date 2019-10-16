import {sandBox, config, cookieStorage } from '../../../lib/myapp.js';
Page({
    data:{
        hasMore: true,
        init: false,
        list: [],
        page: '',
        showText: '正在加载下一页数据',
        show: false,
        config: '',
        author: config.PACKAGES.author
    },
    onLoad(e) {
         //cookieStorage.set("user_token", '6IjQzODUyNGE0OGE4NzIxYjMyMTY0OWU0YWQ1ZmFhNjA3NWQ0YTk5NmExYzU5Y2I3YWUwY2NmYjUzODA0NDcxYjg3OGE1NjczODcwNWNhMmNkIn0',315360000);
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        this.querySeckillList(1)
    },
    jump(e) {
        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + e.currentTarget.dataset.id
        })
    },
    // 分享
    onShareAppMessage(res){
        return {
            title: '惊喜不断，超低价拼团火热进行中',
            path: '/pages/store/groups/groups',
        }
    },
    // 加载更多
    onReachBottom() {
        if (this.data.hasMore) {
            var page = this.data.page + 1;
            this.setData({
                show: true
            })
            this.querySeckillList(page)
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    // 请求拼团列表
    querySeckillList(page) {
        sandBox.get({
            api: 'api/multiGroupon/list',
            data: {
                page: page
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    this.setData({
                        [`list[${page -1}]`]: res.data,
                        init: true,
                        page: current_page,
                        hasMore: current_page < total_pages
                    })
                } else {
                    wx.showModal({
                        title: '',
                        content: '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    title: '',
                    content: '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading();
            this.setData({
                show: false
            })
        }, err => {
            wx.hideLoading();
            this.setData({
                show: false
            })
        })
    },

    // 秒杀开始
    isStarts(e) {
        var findex = e.detail.findex;
        var index = e.detail.index;
        if (index != undefined || findex != undefined) {
            var item = this.data.list[findex][index];
            if (item.init_status != 1) {
                this.setData({
                    [`list[${findex}][${index}].init_status`]: 1,
                })
            }
        }
    },
    // 秒杀结束
    isEnd(e) {
        var findex = e.detail.findex;
        var index = e.detail.index;
        if (index != undefined || findex != undefined) {
            var item = this.data.list[findex][index];
            if (item.is_end == false) {
                this.setData({
                    [`list[${findex}][${index}].is_end`]: true,
                })
            }
        }
    }
})