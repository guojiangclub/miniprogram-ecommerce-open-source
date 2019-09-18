import {sandBox,cookieStorage, getUrl} from '../../../lib/myapp.js';

Page({
    data: {
        page: 1,
        storeList: [],
        meta: '',
        show: false,
        point: {},
        token: '',
        init: false,
        config: ''
    },
    onReady() {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
        var token = cookieStorage.get('user_token');
        this.setData({
            token:token
        });
        if (token) {

            this.queryUserPoint('default');
        }
        var query = {
            is_largess: 1
        };
        this.queryCommodityList(query);
    },
    jump(e){
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/pointStore/detail/detail?id=' + id
        })
    },
    jumpRecord(){
        wx.navigateTo({
            url:'/pages/pointStore/record/record'
        });
    },
    jumpLogin(){
        var url = getUrl();
        wx.navigateTo({
            url: '/pages/user/register/register?url=' + url
        })
    },
    onReachBottom() {
        var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
        if (hasMore) {
            this.setData({
                show: true
            })
            var query = {
                is_largess: 1
            };
            var page = this.data.meta.pagination.current_page + 1;
            this.queryCommodityList(query,page);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    // 商品列表
    queryCommodityList(query = {}, page = 1) {
        var params = Object.assign({}, query, {page});
        wx.showLoading({
            title: '加载中',
            mask: true
        });

        sandBox.get({
            api:'api/store/list',
            data: params,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    // 商品列表页赋值
                    this.setData({
                        [`storeList.${page - 1}`]: res.data,
                        meta: res.meta
                    })
                    if (res.data != '') {
                        this.setData ({
                            init: false
                        })
                    } else {
                        this.setData ({
                            init: true
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
                    title: '',
                    content: "请求失败",
                    showCancel: false
                })
            }

            this.setData({
                show: false
            })
            wx.hideLoading();
        })
        .catch(rej =>{
            wx.showModal({
                title: '',
                content: '请求失败',
                success: res=>{
                    if (res.confirm) {

                    }
                }
            })

            this.setData({
                show: false
            })
            wx.hideLoading();
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

    }
})