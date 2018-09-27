import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		list: [],
		order_no: '',
		url:''
	},
	onLoad(e) {
		pageLogin(getUrl());
		var order_no = '',
            url= '';
		if (e.order_no) {
			order_no = e.order_no
		}
		if (e.url) {
			url = e.url
		}
		this.setData({
			order_no: order_no,
			url:url
		})
	},
	onShow() {
		this.queryAddressList();
	},
	setInfo(e) {
		var from = e.currentTarget.dataset.info;
		var data = cookieStorage.get('order_form');
		if (!data) {
			return this.view(from.id);
		}
		var order_no = this.data.order_no;
		if (order_no && data.order_no === order_no) {
			data.address  = from;
            cookieStorage.set('order_form', data);
			wx.navigateBack({
				url:'/'+this.data.url
			});
		} else {
			return this.view(from.id);
		}
	},
	view(id) {
		wx.navigateTo({
			url: '/pages/address/add/add?id=' + id
		})
	},
	add() {
		wx.navigateTo({
			url: '/pages/address/add/add'
		})
	},
    addWx() {
        wx.chooseAddress({
        	success: res => {
        		cookieStorage.set('address', res);
                wx.navigateTo({
                    url: '/pages/address/add/add?is_wx=' + true
                })
            },
            fail: err => {
        		if (err == 'chooseAddress:fail auth deny') {
        			wx.showModal({
        				content: '请允许获取地址信息',
						showCancel: false
					})
				}
            }
		})
	},
	// 查询收货地址列表
	queryAddressList() {
		var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: "加载中",
            mask: true
        })
		sandBox.get({
			api:  'api/address',
			header: {
				Authorization: token
			},

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        list: res.data
                    })
                } else {
                    wx.showToast({
                        title: res.message,
						icon: 'none'
                    })
                }

            } else {
                wx.showToast({
                    title: '获取信息失败',
                    icon: 'none'
                })
            }
            wx.hideLoading();
		}).catch(() => {
            wx.showToast({
                title: '获取信息失败',
                icon: 'none'
            })
            wx.hideLoading();
		})
	}
})