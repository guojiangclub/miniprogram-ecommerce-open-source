import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data:{
        activeIndex: 0,
        sliderOffset: 0,
        width: 0,
        tabList:[
            {
                title: '一级会员',
                init: false,
                page: 0,
                more: true
            },
            {
                title: '二级会员',
                init: false,
                page: 0,
                more: true
            }
        ],
        dataList:{
            0:[],
            1:[]
        }
    },
    onLoad(){
        this.queryVipList(1,'level1');
    },
    onShow(){
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    width: res.windowWidth / this.data.tabList.length,
                    sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
                })
            }
        });
    },
    //点击切换
    tabClick(e){
        var index = e.currentTarget.dataset.index;
        var type ='';
        this.setData({
            activeIndex:index,
            sliderOffset:e.currentTarget.offsetLeft
        })
        if(index == 0){
            type = 'level1'
        } else if(index == 1){
            type = 'level2'
        }
        if(!this.data.tabList[index].init){
            this.queryVipList(1,type);
        }
    },
    //下拉刷新
    onReachBottom() {
        var index = this.data.activeIndex;
        var type = '';
        if(index == 0){
            type = 'level1'
        } else if(index == 1){
            type = 'level2'
        }
        var hasMore = this.data.tabList[this.data.activeIndex].more;
        var page = this.data.tabList[this.data.activeIndex].page+1;
        if (hasMore) {
            this.queryVipList(page,type);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    //请求会员列表
    queryVipList(page,type) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });

        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/distribution/agent/members',
            header: {
                Authorization: token
            },
            data:{
                page:page,
                type:type
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var status = '';
                    if(type == 'level1' ){
                        status = 0
                    } else if(type == 'level2'){
                        status = 1
                    }
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    this.setData({
                        [`dataList.${status}[${page-1}]`] : res.data,
                        [`tabList[${status}].page`]:current_page,
                        [`tabList[${status}].more`]:current_page < total_pages,
                        [`tabList[${status}].init`]:true
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
            this.setData({
                show: false
            })
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