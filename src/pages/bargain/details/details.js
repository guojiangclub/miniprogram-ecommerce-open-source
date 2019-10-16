import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';
//import { compose } from 'redux';
Page({
    data: {
        userInfo:{},
        left:0,
        select_count: 1,
        show:false,//控制活动规则的显示
        rule:'的叫法是看到了福建省的<br/><br/>打梵蒂冈飞机速度快放假',//活动规则
        number:17,
        skuTable: {},
        is_leader:0,//1为自己，0为好友
        message:'',
        showShare:false,//显示分享
        showNotice:false,//控制砍价后弹框显示
        theReduce:10,//
        step:1,//控制好友按钮显示,1为还未助力；2为助力成功；3为助力失败
        showTell:false,//控制活动结束，好友新开零元拿显示的弹层
        success:true,//模拟好友点击砍价接口是否成功
        buy:true,//系统是否设置了可提前购买
        over:false,//砍价是否完成
        overTime:false,//用户时间是否超时
        overActivity:false,//活动是否结束
        ends_at:'',//结束时间
        starts_at:'',//开始时间
        setColor:'fb5054',//进度条的颜色
        page:1,//页
        show_select: true, //选尺寸
        heroList:[],//砍价英雄榜的数据
        showShareImg:false,//展示分享图片
        pay:false,//是否已经支付
        canBuy:true
    },
    onLoad(e) {
        //this.getMessage()
        var  that =this
        this.getServer()
        if(e.reduce_items_id){
            that.setData({
                reduce_items_id:e.reduce_items_id
            })
        that.getMessage()

        }
        if(this.data.overTime==true || this.data.overActivity==true){
            that.setData({
                setColor:'AAAAAA'
            })
        }    
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
        this.setData({
            Height:windowHeight
        })
        //this.getUserInfo();  
        that.showWitch();
       // that.getStoreDetail()
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
        this.specStore(this.data.result, spec.index)
    }, 
    // 请求商品详情页面数据
    getStoreDetail(wechat_group_id) {
        var token = cookieStorage.get('user_token') || '';
        var wechat_group_id = wechat_group_id || cookieStorage.get('openGId') || '';
        this.getGoodsDetail({
            api: `api/store/detail/${this.data.goods_id}`,
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
            // this.setData({
            //     price: Number(this.data.commodity.sell_price).toFixed(2),
            //     store_count: this.data.commodity.store_nums
            // })
            this.changeText();
            this.immediatelyText();
            //this.disallow_cart();
            this.queryCommodityStore(this.data.id)
            this.queryFavoriteStatus(this.data.id, 'goods');
           // this.getFree(this.data.id);


        });
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

                            /*if (res.meta.seckill) {
                                var interval = setInterval(this.countStartsTime, 1000);

                                that.setData({
                                    'startsTime.interval': interval
                                })
                            }*/
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
        if(this.data.select_product.color && this.data.select_product.size){
        }else{
            return;
        }
        if (this.data.loading) return;
        if (this.disallow_cart()) return;

        this.setData({
            loading: true
        })
        var select_product = this.data.select_product;
        var select_count = Number(this.data.select_count)
        var data = this.data.specs.length ? {
            id: select_product.id,
            name: this.data.name,
            qty: select_count,
            store_count: this.data.store_count,
            price: this.data.time_price,
            market_price: this.data.market_price,
            attributes: {
                img: this.data.detailsMessage.reduce.goods.img,
                size: select_product.size,
                color: select_product.color,
                com_id: this.data.goods_id
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
        if (select_product.sku) {data.attributes.sku = select_product.sku;}
        this.checkoutImmdeOrder(data)
    },
    disallow_cart() {
        let that =this
        if (!this.data.specs.length) {
            return !this.data.store_count;
        }

        var ids = [],
            select_product = {},
            specs = this.data.specs;
        for (let spec of specs) {

            ids.push(spec.select);
            for (let v of spec.values) {
                if (v.id === spec.select) {
                    if(spec.label_key=='Color'){
                        select_product.color = v.alias || v.value;
                    }
                    else if(spec.label_key=='Size'){
                        select_product.size = v.alias || v.value;
                    }
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
        if(this.data.select_product.color && this.data.select_product.size){
            that.setData({
                canBuy:true
            })
        }else{
            that.setData({
                canBuy:false
            })
        }
        //return false;
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
    //关闭sku
    closeSelect() {
        // var animation = new Animation('show');
        // animation.up().then(() => {
            this.setData({
                show_select: true
            })
       // })
    },
    //获取详情页信息
    getMessage(){
        let that=this
        var token = cookieStorage.get('user_token'); 
        sandBox.get({
            api:`api/reduce/showItem?reduce_items_id=${this.data.reduce_items_id}`,
            header: {
				Authorization: token
			},
        }).then(res =>{
            if (res.statusCode == 200) {
                if(res.data.data.status_text !=="进行中" &&res.data.data.status_text!=="已下单待支付" && res.data.data.reduce.status_text=="进行中" && res.data.data.time_price !=="0.00"){
                    that.setData({
                        overTime:true,
                        overActivity:false,
                        setColor:'AAAAAA',
                    })
                }else if(res.data.data.reduce.status_text !=="进行中"){
                    that.setData({
                        overActivity:true,
                        setColor:'AAAAAA'
                    })
                 }else if(res.data.data.status_text=="订单已支付" ){
                        that.setData({
                            pay:true,
                            over:true
                        })
                 }else if(res.data.data.status_text =="进行中" && res.data.data.reduce.status_text=="进行中"){
                        that.setData({
                            overTime:false,
                            overActivity:false,
                            setColor:'fb5054',
                        })
                 }
                 if(res.data.data.reduce_surplus_amount=="0.00"){
                    that.setData({
                        over:true
                     })
                 }
                that.setData({
                    detailsMessage:res.data.data,
                   is_leader:res.data.data.user_is_leader,
                   // is_leader:0,
                   reduce_id:res.data.data.reduce_id,
                   id:res.data.data.id,
                   goods_id:res.data.data.reduce.goods_id,
                   name:res.data.data.reduce.goods.name,
                   store_count:res.data.data.reduce.store_nums,
                   market_price:res.data.data.reduce.goods.market_price,
                   time_price:res.data.data.time_price
                })
                that.queryCommodityStore(this.data.goods_id)
                that.showWitch()
               if(this.data.detailsMessage.progress_par>0.17 && this.data.detailsMessage.progress_par<0.83){
                let percent=parseInt(this.data.detailsMessage.progress_par*100)-17
                that.setData({
                    left:percent
                })
               }else if(this.data.detailsMessage.progress_par==0.83 ||this.data.detailsMessage.progress_par>0.83){
                    that.setData({
                        left:67
                    })
               }else{
                   that.setData({
                       left:0
                   })
               }
            }else{
                wx.showToast({
                    title:res.data.data.message,
                    icon:none,
                    duration: 2000,
                    
                })
            }
        })
        this.showWitch()
    },
    bargainAgin(){
        let that =this
        var token = cookieStorage.get('user_token'); 
         var id = this.data.reduce_id;
         var data={
            reduce_id:id,
            restart:1
         }
        sandBox.post({
            api:  `api/reduce`,
            header: {
				Authorization: token
            },
            data:data
        }).then(res =>{
            if (res.statusCode == 200) {
                wx.showToast({
                    title:'已重新发起砍价',
                    duration:2500
                })
                that.setData({
                    reduce_items_id:res.data.data.reduce_items_id
                })
                that.getMessage()
                that.showWitch()
            }else{}
        })
    },
    showWitch(){
        if(this.data.is_leader==1){
            this.setData({
                message:'邀请好友砍价'
            })
        }else if(this.data.is_leader==0 && this.data.step==1){
            this.setData({
                message:'帮TA砍价'
            })
        }else if(this.data.is_leader==0 && this.data.step==2){
            this.setData({
                message:'我也要去砍价'
            })
        } 
    },
    //获取当前时间
    
    getServer () {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
	var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
	var server = date.getFullYear() + seperator1  + month  + seperator1  + strDate
			+ " "  + date.getHours()  + seperator2  + date.getMinutes()
			+ seperator2 + date.getSeconds();
    this.setData({
        server:server
    })
},
    closeTell(){
        this.setData({
            showTell:false
        })
    },
    showTell(){
        this.setData({
            showTell:true
        })
    },
    closeShare(){
        this.setData({
            showShare:false
        })
    },
    //生成海报
    // getShearImg(){
    //     wx.navigateTo({
    //     	url:'/pages/distribution/shareImg/shareImg?id='+this.data.id+'&channel='+this.data.detail.channel
	// 	})
    //     this.changeShare()
	// },
    // 弹出分享
    changeShare() {
        this.setData({
            showShareImg: true
        })
    },
     // 生成海报
     createShareImg(){
         let that =this
        wx.showLoading({
            title: "生成中",
            mask: true
        })
       var token = cookieStorage.get('user_token') || '';
       sandBox.get({
           api :`api/reduce/share?reduce_items_id=${this.data.reduce_items_id}`,
           header:{
               Authorization: token
           },
        //    data:{
        //        goods_id: this.data.showItemDate.multi_groupon_goods_id,
        //    }
       }).then(res => {
           if(res.statusCode == 200){
            var res = res.data
               if(res.status){
                that.setData({
                    shareImg : res.data.image
                   });
                  //this.getShearImg();
               } else {
                   wx.showModal({
                       content: res.message || '请求失败',
                       showCancel: false
                   })
               }
           } else{
               wx.showModal({
                   content: '请求失败',
                   showCancel: false
               });
           }
           wx.hideLoading();
           this.changeShare();
       })
    },
    closeAlert(){
        this.setData({
            is_refused:false
        })
    },
    helpShare(){
        this.setData({
            showShare:true
        })
    },
    showNotice(){
        this.setData({
            showNotice:true
        })
    },
    closeNotice(){
        this.setData({
            showNotice:false
        })
        this.getMessage()
    },
    //好友也要零元拿
    joinBargain(){
        if(this.data.overActivity==true){
            this.setData({
                showTell:true
            })
        }else{
            wx.navigateTo({
                url:'/pages/bargain/index/index'
            })
        }
    },
    goStore(){
        wx.switchTab({
            url: '/pages/index/index/index'
          })
    },

    //帮好友砍价
    bargain(){
        let that =this
        var token = cookieStorage.get('user_token'); 
        if(this.data.is_leader==0){
            if(this.data.success){
                sandBox.post({
                    api:`api/reduce/help?reduce_items_id=${this.data.reduce_items_id}`,
                    header: {
                            Authorization: token
                        },
                        data:{

                        }
                }).then(res=>{
                    if (res.statusCode == 200){
                        that.setData({
                            step:2
                        })
                        if(res.data.code==400){
                            wx.showToast({
                                title:res.data.message,
                                icon: 'none',
                                duration: 2000
                              })
                              setTimeout(function(){
                            that.setData({
                                step:2
                              })
                              that.showWitch();  
                          },2000)
                        }else{
                            that.setData({
                                showNotice:true,
                                step:2
                            })
                        }
                            if(res.data.data.reduce_amount){
                            that.setData({
                            reduce_amount:res.data.data.reduce_amount,
                            step:2
                        })
                    }
                        that.showWitch();
                    }else{
                        wx.showToast({
                            title: '您暂时不能帮好友砍价',
                            icon: 'none',
                            //duration: 3000
                          })
                          setTimeout(function(){
                            that.setData({
                                step:2
                              })
                              wx.hideToast()
                              //that.showWitch();  
                          },3000)
                    }
                    that.getMessage()
                })
                that.getMessage()
            }
        }
        this.getMessage()
        that.showWitch();
    },
    onShareAppMessage: function (res) {
        let that =this
        if (res.from === 'button') {
          // 来自页面内转发按钮
        }
        return {
          title: '砍价帮帮忙',
          path: `/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}`
        }
      },
    showRule(){
        this.setData({
            show:true
        })
    },
    closeRule(){
        this.setData({
            show:false
        })
    },
    //获取商品信息
     // 获取用户信息
     getUserInfo() {
         let _this =this
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                _this.setData({
                    userInfo:res.data.data,
                }, () => {
                    if (res.data.data.agent_code) {
                        wx.updateShareMenu();
                    }
                })
            }
        })
    },
    onShow: function() {
        this.getRule()       
    },
    //选择sku
    showSelect(e) {
        this.setData({
            show_select:false
        })
    },
     // 立即购买
     checkoutImmdeOrder(data) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/checkout?product_id=' + data.id+`&reduce_items_id=${this.data.reduce_items_id}`,
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
                        url: `/pages/store/order/order?reduce_items_id=${this.data.reduce_items_id}&bargain=true`
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
            }else{
                wx.showToast({
                    title:res.data.message,
                    icon:'none',
                    duration:2000
                })
            }
        })
    },
    showToast(){
        wx.showToast({
            title:'请选择商品的规格',
            icon:'none',
            duration:2000
        })
    },
    changeImg(){
        this.setData({
            showShareImg:false
        })
    },
    //活动规则
    getRule(){
        sandBox.get({
            api:'api/reduce/help/text'
        }).then(res=>{
            if(res.statusCode == 200){
                this.setData({
                    rule:res.data.data.reduce_help_text
                })
            }
        })
    },
    onPullDownRefresh: function() {
       this.getMessage()
        
    },
})