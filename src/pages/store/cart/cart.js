var app = getApp();

import {
    config, getUrl, weapp,
    cookieStorage,
    connect,
    bindActionCreators,
    store,
    actions,
    sandBox
} from '../../../lib/myapp.js';

Page({
    data: {
        toekn: '',
        list:[],
        groupList:[],
        select_products:{},
        allCheck:true,
        channel:'normal',
        loading:false,
        show_coupons: false,        // 领取优惠券
        show_discounts: false,       // 查看促销活动
        goodsList: []     // 购物车里存在的商品id
    },
    onLoad() {
        var token = cookieStorage.get('user_token');
        var locals = cookieStorage.get('cart');
        this.setData({
            token:token,
            loading:false
        });
        if (token && locals && locals.length) {
            this.appendToCart();
        } else {
            this.queryCartList();
        }

    },
    jump(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + id
        })
    },
    // 提交本地购物车
    appendToCart(data) {
        var toekn = this.data.toekn;
        if (!toekn) return;
        if (!Array.isArray(data)) {
            data = [data];
        }

        var json = {};
        data.forEach((v, i) => json[i] = v);
        data = json;
        sandBox.post({
            api: 'api/shopping/cart',
            data: data,
            header: {
                Authorization: toekn
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                this.addCart(true)
            } else {
                this.addCart(false,res.message)
            }
        }).catch(err => {
            this.addCart(false)
        })
    },
    // 获取购物车数据
    queryCartList() {
        var loData = cookieStorage.get('cart') || [];
        var token = this.data.token;
        if (!token) {
            this.setData({
                list: loData
            });
            this.select_product();
            return
        }

        sandBox.get({
            api: 'api/shopping/cart',
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var data = [];
                    if (res.data) {
                        data = Object.keys(res.data).map(key => {
                            res.data[key].checked = true;
                            return res.data[key]
                        }).concat(data);
                    }
                    this.setData({
                        list: data
                    })
                    this.select_product();
                } else {
                    this.addCart(false, res.message)
                }
            } else {
                this.addCart(false)
            }
        }).catch(err => {
            this.addCart(false)
        })
    },
    addCart(success, message) {
        this.setData({
            loading:false
        });
        if (success) {
            cookieStorage.clear('cart');
            this.queryCartList();
        } else {
            cookieStorage.clear('cart');
            wx.showModal({
                content: message || '保存本地购物车失败,请重试！',
                showCancel: false
            })
        }
    },
    // 处理数据
    select_product() {
        var data = {
            count:0,
            total:0,
            __ids:[]
        }

        this.data.list.forEach((v) => {
            if (v.checked) {
                data.count += parseInt(v.qty);
                data.total += Number(v.total);
                data.__ids.push(v.__raw_id || v.index);
            } else {
                this.setData({
                    allCheck:false
                })
            }
        })
        this.setData({
            select_products:data
        })
    },
})