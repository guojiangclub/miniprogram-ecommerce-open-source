import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		status: {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4:0
		},
		activeType:'all',
		isShow:false,
		activeIndex: 0,
		sliderOffset: 0,
		sliderLeft: 0,
		width: 0,
		dataList: {
			//0 是线上 ， 1 是线下
			0: {
                0: [],
                1: [],
                2: [],
                3: [],
				4:[]
			},
			1: {
                0: [],
                1: [],
                2: [],
                3: [],
                4:[]
			}
		},
		tabList:[
            {
                title: "全部会员",
                init: false,
                statusNum: {
                    0:{
                        page: 0,
                        more: true,
                    },
                    1:{
                        page: 0,
                        more: true,
                    }
                },
                show: false
            },
            {
                title: "待结算",
                init: false,
                statusNum: {
                    0:{
                        page: 0,
                        more: true,
                    },
                    1:{
                        page: 0,
                        more: true,
                    }
                },
                show: false
            },
            {
                title: "已入账",
                init: false,
                statusNum: {
                    0:{
                        page: 0,
                        more: true,
                    },
                    1:{
                        page: 0,
                        more: true,
                    }
                },
                show: false
            },
            {
                title: "已失效",
                init: false,
                statusNum: {
                    0:{
                        page: 0,
                        more: true,
                    },
                    1:{
                        page: 0,
                        more: true,
                    }
                },
                show: false
            },

		],
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
					width: res.windowWidth / this.data.tabList.length ,
					sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
				})
			}
		});
        var tabStatus = this.data.status[this.data.activeIndex]; // 都是0，线上

        this.orderList(tabStatus,1,this.data.activeType);
	},
	jump(e) {
		wx.navigateTo({
			url: '/pages/distribution/pusherOrder/pusherOrder?order_no=' + e.currentTarget.dataset.no
		})
	},
    jumpSearch() {
        wx.navigateTo({
            url: '/pages/order/search/search'
        })
	},
	closeType(){
		this.setData({
			isShow:false
		})
	},
	//切换一级会员，二级会员
    changeType(e){
		var type = e.currentTarget.dataset.type;
		var txt = '';
		if(type == 'all'){
			txt = "全部会员"
		} else if (type == 'level1'){
			txt = "一级会员"
		} else {
			txt = "二级会员"
		}
		this.data.tabList.forEach(val=>{
			val.init = false
		})
		// 重新赋值
		var newDataLsit = {
            0: {
                0: [],
                1: [],
                2: [],
                3: [],
                4:[]
            },
            1: {
                0: [],
                1: [],
                2: [],
                3: [],
                4:[]
            }
        }
		this.setData({
			activeType:type,
			tabList:this.data.tabList,
			[`tabList[0].title`]:txt,
			isShow:false,
            dataList: newDataLsit
		}, () => {
            this.orderList(0,1,this.data.activeType);
		})

	},
	tabClick(e) {
           var status = e.currentTarget.id; // 0,1,2,3
           if(status == 0){
               this.setData({
                   isShow:!this.data.isShow,
                   sliderOffset: e.currentTarget.offsetLeft,
                   activeIndex: status
               })
           }
             if(!this.data.isShow){
                 this.setData({
                     sliderOffset: e.currentTarget.offsetLeft,
                     activeIndex: status
                 });
			 }
           if (!this.data.tabList[status].init) {
                  if(!this.data.isShow){
                      wx.showLoading({
                          title: "加载中",
                          mask: true
                      });
                      this.orderList(status,1,this.data.activeType);
				  }
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
		// debugger
		var status = this.data.activeIndex;
		var statusPage = this.data.status[status];
        var page = this.data.tabList[status].statusNum[statusPage].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].statusNum[statusPage].more) {
			this.setData({
				[`${tabList}.show`]: true
			})
			this.orderList(status,page,this.data.activeType);
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}
	},

	// 获取订单列表
    orderList(status, page,type) {
        var token = cookieStorage.get('user_token');
        var newstatus = '';
        if(status == 0){
            newstatus = ''
        } else if(status == 1){
            newstatus = "wait"
        } else if(status == 2){
            newstatus = "close"
        } else if(status == 3){
            newstatus = "lose"
        }

        sandBox.get({
            api: 'api/distribution/order/list',
            header: {
                Authorization: token
            },
            data: {
                status:newstatus,
                type:type,
                page:page
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    var tabList = `tabList[${status}]`;
                    var statusPage = `status[${status}]`;
                    var dataStatus = this.data.status[this.data.activeIndex];//0 线上
                    this.setData({
                        [`dataList.${dataStatus}[${status}][${page - 1}]`] : res.data,
                        [`${tabList}.init`]: true,
                        [`${tabList}.statusNum.${dataStatus}.page`]: current_page,
                        [`${tabList}.statusNum.${dataStatus}.more`]: current_page < total_pages,
                        [`${tabList}.show`]: false
                    })
                    /*console.log(this.data.tabList[status].statusNum[dataStatus]);*/
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
                    title: '',
                    content: res.message,
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
                    title: res.data.message
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
	}
})