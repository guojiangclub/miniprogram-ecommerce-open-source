var app = getApp();


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
            cart_status: {
                status: false,
                message: '商品缺货中'
            },
            id: '',
            skuTable: {},
            price: 0,
            commodity: {},
            detailData: {},
            specs: [],
            detail: '',
            attributesList: {
                top: [],
                bottom: []
            },
            expands: {
                parameter: true,    //商品参数
                recommend: true,    //推荐搭配
                commodity: true,    //商品详情
                story: true,    //产品故事
                interest: true,    //TA们也感兴趣
                like: true,    //猜你喜欢
                history: true     //历史浏览
            },
            showToTop: false,
            show_select: true, //选尺寸
            select_product: {}, //当前选中商品
            store_count: 0,
            store_num: 0,
            select_count: 1,
            is_login: true,
    
            canBuy: false,
            query: {},
            animationSelect: {},
            loading: false,
            coupons: [],              // 可领取的优惠券信息
            discounts: [],             // 可享受的优惠折扣信息
            show_coupons: false,        // 领取优惠券
            show_discounts: false,       // 查看促销活动
            show_cart: false,             // 加入购物车弹窗
            message: '',
            purchaseInfo: {
                status: false,
                num: 0
            },          // 限购
            active: false,
            type: 0,
            endTime: {
                interval: '',
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
                count: 0
            },
            startsTime: {
                interval: '',
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
                count: 0
            },
            show_ten: false,  // 网络繁忙弹窗
            config: ''
        },
    
        onShareAppMessage(res){
    
            return {
                title: this.data.commodity.name,
                // path: '/' + this.router + '?id=' + this.data.id,
                path: `/${this.route}?id=${this.data.id}`,
                imageUrl: this.data.commodity.img,
                success: function (res) {
                    wx.showModal({
                        content: '转发成功',
                        showCancel: false,
                    })
                },
                fail: function (res) {
                    wx.showModal({
                        content: '转发取消',
                        showCancel: false,
                    })
                }
            }
        },
    
        onLoad(e){
            // 第三方平台配置颜色
            var gbConfig = cookieStorage.get('globalConfig') || '';
            this.setData({
                config: gbConfig
            })
    
            wx.login({
                success: res => {
                    console.log(res.code)
                }
            })
            wx.showLoading({
                title: "加载中",
                mask: true
            })
    
            if (!e.id) wx.redirectTo({url: '/pages/store/list/list'})
    
            var is_login = cookieStorage.get('user_token')
            this.setData({
                id: e.id,
                query: e,
                is_login: is_login
            });
    
            // this.queryDiscounts(e.id);
    
            this.getGoodsDetail({
                api: `api/store/detail/${e.id}`,
                data: {include: 'photos,oneComment,guessYouLike,point'}
            }).then(() => {
                console.log(this.data.commodity)
                this.attributesList(this.data.detailData.meta);
                wx.setNavigationBarTitle({
                    title: this.data.detailData.data.name
                })
    
                this.setData({
                    price: Number(this.data.commodity.sell_price).toFixed(2),
                    store_count: this.data.commodity.store_nums
                })
                this.changeText();
                this.disallow_cart();
                this.queryCommodityStore(e.id)
                this.queryFavoriteStatus(e.id, 'goods');
    
            });
    
            // 用户登录后请求限购接口
            if (this.data.is_login) {
                //this.goodsPurchase(this.data.id);
            }
    
        },
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
    
        // 网络繁忙倒计时
        HideTen() {
            this.setData({
                show_ten: false
            })
        },
        changeText() {
            var ret;
            var commodity = this.data.commodity;
            var seckill = this.data.detailData.meta.seckill;
    
            if (!commodity) {
                return
            }
    
            if (commodity.is_del != 0) {
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
                    message: '立即兑换'
                }
            }
    
            this.setData({
                cart_status: ret
            })
        },
    
        //    		活动开始的倒计时
        countTime() {
            var d = 86400000,
                h = 3600000,
                n = 60000,
                end = this.data.detailData.meta.seckill.ends_at,
                server = this.data.detailData.meta.seckill.server_time,
                arr = String(end).split(/\D/),
                newArr = String(server).split(/\D/);
            newArr = newArr.map(Number);
            arr = arr.map(Number);
    
            var serverTime = new Date(newArr[0], newArr[1] - 1, newArr[2], newArr[3], newArr[4], newArr[5]).getTime();
    //		        var nowTime = new Date().getTime();
            var endTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
    //		        组件才秒杀列表页使用时，没有重新请求列表，服务器时间应该加上未开始倒计时的时间
            if (this.mold == 'list') {
                serverTime = serverTime + this.startsTime.count;
            }
    
    //		        计算开始时间跟结束时间的差值
            var timeDiff = endTime - serverTime;
    //		        在本地计算倒计时
            var allTime = this.data.endTime.count + 1000
            this.setData({
                'endTime.count': allTime
            })
            // this.endTime.count += 1000;
            var interval = timeDiff - this.data.endTime.count;
            if (interval < 0) {
    //		        	活动结束
                this.isEnd();
    // 			this.$emit('end',this.index)
            } else {
                var day = Math.floor(interval / d);
                Math.floor(interval -= day * d);
                var hour = Math.floor(interval / h);
                Math.floor(interval -= hour * h);
                var minute = Math.floor(interval / n);
                var second = Math.floor(interval % n / 1000);
                this.setData({
                    'endTime.day': day,
                    'endTime.hour': hour,
                    'endTime.minute': minute,
                    'endTime.second': second
                })
                // this.endTime.day = day;
                // this.endTime.hour = hour;
                // this.endTime.minute = minute;
                // this.endTime.second = second;
            }
        },
    
    //            活动未开始的倒计时
        countStartsTime() {
            var d = 86400000,
                h = 3600000,
                n = 60000,
                sta = this.data.detailData.meta.seckill.starts_at,
                server = this.data.detailData.meta.seckill.server_time,
                arr = String(sta).split(/\D/),
                newArr = String(server).split(/\D/);
            newArr = newArr.map(Number);
            arr = arr.map(Number);
            var serverTime = new Date(newArr[0], newArr[1] - 1, newArr[2], newArr[3], newArr[4], newArr[5]).getTime();
            var staTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
            var timeDiff = staTime - serverTime;
            var allTime = this.data.startsTime.count + 1000
            this.setData({
                'startsTime.count': allTime
            })
            // this.startsTime.count += 1000;
            var interval = timeDiff - this.data.startsTime.count;
    //		        var interval = staTime - nowTime;
    
    //		        时间差小于一天
            if (interval < d) {
                this.setData({
                    type: 1
                });
                if (interval < 0) {
    //			        	代表活动已经开始了，需要执行活动开始倒计时
                    var interval = setInterval(this.countTime, 1000);
                    this.setData({
                        active: true,
                        'endTime.interval': interval
                    })
                    this.isStarts();
                    // this.data.active = true;
    //			        	this.startsTime.count = -(this.startsTime.count - 1000)
    // 				this.$emit('starts',this.index);
                    // this.data. = setInterval(this.countTime,1000);
    //                        清除掉倒计时,以免重复分发事件
                    clearInterval(this.data.startsTime.interval);
                } else {
                    var day = Math.floor(interval / d);
                    Math.floor(interval -= day * d);
                    var hour = Math.floor(interval / h);
                    Math.floor(interval -= hour * h);
                    var minute = Math.floor(interval / n);
                    var second = Math.floor(interval % n / 1000);
    
                    this.setData({
                        'startsTime.day': day,
                        'startsTime.hour': hour,
                        'startsTime.minute': minute,
                        'startsTime.second': second
                    })
                    // this.startsTime.day = day;
                    // this.startsTime.hour = hour;
                    // this.startsTime.minute = minute;
                    // this.startsTime.second = second;
                }
            } else {
                this.setData({
                    message: `${arr[1]} 月 ${arr[2]} 日，${arr[3]} : ${arr[4]} 开始`
                })
                // this.message = `${arr[1] - 1} 月 ${arr[2]} 日，${arr[3]} : ${arr[4]} 开始`
            }
        },
    // 秒杀结束执行
        // isEnd() {
        //     if (this.data.detailData.meta.seckill) {
        //         var id = this.data.id;
        //         this.getGoodsDetail({
        //             api: `api/store/detail/${id}`,
        //             data: {include: 'photos,products,oneComment,guessYouLike,whoLike,point'}
        //         })
        //         this.queryCommodityStore(id);
        //     }
        // },
        // isStarts() {
        //     if (this.data.detailData.meta.seckill.init_status == 2) {
        //         var id = this.data.id;
        //         this.getGoodsDetail({
        //             api: `api/store/detail/${id}`,
        //             data: {include: 'photos,products,oneComment,guessYouLike,whoLike,point'}
        //         })
        //         this.queryCommodityStore(id);
        //     }
        // },
    
        change(e) {
            var expands = this.data.expands[e.currentTarget.dataset.type];
            this.setData({
                [`expands.${e.currentTarget.dataset.type}`]: !expands
            })
    
        },
    
        showSelect(e){
            this.setData({
                show_select: false
            })
    
            var animation = new Animation('show');
            animation.positionInit()
        },
        closeSelect(){
    
    
            var animation = new Animation('show');
            animation.up().then(() => {
                this.setData({
                    show_select: true
                })
            })
    
    
        },
    
        changeCount(e){
    
            var select_count = parseInt(this.data.select_count)
    
            var index = e.target.dataset.index
            var val = select_count + (parseInt(index) ? 1 : -1)
    
            if (val > 0 && val <= parseInt(this.data.store_count)) {
                this.setData({
                    select_count: val
                })
                // 用户登录并且开启了限购
                if (this.data.purchaseInfo.status && this.data.is_login) {
                    if (this.data.select_count > this.data.purchaseInfo.num) {
                        this.setData({
                            select_count: this.data.select_count - 1
                        })
                        wx.showToast({
                            title: '超过限购数量',
                            image: '../../../assets/image/error.png'
                        })
                    }
                }
    
            } else if (val <= 0) {
                wx.showToast({
                    title: '小于最小库存',
                    image: '../../../assets/image/error.png'
                })
            } else if (val > parseInt(this.data.store_count)) {
                wx.showToast({
                    title: '超出最大库存',
                    image: '../../../assets/image/error.png'
                })
            }
        },
    
        modifyCount(e){
    
            var val = parseInt(e.detail.value);
            if (!val) {
                val = 1;
            } else if (!/^[1-9]\d*$/.test(val)) {
                val = val.replace(/[^\d].*$/, '');
                val = parseInt(val) || 1;
            }
    
            if (this.data.purchaseInfo.status && this.data.is_login) {
                if (val < 0) {
                    val = 1
                } else if (val > this.data.purchaseInfo.num) {
                    val = this.data.purchaseInfo.num || 1;
                    wx.showToast({
                        title: '超过限购数量',
                        image: '../../../assets/image/error.png'
                    })
                }
            } else {
                if (val < 0) {
                    val = 1;
                } else if (val > this.data.store_count) {
                    wx.showToast({
                        title: '超过最大库存',
                        image: '../../../assets/image/error.png'
                    })
                    val = parseInt(this.data.store_count);
                }
            }
    
            this.setData({
                select_count: val
            })
    
        },
    
    
        showCoupons() {
            this.setData({
                show_coupons: !this.data.show_coupons
            })
        },
        showDiscounts() {
            this.setData({
                show_discounts: !this.data.show_discounts
            })
        },
        getCoupon(e) {
            var is_login = cookieStorage.get('user_token');
            var code = e.currentTarget.dataset.code;
            var index = e.currentTarget.dataset.index;
            if (is_login) {
                this.goodsConvertCoupon(code, index);
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
    
    
            this.setData({
                specs: specs
            })
    
    
            var canBuy = this.disallow_cart()
            this.setData({
                canBuy: canBuy
            })
            // this.queryCommodityStore(id, spec.index);
            this.specStore(this.data.result, spec.index)
        },
    
        specStore(result, key) {
    
            var query = this.data.query;
            var data = result.data;
            var specs = this.data.specs;
    
            if (key === undefined) {
    
                specs.forEach(spec => {
    
                    for (let v of spec.values) {
                        v.disabled = !data[v.id] || data[v.id].count == 0;
                    }
                });
    
    
                this.setData({
                    specs: specs,
                    skuTable: result.table
                })
    
                specs = this.data.specs
                var canBuy = this.disallow_cart()
    
    
                this.setData({
                    canBuy: canBuy
                })
    
                specs.forEach(spec => {
    
                    let name = 'spec[' + spec.id + ']';
                    if (query[name]) {
                        let id = query[name];
    
    
                        for (let v of spec.values) {
    
                            if (v.id == id && !v.disabled && data[v.id] && data[v.id].count) {
                                v.active = true;
                                spec.select = v.id;
                                this.setData({
                                    specs: specs
                                })
                                specs = this.data.specs
                                var canBuy = this.disallow_cart()
    
    
                                this.setData({
                                    canBuy: canBuy
                                })
                                this.specStore(result, v.index)
    
                                return;
                            }
                        }
                    }
    
                    if (!spec.select) {
                        for (let v of spec.values) {
    
                            if (!v.disabled && data[v.id] && data[v.id].count) {
                                v.active = true;
                                spec.select = v.id;
                                this.setData({
                                    specs: specs
                                })
                                specs = this.data.specs
                                var canBuy = this.disallow_cart()
    
    
                                this.setData({
                                    canBuy: canBuy
                                })
    
                                // this.$emit('specStore', result, v.index);
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
                    store_count: this.data.commodity.store
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
    
                    console.log(specs)
    
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
    
        confirm(){
            if (this.data.loading) return;
            if (this.disallow_cart()) return;
    
            this.setData({
                loading: true
            })
            var select_product = this.data.select_product;
            var select_count = Number(this.data.select_count)
            var data = this.data.specs.length ? {
                    id: select_product.id,
                    name: this.data.commodity.name,
                    qty: select_count,
                    store_count: this.data.store_count,
                    price: select_product.price,
                    market_price: this.data.commodity.market_price,
                    attributes: {
                        img: select_product.img || this.data.detailData.data.photos[0].url,
                        size: select_product.size,
                        color: select_product.color,
                        com_id: this.data.commodity.id
                    }
                } : {
                    id: this.data.commodity.id,
                    name: this.data.commodity.name,
                    qty: select_count,
                    store_count: this.data.store_count,
                    price: this.data.commodity.sell_price,
                    market_price: this.data.commodity.market_price,
                    attributes: {
                        img: this.data.commodity.img || this.data.detailData.data.photos[0].url,
                        com_id: this.data.commodity.id
                    }
                };
    
            // if (this.channel) data.attributes.channel = 'employee';
            if (select_product.sku) data.attributes.sku = select_product.sku;
    
            // 判断是否登录
            // var is_login = !!Cache.get(cache_keys.token);
            var datas = {
                product_id: select_product.id,
                quantity: select_count
            }
            if (!select_product.id) {
                datas.goods_id = this.data.id
            }
            var token = cookieStorage.get('user_token');
            if (!token) {
                this.setData({
                    loading: false
                })
                wx.showModal({
                    content: '请先登录',
                    showCancel: false,
                    success: res => {
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            wx.navigateTo({
                                url: '/pages/user/register/register?url=' + getUrl()
                            })
                        }
                    }
                })
            } else {
                this.pointSore(datas);
    
            }
    
    
        },
        addStoreNum() {
    
            // 判断是否登录
            // var is_login = !!Cache.get(cache_keys.token);
            // var cache_store_num = Cache.get(cache_keys.cart);
            var cache_store_num = cookieStorage.get('cart');
            if (this.data.is_login) {
                this.queryShoppingCount();
            } else {
                if (cache_store_num && cache_store_num.length) {
                    var store_num = this.data.store_num;
                    cache_store_num.forEach(v => {
    
                        store_num += v.qty;
                    })
    
                    this.setData({
                        store_num: store_num
                    })
                }
            }
        },
        disallow_cart() {
            if (!this.data.specs.length) {
                return !this.data.store_count;
            }
    
            var ids = [], select_product = {}, specs = this.data.specs;
            console.log(this.data.commodity.sell_price)
            this.setData({
                price: Number(this.data.commodity.sell_price).toFixed(2),
            })
            for (let spec of specs) {
                if (!spec.select) {
                    this.setData({
                        price: Number(this.data.commodity.sell_price).toFixed(2),
                        select_product: null
                    })
                    return true;
                }
    
                ids.push(spec.select);
                for (let v of spec.values) {
                    if (v.id === spec.select) {
                        switch (spec.label_key) {
                            case 'color':
                                select_product.img = v.img;
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
        jump(e) {
            if (e.currentTarget.dataset.type == 'shop') {
                wx.switchTab({
                    url: '/pages/index/index/index'
                })
            } else if (e.currentTarget.dataset.type == 'cart') {
                wx.navigateTo({
                    url: '/pages/store/cart/cart'
                })
            } else {
                wx.navigateTo({
                    url: '/pages/store/detail/detail?id=' + e.currentTarget.dataset.id
                })
            }
    
        },
        jumpToDetail(e){
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: `/pages/store/detail/detail?id=${id}`
            })
        },
        jumpMeal(e){
            var id = e.currentTarget.dataset.suitid;
            wx.navigateTo({
                url: `/pages/store/meal/meal?id=${id}`
            });
        },
        bigImg(e) {
            var srcList = [];
            var src = e.currentTarget.dataset.url;
            this.data.detailData.data.photos.forEach(i => {
                srcList.push(i.url);
            });
            if (src && srcList.length) {
                wx.previewImage({
                    current: src,
                    urls: srcList
                })
            }
    
        },
    
        // 重要！！！！
        move() {
    
        },
    
        goCart() {
            wx.navigateTo({
                url: '/pages/store/cart/cart'
            });
            this.changeCart();
        },
        changeCart() {
            this.setData({
                show_cart: !this.data.show_cart
            })
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
                        image: '../../../assets/image/error.png',
                        title: res.message
                    });
                }
            }).catch(rej => {
                console.log(rej)
            })
        },
        queryCommodityStore(id, key){
            var that = this;
            sandBox.get({api: `api/store/detail/${id}/stock`})
                .then(res => {
                    wx.hideLoading();
                    res = res.data
                    if (!res.status || !res.data || !res.data.specs) return;
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
    
                        that.setData({
                            specs: specs
                        })
                        console.log(specs)
    
                        var canBuy = this.disallow_cart()
    
    
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
                                    data[id].count += Number(value.store);
    
                                    value.ids.forEach(i => {
                                        if (i === id) return;
    
                                        data[id].specs[i] = {
                                            count: Number(value.store)
                                        };
                                    })
                                });
                            });
                        // console.log(data);
                        var result = {data, table: res.data.stores};
    
                        this.setData({
                            result: result
                        })
                        that.specStore(result, key)
                        // this.$emit('specStore', result, key);
                    }
    
                })
                .catch(err => {
    
                })
        },
        queryShoppingCount(){
            var oauth = this.data.is_login
    
    
            sandBox.get({
                api: `api/shopping/cart/count`,
                header: {Authorization: oauth},
            }).then(res => {
    
            }).catch(rej => {
    
            })
        },
        appendToCart(data){
    
            if (!Array.isArray(data)) {
                data = [data];
            }
            var oauth = this.data.is_login
            var json = {};
            data.forEach((v, i) => json[i] = v);
            data = json;
            var that = this;
            sandBox.post({
                api: 'api/shopping/cart',
                header: {Authorization: oauth},
                data: data,
    
            }).then(res => {
                res = res.data
                if (res.status) {
                    that.addCart(true);
                } else {
                    that.addCart(false, res.message)
                }
            }).catch(rej => {
                that.addCart(false)
            })
        },
        addCart(success, message) {
            // this.$refs.button.finish();
    
            this.setData({
                loading: false
            })
            if (success) {
    
                this.closeSelect();
                this.changeCart();
    
                // wx.showModal({
                //     content: '商品成功加入购物车！',
                //     cancelText: '进购物车',
                //     confirmText: '继续购物',
                //     success: function (res) {
                //         if (res.confirm) {
                //            console.log('用户点击取消')
                //         } else if (res.cancel) {
                //            wx.navigateTo({
                //                url: '/pages/store/cart/cart'
                //            })
                //         }
                //     },
                //     fail: function () {
                //         wx.showToast({
                //             title: '添加失败',
                //             image: '../../../assets/image/error.png',
                //         })
                //     }
                // })
    
                // if (typeof window.__analytics == 'function') {
                //     console.log('11212132323')
                //     var cart = {
                //         action :'add to cart',
                //         product:{
                //             sku: this.$brand.name == 'JackWolfskin' ? this.select_product.id :this.select_product.sku,
                //             title: this.commodity.name,
                //             category: this.commodity.tags,
                //             quantity: this.store_count
                //         }
                //     }
                //
                //     window.__analytics({cart})
                // }
            } else {
                if (message) {
                    wx.showToast({
                        title: message,
                    })
                } else {
                    wx.showToast({
                        title: '添加到购物车失败，请重试',
                    })
                }
            }
    
        },
    
        pointSore(data) {
            var token = cookieStorage.get('user_token');
    
            sandBox.post({
                api: 'api/shopping/order/checkout/point',
    
                header: {
                    Authorization: token
                },
                data: data,
    
            }).then(res => {
                res = res.data;
                if (res.status) {
                    this.setData({
                        loading: false
                    })
                    cookieStorage.set('point_order', res.data);
                    wx.navigateTo({
                        url: '/pages/pointStore/order/order',
                    })
                } else {
                    if (res.message == 'User unbind mobile') {
                        wx.showModal({
                            content: '请先绑定手机号',
                            showCancel: false,
                            success: res => {
                                if (res.confirm || (!res.cancel && !res.confirm)) {
                                    wx.navigateTo({
                                        url: '/pages/user/phone/phone?url=' + getUrl()
                                    })
                                }
                            }
                        })
                        this.setData({
                            loading: false
                        })
                        return
                    }
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                    this.setData({
                        loading: false
                    })
                }
            })
        },
        changeFavorite(id, type) {
            var token = cookieStorage.get('user_token');
    
            sandBox.post({
                api: 'api/favorite/store',
    
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
                        is_Fav: !this.data.is_Fav
                    })
                }
            })
        },
        getGoodsDetail (obj) {
            var that = this;
            return new Promise((resolve, reject) => {
                sandBox.get(obj)
                    .then(res => {
                        console.log(res)
                        res = res.data;
                        that.setData({
                            detailData: res,
                            commodity: res.data,
                        })
    
                        if (res.meta.seckill) {
                            var interval = setInterval(this.countStartsTime, 1000);
    
                            that.setData({
                                'startsTime.interval': interval
                            })
                        }
                        if (res.meta.discounts) {
                            res.meta.discounts.coupons.forEach(v => v.receive = false);
                            that.setData({
                                coupons: res.meta.discounts.coupons,
                                discounts: res.meta.discounts.discounts
                            })
                        }
                        resolve()
                    })
                    .catch(err => {
                        console.log(err);
                        reject()
                    })
            })
    
        },
    
    
        // 查询商品详情页优惠折扣信息
        // queryDiscounts(id) {
        //    wx.request({
        //        url: config.GLOBAL.baseUrl + 'api/store/detail/' + id + '/discount',
        //        success: res => {
        //            if (res.statusCode == 200) {
        //                res = res.data;
        //                if (res.status) {
        //                    res.data.coupons.forEach(v => v.receive = false);
        //                    this.setData({
        //                         coupons: res.data.coupons,
        //                         discounts: res.data.discounts
        //                    })
        //                }
        //            }
        //        }
        //    })
        // },
        // 领取优惠券
        goodsConvertCoupon(code, index) {
            var token = cookieStorage.get('user_token');
            sandBox.post({
                api: 'api/coupon/convert',
                header: {
                    Authorization: token
                },
                data: {
                    coupon_code: code
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
            })
        },
        // 秒杀结算
        // checkoutSeckillOrder(data) {
        //     var token = cookieStorage.get('user_token');
        //     sandBox.post({
        //         api: 'api/shopping/order/checkout?seckill_item_id=' + data.seckill_item_id,
        //         header: {
        //             Authorization: token
        //         },
        //         data: data
        //     }).then(res => {
        //         if (res.statusCode == 200) {
        //             res = res.data;
        //             if (res.status) {
        //                 cookieStorage.set('local_order', res.data);
        //                 this.setData({
        //                     loading: false
        //                 });
        //                 wx.navigateTo({
        //                     url: '/pages/store/order/order?type=seckill'
        //                 })
        //             } else {
        //                 if (res.data && res.data.server_busy) {
        //                     this.setData({
        //                         show_ten: true
        //                     })
        //                 } else if (res.message == 'User unbind mobile') {
        //                     wx.showModal({
        //                         content: '请先绑定手机号',
        //                         showCancel: false,
        //                         success: res => {
        //                             if (res.confirm || (!res.cancel && !res.confirm)) {
        //                                 wx.navigateTo({
        //                                     url: '/pages/user/phone/phone?url=' + getUrl()
        //                                 })
        //                             }
        //                         }
        //                     })
        //                 } else {
        //                     wx.showModal({
        //                         content: res.message || '请求失败',
        //                         showCancel: false
        //                     })
        //                 }
        //                 this.setData({
        //                     loading: false
        //                 });
        //             }
    
    
        //         }
        //     })
        // },
        // 商品限购
        // goodsPurchase(id) {
        //     var token = cookieStorage.get('user_token');
    
        //     sandBox.get({
        //         api: 'api/store/goods/purchase/' + id,
        //         header: {
        //             Authorization: token
        //         }
        //     }).then(res => {
        //         if (res.statusCode == 200) {
        //             res = res.data;
        //             if (res.status) {
        //                 if (res.data) {
        //                     this.setData({
        //                         'purchaseInfo.status': true,
        //                         'purchaseInfo.num': res.data.user_limit
        //                     })
        //                 }
        //             } else {
        //                 wx.showModal({
        //                     title: res.message || '接口错误',
        //                     showCancel: false
        //                 })
        //             }
        //         } else {
        //             wx.showModal({
        //                 title: '请求失败',
        //                 showCancel: false
        //             })
        //         }
        //     })
        // }
})