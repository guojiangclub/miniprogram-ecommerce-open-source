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
        block: {
            order: {
                items: []
            },
            otherCoupon: {}
        },
        form: {
            order_no: '',
            address: {},
            coupon: {},
            invoice: {},
            discount: {},
            note: '',
            formStates: {},
            isDisabled: false   //是否禁用优惠折扣按钮
        },
        formStates: {
            discountsCheckIndex: -1,
            noDiscountsCheckList: -1,
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
        token:'',
        show: false, // 是否显示优惠券
        show_discounts: false,   // 是否显示促销
    },

    onShow(e) {
        this.initData()
    },
    // 点击促销折扣
    showDiscounts() {
        if (!this.data.block.discounts || this.data.block.discounts.length == 0) {
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

    // 添加发票
    addInvoice(){
        wx.navigateTo({
            url:`/pages/store/invoice/invoice?order_no=${this.data.block.order.order_no}&url=${getCurrentPages()[getCurrentPages().length - 1].route}`,
        })
    },

    // 选择地址
    selectAddress () {

        wx.navigateTo({
            url:`/pages/address/list/list?order_no=${this.data.block.order.order_no}&url=${getCurrentPages()[getCurrentPages().length - 1].route}`,
        })
    },

    // 查看更多商品
	jumpGoods() {
		wx.navigateTo({
		    url: '/pages/store/orderGoods/orderGoods?no=' + this.data.block.order.order_no
        })
    },


    // 初始化数据
    initData() {
        var block =cookieStorage.get('local_order');
        var form = cookieStorage.get('order_form');
        var toekn = cookieStorage.get('user_token');

        this.setData({
            toekn:toekn,
            loading:false
        })
        if (block) {
            if (!form || form.order_no !== block.order.order_no) {
                form = Object.assign({}, this.data.form);
                form.order_no = block.order.order_no;
                if (block.address) {
                    form.address = block.address;
                }
                cookieStorage.set('order_form', form)
            } else {
                if (form.formStates && form.formStates.discountsCheckIndex) {
                    this.setData({
                        [`formStates.discountsCheckIndex`]: form.formStates.discountsCheckIndex,
                    })
                }
                this.setData({
                    [`form.isDisabled`]: form.isDisabled,
                    [`temporary.coupon`]: form.coupon
                })
            }
            // 自动选择最优优惠活动
            if (JSON.stringify(form.discount) == '{}' && block.best_discount_id) {
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
            }
            // 自动选择最优的优惠券
            if (JSON.stringify(form.coupon) == '{}' && block.best_coupon_id) {
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
            }
            this.setData({
                [`temporary.coupons`]: block.coupons
            })
            this.setData({
                block: Object.assign({}, this.data.block, block),
                form: Object.assign({}, this.data.form, form)
            })
            this.paymentMoney()
        }
    },

    // 计算折扣信息
    paymentMoney() {
        var dis = {
            order: 0,
            point: 0,
            coupon: 0,
        };
        var total = this.data.block.order.total;
        var block = cookieStorage.get('local_order');
//                订单折扣
        if (this.data.block.discounts && Array.isArray(this.data.block.discounts)) {
            let discounts = this.data.block.discounts;
            let check = this.data.formStates.discountsCheckIndex;
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
                this.setData({
                    [`form.coupon`]: this.data.temporary.coupon
                })
                cookieStorage.set('order_form', this.data.form)
            } else {
//                        当使用了优惠的情况
                let discount = -(discounts[check].adjustmentTotal);
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
                    this.setData({
                        [`form.formStates.discountsCheckIndex`]: check
                    })
                    cookieStorage.set('order_form', this.data.form)

                } else {
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
        dis.total = dis.order + dis.coupon;
        this.setData({
            [`paymentMoneys.discounts`]: dis,
            [`paymentMoneys.total`]: total
        })
    },

    // 选择促销
    changeDiscounts(e){
        this.setData({
            [`formStates.discountsCheckIndex`]: e.detail.value
        })

        this.paymentMoney();

    },

    // 点击使用优惠券
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

    // 选择优惠券
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
        this.setData({
            block: Object.assign({}, this.data.block, data)
        })
        cookieStorage.set('order_form', data)

        this.paymentMoney()
    },

    // 选择优惠券确定
    sure(){
        var block = this.data.block.otherCoupon;
        this.setData({
            [`block.coupon`]: block,
            [`form.coupon`]:block,
            [`temporary.coupon`]: block,
            show: false
        })
        this.paymentMoney()
    },

    // 选择优惠券取消
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

    // 添加备注
    inputNote(e) {
        this.setData({
            'form.note': e.detail.value
        })
    },

    // 提交订单
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

        this.confirmOrder(data);
    },
    // 提交订单
    confirmOrder (data) {
        var oauth = cookieStorage.get('user_token');
        sandBox.post({
            api: `api/shopping/order/confirm`,
            data:data,
            header: {Authorization:  oauth},
        }).then(res => {
            res = res.data;
            console.log(res)
            if (res.status) {
                cookieStorage.clear('local_order')
                this.confirm(true,res.data)
            } else {
                this.confirm(false, res.message)
            }
        }).catch(rej =>{
            wx.showToast({
                title:'提交订单失败，请重试！'
            })
        })
    },
    // 提交订单回调
    confirm(success,data) {
        if (success) {
            this.setData({
                loading:false
            })
            var registration = this.data.block.registration_id;
            var pay_status = data.order.pay_status;

            if (registration || pay_status == 1) {
                wx.redirectTo({
                    url:`/pages/order/index/index?status=0`
                })
            } else {
                wx.redirectTo({
                    url: `/pages/store/payment/payment?order_no=${data.order.order_no}`,
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

    // 保存信息
    saveForm(e){
        cookieStorage.set('order_form', this.data.form)
    },

    // 返回
    back() {
	    wx.navigateBack();
    }
})