var Wxparse = require('../../../component/wxParse/wxParse');
import Rater from '../../../component/rater/rater';
var app = getApp();

var newspecs = [];
import {
    config, getUrl, weapp,
    cookieStorage,
    connect,
    bindActionCreators,
    store,
    actions,
    sandBox
} from '../../../lib/myapp.js'
import Animation from '../../../utils/animation.js'

Page({
    data: {
        id: '',  // 商品ID
        cart_status: {
            status: false,
            message: '商品已下架'
        },
        price: 0,  // 价格
        detailData: {},   // 详情数据
        attributesList: {
            top: [],
            bottom: []
        },    // 商品参数
        domInfo: {
            shop: ''
        },   // 节点信息
        activeName: 'shop',  // 当前所在节点
        expands: {
            parameter: true,    //商品参数
            commodity: true    //商品详情
        },
        loading: false, // 按钮上loading
        show_select: true, //选尺寸
        show_cart: false, // 加入购物车弹出
        select_product: {}, //当前选中商品
        is_Fav: false, // 是否收藏商品
        show_share: false, // 是否弹出分享
        animationSelect: {},  // 动画
        specs: [], // SKU信息
        result: {}, // SKU数据
        query: {}, //
        skuTable: {}, //
        store_count: '', // 商品数量
        coupons: [],              // 可领取的优惠券信息
        discounts: [],             // 可享受的优惠折扣信息
        show_coupons: false,        // 领取优惠券
        show_discounts: false,       // 查看促销活动


        showToTop: false,
        store_num: 0,
        select_count: 1,
        is_login: true,
        canBuy: false,
    },
    onLoad(e) {
        var id = '';
        if (e.id) {
            id = e.id;
        }
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            id = sceneArr[0];
        }
        if (id) {
            this.getStoreDetail(id)
        } else {
            wx.switchTab({
                url: '/pages/index/index/index'
            })
        }

        var is_login = cookieStorage.get('user_token');

        this.setData({
            id: id,
            is_login: is_login
        })
    },
    // 监听页面滚动
    onPageScroll(e) {
        var shop = this.data.domInfo.shop;
        var comment = this.data.domInfo.comment;
        if (!this.data.lock) {
            if (e.scrollTop < shop) {
                this.setData({
                    activeName: 'shop'
                })
            } else if (e.scrollTop > shop && e.scrollTop < shop + comment) {
                this.setData({
                    activeName: 'comment'
                })
            } else {
                this.setData({
                    activeName: 'details'
                })
            }
        }
        this.setData({
            lock: false
        })
    },
    // 分享
    onShareAppMessage() {
        this.setData({
            show_share: false
        })
        return {
            title: '￥ ' + this.data.detailData.data.sell_price + ' | ' + this.data.detailData.data.name,
            path: '/pages/store/detail/detail?id=' + this.data.id,
            imageUrl: this.data.detailData.data.img
        }
    },
    changeShare() {
        this.setData({
            show_share: !this.data.show_share
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

    // 点击滚动到指定位置
    jumpScroll(e) {

        var type = e.target.dataset.type;
        if (type == 'shop') {
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        } else if (type == 'comment') {
            wx.pageScrollTo({
                scrollTop: this.data.domInfo.shop,
                duration: 0
            });
        } else if (type == 'details') {
            wx.pageScrollTo({
                scrollTop: this.data.domInfo.shop + this.data.domInfo.comment,
                duration: 0
            });
        } else {
            wx.pageScrollTo({
                scrollTop: this.data.domInfo.shop,
                duration: 0
            });
        }
        this.setData({
            activeName: type,
            lock: true
        })

    },
    // 请求商品详情页面数据
    getStoreDetail(id) {
        wx.showLoading({
            title: "加载中",
            mask: true
        })
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/store/detail/' + id,
            header: {
                Authorization: token
            },
            data: {
                include: 'photos,oneComment,user',
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        detailData: res
                    })

                    this.getDomInfo('.js__top', 'shop');

                    if (res.data.oneComment && res.data.oneComment.length) {
                        this.getDomInfo('.js__comment', 'comment');
                        Rater.init('store', {
                            value: res.data.oneComment[0].point,
                            disabled: true,
                            activeColor: '#EA4448',
                            fontSize: 14
                        })
                    }
                    if (res.meta.discounts) {
                        res.meta.discounts.coupons.forEach(v => v.receive = false);
                        this.setData({
                            coupons: res.meta.discounts.coupons,
                            discounts: res.meta.discounts.discounts
                        })
                    }
                    Wxparse.wxParse('detailI', 'html', res.data.content, this, 0);
                    this.attributesList(res.meta);
                    wx.setNavigationBarTitle({
                        title: res.data.name
                    })
                    this.setData({
                        price: Number(res.data.sell_price).toFixed(2),
                        store_count: res.data.store_nums
                    })

                    this.changeText();
                    this.disallow_cart();
                    this.queryCommodityStore(this.data.id)
                    this.queryFavoriteStatus(this.data.id, 'goods');
                } else {
                    wx.hideLoading()
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.hideLoading()
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
        }).catch(err => {
            wx.showModal({
                content: '内部错误',
                showCancel: false
            })
            wx.hideLoading();
        })
    },


    // 请求商品SKU
    queryCommodityStore(id, key) {
        sandBox.get({
            api: 'api/store/detail/' + id + '/stock'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    if (!res.data || !res.data.specs) return

                    if (res.data.specs && typeof key === 'undefined') {
                        let specs = [];


                        Object.keys(res.data.specs)
                            .forEach((key, index) => {
                                let value = res.data.specs[key];
                                value.select = '';
                                value.values = value.list
                                    .map(v => {
                                        return Object.assign({
                                            index: index,
                                            active: false,
                                            disabled: false
                                        }, v);
                                    });

                                delete value.list;
                                specs.push(value);
                            });

                        newspecs = specs;

                        this.setData({
                            specs: specs
                        })

                        var canBuy = this.disallow_cart();

                        this.setData({
                            canBuy: canBuy
                        })
                    }

                    if (res.data.stores) {
                        let data = {};
                        Object.keys(res.data.stores)
                            .forEach(key => {
                                let value = res.data.stores[key];

                                value.ids.forEach(id => {
                                    data[id] = data[id] || {count: 0, specs: {}};
                                    data[id].count += parseInt(value.store);

                                    value.ids.forEach(i => {
                                        if (i === id) return;

                                        data[id].specs[i] = {
                                            count: parseInt(value.store)
                                        };
                                    })
                                });
                            });
                        var result = {data, table: res.data.stores};

                        this.setData({
                            result: result
                        })
                        this.specStore(result, key)
                    }
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
                wx.hideLoading()
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
                wx.hideLoading()
            }
        }).catch(() => {
            wx.showModal({
                content: '请求失败',
                showCancel: false
            })
            wx.hideLoading()
        })
    },

    // 整理sku数据
    specStore(result, key) {
        var data = result.data;
        var specs = newspecs;
        if (key === undefined) {

            specs.forEach(spec => {

                for (let v of spec.values) {
                    v.disabled = !data[v.id] || data[v.id].count == 0;
                }
            });

            this.setData({
                // specs: specs,
                skuTable: result.table
            })
            var canBuy = this.disallow_cart()
            this.setData({
                canBuy: canBuy
            })

            specs.forEach(spec => {

                if (!spec.select) {
                    for (let v of spec.values) {

                        if (!v.disabled && data[v.id] && data[v.id].count) {
                            v.active = true;
                            spec.select = v.id;
                            this.setData({
                                specs: specs
                            })
                            var canBuy = this.disallow_cart()
                            this.setData({
                                canBuy: canBuy
                            })
                            this.specStore(result, v.index)
                            return;
                        }
                    }
                    return
                }
                this.setData({
                    specs: specs
                })
            });


            return;
        }
        var spec = specs[key];
        if (spec.select) {
            this.setData({
                store_count: data[spec.select].count
            })

            for (let i = 0; i < specs.length; i++) {

                if (i === key) continue;
                specs[i].values.forEach(v => {

                    v.disabled = !data[spec.select].specs[v.id].count;

                });


                if (specs[i].select) {
                    this.setData({
                        store_count: data[spec.select].specs[specs[i].select].count,
                    })
                }

                this.setData({
                    specs: specs
                })
            }
        } else {
            this.setData({
                store_count: this.data.detailData.data.store_nums
            })
            for (let i = 0; i < specs.length; i++) {

                if (i === key) continue;


                specs[i].values.forEach(v => {
                    v.disabled = !data[v.id] || !data[v.id].count;
                });


                if (specs[i].select) {
                    this.setData({
                        store_count: data[specs[i].select].count,
                    })

                }

                this.setData({
                    specs: specs
                })
            }
        }
        if (parseInt(this.data.select_count) > this.data.store_count) {
            this.setData({
                select_count: String(this.data.store_count)
            })
        } else if (parseInt(this.data.select_count) === 0) {
            this.setData({
                select_count: '1'
            })
        }
        this.setData({
            specs: specs,
        })

        var canBuy = this.disallow_cart()
        this.setData({
            canBuy: canBuy
        })
    },

    // 处理SKU
    disallow_cart() {

        if (!this.data.specs.length) {
            return !this.data.store_count;
        }

        var ids = [], select_product = {}, specs = this.data.specs;
        this.setData({
            price: Number(this.data.detailData.data.sell_price).toFixed(2),
        })
        for (let spec of specs) {
            if (!spec.select) {
                this.setData({
                    price: Number(this.data.detailData.data.sell_price).toFixed(2),
                    select_product: null
                })
                return true;
            }
            ids.push(spec.select);
            for (let v of spec.values) {
                if (v.id === spec.select) {
                    switch (spec.label_key) {
                        case 'color':
                            select_product.img = v.spec_img;
                            select_product.color = v.alias || v.value;
                            select_product.bac = v.color
                            break;
                        default:
                            select_product.size = v.alias || v.value;
                    }
                    break;
                }
            }
        }
        if (this.data.skuTable) {
            ids = ids[0] > ids[1] ? [ids[1], ids[0]] : ids
            ids = ids.join('-');
            select_product = Object.assign(select_product, this.data.skuTable[ids]);
        }
        this.setData({
            price: Number(select_product.price).toFixed(2),
            select_product: select_product
        })
        return false;
    },


    // 点击选择SKU
    selectSpec(e){

        var spec = {
            key: e.currentTarget.dataset.key,
            index: e.currentTarget.dataset.index,
            disabled: Number(e.currentTarget.dataset.disabled),
            active: Number(e.currentTarget.dataset.active),
            id: Number(e.currentTarget.dataset.id)
        };

        if (spec.disabled) return;
        var specs = this.data.specs;
        if (!spec.active) {
            for (let item of specs[spec.index].values) {
                if (item.active) {
                    item.active = false;
                    break;
                }
            }
        }

        specs[spec.index].values[spec.key].active = !specs[spec.index].values[spec.key].active
        spec.active = !spec.active;
        specs[spec.index].select = spec.active ? spec.id : '';


        newspecs = specs
       /* this.setData({
            specs: specs
        })*/


        var canBuy = this.disallow_cart()
        this.setData({
            canBuy: canBuy
        })
        this.specStore(this.data.result, spec.index)
    },

    // 查询是否收藏改商品
    queryFavoriteStatus(id, type) {
        var token = cookieStorage.get('user_token');
        if (!token) return;

        sandBox.get({
            api: 'api/favorite/isfav',
            header: {
                Authorization: token
            },
            data: {
                favoriteable_id: id,
                favoriteable_type: type
            },
        }).then(res => {
            res = res.data;

            if (res.status) {
                this.setData({
                    is_Fav: !!res.data.is_Fav
                })
            } else {
                wx.showToast({
                    icon: 'nonte',
                    title: res.message
                });
            }
        }).catch(rej => {

        })
    },


    // 收藏
    changeFavorite(id, type) {
        var token = cookieStorage.get('user_token');

        sandBox.post({
            api: 'api/favorite',
            header: {
                Authorization: token
            },
            data: {
                favoriteable_id: id,
                favoriteable_type: type
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        is_Fav: !this.data.is_Fav
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
        }).catch(() => {
            wx.showModal({
                content: '请求失败',
                showCancel: false
            })
        })
    },

    // 数量加减
    changeCount(e){

        var select_count = parseInt(this.data.select_count)

        var index = e.target.dataset.index
        var val = select_count + (parseInt(index) ? 1 : -1)

        if (val > 0 && val <= parseInt(this.data.store_count)) {
            this.setData({
                select_count: val
            })

        } else if (val <= 0) {
            wx.showToast({
                title: '小于最小库存',
                icon: 'none'
            })
        } else if (val > parseInt(this.data.store_count)) {
            wx.showToast({
                title: '超出最大库存',
                icon: 'none'
            })
        }
    },

    // 输入数量
    modifyCount(e){

        var val = parseInt(e.detail.value);
        if (!val) {
            val = 1;
        } else if (!/^[1-9]\d*$/.test(val)) {
            val = val.replace(/[^\d].*$/, '');
            val = parseInt(val) || 1;
        }

        if (val < 0) {
            val = 1;
        } else if (val > this.data.store_count) {
            wx.showToast({
                title: '超过最大库存',
                icon: 'none'
            })
            val = parseInt(this.data.store_count);
        }

        this.setData({
            select_count: val
        })

    },


    // 提交商品
    confirm() {
        if (this.data.loading) return;
        if (this.disallow_cart()) return;

        this.setData({
            loading: true
        })
        var select_product = this.data.select_product;
        var select_count = Number(this.data.select_count);

        var data = this.data.specs.length ? {
                id: select_product.id,
                name: this.data.detailData.data.name,
                qty: select_count,
                store_count: this.data.store_count,
                price: select_product.price,
                market_price: this.data.detailData.data.market_price,
                attributes: {
                    img: select_product.img || this.data.detailData.data.photos[0].url,
                    size: select_product.size,
                    color: select_product.color,
                    com_id: this.data.detailData.data.id
                }
            } : {
                id: this.data.detailData.data.id,
                name: this.data.detailData.data.name,
                qty: select_count,
                store_count: this.data.store_count,
                price: this.data.detailData.data.sell_price,
                market_price: this.data.detailData.data.market_price,
                attributes: {
                    img: this.data.detailData.data.img || this.data.detailData.data.photos[0].url,
                    com_id: this.data.detailData.data.id
                }
            };

        if (select_product.sku) data.attributes.sku = select_product.sku;

        if (this.data.is_login) {
            this.appendToCart(data);
        } else {
            data.local = true;
            data.total = Number(data.qty) * Number(data.price);
            data.color = data.attributes.color;
            data.size = data.attributes.size;
            data.img = data.attributes.img;

            var locals = cookieStorage.get('cart') || [];
            locals.unshift(data);

            var skus = {};
            var save = [];
            locals.forEach(v => {
                let sku, index;
                if (v.attributes && v.attributes.sku) {
                    sku = v.attributes.sku;
                } else {
                    sku = v.id;
                }

                if (skus[sku] === undefined) {
                    index = save.length;
                    v.index = index;
                    v.checked = true;
                    save.push(v);
                    skus[sku] = index;

                } else {
                    let i = skus[sku];
                    save[i].qty += v.qty;
                    save[i].total += v.total;
                    save[i].store_count = this.data.store_count;

                }
            });

            cookieStorage.set('cart', save);

            this.addCart(true)
        }


    },
    // 添加到购物车
    appendToCart(data) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        var oauth = this.data.is_login;
        var json = {};
        data.forEach((v, i) => json[i] = v);
        data = json;

        sandBox.post({
            api: 'api/shopping/cart',
            header: {
                Authorization: oauth
            },
            data: data
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.addCart(true);
                } else {
                    this.addCart(false, res.message)
                }
            } else {
                this.addCart(false)
            }
        }).catch(() => {
            this.addCart(false)
        })
    },
    // 处理加入购物车
    addCart(status, message) {
        this.setData({
            loading: false
        })

        if (status) {
            this.closeSelect();
            this.changeCart();
        } else {
            wx.showModal({
                content: message || '添加到购物车失败，请重试',
                showCancel: false
            })
        }
    },
    // 弹出选择SKU框
    showSelect() {
        this.setData({
            show_select: false
        })

        var animation = new Animation('show');
        animation.positionInit()
    },
    // 关闭SKU选择框
    closeSelect(){
        var animation = new Animation('show');
        animation.up().then(() => {
            this.setData({
                show_select: true
            })
        })
    },
    // 重要，阻止页面滑动
    move() {

    },
    // 切换收藏状态
    changeStatus() {
        var token = cookieStorage.get('user_token');
        if (token) {
            this.changeFavorite(this.data.id, 'goods');
        } else {
            var url = getUrl();
            wx.showModal({
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
    // 获取节点信息
    getDomInfo(name, type) {
        var query = wx.createSelectorQuery();
        query.select(name).boundingClientRect(res => {
            this.setData({
                [`domInfo.${type}`]: res.height
            })
        }).exec();
    },
    // 商品参数处理函数
    attributesList(meta) {
        var topList = [];
        var bottomList = [];

        if (meta && meta.attributes) {
            var attributes = meta.attributes;
            for (var item of attributes) {
                if (item.is_chart === 1) {
                    bottomList.push(item);
                } else {
                    topList.push(item);
                }
            }
        }
        this.setData({
            'attributesList.top': topList,
            'attributesList.bottom': bottomList
        })

    },
    // 点击收缩
    change(e) {
        var expands = this.data.expands[e.currentTarget.dataset.type];
        this.setData({
            [`expands.${e.currentTarget.dataset.type}`]: !expands
        })

    },
    // 切换加入购物车弹出
    changeCart() {
        this.setData({
            show_cart: !this.data.show_cart
        })
    },
    // 进入购物车
    goCart() {
        wx.navigateTo({
            url: '/pages/store/cart/cart'
        });
        this.changeCart();
    },
    // 跳转
    jump(e) {
        if (e.currentTarget.dataset.type == 'shop') {
            wx.switchTab({
                url: '/pages/index/index/index'
            })
        } else if (e.currentTarget.dataset.type == 'cart') {
            wx.navigateTo({
                url: '/pages/store/cart/cart'
            })
        }

    },
    getShearImg() {
        this.setData({
            show_share: false
        })
        wx.navigateTo({
            url: '/pages/store/shearImg/shearImg?id=' + this.data.id
        })
    },
    // 处理按钮状态
    changeText() {
        var ret;
        var commodity = this.data.detailData.data;
        if (!commodity) {
            return
        }

        if (commodity.is_del != 0 || commodity.is_largess != 0) {
            ret = {
                status: false,
                message: '商品已下架'
            }
        } else if (commodity.store_nums <= 0) {
            ret = {
                status: false,
                message: '商品缺货中'
            }
        } else {
            ret = {
                status: true,
                message: '加入购物车'
            }
        }
        this.setData({
            cart_status: ret
        })
    },
})

