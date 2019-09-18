var app = getApp();
import {
    connect,
    bindActionCreators,
    store,
    actions,
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
            coupon: {}      //当前选择的优惠券
        },
        paymentMoneys: {
            discounts: {},
            total: 0
        },
        check: null,
        is_login:'',
        type: '',
        config: ''
    },

	onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
        if (e.type) {
            this.setData({
                type: e.type
            })
        }
        this.queryUserPoint('default');
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
	inputNote(e) {
		this.setData({
			'form.note': e.detail.value
		})
	},
    change(e) {

        this.setData({
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

        this.paymentMoney()
    },
    sure(){
        var block = this.data.block.otherCoupon

        this.setData({
            [`block.coupon`]: block,
            [`form.coupon`]:block,
            show: false
        })

        console.log(this.data.form.coupon)

        this.paymentMoney()
    },
    select() {
        if(this.data.block.coupons.length) {
	        this.setData({
		        show: true
	        })
        } else  {
	        wx.showModal({
	            title: '',
		        content: '暂无可使用的优惠券',
		        showCancel: false
            })
        }
    },
    cancel() {
        var coupons = this.data.block.coupons
        coupons.forEach((v) => v.checked = false)
        this.setData({

            [`block.coupons`]: coupons,
            [`form.coupon`]:this.data.block.otherCoupon,
            [`block.otherCoupon`]: {},
            check: null,
            show: false
        })
    },

    onShow() {

        this.initData()
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });

    },
    initData() {
        var block =cookieStorage.get('point_order');
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
                if (form.formStates) {

                    this.setData({
                        [`formStates.discountsCheckIndex`]: form.formStates.discountsCheckIndex,
                        [`formStates.pointStatus`]: form.formStates.pointStatus
                    })
                }


                this.setData({
                    [`form.isDisabled`]: form.isDisabled,
                    [`temporary.coupon`]: form.coupon
                })
            }

            this.setData({
                [`temporary.coupons`]: block.coupons
            })
            this.queryOrderExtra();

            this.setData({
                block: Object.assign({}, this.data.block, block),
                form: Object.assign({}, this.data.form, form)
            })
            console.log(this.data.form)
            this.paymentMoney()
            // t.next({block, form});
        } else {

            // this.addHistory();
            // t.to.router.forward({name: 'user-order-online', params: {status: 1}});
        }
    },
    queryOrderExtra(){
        var oauth = this.data.is_login

        sandBox.get({
            api: `api/shopping/order/extraInfo`,
            header: {Authorization: oauth},

        }).then(res =>{
            res = res.data

            var data = res.data;

            if (res.status) {
                var extra = {
                    point: data.userPoint,
                    limit: data.pointLimit,
                    factor: data.pointToMoney
                };

                this.setData({
                    extra: extra
                })
                // dispatch(UserOrderExtra, extra);
            }
        })
    },
    changeDiscounts(e){
        this.setData({
            [`formStates.discountsCheckIndex`]: e.detail.value
        })

        this.paymentMoney();

    },
    submitOrder() {
        if (this.data.loading) return
        this.setData({
            loading:true
        })
        var data = {
            order_no: this.data.form.order_no,   // 订单编号
            note: this.data.form.note            // 用户留言
        };

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

        if (this.data.form.coupon && this.data.form.coupon.id) {
            data.coupon_id = this.data.form.coupon.id;
        }

        if (this.data.form.invoice && this.data.form.invoice.id) {
            data.invoice_id = this.data.form.invoice.id;
        }

        if (this.data.form.discount && this.data.form.discount.id) {
            data.discount_id = this.data.form.discount.id;
        }

        if (this.data.form.point) {
            data.point = this.data.form.point;
        }

        this.confirmOrder(data);
    },
    confirmOrder (data) {

        var that = this;
        var oauth = this.data.is_login;
        sandBox.post({
            api: `api/shopping/order/confirm/point`,
            data:data,
            header: {Authorization:  oauth},
        }).then(res => {
            res = res.data;
            console.log(res)
            if (res.status) {
                cookieStorage.clear('point_order')
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
    queryUserPoint(type) {
        var token = cookieStorage.get('user_token');

        sandBox.get({
            api:'api/users/point',
            header:{
                Authorization:token
            },
            data:{
                type: type
            }
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        point: res.data
                    })
                }
            }
        })

    },
    confirm(success,data) {

        if (success) {
            this.setData({
                loading:false
            })
            wx.redirectTo({
                url: `/pages/pointStore/success/success?order_no=${data.order.order_no}`
            })
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
    paymentMoney() {
        var dis = {
            order: 0,
            point: 0,
            coupon: 0,
        };
        var total = this.data.block.order.total;
        var fixedTotal = this.data.block.order.total;
        var block = cookieStorage.get('point_order');
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
                    [`block.orderPoint.pointCanUse`]: Math.min(total * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint),
                    [`block.orderPoint.pointAmount`]: Math.max(-(total * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney)),
                    [`form.coupon`]: this.data.temporary.coupon
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
                    //                            操作积分


                    this.setData({
                        [`block.orderPoint.pointCanUse`]: Math.min(total * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney, this.data.block.orderPoint.userPoint),
                        [`block.orderPoint.pointAmount`]: Math.max(-(total * this.data.block.orderPoint.pointLimit), -(this.data.block.orderPoint.userPoint * this.data.block.orderPoint.pointToMoney)),
                        [`form.formStates.discountsCheckIndex`]: check
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
            let discount = -(adjustments[0].amount);
            if (discount <= total) {
                dis.coupon = adjustments[0].amount;
                total -= discount;
//                        操作积分

                this.setData({
                    [`block.orderPoint.pointCanUse`]: total * this.data.block.orderPoint.pointLimit / this.data.block.orderPoint.pointToMoney,
                    [`block.orderPoint.pointAmount`]: -(total * this.data.block.orderPoint.pointLimit)
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

        console.log(this.data.form, this.data.block)


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

        if (this.data.form.point > this.data.block.orderPoint.pointCanUse) {
            this.setData ({
                [`form.point`]:this.data.block.orderPoint.pointCanUse
            })
            dis.point = this.data.block.orderPoint.pointCanUse * 10
        }


        this.setData({
            [`paymentMoneys.discounts`]: dis,
            [`paymentMoneys.total`]: total
        })

    },
    usePoint(){

        this.setData({
            [`formStates.pointStatus`]: true,
            [`form.point`]: this.data.block.orderPoint.pointCanUse
        })


        this.paymentMoney()
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