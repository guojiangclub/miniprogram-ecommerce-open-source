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
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });
	},
	onLoad(e) {
        console.log(e,'00000000');
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
	jumpDetail(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/pointStore/detail/detail?id=' + id
		})
	},
    jumpPoint() {
        wx.navigateTo({
            url: '/pages/pointStore/index/index'
        })
    },

	cancel() {
		wx.showModal({
		  title: '',
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
			title: '',
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
                    title: '',
                    content: '请求失败，请稍后重试'
                })
            }

            wx.hideLoading();
		}).catch(rej =>{
            wx.showModal({
                title: '',
                content: '请求失败，请稍后重试'
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
                    title: '',
                    content: res.message,
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.queryOrderDetail(orderNo);
                        }
                    }
                })
            } else {
                wx.showModal({
                    title: '',
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
		}).catch(rej =>{

            if (rej.statusCode == 404) {
                wx.showModal({
                    title: '',
                    content: '接口不存在',
                    showCancel: false
                })
            } else {
                wx.showModal({
                    title: '',
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
                    title: '',
                    content: res.message,
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.queryOrderDetail(orderNo);
                        }
                    }
                })
            } else {
                wx.showModal({
                    title: '',
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
		}).catch(rej =>{
            wx.showModal({
                title: '',
                content: '取消订单失败, 请检查您的网络状态',
                showCancel: false
            })
		})
	}
})