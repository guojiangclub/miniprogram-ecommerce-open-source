import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		detail: {
			is_default: false,
			address_name: [],
            accept_name: '',
            mobile: '',
            address: ''
		},
		id: '',
		loading: false,
		deleteLoading: false
	},

	onLoad(e) {
		pageLogin(getUrl());
		if (e.id) {
			wx.setNavigationBarTitle({
				title: '修改收货地址'
			})
            this.setData({
                id: e.id
            })
			this.queryAddress(e.id);
		} else {
			wx.setNavigationBarTitle({
				title: '新增收货地址'
			})
		}
		var address = cookieStorage.get('address')
		if (e.is_wx && address) {
		    var address_name = [];
            address_name.push(address.provinceName);
            address_name.push(address.cityName);
            address_name.push(address.countyName)
		    this.setData({
		        'detail.mobile': address.telNumber,
                'detail.accept_name': address.userName,
                'detail.address': address.detailInfo,
                'detail.address_name': address_name

            })
            console.log(address);
        }
	},
	bindRegionChange(e) {
		this.setData({
			'detail.address_name': e.detail.value
		})
	},
	check(e) {
		this.setData({
			"detail.is_default": !this.data.detail.is_default
		})
	},
	input(e) {
		var type = e.currentTarget.dataset.type;
		var value = e.detail.value;
		this.setData({
			[`detail.${type}`]: value
		})
	},
	delete() {
		this.setData({
			deleteLoading: true
		})
		this.removeAddress(this.data.id);
	},
	submit() {
		this.setData({
			loading: true
		})
		var message = null;
		if (!is.has(this.data.detail.accept_name)) {
			message = '请输入姓名'
		} else if (!is.has(this.data.detail.mobile)) {
			message = '请输入手机号码'
		} else if (!is.mobile(this.data.detail.mobile)) {
			message = '请输入正确的手机号码'
		} else if (!is.has(this.data.detail.address_name)) {
			message = '请选择地址'
		} else if (!is.has(this.data.detail.address)) {
			message = '请输入详细地址';
		}
		if (message) {
			this.setData({
				loading: false
			})
			wx.showModal({
				title: '',
				content: message,
				showCancel: false
			})
		} else {
			if (this.data.id) {
				this.updateAddress(this.data.detail);
			} else {
				this.createAddress(this.data.detail)
			}
		}
	},
	// 获取收货地址详情
	queryAddress(id) {
        wx.showLoading({
            title: "加载中",
            mask: true
        })
		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/address/' + id,
			header: {
				Authorization: token
			},

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                var data = res.data;
                data.is_default = !!data.is_default;
                data.address_value = [data.province, data.city, data.area].join(' ');
                data.address_name = data.address_name.split(' ');
                if (res.status) {
                    this.setData({
                        detail: data
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
		})
	},
	// 新增收货地址
	createAddress(data) {
		var address = {
			accept_name: data.accept_name,
			mobile: data.mobile,
			address_name: data.address_name.join(" "),
			address: data.address,
			is_default: data.is_default ? 1 : 0
		};
		var token = cookieStorage.get('user_token');
		sandBox.post({
			api: 'api/address',
			header: {
				Authorization: token
			},
			data: address,

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showModal({
                        content: '新增收货地址成功',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: '新增收货地址失败',
                        icon: 'none',
                        complete: err => {
                            setTimeout(() => {
                                wx.navigateBack();
                            },1600)
                        }
                    })
                }
            } else {
                wx.showToast({
                    title: '请求错误',
                    icon: 'none',
                    complete: err => {
                        setTimeout(() => {
                            wx.navigateBack();
                        },1600)
                    }
                })
            }

            this.setData({
                loading: false
            })
		}).catch(rej =>{
            this.setData({
                loading: false
            })
		})
	},
	// 修改收货地址
	updateAddress(data) {
		var address = {
			id: data.id,
			accept_name: data.accept_name,
			mobile: data.mobile,
			address_name: data.address_name.join(" "),
			address: data.address,
			is_default: data.is_default ? 1 : 0
		};
		var token = cookieStorage.get('user_token');
		sandBox.ajax({
			api: 'api/address/' + data.id,
			method: 'PUT',
			header: {
				Authorization: token
			},
			data: address,
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showModal({
                        content: '修改收货地址成功',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: '修改收货地址失败',
                        icon: 'none',
                        complete: err => {
                            setTimeout(() => {
                                wx.navigateBack();
                            },1600)
                        }
                    })
                }
            } else {
                wx.showToast({
                    title: '请求错误',
                    icon: 'none',
                    complete: err => {
                        setTimeout(() => {
                            wx.navigateBack();
                        },1600)
                    }
                })
            }

            this.setData({
                loading: false
            })
		}).catch(rej =>{
            this.setData({
                loading: false
            })
		})
	},
	// 删除收货地址
	removeAddress(id) {
		var token = cookieStorage.get('user_token');
		sandBox.ajax({
			api: 'api/address/' + id,
			header: {
				Authorization: token
			},
			method: 'DELETE',

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showModal({
                        content: '删除收货地址成功',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: '删除收货地址失败',
                        icon: 'none',
                        complete: err => {
                            setTimeout(() => {
                                wx.navigateBack();
                            },1600)
                        }
                    })
                }
            } else {
                wx.showToast({
                    title: '请求错误',
                    icon: 'none',
                    complete: err => {
                        setTimeout(() => {
                            wx.navigateBack();
                        },1600)
                    }
                })
            }

            this.setData({
                deleteLoading: false
            })
		}).catch(rej =>{
            this.setData({
                deleteLoading: false
            })
		})
	}

})