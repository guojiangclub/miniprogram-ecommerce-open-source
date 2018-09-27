var app = getApp();
import {config,is,sandBox,cookieStorage} from '../../../lib/myapp.js';
import Animation from '../../../utils/animation';
Page({
    data: {
        page: 1,
        storeList: [],
        orderBy: '',
        sort: '',
        c_id:'',
        meta: '',
        show: false,
        showFilter: false,
        filter: null,
        init: false
    },
    onShareAppMessage() {
        var info = cookieStorage.get('init_info');
        return {
            title: info.title,
            path: `/${this.route}`,
            imageUrl: info.imgUrl,
        }
    },
    onLoad(e) {
        if (e.c_id) {
            this.setData({
                c_id: e.c_id
            })
        }
        if (e.orderBy) {
            this.setData({
                orderBy: e.orderBy,
                sort: e.sort
            })
        }
        var price = { min: '', max: '' };
        var shadows = { attr: {}, specs: {} };
        if (e.attr) {
            e.attr.forEach(v => shadows.attr[v] = true);
        }
        Object.keys(e).forEach(key => {
            let ret = /^specs\[([^\]]+)]$/.exec(key);
            if (ret) {
                let name = ret[1];
                shadows.specs[name] = e[key];
            }
        })
        var priceList = ['0-100', '101-200', '201-300', '301-500', '500-'];

        shadows.price = e.price || '';
        if (!~priceList.indexOf(shadows.price)) {
            var parts = shadows.price.split(/\s*\-\s*/);
            price.min = parts[0] || '';
            price.max = parts[1] || '';
        }
        this.setData({
            price: price,
            shadows: shadows,
            selections: {},
            priceList: priceList,
            priceCache: {}
        })

        var query = {
            sort: this.data.sort,
            orderBy: this.data.orderBy,
            c_id: this.data.c_id
        };

        this.queryCommodityList(query);
    },
    // 价格点击
    checkPrice(e) {
        var num = e.currentTarget.dataset.num;
        if (this.data.shadows.price == num) {
            this.setData({
                'priceCache.value': num
            })
            if (this.data.priceCache.min !== undefined) {
                this.setData({
                    'price.min': this.data.priceCache.min
                })
            }
            if (this.data.priceCache.max !== undefined) {
                this.setData({
                    'price.min': this.data.priceCache.max
                })
            }

            this.setData({
                'shadows.price': ''
            })
        } else {
            if (this.data.price.min !== '') {
                this.setData({
                    'priceCache.min': this.data.priceCache.min
                })
            }
            if (this.data.price.max !== '') {
                this.setData({
                    'priceCache.max': this.data.priceCache.max
                })
            }
            this.setData({
                'price.min': '',
                'price.max': '',
                'shadows.price': num
            })
        }
    },
    // 价格输入
    modifyPrice(e) {
        var type = e.currentTarget.dataset.type
        var val = this.data.price[type ? 'max' : 'min'];
        val = parseFloat(val);
        if (isNaN(val)) val = '';
        if (this.data.price[type] == 'max') {
            this.setData({
                'price.max': val
            })
        } else {
            this.setData({
                'price.min': val
            })
        }
        this.setData({
            'shadows.price': ''
        })
    },
    // 点击筛选条件
    check(e) {
        var type = e.currentTarget.dataset.type;
        var id = type.id;
        var selections = Object.assign({}, this.data.selections);
        if (!selections[id]) {
            for (let k in selections) {
                if (selections.hasOwnProperty(k)) {
                    let o = selections[k]
                    if (o.type === type.type && o.key === type.key) {
                        delete selections[k];
                    }
                }
            }
            selections[id] = {
                key: type.key,
                type: type.type,
                value: type.value,
                field: type.field
            }
        } else {
            delete  selections[id];
        }
        this.setData({
            selections: Object.assign({}, selections)
        })
    },
    // 取消
    cancel() {
        var animation = new Animation('show');
        animation.right().then(() => {
            this.setData({
                showFilter: false,
                selections: {},
                shadows: {}
            });
        })
    },
    // 确定
    confirm() {
        var attr = [], specs = {};
        for (let k in this.data.selections) {
            if (this.data.selections.hasOwnProperty(k)) {
                let o = this.data.selections[k];
                if (o.type === 'attr') {
                    attr.push(o.value);
                } else {
                    specs['specs[' + o.field + ']'] = o.value;
                }
            }
        }
        attr = attr.join(',')
        var price = this.data.shadows.price;
        if (attr.length) {
            var query = Object.assign({}, {attr}, {c_id: this.data.c_id,orderBy: this.data.orderBy, sort: this.data.sort, price: price}, specs)
        } else {
            var query = Object.assign({},{c_id: this.data.c_id,orderBy: this.data.orderBy, sort: this.data.sort, price: price}, specs)
        }
        this.queryCommodityList(query);

    },
    // 筛选
    changeOrderBy(e) {
        var field = e.currentTarget.dataset.type;
        if (this.data.orderBy === field) {
            this.setData({
                sort: this.data.sort === 'desc' ? 'asc' : 'desc'
            })
        } else {
            this.setData({
                orderBy: field,
                sort: 'desc'
            })
        }
        var query = {
            sort: this.data.sort,
            orderBy: this.data.orderBy,
            c_id: this.data.c_id
        };

        this.queryCommodityList(query);
    },
    jump(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + id
        })
    },
    jumpClass() {
        wx.switchTab({
            url: '/pages/index/classification/classification'
        })
    },
    search() {
        wx.navigateTo({
            url: '/pages/store/search/search'
        })
    },
    cart() {
        wx.navigateTo({
            url: '/pages/store/cart/cart'
        })
    },
    onReachBottom() {
        var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
        if (!this.data.showFilter)  {
            if (hasMore) {
                var query = {
                    sort: this.data.sort,
                    orderBy: this.data.orderBy,
                    c_id: this.data.c_id
                };
                var page = this.data.meta.pagination.current_page + 1;
                this.queryCommodityList(query,page);
            } else {
                wx.showToast({
                    image: '../../../assets/image/error.png',
                    title: '再拉也没有啦'
                });
            }
        }
    },
    showFilter() {
        if (this.data.c_id) {
            this.setData({
                showFilter: true
            })
            var animation = new Animation('show');
            animation.Pullleft();
        }
    },
    move() {

    },
    // 查询商品列表
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
                        [`storeList[${page - 1}]`]: res.data,
                        meta: res.meta,
                        init: true
                    })
                    // 右侧筛选赋值
                    if (res.meta && res.meta.filter) {
                        if (Array.isArray(res.meta.filter)) {
                            this.setData({
                                filter: null
                            })
                        } else {
                            let filter = res.meta.filter;
                            let list =[];
                            if (filter.attr && filter.attr.keys) {
                                let type = 'attr';
                                filter.attr.keys.forEach(key => {
                                    let arr = [];
                                    let arrText = [];
                                    for (let attr in filter.attr.values[key]) {
                                        !!attr && arrText.push(filter.attr.values[key][attr])
                                        !!attr && arr.push(attr);
                                    }
                                    list.push({
                                        key,
                                        values: arr.map((v, index) => {
                                            return {id: [type, key, v].join('-'),key,type,value: v, text:arrText[index]}
                                        })
                                    });
                                });
                            }
                            if (filter.specs && filter.specs.keys)  {
                                let type = 'specs';
                                filter.specs.keys.forEach(key => {
                                    let entries = key.split(':');
                                    let field = entries[1];
                                    key = entries[0];
                                    var newKey = key + ':' + field;
                                    let specs = [];
                                    let specsText = [];
                                    for (let spec in filter.specs.values[newKey]) {
                                        !!spec && specsText.push(filter.specs.values[newKey][spec]);
                                        !!spec &&　specs.push(spec);
                                    }
                                    list.push({
                                        key,
                                        values: specs
                                            .map((v, index) => {
                                                return {id: [type, key, v].join('-'), key, type, field, value: v, text: specsText[index]}
                                            })
                                    });
                                })
                            }

                            this.setData({
                                filter: list
                            })
                        }
                    }

                    this.setData({
                        showFilter: false
                    })
                } else {
                    wx.showModal({
                        content: res.message,
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false
                })
            }
            wx.hideLoading();
        })
            .catch(rej =>{
                wx.showModal({
                    title: '',
                    content: '请求失败',
                })
                wx.hideLoading();
            })
    }
})