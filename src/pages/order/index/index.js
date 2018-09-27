import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		activeIndex: 0,
		sliderOffset: 0,
		sliderLeft: 0,
		width: 0,
		tabList: [
			{
				title: "全部",
				init: false,
                line: false,
                page: 0,
                more: true,
				show: false
			},
			{
				title: "待付款",
				init: false,
                line: false,
                page: 0,
                more: true,
				show: false
			},
			{
				title: "待发货",
				init: false,
                line: false,
                page: 0,
                more: true,
				show: false
			},
			{
				title: "待收货",
				init: false,
                line: false,
                page: 0,
                more: true,
				show: false
			},
            {
                title: "待评价",
                init: false,
                line: false,
                page: 0,
                more: true,
                show: false
            }
		],
		dataList: {
            0: [],
            1: [],
            2: [],
            3: []
		},
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
		showText: '正在加载下一页数据',
	},
	onLoad(e) {
		pageLogin(getUrl());
		if (e.type) {
			this.setData({
				activeIndex: e.type
			})
		}
	},
	onShow(e) {
		wx.showLoading({
			title: "加载中",
			mask: true
		});
		wx.getSystemInfo({
			success: res => {
				this.setData({
					width: res.windowWidth / this.data.tabList.length,
					sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
				})
			}
		});
        this.orderList(this.data.activeIndex);
	},
	jump(e) {
		wx.navigateTo({
			url: '/pages/order/detail/detail?no=' + e.currentTarget.dataset.no
		})
	},
    jumpSearch() {
        wx.navigateTo({
            url: '/pages/order/search/search'
        })
	},
	tabClick(e) {
        var status = e.currentTarget.id;
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: status
		});
        if (!this.data.tabList[status].init) {
			wx.showLoading({
				title: "加载中",
				mask: true
			});
			this.orderList(status);
		}
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
	onReachBottom(e) {
        var status = this.data.activeIndex
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        console.log(tabList);
        if (this.data.tabList[status].more) {
        	this.setData({
                [`${tabList}.show`]: true
			})
            this.orderList(status,page);
        } else {
            wx.showToast({
                title: '再拉也没有啦',
				icon: 'none'
            });
        }
	},

	// 获取订单列表
	orderList(status = 0, page = 1) {
		var token = cookieStorage.get('user_token');
		var params = status ? { status  } : {  };
		params.page = page;

		sandBox.get({
			api: 'api/order/list',
			header: {
				Authorization: token
			},
			data: params,
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[${status}]`;
                    this.setData({
                        [`dataList.${status}[${page - 1}]`] : res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.page`]: current_page,
                        [`${tabList}.more`]: current_page < total_pages,
                        [`${tabList}.show`]: false
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        image: '../../../assets/image/error.png'
                    })
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
                            this.orderList(this.data.activeIndex);
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
                this.orderList(this.data.activeIndex);
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

	// 商品评价
    commentOrder(e) {
        var order_no = e.currentTarget.dataset.no;
        wx.navigateTo({
        	url: '/pages/order/evaluate/evaluate?order_no=' + order_no
		})
	}
})