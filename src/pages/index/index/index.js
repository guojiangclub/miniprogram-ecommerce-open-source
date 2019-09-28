
var app = getApp();

import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';


// 微页面
Page({
    data: {
        banner:[],
        indexData:{},
        goods_arr:[],
        topImage: [],
        bestSalesGoods: [],
        suit:[],
        imgHeight: '',
        screenWidth: 0,
        currentDesc:'news',
        is_newGiftLogin:false,
        isLogin:'',
        showNoGift: false, // 用户是否关闭弹窗
        showGift: false,  // 登录状态下是否弹窗
        tapIndex: 0,
	    isShow: false,
        goodsIndex: 0,
	    goodsList: [],
        author: '',
        scroll: true,
        config: '',
        wyBanner: '',
        wyGoodsList: '',
        userInfo: '',
        microData:''
    },
    onShareAppMessage(res){
        var info = cookieStorage.get('init_info');
        let path = this.data.userInfo && this.data.userInfo.agent_code ? `/${this.route}?agent_code=${this.data.userInfo.agent_code}` : `${this.route}`;
        console.log('这个是分享出去的链接', path);
        return {
            title: info.title,
            path: path,
            imageUrl: info.imgUrl
        }
    },
    onPullDownRefresh() {
        wx.showLoading();
        this.queryMicroData();
    },
    onLoad(e){
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig,
        })
        if (!gbConfig) {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync(): {};
            if (extConfig) {
                this.setData({
                    config: extConfig,
                })
            }
        }
        wx.showLoading();
        this.queryMicroData();
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
    },
    onShow(e){
        this.setData({
            isLogin:!!cookieStorage.get('user_token'),
        });

        let toekn = cookieStorage.get('user_token');
        if (toekn) {
            this.getUserInfo();
        }
    },
    setCode(e) {
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
        var clerk_id = e.clerk_id || "";
        var shop_id = e.shop_id || "";
        var agent_code = e.agent_code||  '';
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[0]
            }
        }
        var cook_shop_id = cookieStorage.get('shop_id');
        if (!cookieStorage.get('distribution_valid_time')) {
            valid_time = 10080;
        } else {
            valid_time = cookieStorage.get('distribution_valid_time');
        }
        console.log('这个是时间', valid_time);

        let timeStamp = new Date().getTime();
        timeStamp += timeMap.n * valid_time;

        // 当url上shop_id与缓存中shop_id不一致时，需要清除clerk_id。以此保证shop_id与clerk_id对应
        var cook_clerk_id = cookieStorage.get('clerk_id');
        if (cook_shop_id != shop_id && cook_clerk_id) {
            cookieStorage.clear('clerk_id');
        }

        if (agent_code != cookieStorage.get('agent_code')) {
            var data=[];
            cookieStorage.set('agent_goods_id', data);
        }

        if (agent_code) {
            cookieStorage.set('agent_code', agent_code, valid_time + 'n');
            // 如果有agent_code就将这次进入的时间缓存
            cookieStorage.set('agent_code_time', timeStamp, valid_time + 'n');

            // 如果有agent_code并且有coupon_agent_code就将coupon_agent_code清除，保证agent_code为第一位
            if (cookieStorage.get('coupon_agent_code')) {
                cookieStorage.clear('coupon_agent_code')
            }
        }

        if (clerk_id) {
            cookieStorage.set('clerk_id', clerk_id, valid_time + 'n');
        }

        if (shop_id) {
            cookieStorage.set('shop_id', shop_id, valid_time + 'n');
            // 如果有shop_id就将这次进入的时间缓存
            cookieStorage.set('shop_id_time', timeStamp, valid_time + 'n');
        }
        const code = agent_code || cookieStorage.get('agent_code');
        if (code) {
            // this.getCodeUser(code);
        }

    },
     // 获取初始化数据
     init(e) {
        console.log('获取到的e', e);
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
                    if (res.data && res.data.other_technical_support) {
                        this.setData({
                            author: res.data.other_technical_support,
                            index_activity_alert:res.data.index_activity_alert
                        })
                    }
                    /*wx.setNavigationBarTitle({
                        title: res.data.mini_home_title
                    })*/
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data);
                    this.setCode(e);
                    if (agent_code && res.data.mini_program_login_type == 'default' && !token){
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
                                                        url: '/pages/user/agentlogin/agentlogin?agent_code=' + agent_code + '&open_id=' + res.data.open_id + '&url=' + getUrl() + '&is_tab=true'
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
                                        icon:'none'
                                    })
                                }
                            }
                        })
                    }
                } else {
                    this.setCode(e);
                }
            } else {
                this.setCode(e);
            }
        })
    },
    // 根据agent_code获取用户信息
    getCodeUser(agent_code) {

        sandBox.get({
            api: '/api/distribution/getAgentInfo',
            data: {
                agent_code: agent_code
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    const title = res.data.name + ' X ' + res.data.home_title || '';
                    wx.setNavigationBarTitle({
                        title: title
                    })
                }
            }
        })
    },
    // 获取用户信息
    getUserInfo() {
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    userInfo:res.data.data,
                }, () => {
                    if (res.data.data.agent_code) {
                        wx.updateShareMenu();
                    }
                })
            }
        })
    },
    jumpAuthor() {
        wx.scanCode({
            success: res => {
                console.log(res);
            }
        })
        return
        wx.navigateTo({
            url:'/pages/index/author/author'
        });
    },
	imgLoad(e) {
		var height = e.detail.height
		var width = e.detail.width;
		var ratio = width / height;
		var screenWidth = this.data.screenWidth;
		this.setData({
			imgHeight: screenWidth / ratio
		})
	},
    changeItem(e){
        var index = e.currentTarget.dataset.index
        if (index == this.data.currentDesc ) return;
        this.setData({
            goods_arr:this.data.indexData.Mini_H5TabData[index],
	        tapIndex:index
        })
    },
	changeGoodsItem(e) {
		var index = e.currentTarget.dataset.index
		if (index == this.data.currentDesc ) return;
		this.setData({
			goodsIndex: index
        })
    },
    closeGift(){
        cookieStorage.set('gift_info',true);
        this.setData({
            showGift:false
        })
    },
    showModal(){
        this.setData({
            showNoGift:true
        })
    },
	showPreview(e) {
        var items = this.data.indexData.H5GoodsRecommend[this.data.goodsIndex].items;
        var index = e.currentTarget.dataset.index;
        this.setData({
	        goodsList: items[index].items,
	        isShow: true
        })
    },
    jumpMeal(e){
        // console.log(e);
        var id = e.currentTarget.dataset.suitid;
        wx.navigateTo({
            url:`/pages/store/meal/meal?id=${id}`
        });
    },
    // 关闭弹窗
	isClone() {
        this.setData({
	        isShow: false
        })
    },
    // 秒杀开始
    isStarts(e) {
        var idx = e.detail.idx;
        var index = e.detail.index;
        if(this.data.microData.pages[idx].value[index].associate.init_status != 1){
            this.setData({
                [`microData.pages[${idx}].value[${index}].associate.init_status`]:1
            })
        }
    },
    // 秒杀结束
    isEnd(e) {
        var idx = e.detail.idx;
        var index = e.detail.index;
        var newData = this.data.microData;
        newData.pages[idx].value.splice(index,1);
        this.setData({
            microData:newData
         })
    },

    login(){
        pageLogin(getUrl());
        /*wx.redirectTo({
            url: '/pages/user/register/register?url='+getUrl()+encodeURIComponent('?giftLogin=true')
        })*/
    },
    close(){
        this.setData({
            showNoGift:false
        })
        // this.showNoGift = false;
        var time = new Date(new Date().setHours(0,0,0,0)).getTime() + 86400000;
        cookieStorage.set('new_gift', true, time);
    },
    jumpToSearch(){
        wx.navigateTo({
            url:'/pages/store/search/search'
        })
    },
    jumpToDetail(e){
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url:`/pages/store/detail/detail?id=${id}`
        })
    },
    jumpCall(e) {
        if (this.data.isLogin) {
            var id = e.currentTarget.dataset.id

            wx.navigateTo({
                url: '/pages/store/call/call?id=' + id
            })

        } else {
            wx.showModal({
                content: '请先登录',
                success: res => {
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        pageLogin(getUrl());
                    }
                }
            })
        }

    },
	jumpImg(e) {
        /*wx.scanCode({
            success: res => {
                console.log(res);
            }
        })
        return*/

        var src = e.currentTarget.dataset.src;
        if (!src || src == 'uto_miniprogram') return

        wx.navigateTo({
            url: src
        })
    },
    //跳到搜索页面
    jumpSearch(){
        wx.navigateTo({
            url:'/pages/store/search/search'
        })
    },
	jumpMenu(e) {
        if (config.PACKAGES.isTab) {
            wx.switchTab({
                url: '/pages/index/classification/classification'
            })
        } else {
            wx.navigateTo({
                url: '/pages/index/classify/classify'
            })
        }
    },
    jumpStore(e) {
        var id = e.currentTarget.dataset.id

        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + id
        })
    },
    queryData (){
        sandBox.get({
            api: 'api/home/getHomeModulesData',
            data: {
	            includes: 'Mini_TopShuffling,Mini_Bottom_Banner,Mini_H5TabData,suit,seckill,FreeEvent,Mini_HeadBottomAd,bestSalesGoods,H5GoodsRecommend,Mini_coupons,Mini_TH_banner,groupon'
            }

        }).then(res => {
            res = res.data;
            this.setData({
                indexData:res.data,

            });
	        if (res.data && res.data.Mini_TopShuffling) {
                this.setData({
	                banner:res.data.Mini_TopShuffling
                })
	        };
	        if (res.data && res.data.Mini_H5TabData) {
		        this.setData({
			        goods_arr:res.data.Mini_H5TabData[0]
		        })
	        }
	        if (res.data && res.data.suit) {
		        this.setData({
			        suit:res.data.suit.items
		        })
	        };
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch(() => {
            wx.stopPullDownRefresh();
            wx.hideLoading();
            wx.showModal({
                content:'请求失败',
	            showCancel:false
            })
        })
    },
    //请求新数据
    queryMicroData (){
        sandBox.get({
            api: 'api/micro/page/index'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        microData: ''
                    }, () => {
                        this.setData({
                            microData:res.data,
                        });  
                    })

                    if (res.data && res.data.micro_page) {
                        wx.setNavigationBarTitle({
                            title: res.data.micro_page.name
                        })
                    }
                } else {
                    wx.showModal({
                        content:res.message || '请下拉页面刷新重试',
                        showCancel:false
                    })
                }
            } else {
                wx.showModal({
                    content:'请下拉页面刷新重试',
                    showCancel:false
                })
            }
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch(() => {
            wx.stopPullDownRefresh();
            wx.hideLoading();
            wx.showModal({
                content:'请求失败',
                showCancel:false
            })
        })
    },
    go(e) {
        var link = e.currentTarget.dataset.link;
        if (link) {
            if (link.indexOf('c_id') != -1) {
                wx.navigateTo({
                    url: '/pages/store/list/list?' + link
                })
            } else if (link.indexOf('id') != -1) {
                wx.navigateTo({
                    url: '/pages/store/detail/detail?' + link
                })
            }
        }
    },
    // 领取优惠券
    getCoupon(e) {
        var token = cookieStorage.get('user_token');
        var code = e.detail.code;
        var index = e.detail.index;
        var id =e.currentTarget.dataset.id
        if (token) {
            this.convertCoupon(code, index,id);
        } else {
            wx.showModal({
                content: '请先登录',
                showCancel: false,
                success: res => {
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        pageLogin(getUrl());
                    }
                }
            })
        }
    },
    // 领取优惠券接口
    convertCoupon(code, index,id) {
        var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: "正在领取",
            mask: true
        });
        sandBox.post({
            api: 'api/coupon/take',
            header: {
                Authorization: token
            },
            data: {
                discount_id:id,
                coupon_code:code
            }
        }).then(res => {
            wx.hideLoading();
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                   var pages = this.data.microData.pages;
                   pages.forEach((val,idx)=>{
                       if(val.name == 'micro_page_componet_coupon'){
                           this.setData({
                               [`microData.pages[${idx}].value[${index}].associate.has_get`]:true
                           })
                       }
                   })
                    wx.showToast({
                        title: '领取成功',
                    });
                } else {
                    wx.showToast({
                        title: res.message || '领取失败',
                        image: '../../../assets/image/error.png'
                    })
                }
            } else {
                wx.showToast({
                    title: '领取失败',
                    image: '../../../assets/image/error.png'
                })
            }

        }).catch(rej => {
            wx.showToast({
                title: '领取失败',
                image: '../../../assets/image/error.png'
            })
            wx.hideLoading();
        })
    },
    jumpList(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/coupon/goods/goods?id=' + id
        })

    },
    //请求万有商城首页数据
    getStoreData(){
        wx.showLoading({
            title:"加载中",
            mask:true
        })
        sandBox.get({
            api:'api/market/store/index'
        }).then(res=>{
            if (res.statusCode == 200){
                res = res.data;
                if (res.status){
                    if (res.data) {
                        this.setData({
                            wyBanner:res.data.Mini_TopShuffling,
                            wyGoodsList:res.data.goods
                        })
                    }
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
        }).catch(()=>{
            wx.showModal({
                content:'请求失败',
                showCancel: false
            })
            wx.hideLoading()
        })
    }

});
