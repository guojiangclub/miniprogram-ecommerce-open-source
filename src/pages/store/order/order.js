import {
    sandBox,
    cookieStorage,
    config
} from '../../../lib/myapp.js'


Page({
    data: {
        loading:false,
        show: false,
        block: {
            order: {
                items: []
            },
            orderPoint: {
                pointAmount: 0,
                pointCanUse: 0
            },
            otherCoupon: {}
        },



        newBlock: {
            orderPoint:{
                pointCanUse:0
            },
            discountGroup:[]
        },
        newForm: {

        },
        discountStatus: {

        },
        bestDiscount: false, // 是否为最优折扣
        discountsCheckIndex: -1, // 选择的id
        couponCheckIndex: -1,
        available: {
            coupons: [],    //可选择的优惠券
            currentCoupon: '',      //当前选择的优惠券
            discounts: [],   // 可使用的促销折扣
            currentDiscount: '',    // 当前选择促销折扣
            currentPoint: '',
            pointStatus: false
        },
        pay_amount: '',
        extra: {
            point: {}
        },
        form: {
            order_no: '',
            address: {},
            coupon: {},
            invoice: {},
            discount: {},
            point: 0,
            note: '',
            formStates: {},
            isDisabled: false   //是否禁用优惠折扣按钮
        },
        useList: [
            [
                {name: '不使用', value: 0},
                {name: '使用', value: 1}
            ]
        ],
        formStates: {
            discountsCheckIndex: -1,
            noDiscountsCheckList: -1,
            pointStatus: false,
        },
        temporary: {
            coupons: [],    //可选择的优惠券
            coupon: {},      //当前选择的优惠券
            discounts: [],   // 可使用的促销折扣
            discount: {}    // 当前选择促销折扣
        },
        paymentMoneys: {
            discounts: {},
            total: 0
        },
        check: null,
        is_login:'',
        type: '',
        show_discounts: false,
        task_id: '',
        valueR:0,
        initInfo:'',
        config: '',
        accountInfo: '',
        self_shop:'',

    },

    onLoad(e) {
        var accountInfo = wx.getAccountInfoSync();
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig,
            accountInfo: accountInfo
        })
        if (e.type) {
            this.setData({
                type: e.type
            })
        }
        if (e.task_id) {
            this.setData({
                task_id: e.task_id
            })
        }
        var info = cookieStorage.get('init');
        if (info && info.pick_self == 1 && this.data.self_shop) {
            this.setData({
                valueR: 1
            })
        }
        this.setData({
            initInfo:info
        })
        this.initData();

    },
    //配送方式选择
    radioChange(e){
        this.setData({
            valueR:e.detail.value
        })
    },
    selectStore(){
        wx.navigateTo({
            url:'/pages/store/selfShop/selfShop'
        })
    },
    showDiscounts() {
        if (!this.data.available.discounts || this.data.available.discounts.length == 0) {
            wx.showModal({
                content: '您暂无可用优惠',
                showCancel: false
            })
        } else {
            this.setData({
                show_discounts: !this.data.show_discounts
            })
        }
    },
    addInvoice(){
        wx.navigateTo({
            url:`/pages/store/invoice/invoice?order_no=${this.data.block.order.order_no}&url=${getCurrentPages()[getCurrentPages().length - 1].route}`,
        })
    },
    selectAddress () {
        wx.navigateTo({
            url:`/pages/address/list/list?order_no=${this.data.block.order.order_no}&url=${getCurrentPages()[getCurrentPages().length - 1].route}`,
        })
    },
    jumpGoods() {
        wx.navigateTo({
            url: '/pages/store/orderGoods/orderGoods?no=' + this.data.block.order.order_no
        })
    },
    change(e) {
        let value = e.detail.value;
        let couponList = this.data.available.coupons;
        let item = '';
        couponList.forEach((items, index) => {
            if (index == value) {
                item = items
            }
        });
        let exclusive = item.discount.exclusive;

        if (exclusive) {
            this.setData({
                'available.discounts': [],
                'available.currentDiscount': '',
                discountsCheckIndex: -1
            })
        }
        this.setData({
            [`available.currentCoupon`]: item,
            show: false
        }, () => {
            this.calculateOrder();
        })






        /*this.setData({
            check: e.detail.value
        })
        var coupons = this.data.block.coupons
        var item = coupons[e.detail.value]

        var data = cookieStorage.get('order_form')
        let exclusive = item.discount.exclusive
        if (!data) return;
        coupons.forEach((v, key) => v.checked = key == e.detail.value)


        if (Array.isArray(item.adjustments)) {
            item.adjustments.sort((a, b) => {
                return Math.abs(a.amount) < Math.abs(b.amount);
            });
        }
//                    排他
        if (exclusive) {
            data.formStates.discountsCheckIndex = -1;
            data.isDisabled = true;
        } else {
            data.isDisabled = false;
        }
        data.otherCoupon = item;
        data.coupons = coupons;
        // Cache.set(cache_keys.order_form, data);
        this.setData({
            block: Object.assign({}, this.data.block, data)
        })

        cookieStorage.set('order_form', data)

        this.paymentMoney()*/
    },
    sure(){
        var block = this.data.block.otherCoupon;
        this.setData({
            /* [`block.coupon`]: block,
             [`form.coupon`]:block,
             [`temporary.coupon`]: block,*/
            show: false
        })

        console.log(this.data.form.coupon)


        // this.paymentMoney()

    },
    select() {
        if(this.data.available.coupons.length) {
            this.setData({
                show: true
            })
        } else  {
            wx.showModal({
                content: '暂无可使用的优惠券',
                showCancel: false
            })
        }
    },
    cancel() {
        var coupons = this.data.available.coupons
        coupons.forEach((v) => v.checked = false)

        this.setData({
            couponCheckIndex: -1,
            'available.coupons': coupons,
            'available.currentCoupon': '',
            show: false,
        }, () => {
            this.calculateOrder();
        })
    },

    onShow() {
        var block =cookieStorage.get('local_order');
        var form = cookieStorage.get('order_form');
        let self_shop = cookieStorage.get('selfShop');

        if (block) {
            if (!form || form.order_no !== block.order.order_no) {
                form = Object.assign({}, this.data.form);
                form.order_no = block.order.order_no;
                if (block.address) {
                    form.address = block.address;
                }
                // Cache.set(cache_keys.order_form, form);
                cookieStorage.set('order_form', form)
            }
        }
        if(self_shop){
            this.setData({
                self_shop:self_shop
            })
        }

        this.setData({
            block: Object.assign({}, this.data.block, block),
            form: Object.assign({}, this.data.form, form)
        })
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });

    },
    inputNote(e) {
        this.setData({
            'form.note': e.detail.value
        })
    },
    initData() {
        var block =cookieStorage.get('local_order');
        var form = cookieStorage.get('order_form');
        var is_login = cookieStorage.get('user_token');
        this.setData({
            is_login:is_login,
            loading:false
        })
        if (block) {
            if (!form || form.order_no !== block.order.order_no) {
                form = Object.assign({}, this.data.form);
                form.order_no = block.order.order_no;
                if (block.address) {
                    form.address = block.address;
                }
                // Cache.set(cache_keys.order_form, form);
                cookieStorage.set('order_form', form)
            } else {
                /*if (form.formStates) {
                    this.setData({
                        [`formStates.discountsCheckIndex`]: form.formStates.discountsCheckIndex,
                        [`formStates.pointStatus`]: form.formStates.pointStatus
                    })
                }
                this.setData({
                    [`form.isDisabled`]: form.isDisabled,
                    [`temporary.coupon`]: form.coupon
                })*/
            }

            // 自动选择最优优惠活动
            /*if (JSON.stringify(form.discount) == '{}' && block.best_discount_id) {
                if (Array.isArray(block.discounts)) {
                    block.discounts.forEach((item, index) => {
                        if (item.id == block.best_discount_id) {
                            var data = {
                                detail: {
                                    value: index
                                }
                            }
                            this.changeDiscounts(data);
                        }
                    })
                }
            }*/

            // 自动选择最优的优惠券
            /*if (JSON.stringify(form.coupon) == '{}' && block.best_coupon_id) {
                if (Array.isArray(block.coupons)) {
                    block.coupons.forEach((item, index) => {
                        if (item.id == block.best_coupon_id) {
                            this.setData({
                               'block.otherCoupon': item
                            }, () => {
                                this.sure();
                            });
                            this.setData({
                                check: index
                            })
                        }
                    })
                }
            }*/
            /*this.setData({
                [`temporary.coupons`]: block.coupons,
                [`temporary.discounts`]: block.discounts
            })*/
            //this.queryOrderExtra();

            this.setData({
                block: Object.assign({}, this.data.block, block),
                form: Object.assign({}, this.data.form, form),
                newBlock: Object.assign({}, this.data.block, block),
                newForm: Object.assign({}, this.data.form, form),
            });

            if (block.discountGroup && block.discountGroup.length) {
                let currentItem = block.discountGroup[0] // 第一个为最优促销
                if (JSON.stringify(form.discount) == '{}' && currentItem.discount) {
                    if (Array.isArray(block.discounts)) {
                        block.discounts.forEach((item, index) => {
                            if (item.id == currentItem.discount) {
                                this.setData({
                                    'available.currentDiscount': item
                                })
                            }
                        })
                        this.setData({
                            'available.discounts': block.discounts
                        })
                    }
                }
                if (JSON.stringify(form.coupon) == '{}' && currentItem.coupon) {
                    if (Array.isArray(block.coupons)) {
                        block.coupons.forEach((item, index) => {
                            if (item.id == currentItem.coupon) {
                                this.setData({
                                    'available.currentCoupon': item
                                })
                            }
                        })

                        this.setData({
                            'available.coupons': block.coupons
                        })
                    }
                }
            }
            // this.paymentMoney();

            setTimeout(() => {
                this.calculateOrder();
            }, 300)
            // t.next({block, form});
        } else {
            // this.addHistory();
            // t.to.router.forward({name: 'user-order-online', params: {status: 1}});
        }
    },
    //这个接口后台没有，先注释掉
    // queryOrderExtra(){
    //     var oauth = this.data.is_login

    //     sandBox.get({
    //         api: `api/shopping/order/extraInfo`,
    //         header: {Authorization: oauth},

    //     }).then(res =>{
    //         res = res.data

    //         var data = res.data;

    //         if (res.status) {
    //             var extra = {
    //                 point: data.userPoint,
    //                 limit: data.pointLimit,
    //                 factor: data.pointToMoney
    //             };

    //             this.setData({
    //                 extra: extra
    //             })
    //             // dispatch(UserOrderExtra, extra);
    //         }
    //     })
    // },
    changeDiscounts(e){
        let value = e.detail.value;
        let discountsList = this.data.available.discounts;
        let item = '';
        if (value == -1) {
            item == '';
        } else {
            discountsList.forEach((items,index) => {
                if (index == value) {
                    item = items;
                }
            })
        }
        let exclusive = item.exclusive;
        if (exclusive) {
            this.setData({
                'available.coupons': [],
                'available.currentCoupon': '',
                couponCheckIndex: -1
            });
        }
        this.setData({
            [`available.currentDiscount`]: item
        }, () => {
            this.calculateOrder();
        })

    },
    submitOrder() {
        if (this.data.loading) return
        var info = this.data.initInfo;
        this.setData({
            loading:true
        })
        var data = {
            order_no: this.data.form.order_no,   // 订单编号
            note: this.data.form.note            // 用户留言
        };
        var itemId = this.data.block.order.items[0].item_meta.detail_id;


        if (this.data.valueR == 0) {
            if ((itemId == 752 ||  itemId == 753) && this.data.accountInfo.miniProgram.appId == 'wxaeb31c404bc0abee') {
                // 511特殊需求
            } else {
                if (this.data.form.address && this.data.form.address.id) {
                    data.address_id = this.data.form.address.id;
                } else {
                    this.setData({
                        loading:false
                    })
                    wx.showModal({
                        title:'请填写收货地址',
                        success:function (res) {
                            if (res.confirm) {

                            }
                        }
                    })
                    return;
                }
            }

        }

        data.pick_self = this.data.valueR;
        if (this.data.available.currentCoupon && this.data.available.currentCoupon.id) {
            data.coupon_id = this.data.available.currentCoupon.id;
        }

        if (this.data.form.invoice && this.data.form.invoice.id) {
            data.invoice_id = this.data.form.invoice.id;
        }

        if (this.data.available.currentDiscount && this.data.available.currentDiscount.id) {
            data.discount_id = this.data.available.currentDiscount.id;
        }

        if (this.data.available.pointStatus) {
            data.point = this.data.available.currentPoint;
        }
        if (this.data.task_id) {
            data.task_id = this.data.task_id
        }
        if(this.data.valueR == 1){
            if(this.data.self_shop == ''){
                this.setData({
                    loading:false
                })
                wx.showModal({
                    title:'请选择自提门店',
                    showCancel:false
                })
                return;
            }
        }


        var agent_code = cookieStorage.get('agent_code');
        if (agent_code) {
            data.agent_code = agent_code;
            data.agent_goods_id = cookieStorage.get('agent_goods_id');
            if(cookieStorage.get('agent_suit_id')){
                data.agent_suit_id = cookieStorage.get('agent_suit_id')
            }
        }
        if(cookieStorage.get('shop_id')){
            data.shop_id = cookieStorage.get('shop_id')
        }
        if(cookieStorage.get('agent_code_time')){
            data.agent_code_time = cookieStorage.get('agent_code_time')
        }
        if(cookieStorage.get('clerk_id')){
            data.clerk_id = cookieStorage.get('clerk_id')
        }
        if(cookieStorage.get('shop_id_time')){
            data.shop_id_time = cookieStorage.get('shop_id_time')
        }
        if(cookieStorage.get('selfShop')){
            let storelocator_id = cookieStorage.get('selfShop').id;
            data.storelocator_id = storelocator_id
        }
        var group_info = cookieStorage.get('group_info')
        console.log("group_info",group_info)
        if (this.data.type == 'groupon' && group_info) {
            data.multi_groupon_id = group_info.multi_groupon_id;
            debugger
            data.multi_groupon_item_id = group_info.multi_groupon_item_id;
        }
        if (cookieStorage.get('openGId')) {
            data.wechat_group_id = cookieStorage.get('openGId');
        }

        this.confirmOrder(data);
    },
    confirmOrder (data) {
        console.log('这个是传的参数', data);
        var that = this;
        var oauth = this.data.is_login;
        sandBox.post({
            api: `api/shopping/order/confirm`,
            data:data,
            header: {Authorization:  oauth},
        }).then(res => {
            res = res.data;
            console.log(res)
            if (res.status) {
                cookieStorage.clear('local_order')
                cookieStorage.clear('selfShop')
                // this.$emit('confirm', true, res.data);
                that.confirm(true,res.data)
            } else {
                that.confirm(false, res.message)
            }
        }).catch(rej =>{
            wx.showToast({
                title:'提交订单失败，请重试！'
            })
        })
    },
    confirm(success,data) {
        if (success) {
            this.setData({
                loading:false
            })
            // this.$refs.button.finish();

            var registration = this.data.block.registration_id;
            var pay_status = data.order.pay_status;

            if (registration || pay_status == 1) {
                // this.addHistory();

                // this.$router.forward({name: 'user-order-online', params: {status: 0}});

//                        this.$router.forward({name: 'user-order-online', params: {status: 0}, query: {registration}});

                wx.redirectTo({
                    url:`/pages/order/index/index?status=0`,
                    success:function (){

                    }
                })

            } else {
                wx.redirectTo({
                    url: `/pages/store/payment/payment?order_no=${data.order.order_no}`,
                    success: function () {

                    }
                    // this.$router.forward({name: 'store-payment', params: {order_no: data.order.order_no}});

                })
            }
        } else {
            this.setData({
                loading:false
            })
            wx.showModal({
                content: data || '提交订单失败',
                showCancel: false
            })
        }
    },
    // 计算订单优惠以及积分等信息
     calculateOrder() {
        let dis = {
            order: 0,
            discounts: 0, // 促销抵扣的钱
            coupon: 0,  // 优惠券抵扣的钱
            point: 0,  // 积分抵扣的钱
            pointCanUse: 0,  // 可用多少积分
        };
        let amount = this.data.newBlock.order.total; // 订单应付金额
        var fixedTotal = this.data.newBlock.order.total;
        let pay_amount =  amount;
        let block = this.data.newBlock;
        console.log(block);
        // let pointCanotUseAmount = block.orderPoint.pointCanotUseAmount || 0;
        let pointCanotUseAmount =  0;
        let currentDiscount = this.data.available.currentDiscount;
        let currentDiscountID = currentDiscount ? currentDiscount.id : 0;
        let currentCoupon = this.data.available.currentCoupon;
        let currentCouponId = currentCoupon ? currentCoupon.id : 0;
        let couponList = this.data.available.coupons;
        let discountsList = this.data.available.discounts;
        let currentItem = this.currentItem(currentDiscountID, currentCouponId); // 拿到当前的组合方式
        let pointStatus = this.data.available.pointStatus;
        // 如果有选择促销
        if (currentDiscount) {
            // 促销能减掉的钱
            let discount = -(currentDiscount.adjustmentTotal);
            // 是否排优惠券
            let exclusive = currentDiscount.exclusive;
            console.log(pay_amount);
            if (discount <= pay_amount) {
                console.log(1);
                dis.discounts = -(currentItem.discountAdjustment);
                pay_amount = pay_amount + currentItem.discountAdjustment;  // 值为负数，所以得加
                discountsList.forEach((item,index) => {

                    if (item.id == currentDiscountID) {
                        this.setData({
                            discountsCheckIndex: index
                        })
                    }
                })

                // 如果排他,将选择的优惠券取消
                if (exclusive) {

                    this.setData({
                        'available.coupons': [],
                        'available.currentCoupon': '',
                        couponCheckIndex: -1
                    });
                    currentCoupon = '';
                    currentCouponId = 0;
                    couponList = [];
                    currentItem = this.currentItem(currentDiscountID, 0); // 拿到当前的组合方式

                    pay_amount =  amount;
                    dis.discounts = -(currentItem.discountAdjustment);
                    pay_amount = pay_amount + currentItem.discountAdjustment;  // 值为负数，所以得加
                } else {
                    console.log('还剩多钱',pay_amount);
                    // 开始筛选优惠券
                    let couponArr = [];
                    if (block.coupons && block.coupons.length) {
                        block.coupons.forEach(item => {
                            if (item.orderAmountLimit == 0 || item.orderAmountLimit <= pay_amount) {
                                item.checked = false;
                                couponArr.push(item);
                            }
                        })
                        this.setData({
                            'available.coupons': couponArr
                        });
                        couponList = couponArr
                    }
                }


            } else {
                console.log(2);
                wx.showModal({
                    title: '超过最大折扣',
                    showCancel: false
                })
                this.setData({
                    'available.currentDiscount': '',
                })
            }

            console.log(discount, pay_amount);
        } else {
            // 不用促销将数据还原
            dis.discounts = 0;
            this.setData({
                'available.coupons': block.coupons,
                discountsCheckIndex: -1
            })
        }


        // 如果有选择优惠券
        if (currentCoupon) {
            // 优惠券能减掉的钱
            let discount = -(currentCoupon.adjustmentTotal);
            // 是否排促销
            let exclusive = currentCoupon.discount.exclusive;

            if (discount <= pay_amount) {
                console.log(3);
                dis.coupon = -(currentItem.couponAdjustment);
                pay_amount = pay_amount + currentItem.couponAdjustment;  // 值为负数，所以得加

                couponList.forEach((item,index) => {
                    if (item.id == currentCouponId) {
                        item.checked = true;
                        this.setData({
                            couponCheckIndex: index
                        })
                    } else {
                        item.checked = false;
                    }
                })
                console.log(couponList);
                this.setData({
                    'available.coupons': couponList
                })

                if (exclusive) {
                    this.setData({
                        'available.discounts': [],
                        'available.currentDiscount': '',
                        discountsCheckIndex: -1
                    })
                    currentDiscount = '';
                    discountsList = [];
                    currentDiscountID = 0;
                    currentItem = this.currentItem(0, currentCouponId); // 拿到当前的组合方式
                    pay_amount =  amount;
                    dis.coupon = -(currentItem.couponAdjustment);
                    pay_amount = pay_amount + currentItem.couponAdjustment;  // 值为负数，所以得加
                } else {
                    // 筛选促销
                    if (!currentDiscount) {
                        let discountArr = [];
                        if (block.discounts && block.discounts.length) {
                            block.discounts.forEach(item => {
                                if (item.orderAmountLimit == 0 || item.orderAmountLimit <= pay_amount) {
                                    discountArr.push(item);
                                }
                            })
                            this.setData({
                                'available.discounts': discountArr
                            })
                            discountsList = discountArr
                        }
                    }
                }
            } else {
                console.log(4);
                wx.showModal({
                    title: '超过最大折扣',
                    showCancel: false
                })
                this.setData({
                    'available.currentCoupon': ''
                })
            }

            console.log(discount, pay_amount);
        } else {
            dis.coupon = 0;
            this.setData({
                'available.discounts': block.discounts
            })
        }

        // this.setData({
        //     [`newBlock.orderPoint.pointCanUse`]: Number(Math.min((pay_amount - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint).toFixed(2)),
        //     [`newBlock.orderPoint.pointAmount`]: Number(Math.max(-((pay_amount - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney)).toFixed(2))
        // }, () => {
        //     this.setData({
        //         [`available.currentPoint`]: this.data.newBlock.orderPoint.pointCanUse,
        //         pointAmount: (this.data.newBlock.orderPoint.pointAmount / 100).toFixed(2)
        //     })
        // })
        /*dis.pointCanUse = Number(Math.min((pay_amount - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney,this.data.block.orderPoint.userPoint).toFixed(2));
        dis.point = Number(Math.min((pay_amount - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit, this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney).toFixed(2))*/
        // 如果使用了积分
        // if (pointStatus) {
        //     debugger
        //     let factor = this.data.extra.factor;
        //     let discount = this.data.available.currentPoint * factor;
        //     console.log('为什么',this.data.available.currentPoint, discount);
        //     if (discount <= pay_amount) {
        //         dis.point = -discount;
        //         pay_amount -= discount;
        //         if (pay_amount < 0) {
        //             pay_amount = 0;
        //             if (dis.point != 0) {
        //                 pay_amount = -(fixedTotal + dis.point);
        //             }
        //         }
        //     } else {
        //         this.setData({
        //             [`available.currentPoint`]: 0
        //         })
        //     }
        // } else {
            this.setData({
                [`available.currentPoint`]: 0
            })
       // }
        let bestDiscount = false;
        if (block.discountGroup && block.discountGroup.length) {
        var bestDiscountItem = block.discountGroup[0];}
        if (bestDiscountItem && currentDiscountID == bestDiscountItem.discount && currentCouponId == bestDiscountItem.coupon) {
            bestDiscount = true
        }

        dis.coupon_yuan = -(dis.coupon / 100).toFixed(2);
        dis.discounts_yuan = -(dis.discounts / 100).toFixed(2)
        dis.total_yuan = -((dis.coupon + dis.discounts) / 100).toFixed(2)
        dis.point_yuan = (dis.point / 100).toFixed(2)
        currentItem.adjustmentTotal_yuan = (currentItem.adjustmentTotal / 100).toFixed(2)
        console.log('看下有用没', pay_amount, currentItem, dis, this.data.newBlock.orderPoint);
        this.setData({
            discounts: dis,
            pay_amount: pay_amount,
            pay_amount_yuan: ((pay_amount + block.order.payable_freight) / 100).toFixed(2),
            currentItem: currentItem,
            bestDiscount: bestDiscount
        })
    },
    // 当前选择的组合方式
    currentItem(currentDiscountID, currentCouponId) {
        console.log('为什么', currentDiscountID, currentCouponId);
        let block = this.data.newBlock;
        let currentItem = {
            adjustmentTotal: 0,  // 总共减掉多少钱
            coupon: 0, // 优惠券id
            couponAdjustment: 0, // 优惠券减掉多少钱
            discount: 0,  // 促销id
            discountAdjustment: 0, // 促销减掉多少钱
        };
        if (block.discountGroup && block.discountGroup.length){
            block.discountGroup.forEach(item => {
                if (item.discount == currentDiscountID && item.coupon == currentCouponId) {
                    currentItem = item;
                }
            });
        }
        return currentItem
    },

    // 使用了最优组合
    bestSwitch(e) {
        var block =cookieStorage.get('local_order');
        console.log("block",block)
        var form = cookieStorage.get('order_form');
        if (e.detail.value) {
            if (block.discountGroup && block.discountGroup.length) {
                let currentItem = block.discountGroup[0] // 第一个为最优促销
                if (JSON.stringify(form.discount) == '{}' && currentItem.discount) {
                    if (Array.isArray(block.discounts)) {
                        block.discounts.forEach((item, index) => {
                            if (item.id == currentItem.discount) {
                                this.setData({
                                    'available.currentDiscount': item
                                })
                            }
                        })
                        this.setData({
                            'available.discounts': block.discounts
                        })
                    }
                }
                if (JSON.stringify(form.coupon) == '{}' && currentItem.coupon) {
                    if (Array.isArray(block.coupons)) {
                        block.coupons.forEach((item, index) => {
                            if (item.id == currentItem.coupon) {
                                this.setData({
                                    'available.currentCoupon': item
                                })
                            }
                        })
                        this.setData({
                            'available.coupons': block.coupons
                        })
                    }
                }
            }
        } else {
            this.setData({
                'available.currentCoupon': '',
                'available.currentDiscount': '',
                discountsCheckIndex: -1,
                couponCheckIndex: -1
            })
        }
        setTimeout(() => {
            this.calculateOrder()
        }, 300)

    },
    paymentMoney() {

        return
        var dis = {
            order: 0,
            point: 0,
            coupon: 0,
        };
        var total = this.data.block.order.total;
        var fixedTotal = this.data.block.order.total;

        var block = cookieStorage.get('local_order');
        var pointCanotUseAmount =  block.orderPoint.pointCanotUseAmount || 0;
        // var pointToMoney = block.orderPoint.pointToMoney;

//                订单折扣
        if (this.data.block.discounts && Array.isArray(this.data.block.discounts)) {

            let discounts = this.data.block.discounts;
            let check = this.data.formStates.discountsCheckIndex;
            console.warn(check)
            if (check == -1) {


//                        当选择不使用优惠的情况
                dis.order = 0;
                this.setData({
                    [`form.discount`]: {},
                    [`form.formStates.discountsCheckIndex`]: check,

                })
                if (this.data.temporary.coupons.length) {

                    this.setData({
                        [`block.coupons`]: this.data.temporary.coupons
                    })
                }
                //                            操作积分
                // this.data.block.orderPoint.pointCanUse = Math.min(total * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint);
                // this.data.block.orderPoint.pointAmount = Math.max(-(total * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney));
                //
                // this.data.form.coupon = this.data.temporary.coupon;     // 将选择的优惠券还原

                this.setData({
                    [`block.orderPoint.pointCanUse`]: Number(Math.min((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint).toFixed(2)),
                    [`block.orderPoint.pointAmount`]: Number((Math.max(-((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney))).toFixed(2)),
                    [`form.coupon`]: this.data.temporary.coupon
                }, () => {
                    this.setData({
                        [`available.currentPoint`]: this.data.newBlock.orderPoint.pointCanUse
                    })
                })
                cookieStorage.set('order_form', this.data.form)
            } else {

//                        当使用了优惠的情况
                let discount = -(discounts[check].adjustmentTotal);
                console.log(discount)
                let exclusive = discounts[check].exclusive;    //是否排他(优惠券);

                if (discount <= total) {
                    if (exclusive) {
                        this.setData({
                            [`block.coupon`]: {},
                            [`block.coupons`]: [],
                            [`form.coupon`]: {}
                        })
                    } else {
                        this.setData({
                            [`block.coupons`]: this.data.temporary.coupons,
                            [`form.coupon`]: this.data.temporary.coupon
                        })
                    }
                    dis.order = discounts[check].adjustmentTotal;
                    this.setData({
                        [`form.discount`]: discounts[check]
                    })
                    total -= discount;
                    // 操作积分


                    this.setData({
                        [`block.orderPoint.pointCanUse`]: Number(Math.min((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint).toFixed(2)),
                        [`block.orderPoint.pointAmount`]: Number((Math.max(-((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney))).toFixed(2)),
                        [`form.formStates.discountsCheckIndex`]: check
                    }, () => {
                        this.setData({
                            [`available.currentPoint`]: this.data.newBlock.orderPoint.pointCanUse
                        })
                    })
                    // Cache.set(cache_keys.order_form, this.data.form);
                    cookieStorage.set('order_form', this.data.form)

                } else {
                    // this.$Alert('超过最大优惠折扣', () => {
                    //     check = -1;
                    // });
                    wx.showModal({
                        title: '超过最大折扣',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) check = -1
                        }
                    })
                    this.setData({
                        [`form.discount`]: {}
                    })
                    cookieStorage.set('order_form', this.data.form)
                }
            }
        }

//                优惠券折扣
        if (this.data.block.coupon && this.data.block.coupon.adjustments && Array.isArray(this.data.block.coupon.adjustments)) {
            let adjustments = this.data.block.coupon.adjustments;
            let exclusive = this.data.form.coupon.discount.exclusive;
            let discount = -(adjustments[0].amount);
            if (discount <= total) {
                if (exclusive) {  // 是否排他
                    console.log('促销的钱', dis.order);
                    if (dis.order != 0) {
                        total -= dis.order;
                        console.log('总价', total);
                    }
                    dis.order = 0;
                    this.setData({
                        'form.isDisabled': true,
                        'form.discount': {},
                        'block.discounts': [],
                        'formStates.discountsCheckIndex': -1,
                        'form.formStates.discountsCheckIndex': -1
                    })
                } else {
                    this.setData({
                        [`block.discounts`]: this.data.temporary.discounts,
                        [`form.isDisabled`]: false
                    })
                    // console.log(32424242);
                }
                dis.coupon = adjustments[0].amount;
                total -= discount;
//                        操作积分

                console.log(Math.min((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint));
                this.setData({
                    [`block.orderPoint.pointCanUse`]: Number(Math.min((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint).toFixed(2)),
                    [`block.orderPoint.pointAmount`]: Number(Math.max(-((total - pointCanotUseAmount) * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney)).toFixed(2))
                }, () => {
                    this.setData({
                        [`available.currentPoint`]: this.data.newBlock.orderPoint.pointCanUse
                    })
                })
            } else {
                wx.showModal({
                    title: '超过最大折扣',
                    showCancel: false,
                })
                this.setData({
                    [`form.coupon`]: {},
                    [`temporary.coupon`]: {},
                    [`form.isDisabled`]: false
                })
                cookieStorage.set('order_form', this.data.form)
            }
        }



        //              积分折扣
        if (this.data.form.point) {

            let factor = this.data.extra.factor;

            let discount = this.data.form.point * factor;
            if (discount <= total) {
                dis.point = -discount;
                total -= discount;
                if (total < 0) {
                    total = 0;
                    if (dis.point != 0) {
                        dis.total = -(fixedTotal + dis.point);
                    }
                } else {
                    //                除积分外的优惠
                    dis.total = dis.order + dis.coupon;
                }
                cookieStorage.set('order_form', this.data.form)
            } else {
                this.setData({
                    [`form.point`]: 0
                })
                cookieStorage.set('order_form', this.data.form)
            }
        }

        // 除积分外的优惠
        dis.total = dis.order + dis.coupon;

        if ((this.data.form.point > this.data.block.orderPoint.pointCanUse) && this.data.block.orderPoint.pointCanUse > 0) {
            this.setData ({
                [`form.point`]:this.data.block.orderPoint.pointCanUse
            })
            dis.point = Number((this.data.block.orderPoint.pointCanUse * 10).toFixed(2))
        }


        this.setData({
            [`paymentMoneys.discounts`]: dis,
            [`paymentMoneys.total`]: total
        })
    },
    usePoint(e){

        /*if (e.detail.value) {
            this.setData({
                [`formStates.pointStatus`]: true,
                [`form.point`]: this.data.block.orderPoint.pointCanUse
            })
            this.paymentMoney()
        } else {
            this.setData({
                [`formStates.pointStatus`]: false,
                [`form.point`]: 0
            })
            this.paymentMoney()
        }*/

        if (e.detail.value) {
            this.setData({
                [`available.pointStatus`]: true,
                [`available.currentPoint`]: this.data.newBlock.orderPoint.pointCanUse
            })
        } else {
            this.setData({
                [`available.pointStatus`]: false,
                [`available.currentPoint`]: 0
            })
        }
        setTimeout(() => {
            this.calculateOrder();
        }, 300)

    },
    modifyPoint(e){
        var min = 0;
        var max = this.data.extra.point;
        var val = e.detail.value;
        var use = Math.floor(this.data.block.order.total * this.data.extra.limit / this.data.extra.factor);
        var sun = Math.floor((this.data.block.order.total + this.data.paymentMoneys.discounts.total) / this.data.extra.factor);

        if (!isFinite(use)) use = max;
        if (!isFinite(sun)) sun = max;

        max = Math.min(max, use, sun);

        val = parseInt(val);
        if (isNaN(val)) {
            val = '';
        } else if (val < min) {
            val = min;
        } else if (val > max) {
            val = max;
        }

        e.detail.value = val
        this.setData({
            [`form.point`]: val
        })
        this.paymentMoney()
    },
    saveForm(e){
        cookieStorage.set('order_form', this.data.form)

    },
    back() {
        wx.navigateBack();
    }
})