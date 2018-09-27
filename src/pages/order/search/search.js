import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		dataList: [],
		text: '',
        clear: true,
        meta: '',
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
	},
    search(e) {
	    this.setData({
	        text: e.detail.value,
            clear: e.detail.value <= 0
        })
    },
    clear() {
        this.setData({
            text: '',
            clear: true
        })
    },
    // 搜索
    searchKeywords() {

        var keyword = this.data.text;
        if (!keyword || !keyword.length) return;
        this.orderList(keyword);

    },
    jump(e) {
        wx.navigateTo({
            url: '/pages/order/detail/detail?no=' + e.currentTarget.dataset.no
        })
    },
    pay(e) {
        var order_no = e.currentTarget.dataset.no;
        wx.navigateTo({
            url: '/pages/store/payment/payment?order_no=' + order_no
        })
    },
    delete(e) {
        wx.showModal({
            title: '',
            content: '是否删除该订单',
            success:res => {
                if (res.confirm) {
                    this.deleteOrder(e.currentTarget.dataset.no);
                }
            }
        })
    },
    submit(e) {
        wx.showModal({
            title: '',
            content: '是否确认收货',
            success:res => {
                if (res.confirm) {
                    this.receiveOrder(e.currentTarget.dataset.no);
                }
            }
        })
    },
    // 确认收货
    receiveOrder(orderNo) {
        var token =cookieStorage.get('user_token');

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
                    content: '收货成功',
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.orderList(0,this.data.activeIndex);
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
    },
    // 删除订单
    deleteOrder(orderNo) {
        var token = cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/shopping/order/delete',

            header: {
                Authorization: token
            },
            data: {
                'order_no': orderNo
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                wx.showToast({
                    title: '删除成功'
                });
                this.orderList(0,this.data.activeIndex);
            } else {
                wx.showModal({
                    title: '',
                    content: '删除订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
        }).catch(rej =>{
            wx.showModal({
                title: '',
                content: '删除订单失败, 请检查您的网络状态',
                showCancel: false
            })
        })
    },
    onReachBottom() {
        // debugger
        var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
        if (hasMore) {
            var page = this.data.meta.pagination.current_page + 1;
            this.orderList(this.data.text,page);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
	// 获取订单列表
	orderList(status, page = 1) {
        console.log(status);
        var token = cookieStorage.get('user_token');
		var params = {
            criteria: status,
            page : page,
		};

        wx.showLoading({
            title: '加载中',
            mask: true
        });

		sandBox.get({
			api: 'api/order/list',
			header: {
				Authorization: token
			},
			data: params,
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data.length) {
                    this.setData({
                        [`dataList.${page - 1}`]: res.data,
                        meta: res.meta
                    })
                } else {
                    wx.showToast({
                        image: '../../../assets/image/error.png',
                        title: '没有查询到'
                    });
                }
            } else {
                wx.showModal({
                    title: '',
                    content: '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej =>{
            wx.showToast({
                title: "请求失败",
                image: '../../../assets/image/error.png'
            })
            wx.hideLoading()
        })
	}
})