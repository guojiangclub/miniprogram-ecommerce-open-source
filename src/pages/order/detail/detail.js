import {config,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		order: {},
		typeList: {
			0: '临时订单',
			1: '待付款',
			2: '付款成功',
			3: '已发货',
			4: '已完成',
			5: '已完成',
			6: '已取消',
			7: '已退款',
			8: '已作废',
			9: '已删除',
			31: '部分已发货'
		},
		refundStatus:[
            '待审核',
			'审核通过',
			'拒绝申请',
			'已完成',
			'已关闭',
			'等待买家退货',
			'买家已退货',
			'等待商城发货'
		],
		order_no: '',
	},
	onShow(){
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        this.queryOrderDetail(this.data.order_no);
	},
	onLoad(e) {
		this.setData({
            order_no: e.no
		})
	},
    applyRetreat(e){
        wx.navigateTo({
            url: '/pages/afterSales/apply/apply?no=' + e.currentTarget.dataset.no+'&id='+e.currentTarget.dataset.id
        })
	},
    jumpRetreat(e){
        var refund_no=e.currentTarget.dataset.no;
        wx.navigateTo({
            url: '/pages/afterSales/detail/detail?no='+refund_no
        })
	},
	pay(e) {
		var order_no = e.currentTarget.dataset.no;
		wx.navigateTo({
			url: '/pages/store/payment/payment?order_no=' + order_no
		})
	},
    jump() {
    	var id = this.data.order.multi_groupon_users[0].multi_groupon_items_id;
        wx.navigateTo({
            url: '/pages/store/collage/collage?multi_groupon_item_id=' + id
        })
	},
	jumpDetail(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/store/detail/detail?id=' + id
		})
	},

	cancel() {
		wx.showModal({
		  content: '确定取消该订单',
		  success: res=>{
		    if (res.confirm) {
			    this.cancelOrder(this.data.order_no);
		    }
		  }
		})
	},
	receive() {
		wx.showModal({
			content: '确定已收货?',
			success: res=>{
				if (res.confirm) {
					this.receiveOrder(this.data.order_no);
				}
			}
		})
	},
	// 获取订单详情
	queryOrderDetail(orderNo) {
		var token =cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/order/' + orderNo,
			header: {
				Authorization: token
			},
		}).then(res =>{
            if (res.statusCode = 200) {
                res = res.data;
                this.setData({
                    order: res.data
                })
            } else {
                wx.showModal({
                    content: '请求失败，请稍后重试',
                    showCancel: false
                })
            }

            wx.hideLoading();
		}).catch(rej =>{
            wx.showModal({
                content: '请求失败，请稍后重试',
                showCancel: false
            })
            wx.hideLoading();
		})
	},
	// 取消订单
	cancelOrder(orderNo) {
		var token = cookieStorage.get('user_token');

		sandBox.post({
			api: 'api/shopping/order/cancel',
			header: {
				Authorization: token
			},
			data: {
				order_no: orderNo
			},
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                wx.showModal({
                    content: res.message || '取消成功',
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.queryOrderDetail(orderNo);
                        }
                    }
                })
            } else {
                wx.showModal({
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
		}).catch(rej =>{

            if (rej.statusCode == 404) {
                wx.showModal({
                    content: '接口不存在',
                    showCancel: false
                })
            } else {
                wx.showModal({
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
			}
		})
	},
	// 确认收货
	receiveOrder(orderNo) {
		var token = cookieStorage.get('user_token');

		sandBox.post({
			api: 'api/shopping/order/received',
			header: {
				Authorization: token
			},
			data: {
				order_no: orderNo
			},
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                wx.showModal({
                    content: '确认收货成功',
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.queryOrderDetail(orderNo);
                        }
                    }
                })
            } else {
                wx.showModal({
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
		}).catch(rej =>{
            wx.showModal({
                content: '取消订单失败, 请检查您的网络状态',
                showCancel: false
            })
		})
	},
	// 发货
    delivery() {
        var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: '正在发货',
            mask: true
        })
        sandBox.post({
            api: 'api/shopping/order/delivery',
            header: {
                Authorization: token
            },
            data: {
                order_no: this.data.order_no
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                wx.showModal({
                    content: '发货成功',
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.queryOrderDetail(this.data.order_no);
                        }
                    }
                })
            } else {
                wx.showModal({
                    content: '发货失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(rej =>{
            wx.hideLoading();
            wx.showModal({
                content: '发货失败, 请检查您的网络状态',
                showCancel: false
            })
        })
	}
})