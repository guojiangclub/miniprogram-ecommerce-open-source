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
        select_products:{},
        allCheck:true,
        channel:'normal',
        loading:false,
        coupons: [],              // 可领取的优惠券信息
        discounts: [],             // 可享受的优惠折扣信息
        show_coupons: false,        // 领取优惠券
        show_discounts: false,       // 查看促销活动
        goodsList: [],     // 购物车里存在的商品id
    },
    onShow() {
        var token = cookieStorage.get('user_token');
        var locals = cookieStorage.get('cart');
        this.setData({
            token:token,
            loading:false
        });
        if (token && locals && locals.length) {
            this.appendToCart(locals);
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
    goLogin() {
        var url = getUrl();
        wx.navigateTo({
            url: '/pages/user/register/register?url=' + url
        })
    },
    changeCoupons() {
        this.setData({
            show_coupons: !this.data.show_coupons
        })
    },
    changeDiscounts() {
        this.setData({
            show_discounts: !this.data.show_discounts
        })
    },

    // 购物车领券
    cardDiscount(ids) {
        sandBox.post({
            api: 'api/shoppingCart/discount',
            data: {
                ids: ids
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status && res.data) {
                    res.data.coupons.forEach(v => v.receive = false);
                    this.setData({
                        coupons: res.data.coupons,
                        discounts: res.data.discounts
                    })
                }
            }
        })
    },

    // 领取优惠券
    getCoupon(e) {
        var is_login = cookieStorage.get('user_token');
        var discount_id = e.currentTarget.dataset.id;
        var index = e.currentTarget.dataset.index;
        if (is_login) {
            this.goodsConvertCoupon(discount_id, index);
        } else {
            var url = getUrl();
            wx.showModal({
                tiele: '',
                content: '请先登录',
                success: res => {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/user/register/register?url=' + url
                        })
                    }
                }
            })
        }
    },
    // 领取优惠券接口
    goodsConvertCoupon(discount_id, index) {
        var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: '正在领取',
            mask: true
        })
        sandBox.post({
            api: 'api/coupon/take',
            header: {
                Authorization: token
            },
            data: {
                discount_id: discount_id
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var coupons = `coupons[${index}]`
                    this.setData({
                        [`${coupons}.receive`]: true
                    });
                    wx.showToast({
                        title: '领取成功',
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        image: '../../../assets/image/error.png'
                    })
                }
            } else {
                wx.showToast({
                    title: '领取失败',
                    image: '../../../assets/image/error.png'
                })
            }
            wx.hideLoading();
        })
    },

    // 提交本地购物车
    appendToCart(data) {
        var toekn = this.data.token;
        if (!toekn) return;
        if (!Array.isArray(data)) {
            data = [data];
        }
        wx.showLoading({
            title: '加载中',
            mask: true
        })
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

        wx.showLoading({
            title: '加载中',
            mask: true
        })

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

                        // 购物车领券
                        if (data.length) {
                            var list = [];
                            data.forEach(v => {
                                if (this.data.goodsList.indexOf(v.com_id) == -1) {
                                    list.push(v.com_id)
                                };
                            });
                            this.setData({
                                goodsList: list
                            });
                            this.cardDiscount(list);
                        }
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

    // 添加本地购物车回调
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
            wx.hideLoading();
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
        wx.hideLoading();
    },

    // 数量加减
    changeCount(e) {
        var index = e.target.dataset.index,
            change = e.target.dataset.change,
            list = this.data.list,
            val = (parseInt(list[index].qty) || 0) + (parseInt(change) ? 1 : -1),
            store_count = list[index].store_count;

        if (store_count == undefined) {
            if (val > 0 && val <= 99) {
                var data = {
                    qty: val,
                    total: val * Number(list[index].price)
                };
                this.change(list[index], data,index);
            }
        } else {
            if (val > 0 && val <= store_count) {
                var data = {
                    qty: val,
                    total: val * Number(list[index].price)
                };
                this.change(list[index], data,index);
            }  else {
                wx.showToast({
                    title:'超过最大库存',
                    icon:'none'
                })
            }
        }
    },

    // 直接输入价格
    modifyCount(e) {
        var index = e.currentTarget.dataset.index;
        var item = this.data.list[index]
        var val = e.detail.value;
        var store_count = item.store_count;

        if (!val) {
            val = 1;
        } else if (!/^[1-9]\d*$/.test(val)) {
            val = val.replace(/[^\d].*$/, '');
            val = parseInt(val) || 1;
        }

        if (store_count != undefined) {
            if (val > store_count) {
                val = store_count;
                wx.showToast({
                    title:'超过最大库存',
                    icon: 'none'
                })
            }
        }
        var data = {
            qty: val,
            total: val * Number(item.price)
        };

        this.change(item, data);

    },

    // 数量更新
    change(item, data, index) {
        if (item.local) {
            var locals = cookieStorage.get('cart') || [];
            locals[item.index].qty = data.qty;
            locals[item.index].total = data.total;
            cookieStorage.set('cart',locals);
            this.updated(true,data,item,index)
        } else {
            this.updateToCart(data, item,index);
        }
    },
    // 数量更新接口
    updateToCart(attr, data, index) {
        sandBox.ajax({
            api: 'api/shopping/cart/' + data.__raw_id,
            data: {
                attributes: {
                    qty: attr.qty
                }
            },
            method:'PUT',
            header: {Authorization: this.data.token},
        }).then(res => {
            res = res.data;
            if (res.status !== false) {
                this.updated(true,attr,data,index)
            } else {
                this.updated(false,{ qty: res.data.stock_qty }, data,index)
            }
        })
    },

    // 数量接口更新回调
    updated(status, data, item, index) {
        if (status) {
            item.qty = data.qty;
            item.total = data.total;
        } else {
            item.qty = data.qty;
            item.total = item.qty * Number(item.price);
            wx.showToast({
                title:'超过最大库存',
                icon: 'none'
            })
        }
        var list = this.data.list
        list[index] = item;

        this.setData({
            list:list
        })
        this.select_product()
    },


    // 移除商品
    removeFromCart(e){
        var oauth = this.data.token;
        var index = e.target.dataset.index;
        var list = this.data.list;
        var data = list[index]

        if (list[index].local) {
            var locals =cookieStorage.get('cart') || [];
            for (let i=0;i<locals.length;i++) {
                if (locals[i].index === list[index].index) {
                    locals.splice(i, 1);
                    break;
                }
            }
            if (locals.length) {
                cookieStorage.set('cart',locals);
            } else {
                cookieStorage.clear('cart');
            }
            this.removed(true,index)
        } else {
            sandBox.ajax({
                api:`api/shopping/cart/${data.__raw_id}`,
                header: {Authorization: oauth},
                method:'DELETE',
            }).then(res => {

                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        this.removed(true, index)
                    } else {
                        this.removed(false, res.message)
                    }
                } else {
                    this.removed(false)
                }
            }).catch(rej => {
                this.removed(false)
            })
        }
    },

    // 移除回调
    removed (status,index, message){
        if (status) {
            var list = this.data.list;
            list.splice(index, 1)[0];
            this.setData({
                list:list
            })
            this.select_product()
        } else {
            wx.showToast({
                title:message || '删除购物车商品失败！',
                icon: 'none'
            })
        }
    },

    // 勾选状态
    changeCheck(e) {
        var ids = e.detail.value;
        var list = this.data.list;

        list.forEach((item)=>{
            item.checked = false;
        })

        ids.forEach((item)=>{
            list[item].checked = true
        })

        this.setData({
            list:list
        })

        if (ids.length == list.length) {
            this.setData({
                allCheck:true
            })
        }

        this.select_product();
    },
    // 全选
    selectAll() {
        var allCheck = this.data.allCheck
        var list = this.data.list
        this.setData({
            allCheck:!allCheck
        })
        list.forEach((item)=> {item.checked = this.data.allCheck ? true : false})

        this.setData({
            list:list
        })
        this.select_product();
    },
    // 提交订单
    order() {
        var data = this.data.select_products;
        if (!data.count) {
            return
        };
        this.setData({
            loading:true
        })
        var oauth = this.data.token;

        if (!oauth) {
            var url = getUrl();
            wx.navigateTo({
                url:'/pages/user/register/register?url=' + url
            })
            return;

        }

        var locals = cookieStorage.get('cart');
        if (locals && locals.length) {
            // 提交本地购物车
            this.appendToCart(locals);
            return;
        }

        this.checkoutOrder();
    },
    // 提交订单
    checkoutOrder() {
        var ids = this.data.select_products.__ids;
        var type = this.data.channel;
        var oauth = this.data.token;
        var cart_ids = ids.filter(id => id);


        sandBox.post({
            api:'api/shopping/order/checkout',
            data:{ cart_ids, type },
            header: {Authorization: oauth},
            method:'POST',
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('local_order',res.data);
                    wx.navigateTo({
                        url:'/pages/store/order/order',
                    })
                } else {
                    wx.showModal({
                        content: message || '结算失败,请重试！',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '结算失败,请重试！',
                    showCancel: false
                })
            }

            this.setData({
                loading: false
            })
        }).catch(() => {
            wx.showModal({
                content: message || '结算失败,请重试！',
                showCancel: false
            })
            this.setData({
                loading: false
            })
        })
    }
})
