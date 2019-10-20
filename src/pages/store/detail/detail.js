import Rater from '../../../component/rater/rater';
import {
    config,
    getUrl,
    weapp,
    cookieStorage,
    connect,
    bindActionCreators,
    store,
    actions,
    sandBox
} from '../../../lib/myapp.js'
var app = getApp();
import Animation from '../../../utils/animation.js'
Page({
    data: {
        cart_status: {
            status: false,
            message: '商品已下架'
        },
        immediately_text: {
            status: false,
            message: '商品已下架'
        },
        id: '',
        skuTable: {},
        price: 0,
        commodity: {},
        detailData: {
            data:{
                shop_hidden_more_info:''
            }
        },
        specs: [],
        detail: '',
        attributesList: {
            top: [],
            bottom: []
        },
        expands: {
            parameter: true, //商品参数
            recommend: true, //推荐搭配
            commodity: true, //商品详情
            story: true, //产品故事
            interest: true, //TA们也感兴趣
            like: true, //猜你喜欢
            history: true //历史浏览
        },
        showToTop: false,
        show_select: true, //选尺寸
        select_product: {}, //当前选中商品
        store_count: 0,
        store_num: 0,
        select_count: 1,
        is_login: true,
        is_show_tabbar: false,

        show_attention: false,
        canBuy: false,
        query: {},
        animationSelect: {},
        loading: false,
        coupons: [], // 可领取的优惠券信息
        discounts: [], // 可享受的优惠折扣信息
        show_coupons: false, // 领取优惠券
        show_discounts: false, // 查看促销活动
        show_cart: false, // 加入购物车弹窗
        show_share: false, // 弹出分享
        message: '',
        purchaseInfo: {
            status: false,
            num: 0
        }, // 限购
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
        show_ten: false, // 网络繁忙弹窗
        freeInfo: '',
        domInfo: {
            shop: '',
            like: 0
        },
        activeName: 'shop',
        lock: false,
        author: '',
        brand: config.BRAND.name,
        share_img: false,
        shareImg: "",
        show_same: false,
        show_rule: false,
        show_more: false,
        groupon_item_id: '', //子参团id
        url_groupon_item_id: '', //url上面自带的子参团id 通过分享进来的
        groupon_userlist: '', // 拼团用户信息数据
        groupon_itemList: [], // 他们也在拼数据
        meta: '', // 他们也在拼页面数据
        init: false, //是否加载过
        more: true, //是否还可以加载
        page: 1, //当前请求第几页的数据
        emjstatus: {
            percent: 0, //进度条百分比
            lauch: false, //第一个icon控制
            half: false, //第二个icon控制
            end: false //第三个icon控制
        },
        show_third: false, //弹出第三方供货
        config: '',
        gbConfig: '',
        price_interval: '',
        initInfoData: '',
        is_immediately: false,
        is_refused: false,
        is_fives: false,
        show_more_shop: false,
        freeGoodsInfo: '',
        shopInfo: ''

    },

    onShareAppMessage(res) {
        this.changeShare();
        var codeTitle = ''
        if (this.data.commodity.user) {
            codeTitle = this.data.commodity.user.nick_name + '向您推荐' + this.data.commodity.name;
        }
        var priceTitle = '￥ ' + this.data.commodity.sell_price + ' | ' + this.data.commodity.name;
        var id = this.data.commodity.user ? this.data.commodity.user.id : ''
        return {
            title: priceTitle,
            // path: '/' + this.router + '?id=' + this.data.id,
            path: `/${this.route}?id=${this.data.id}&agent_code=${this.data.detailData.data.agent_code}&user_id=${id}&is_share=true`,
            imageUrl: this.data.commodity.img,
        }
    },

    onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        var init = cookieStorage.get('init');
        var accountInfo = wx.getAccountInfoSync();
        this.setData({
            config: gbConfig,
            accountInfo: accountInfo,
            author: init && init.other_technical_support ? init.other_technical_support : ''
        })
        if (!gbConfig) {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
            if (extConfig) {
                this.setData({
                    config: extConfig,
                })
            }
        }
        wx.showLoading({
            title: "加载中",
            mask: true
        })

        // 显示页面转发按钮
        wx.showShareMenu({
            withShareTicket: true
        })



        var id = '';
        var groupon_item_id = '';
        var user_id = '';


        if (e.id) {
            id = e.id
            this.setData({
                id:e.id
            })
        }
        if (e.user_id) {
            user_id = e.user_id
        }
        if (e.groupon_item_id) {
            groupon_item_id = e.groupon_item_id;
            this.setData({
                url_groupon_item_id: e.groupon_item_id
            })
        }

        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 1) {
                groupon_item_id = sceneArr[2] ? sceneArr[2] : '';
                this.setData({
                    url_groupon_item_id: sceneArr[2] ? sceneArr[2] : ''
                })
            }

            id = sceneArr[0];

            if (sceneArr[3]) {
                user_id = sceneArr[3];
                this.beSharePoint(id, sceneArr[3]);
            }

        }

        if (!id) {
            wx.redirectTo({ url: '/pages/store/list/list' })
            return
        }

        if (e.is_share && e.user_id) {
            this.beSharePoint(id, user_id);
        }

        var is_login = cookieStorage.get('user_token');
        this.setData({
            id: id,
            query: e,
            is_login: is_login,
            groupon_item_id: groupon_item_id,
            user_id: user_id
        });
        // this.queryDiscounts(e.id);
        this.init(e);



        /*
         分销相关 S
         */




        /*
         分销相关 E
         */





        // 用户登录后请求限购接口
        // if (this.data.is_login) {
        //     this.goodsPurchase(this.data.id);
        // }

       // this.getCustomModel();
        //this.getShopInfo();
        var shareTicketInfo = cookieStorage.get('shareTicketInfo');
        this.getStoreDetail()
        this.getGid(shareTicketInfo)
    },
    jumpRecharge() {
        var token = cookieStorage.get('user_token');
        if (token) {
            wx.navigateTo({
                url: '/pages/recharge/index/index'
            });
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
    jumpSvip() {
        if (this.data.detailData.meta.vip_plan) {
            var link = this.data.detailData.meta.vip_plan.vip_plan_equity_link;

            wx.navigateTo({
                url: '/pages/other/links/links?url=' + link
            });
        }
    },
    closeAlert() {
        this.setData({
            is_refused: false
        })
    },
    callPhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.service_info.online_service_self.phone
        })
    },
    setCode(e) {
        var agent_code = '';
        if (e.agent_code) {
            agent_code = e.agent_code
        }
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[1]
            }
        }
        // 获取agent_code存缓存里
        if (agent_code) { 
            // 如果有agent_code并且有coupon_agent_code就将coupon_agent_code清除，保证agent_code为第一位
            if (cookieStorage.get('coupon_agent_code')) {
                cookieStorage.clear('coupon_agent_code')
            }

            const timeMap = {
                y: 31536000000,
                m: 2592000000,
                d: 86400000,
                h: 3600000,
                n: 60000,
                s: 1000
            };
            // 默认有效期为7天
            var valid_time = "";
            if (!cookieStorage.get('distribution_valid_time')) {
                valid_time = 10080;
            } else {
                valid_time = cookieStorage.get('distribution_valid_time');
            }


            let timeStamp = new Date().getTime();
            timeStamp += timeMap.n * valid_time;
            // 如果有agent_code就讲这次进入的时间缓存
            cookieStorage.set('agent_code_time', timeStamp, valid_time + 'n');

            // 如果缓存中没有agent_code
            if (!cookieStorage.get('agent_code')) {
                var data = [];
                data.push({
                    id: this.data.id,
                    time: timeStamp
                });
                cookieStorage.set('agent_code', agent_code, valid_time + 'n');
                cookieStorage.set('agent_goods_id', data);
            } else {
                // 判断缓存的code和从url的code相等
                if (agent_code == cookieStorage.get('agent_code')) {
                    var data = cookieStorage.get('agent_goods_id') ? cookieStorage.get('agent_goods_id') : [];
                    var flag = false;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == this.data.id) {
                            flag = true;
                            data[i].time = timeStamp;
                            break
                        }
                    }
                    if (!flag) {
                        data.push({
                            id: this.data.id,
                            time: timeStamp
                        })
                    }
                    cookieStorage.set('agent_code', agent_code, valid_time + 'n');
                    cookieStorage.set('agent_goods_id', data);
                } else {
                    var data = [];;
                    data.push({
                        id: this.data.id,
                        time: timeStamp
                    })
                    cookieStorage.set('agent_code', agent_code, valid_time + 'n');
                    cookieStorage.set('agent_goods_id', data);
                    // cookieStorage.set('agent_scan', 0, valid_time + 'n');
                }


            }
        }
    },

    // 初始化数据
    init(e) {
        var token = cookieStorage.get('user_token');
        var agent_code = '';
        if (e.agent_code) {
            agent_code = e.agent_code
        }
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[1]
            }
        }
        sandBox.get({
            api: 'api/system/init'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data)

                    var shareTicketInfo = cookieStorage.get('shareTicketInfo');
                    var init = cookieStorage.get('init');
                    var service_info = cookieStorage.get('service_info');

                    this.setData({
                        service_info: service_info,
                        initInfoData: res.data
                    })
                    if (shareTicketInfo && init && init.get_gid == 1) {

                        this.getGid(shareTicketInfo);
                    } else {
                        //this.getStoreDetail();
                    }
                    if (agent_code && res.data.mini_program_login_type == 'default' && !token) {
                        wx.showLoading({
                            title: '正在自动登录',
                            mask: true
                        })
                        wx.login({
                            success: res => {
                                if (res.code) {
                                    app.autoLogin(res.code, agent_code)
                                        .then(res => {
                                            if (res.status) {
                                                if (res.data.access_token) {
                                                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                                                    this.setData({
                                                        is_login: access_token
                                                    })
                                                }
                                                if (res.data.open_id) {
                                                    wx.reLaunch({
                                                        url: '/pages/user/agentlogin/agentlogin?agent_code=' + agent_code + '&open_id=' + res.data.open_id + '&url=' + getUrl()
                                                    })
                                                }
                                            }
                                            wx.hideLoading();
                                        }, err => {
                                            wx.hideLoading();
                                        })
                                } else {
                                    wx.showToast({
                                        title: '获取code失败',
                                        icon: 'none'
                                    })
                                }
                            }
                        })
                    }
                } else {
                    this.getStoreDetail();
                }
                this.setCode(e)
            } else {
                this.setCode(e)
            }
        }).catch(err => {
            this.setCode(e)
        })
    },

    // 获取群id信息
    getGid(shareTicketInfo) {
        wx.login({
            success: res => {
                wx.getShareInfo({
                    shareTicket: shareTicketInfo,
                    success: ret => {
                        var gidData = ret;
                        var user_id = this.data.user_id;
                        gidData.code = res.code;
                        app.getGid(gidData, user_id)
                            .then(res => {
                                if (res.status) {
                                    this.getStoreDetail(res.data.openGId);
                                    cookieStorage.clear('shareTicketInfo')
                                } else {
                                    if (res.message == '获取失败') {
                                        wx.showModal({
                                            content: '获取openGId失败,点击重试',
                                            showCancel: false,
                                            success: res => {
                                                if (res.confirm || (!res.cancel && !res.confirm)) {
                                                    var shareTicketInfo = cookieStorage.get('shareTicketInfo');
                                                    this.getGid(shareTicketInfo);
                                                }
                                            }
                                        })
                                    } else {
                                        wx.showModal({
                                            content: res.message || '获取openGId失败',
                                            showCancel: false
                                        })
                                        this.getStoreDetail();
                                    }
                                    wx.hideLoading();
                                }
                            }, err => {
                                this.getStoreDetail();
                            })
                    },
                    fail: err => {
                       // this.getStoreDetail();
                    }
                })
            }
        })
    },
    // 请求商品详情页面数据
    getStoreDetail(wechat_group_id) {
        var token = cookieStorage.get('user_token') || '';
        var wechat_group_id = wechat_group_id || cookieStorage.get('openGId') || '';
        this.getGoodsDetail({
            api: `api/store/detail/${this.data.id}`,
            header: {
                Authorization: token
            },
            data: {
                include: 'photos,oneComment,guessYouLike,point,user',
                //...
                multi_groupon_item_id: this.data.groupon_item_id,
                wechat_group_id: wechat_group_id
            }
        }).then(() => {
            if (this.data.detailData.data.shop_hidden_more_info == 0) {
                this.getDomInfo('.js__top', 'shop');
                // this.getDomInfo('.js__like', 'like');
                this.getDomInfo('.js__comment', 'comment');
            }

            if (this.data.detailData.data.oneComment && this.data.detailData.data.oneComment.length) {
                Rater.init('store', {
                    value: this.data.detailData.data.oneComment[0].point,
                    disabled: true,
                    activeColor: '#EA4448',
                    fontSize: 14
                })
            }



            this.attributesList(this.data.detailData.meta);
            wx.setNavigationBarTitle({
                title: this.data.detailData.data.name
            })
            var price_interval = '￥' + this.data.detailData.data.min_price + ' - ' + '￥' + this.data.detailData.data.max_price;
            if (this.data.detailData.data.min_price == this.data.detailData.data.max_price) {
                // price_interval = '￥' + this.data.detailData.data.min_price
            }
            this.setData({
                    price_interval: price_interval,
                    is_show_tabbar: true
                })
                // 新增
            this.setData({
                price: Number(this.data.commodity.sell_price).toFixed(2),
                store_count: this.data.commodity.store_nums
            })
            this.changeText();
            this.immediatelyText();
            this.disallow_cart();
            this.queryCommodityStore(this.data.id)
            this.queryFavoriteStatus(this.data.id, 'goods');
           // this.getFree(this.data.id);


        });
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
    // 监听页面滚动
    onPageScroll(e) {
        if (this.data.detailData.data.shop_hidden_more_info) {
            return
        }
        var shop = this.data.domInfo.shop;
        var like = 0;
        var comment = this.data.domInfo.comment;
        if (!this.data.lock) {
            if (e.scrollTop < shop) {
                this.setData({
                    activeName: 'shop'
                })
            } else if (e.scrollTop > shop + like && e.scrollTop < shop + like + comment) {
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
    // 网络繁忙倒计时
    HideTen() {
        this.setData({
            show_ten: false
        })
    },
    //跳转购物车页面
    shopCar(){
        wx.navigateTo({
            url:'/pages/store/cart/cart'
        })
    },
    // 弹出客服
    showServer() {
        var srcList = ['https://ibrand-miniprogram.oss-cn-hangzhou.aliyuncs.com/%E5%B0%8F%E7%A8%8B%E5%BA%8F/QQ20180517-0.jpg'];
        wx.previewImage({
                urls: srcList
            })
            /*this.setData({
             showServer: !this.data.showServer
             })*/
    },
    // 弹出分享
    changeShare() {
        this.setData({
            show_share: !this.data.show_share
        })
    },
    //弹出规则
    sharRules() {
        this.setData({
            show_rule: !this.data.show_rule
        })
    },
    //弹出第三方供货详情
    changeThird() {
        this.setData({
            show_third: !this.data.show_third
        })
    },
    //弹出更多拼团
    seeMore() {
        this.setData({
            show_more: !this.data.show_more
        })
    },
    //点击幕布关闭更多拼团
    closeMore() {
        this.setData({
            show_more: false
        })
    },
    //关闭规则
    closeRule() {
        this.setData({
            show_rule: false
        })
    },
    // 弹出图片
    changeImg() {
        this.setData({
            share_img: !this.data.share_img
        })
    },
    jumpAuthor() {
        wx.navigateTo({
            url: '/pages/index/author/author'
        });
    },
    jumpFreeLink(e) {
        let link = e.currentTarget.dataset.link;
        wx.navigateTo({
            url: link,
            fail: () => {
                wx.switchTab({
                    url: link
                })
            }
        });
    },
    // 获取分享图片
    getShearImg() {
        wx.showLoading({
            title: "生成中",
            mask: true
        })
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/distribution/createMiniShareImg',
            header: {
                Authorization: token
            },
            data: {
                goods_id: this.data.id
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        shareImg: res.data.image
                    }, () => {
                        this.changeImg();
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
            wx.hideLoading();
            this.changeShare();
        }).catch(rej => {
            wx.showModal({
                content: '内部错误',
                showCancel: false
            })
            wx.hideLoading();
            this.changeShare();
        })
    },
    // 下载图片
    downImg(){
        wx.downloadFile({
            url: `${this.data.shareImg}`, 
            success (res) {
              if (res.statusCode === 200) {
                wx.playVoice({
                  tempFilePath: res.tempFilePath,
                })
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function () {
                        wx.showToast({
                            title: '保存图片成功',
                            icon: 'none'
                        })
                        wx.hideLoading();
                    },
                    fail: rej => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '保存图片失败',
                            icon: 'none'
                        })
                    }
                })
              }
            }
          })
    },
    // downImg() {
    //     if (this.data.shareImg) {
    //         console.log('this.data.shareImg',this.data.shareImg)
    //         wx.showLoading({
    //             title: '正在下载',
    //             mask: true
    //         });
    //         sandBox.dowloadFile({
    //             api: this.data.shareImg
    //         }).then(res => {
    //             if (res.statusCode == 200) {
    //                 wx.getSetting({
    //                     success: ret => {
    //                         // 如果之前没有授权
    //                         if (!ret.authSetting['scope.writePhotosAlbum']) {
    //                             wx.authorize({
    //                                 scope: 'scope.writePhotosAlbum',
    //                                 success: rej => {
    //                                     this.saveImg(res.tempFilePath);
    //                                 },
    //                                 // 用户拒绝授权
    //                                 fail: ret => {
    //                                     this.setData({
    //                                         is_refused: true
    //                                     })
    //                                     wx.hideLoading();
    //                                 }
    //                             })
    //                         } else {
    //                             this.saveImg(res.tempFilePath);
    //                         }
    //                     }
    //                 })
    //             } else {
    //                 wx.hideLoading();
    //                 wx.showToast({
    //                     title: '下载图片失败',
    //                     icon: 'none'
    //                 })
    //             }
    //         }, err => {

    //         })
    //     }
    // },
    // 保存图片
    saveImg(path) {
        wx.saveImageToPhotosAlbum({
            filePath: path,
            success: res => {
                wx.hideLoading();
            },
            fail: rej => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存图片失败',
                    icon: 'none'
                })
            }
        })
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
    jumpScroll(e) {
        var type = e.target.dataset.type;

        if (type == 'shop') {
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        } else if (type == 'comment') {
            wx.pageScrollTo({
                scrollTop: this.data.domInfo.shop + this.data.domInfo.like + 10,
                duration: 0
            });
        } else if (type == 'details') {
            wx.pageScrollTo({
                scrollTop: this.data.domInfo.shop + this.data.domInfo.like + this.data.domInfo.comment,
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
    viewComment() {
        wx.navigateTo({
            url: '/pages/store/comment/comment?id=' + this.data.id
        })
    },
    immediatelyText() {
        var ret;
        var commodity = this.data.commodity;
        var seckill = this.data.detailData.meta.seckill;
        var group = this.data.detailData.meta.multiGroupon;
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
                message: '立即购买'
            }
        }

        if (seckill && seckill.init_status == 2) {
            ret = {
                seckill: false,
                message: '原价购买'
            }
        } else if (seckill && seckill.init_status == 1) {
            ret = {
                seckill: true,
                message: '立即抢购'
            }
        }

        if (group && commodity.multi_groupon_init_status == 2) {
            ret = {
                group: false,
                message: '原价购买'
            }
        } else if (group && commodity.multi_groupon_init_status == 1) {
            if (this.data.detailData.data.multi_groupon_join_status == 1) {
                ret = {
                    group: true,
                    message: '已参团'
                }

            } else if (this.data.groupon_item_id) {
                ret = {
                    group: true,
                    message: '一键参团'
                }
            } else {
                ret = {
                    group: true,
                    message: '一键开团'
                }
            }
        }


        this.setData({
            immediately_text: ret
        })
    },
    changeMoreShop() {
        this.setData({
            show_more_shop: !this.data.show_more_shop
        })
    },
    changeText() {
        var ret;
        var commodity = this.data.commodity;
        var seckill = this.data.detailData.meta.seckill;
        var group = this.data.detailData.meta.multiGroupon;
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
        } else if ((this.data.id == 752 || this.data.id == 753) && this.data.accountInfo.miniProgram.appId == 'wxaeb31c404bc0abee') {
            this.setData({
                is_fives: true
            })
            ret = {
                status: true,
                message: '立即购买'
            }
        } else {
            ret = {
                status: true,
                message: '加入购物车'
            }
        }


        if (seckill && seckill.init_status == 2) {
            ret = {
                status: true,
                seckill: false,
                message: '原价购买'
            }
        } else if (seckill && seckill.init_status == 1) {
            ret = {
                status: true,
                seckill: true,
                message: '立即抢购'
            }
        }

        if (group && commodity.multi_groupon_init_status == 2) {
            ret = {
                status: true,
                group: false,
                message: '原价购买'
            }
        } else if (group && commodity.multi_groupon_init_status == 1) {
            if (this.data.detailData.data.multi_groupon_join_status == 1) {
                ret = {
                    status: true,
                    group: true,
                    message: '已参团'
                }

            } else if (this.data.groupon_item_id) {
                ret = {
                    status: true,
                    group: true,
                    message: '一键参团'
                }
            } else {
                ret = {
                    status: true,
                    group: true,
                    message: '一键开团'
                }
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
        var allTime = this.data.endTime.count + 1000;
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
        }
    },

    change(e) {
        var expands = this.data.expands[e.currentTarget.dataset.type];
        this.setData({
            [`expands.${e.currentTarget.dataset.type}`]: !expands
        })

    },
    jumpCollage() {
        var multi_groupon_item_id = this.data.groupon_userlist.multi_groupon_item_id;
        wx.navigateTo({
            url: `/pages/store/collage/collage?multi_groupon_item_id=${multi_groupon_item_id}`
        })
    },

    showSelect(e) {
        /*if (this.data.id == 1) {
            this.call();
            return
        }*/



        var id = e.target.dataset.id;
        var group = this.data.detailData.meta.multiGroupon;
        var multi_groupon_item_id = this.data.groupon_userlist.multi_groupon_item_id;
        if (group && this.data.commodity.multi_groupon_init_status == 1 && this.data.detailData.data.multi_groupon_join_status == 1) {
            if (this.data.detailData.data.multi_groupon_order_no) {
                wx.showModal({
                    content: '您的参团订单未支付，点击确定继续支付',
                    success: res => {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/store/payment/payment?order_no=' + this.data.detailData.data.multi_groupon_order_no
                            })
                        }
                    }
                })
            } else {
                wx.navigateTo({
                    url: `/pages/store/collage/collage?multi_groupon_item_id=${multi_groupon_item_id}`
                })
            }
        } else {
            //直接进来,URL上面没有子参团id，想要从他们也在拼的去参团买
            if (id) {
                this.setData({
                    show_more: false,
                    groupon_item_id: id
                })
            } else if (this.data.url_groupon_item_id) { //通过分享进来的
                this.setData({
                    groupon_item_id: this.data.url_groupon_item_id,
                })
            } else {
                this.setData({
                    groupon_item_id: ''
                })
            }
            if (e.target.dataset.status && (this.data.immediately_text.message == '立即购买' || this.data.immediately_text.message == '原价购买')) {
                this.setData({
                    is_immediately: true
                });
            } else {
                this.setData({
                    is_immediately: false
                })
            }
            this.setData({
                is_alone: false,
                show_select: false,
            })

            var animation = new Animation('show');
            animation.positionInit()
        }
    },

    // 子团点击
    multiAddToCart(e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.join;
        var order_no = e.currentTarget.dataset.order_no;
        if (status == 1) {
            // 当订单未付款时跳转到付款页面
            if (order_no) {
                wx.showModal({
                    content: '您的参团订单未支付，点击确定继续支付',
                    success: res => {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/store/payment/payment?order_no=' + order_no
                            })
                        }
                    }
                })
            } else {
                wx.navigateTo({
                    url: `/pages/store/collage/collage?multi_groupon_item_id=${id}`
                })
            }
            return
        }

        if (id) {
            this.setData({
                show_more: false,
                groupon_item_id: id
            })
        } else if (this.data.url_groupon_item_id) {
            this.setData({
                groupon_item_id: this.data.url_groupon_item_id,
            })
        } else {
            this.setData({
                groupon_item_id: ''
            })
        }
        this.setData({
            show_select: false,
            is_alone: false
        })
        var animation = new Animation('show');
        animation.positionInit()
    },

    // 单独购买
    aloneAddToCart() {
        this.setData({
            is_alone: true,
            show_select: false
        });
        var animation = new Animation('show');
        animation.positionInit()
    },
    // 立即购买
    immediately() {
        this.setData({
            is_immediately: true,
            show_select: false
        });
        var animation = new Animation('show');
        animation.positionInit()
    },
    closeSelect() {
        var animation = new Animation('show');
        animation.up().then(() => {
            this.setData({
                show_select: true
            })
        })
    },

    changeCount(e) {

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

    modifyCount(e) {

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
    changeAttention() {
        if (this.data.service_info.online_service_type !== 'self') return
        this.setData({
            show_attention: !this.data.show_attention
        })
    },
    showDiscounts() {
        this.setData({
            show_discounts: !this.data.show_discounts
        })
    },
    showSame() {
        this.setData({
            show_same: !this.data.show_same
        })
    },
    getCoupon(e) {
        var is_login = cookieStorage.get('user_token');
        var discount_id = e.currentTarget.dataset.discountId;
        var index = e.currentTarget.dataset.index;
        if (is_login) {
            this.goodsConvertCoupon(discount_id, index);
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
    selectSpec(e) {

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

    confirm() {
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

        //      秒杀开始添加信息
        if (this.data.detailData.meta.seckill && this.data.detailData.meta.seckill.init_status == 1) {
            var newData = {};
            newData.attributes = {};
            newData.id = data.id;
            newData.img = data.attributes.img || this.data.detailData.data.photos[0].url;
            newData.name = data.name;
            newData.price = data.price;
            newData.qty = data.qty;
            newData.total = data.qty * data.price;
            newData.seckill_goods_id = this.data.detailData.meta.seckill.item_id;
            newData.seckill_item_id = this.data.detailData.meta.seckill.id;

            if (this.data.specs.length) {
                newData.attributes['dynamic_sku'] = {};
                newData.attributes['dynamic_sku'].id = data.id;
                newData.attributes['dynamic_sku'].size = data.attributes.size;
                newData.attributes['dynamic_sku'].color = data.attributes.color;
            }

        }

        // 拼团开始添加信息
        if (this.data.detailData.meta.multiGroupon && this.data.commodity.multi_groupon_init_status == 1) {
            var grouponData = data;
            grouponData.multi_groupon_id = this.data.detailData.meta.multiGroupon.id;
            grouponData.price = this.data.detailData.meta.multiGroupon.price;
            grouponData.multi_groupon_item_id = this.data.groupon_item_id;
        }

        // 添加511特殊需求信息
        if ((this.data.id == 752 || this.data.id == 753) && this.data.accountInfo.miniProgram.appId == 'wxaeb31c404bc0abee') {
            var landData = data;
            landData.product_id = data.id;
        }

        // 是否点击的是立即购买
        if (this.data.is_immediately) {
            var immdeData = data;
            immdeData.product_id = data.id;
        }

        // 判断是否登录
        // var is_login = !!Cache.get(cache_keys.token);


        // 判断是否参与秒杀并且秒杀开始
        if (this.data.detailData.meta.seckill && this.data.detailData.meta.seckill.init_status == 1) {
            if (!this.data.is_login) {
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
            } else {
                this.checkoutSeckillOrder(newData);
            }
        } else if (this.data.detailData.meta.multiGroupon && this.data.commodity.multi_groupon_init_status == 1 && !this.data.is_alone) {
            if (!this.data.is_login) {
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
            } else {
                this.checkoutGroupOrder(grouponData);
            }
        } else if (this.data.is_immediately) {
            if (!this.data.is_login) {
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
            } else {
                // 是否立即购买
                this.checkoutImmdeOrder(immdeData)
            }
        } else if ((this.data.id == 752 || this.data.id == 753) && this.data.accountInfo.miniProgram.appId == 'wxaeb31c404bc0abee') {
            if (!this.data.is_login) {
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
            } else {
                // 511特殊需求
                this.checkoutLandOrder(landData);
            }
        } else {
            if (this.data.is_login) {
                this.appendToCart(data);
                this.addStoreNum();
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

                this.setData({
                    store_num: 0
                })
                this.addStoreNum();
                this.addCart(true)
            }
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
        console.log('1')
        if (!this.data.specs.length) {
            return !this.data.store_count;
        }

        var ids = [],
            select_product = {},
            specs = this.data.specs;
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
                    console.log('spec.label_key',spec.label_key)
                    if (spec.label_key=='Color') {
                        // case 'color':
                            select_product.img = v.img;
                            select_product.color = v.alias || v.value;
                            select_product.bac = v.color
                            // break;
                        // default:
                            // select_product.size = v.alias || v.value;
                    }else if(spec.label_key=='Size'){
                        select_product.size = v.alias || v.value;
                    }
                    // break;
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
        console.log('select_product',select_product)
        console.log("select_product.color,select_product.size",select_product.color,select_product.size)
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
    jumpToDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/store/detail/detail?id=${id}`
        })
    },
    jumpMeal(e) {
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
    previewImage() {
        wx.previewImage({
            current: this.data.service_info.online_service_self.qr_code,
            urls: [this.data.service_info.online_service_self.qr_code]
        })
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
        })
    },
    call(e) {
        var token = cookieStorage.get('user_token');
        var id = this.data.freeInfo.id;
        var CallUrl = '/pages/store/call/call?id=' + id;

        if (!token) {
            var url = getUrl();
            wx.navigateTo({
                url: '/pages/user/register/register?url=' + url
            })
            return
        }

        wx.navigateTo({
            url: CallUrl
        })
    },
    // 请求sku
    queryCommodityStore(id, key) {
        var that = this;
        sandBox.get({ api: `api/store/detail/${id}/stock` })
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
                                data[id] = data[id] || { count: 0, specs: {} };
                                data[id].count += Number(value.store);

                                value.ids.forEach(i => {
                                    if (i === id) return;

                                    data[id].specs[i] = {
                                        count: Number(value.store)
                                    };
                                })
                            });
                        });
                    var result = { data, table: res.data.stores };

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
    queryShoppingCount() {
        var oauth = this.data.is_login


        sandBox.get({
            api: `api/shopping/cart/count`,
            header: { Authorization: oauth },
        }).then(res => {

        }).catch(rej => {

        })
    },
    appendToCart(data) {

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
            header: { Authorization: oauth },
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
        this.setData({
            loading: false
        })
        if (success) {

            this.closeSelect();
            this.changeCart();
        } else {
            if (message) {
                wx.showToast({
                    title: message,
                    icon: 'none'
                })
            } else {
                wx.showToast({
                    title: '添加到购物车失败，请重试',
                    icon: 'none'
                })
            }
        }

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
    // 请求商品详情页面数据
    getGoodsDetail(obj) {
        var that = this;
        return new Promise((resolve, reject) => {
            sandBox.get(obj)
                .then(res => {

                    if (res.statusCode == 200) {
                        res = res.data;
                        if (res.status) {
                            that.setData({
                                detailData: res,
                                commodity: res.data,
                            })
                            if (res.meta.discounts) {
                                res.meta.discounts.coupons.forEach(v => v.receive = false);
                                that.setData({
                                    coupons: res.meta.discounts.coupons,
                                    discounts: res.meta.discounts.discounts
                                })
                            }
                            if (res.meta.multiGroupon) { //当有拼团，并且拼团正在进行中
                                var id = this.data.id; // 商品id
                                var multi_groupon_item_id = this.data.groupon_item_id; // 子参团id
                                this.getGrouponUserList(id, multi_groupon_item_id);
                                this.getGrouponItems(res.meta.multiGroupon.id, 1, multi_groupon_item_id);
                                this.controlProgress();
                            }
                            resolve()
                        } else {
                            wx.showModal({
                                content: res.message || '请求失败',
                                showCancel: false
                            })
                            wx.hideLoading();
                            reject()
                        }

                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                        wx.hideLoading();
                        reject()
                    }


                })
                .catch(err => {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                    wx.hideLoading();
                    reject()
                })
        })

    },
    // 领取优惠券
    goodsConvertCoupon(discount_id, index) {
        var token = cookieStorage.get('user_token');
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
        })
    },
    // 秒杀结算
    checkoutSeckillOrder(data) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/checkout?seckill_item_id=' + data.seckill_item_id,
            header: {
                Authorization: token
            },
            data: data
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('local_order', res.data);
                    this.setData({
                        loading: false
                    });
                    wx.navigateTo({
                        url: '/pages/store/order/order?type=seckill'
                    })
                } else {
                    if (res.data && res.data.server_busy) {
                        this.setData({
                            show_ten: true
                        })
                    } else if (res.message == 'User unbind mobile') {
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
                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                    }
                    this.setData({
                        loading: false
                    });
                }


            }
        })
    },

    // 拼团结算
    checkoutGroupOrder(data) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/checkout',
            header: {
                Authorization: token
            },
            data: data
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var info = {
                        multi_groupon_id: data.multi_groupon_id,
                        multi_groupon_item_id: data.multi_groupon_item_id
                    };
                    cookieStorage.set('group_info', info);
                    cookieStorage.set('local_order', res.data);
                    this.setData({
                        loading: false
                    });
                    wx.navigateTo({
                        url: '/pages/store/order/order?type=groupon'
                    })
                } else {
                    if (res.data && res.data.server_busy) {
                        this.setData({
                            show_ten: true
                        })
                    } else if (res.message == 'User unbind mobile') {
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
                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                    }
                    this.setData({
                        loading: false
                    });
                }


            }
        })
    },

    // 虚拟参团
    jumpVirtual() {
        wx.navigateTo({
            url: '/pages/store/virtual/virtual?id=' + this.data.id + '&multi_groupon_id=' + this.data.detailData.meta.multiGroupon.id
        })
    },
    // 511特殊需求
    checkoutLandOrder(data) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/checkout?product_id=' + data.id,
            header: {
                Authorization: token
            },
            data: data
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('local_order', res.data);
                    this.setData({
                        loading: false
                    });
                    wx.navigateTo({
                        url: '/pages/store/order/order'
                    })
                } else {
                    if (res.data && res.data.server_busy) {
                        this.setData({
                            show_ten: true
                        })
                    } else if (res.message == 'User unbind mobile') {
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
                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                    }
                    this.setData({
                        loading: false
                    });
                }
            }
        })
    },


    // 立即购买
    checkoutImmdeOrder(data) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/checkout?product_id=' + data.id,
            header: {
                Authorization: token
            },
            data: data
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('local_order', res.data);
                    this.setData({
                        loading: false
                    });
                    wx.navigateTo({
                        url: '/pages/store/order/order'
                    })
                } else {
                    if (res.data && res.data.server_busy) {
                        this.setData({
                            show_ten: true
                        })
                    } else if (res.message == 'User unbind mobile') {
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
                    } else {
                        wx.showModal({
                            content: res.message || '请求失败',
                            showCancel: false
                        })
                    }
                    this.setData({
                        loading: false
                    });
                }
            }
        })
    },
    // 商品限购
    goodsPurchase(id) {
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/store/goods/purchase/' + id,
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    if (res.data) {
                        this.setData({
                            'purchaseInfo.status': true,
                            'purchaseInfo.num': res.data.user_limit
                        })
                    }
                } else {
                    wx.showModal({
                        title: res.message || '接口错误',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    title: '请求失败',
                    showCancel: false
                })
            }
        })
    },

    //请求拼团数据
    getGrouponUserList(id, multi_groupon_item_id) {
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/multiGroupon/getGrouponUserList',
            header: {
                Authorization: token
            },
            data: {
                goods_id: id,
                multi_groupon_item_id: multi_groupon_item_id
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        groupon_userlist: res.data
                    })
                } else {
                    wx.showModal({
                        content: res.message || '拼团信息请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '拼团信息请求失败',
                    showCancel: false
                })
            }
        })
    },
    //scroll-view 滚动刷新
    scrollBottom() {
        var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
        var multi_groupon_id = this.data.detailData.meta.multiGroupon.id;
        if (hasMore) {
            this.setData({
                more: true
            })
            var page = this.data.meta.pagination.current_page + 1;
            var multi_groupon_item_id = this.data.multi_groupon_item_id;
            this.getGrouponItems(multi_groupon_id, page, multi_groupon_item_id);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }

    },
    //他们也在拼请求数据
    getGrouponItems(multi_groupon_id, page, multi_groupon_item_id) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/multiGroupon/getGrouponItems',
            header: {
                Authorization: token
            },
            data: {
                multi_groupon_id: multi_groupon_id,
                page: page,
                multi_groupon_item_id: multi_groupon_item_id
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        [`groupon_itemList[${page-1}]`]: res.data,
                        meta: res.meta,
                        init: true

                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求他们也在拼数据失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求他们也在拼数据失败',
                    showCancel: false
                })
            }
            this.setData({
                more: false
            })
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading()
            wx.showModal({
                content: res.message || '请求失败',
                showCancel: false
            })
        })
    },

    //进度条控制3种状态
    controlProgress() {
        // todo
        if (this.data.commodity.multi_groupon_init_status == 1) {
            if (this.data.detailData.data.multi_groupon_join_status || this.data.groupon_item_id) {
                //只要你是满团，就是显示全红
                if (this.data.detailData.data.multi_groupon_item_complete_status != 0) {
                    this.setData({
                        emjstatus: {
                            percent: 100, //进度条百分比
                            lauch: true, //第一个icon控制
                            half: true, //第二个icon控制
                            end: true //第三个icon控制
                        }
                    })
                } else {
                    this.setData({
                        emjstatus: {
                            percent: 50, //进度条百分比
                            lauch: true, //第一个icon控制
                            half: true, //第二个icon控制
                            end: false //第三个icon控制
                        }
                    })
                }
            }
        }
    },
    beSharePoint(goods_id, user_id) {
        wx.login({
            success: res => {
                if (res.code) {
                    this.sharePoint(res.code, goods_id, user_id);
                }
            }
        })
    },
    // 分享获得积分
    sharePoint(code, goods_id, user_id) {
        sandBox.post({
            api: 'api/shareGetPoint',
            data: {
                user_id: user_id,
                goods_id: goods_id,
                code: code
            }
        }).then(res => {
            /*wx.showModal({
                content: '获取积分成功',
                showCancel: false
            })*/
        })
    }


// const page = connect.Page(
//     store(),
//     (state) => {},
//     (dispatch) => {
//         return {}
//     }
// )

// Page(page(args))
})