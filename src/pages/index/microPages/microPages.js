
/**
 * Created by admin on 2017/9/26.
 */
import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';
const app = getApp()

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
        noLoginGift: '',   // 未登录状态下的新人礼信息
        loginGift: '',    // 登录状态下的新人礼信息
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
        microData:'',
        // 组件所需的参数
        nvabarData: {
            showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
            title: '我的主页', //导航栏 中间的标题
        },
        id: '',

        // 此页面 页面内容距最顶部的距离
       // height: app.globalData.height * 2 + 20 ,

    },
    onShareAppMessage(res){
        var info = cookieStorage.get('init_info');
        return {
            title: info.title,
            path: `/${this.route}?id=${this.data.id}&name=${this.data.name}`,
            imageUrl: info.imgUrl
        }
    },
    onPullDownRefresh(e) {
        wx.showLoading();
        this.queryData(this.data.id);
    },
    onLoad(e){
        console.log(this.data.height)
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig,
            id: e.id,
            name: e.name || ''
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
        this.queryMicroData(e.id, e.name || '');
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
        this.init(e);
    },
    onShow(e){
        this.setData({
            isLogin:!!cookieStorage.get('user_token'),
        });

        // 万有的接口
        // this.getStoreData();


        // !!cookieStorage.get('user_token')
         let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // },()=>{
        //     console.log("已改");
        // });
        // console.log(app.globalData.giftLogin)
        // this.setData({
        //     is_newGiftLogin:app.globalData.giftLogin
        // });
        let is_info=cookieStorage.get('gift_info');
        if(!this.data.isLogin){
            this.newPeopleGift();
        }
        // if(this.data.isLogin && !is_info){
        //    // this.getPeopleGift();
        // }
    },
    // 获取初始化数据
    init(e) {
        // sandBox.get({
        //     api: 'api/system/init'
        // }).then(res => {
        //     if (res.statusCode == 200) {
        //         res = res.data;
        //         if (res.status) {
        //             if (res.data && res.data.other_technical_support) {
        //                 this.setData({
        //                     author: res.data.other_technical_support
        //                 })
        //             }
        //             /*wx.setNavigationBarTitle({
        //              title: res.data.mini_home_title
        //              })*/
        //             cookieStorage.set('init_info', res.data.h5_share);
        //             cookieStorage.set('service_info', res.data.online_service_data);
        //             cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
        //             cookieStorage.set('init', res.data);
        //             this.setCode(e);
        //         } else {
        //             this.setCode(e);
        //         }
        //     } else {
        //         this.setCode(e);
        //     }
        // })
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
                    const title = res.data.name + ' X ' + res.data.home_title;
                    wx.setNavigationBarTitle({
                        title: title
                    })
                }
            }
        })
    },
    jumpAuthor() {
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
    // 新人进店有礼
    newPeopleGift(){
        sandBox.get({
            api:'api/home/gift_new_user'
        }).then(res=>{
            res=res.data;
            if(res.status &&　res.data){
                var cache_no_gift = cookieStorage.get('new_gift');
                console.log(res.data);
                res.data.gift.forEach(function(val){
                    val.coupon.usestart_at=val.coupon.usestart_at.replace(/\s.+$/, '')
                    val.coupon.useend_at=val.coupon.useend_at.replace(/\s.+$/, '');
                });
                this.setData({
                    noLoginGift:res.data
                });
                if(!cache_no_gift){
                    this.setData({
                        showNoGift:true
                    })
                }
            }
            // else{
            //     wx.showModal({
            //         title: '提示',
            //         content: '请求失败',
            //         success: res=>{
            //             if (res.confirm) {
            //
            //             }
            //         }
            //     })
            // }
        });
    },
    // 新人进店有礼(已登录)
    // getPeopleGift(){
    //     sandBox.post({
    //         api:'api/home/gift_new_user',没有这个接口
    //         header:{
    //             Authorization:cookieStorage.get('user_token')
    //         }
    //     }).then(res=>{
    //         res=res.data;
    //         var cache_info = cookieStorage.get('gift_info');
    //         if(res.status && res.data && !cache_info){
    //             // 判断是不是老用户
    //             if(!res.data.activity.is_new_user){
    //                 console.log(res.data);
    //                 if(this.data.is_newGiftLogin){
    //                     res.data.activity.gift.forEach(function(val){
    //                         val.coupon.usestart_at=val.coupon.usestart_at.replace(/\s.+$/, '');
    //                         val.coupon.useend_at=val.coupon.useend_at.replace(/\s.+$/, '');
    //                     });
    //                     this.setData({
    //                         showGift:true,
    //                         loginGift:res.data
    //                     });
    //                 }else{
    //                     this.closeGift();
    //                 }
    //             }
    //             else{
    //                 res.data.activity.gift.forEach(function(val){
    //                     val.coupon.usestart_at=val.coupon.usestart_at.replace(/\s.+$/, '');
    //                     val.coupon.useend_at=val.coupon.useend_at.replace(/\s.+$/, '');
    //                 });
    //                 this.setData({
    //                     showGift:true,
    //                     loginGift:res.data
    //                 })
    //             }
    //         }
    //         else{
    //         }
    //     })
    // },
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
    //请求新数据
    queryMicroData (id,name = ''){
        sandBox.get({
            api: 'api/micro/page/'+id,
            data: {
                name: name
            }

        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        microData:res.data,
                    });
                    if (res.data && res.data.micro_page) {
                        wx.setNavigationBarTitle({
                            title: res.data.micro_page.name == 'brand' ? '品牌馆' : res.data.micro_page.name
                        })
                    }
                } else {
                    wx.showModal({
                        content:res.message || '请求失败',
                        showCancel:false
                    })
                }
            } else {
                wx.showModal({
                    content:'请求失败',
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
        if (token) {
            this.convertCoupon(code, index);
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
    convertCoupon(code, index) {
        var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: "正在领取",
            mask: true
        });
        sandBox.post({
            api: 'api/coupon/convert',
            header: {
                Authorization: token
            },
            data: {
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

});