import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		page: 1,
		show: false,
		edit: false,
		meta: '',
		total: 0,
		dataList: [],
		checkList: [],
		allCheck: false,
		token: ''
	},
	onShow() {
		this.queryFavoriteList();
	},
	onReachBottom() {
		var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
		if (hasMore) {
			this.setData({
				show: true
			});

			var page = this.data.meta.pagination.current_page + 1;
			this.queryFavoriteList(0,page);
		} else {
			wx.showToast({
				icon: 'none',
				title: '再拉也没有啦'
			});
		}
	},
	edit() {
		this.setData({
			edit: !this.data.edit
		})
	},
	select(e) {
		var value = e.detail.value;
		var newList = [];
		if (value.length == this.data.total) {
			this.setData({
				allCheck: true
			})
		} else {
			this.setData({
				allCheck: false
			})
		}

		value.forEach(v => {
			v=parseInt(v);
			newList.push(v);
		})
		this.setData({
			checkList: newList
		})
	},
	// 全选
	click() {
		var newList = this.data.dataList;
		if (this.data.allCheck) {
			newList.forEach(v => {
				v.forEach(i => {
					i.isCheck =false
				})
			});
			this.setData({
				checkList: []
			})
		} else {
			var checkList = [];
			newList.forEach(v => {
				v.forEach(i => {
					i.isCheck =true
				})
			});
			newList.forEach(v => {
				v.forEach(i => {
					checkList.push(i.favoriteable_id)
				})
			});
			this.setData({
				checkList: checkList
			})
		}
		this.setData({
			dataList: newList,
			allCheck: !this.data.allCheck
		})

	},
	cancel() {
		var data = {
			checkList: this.data.checkList,
			dataList: this.data.dataList
		}
		if (this.data.checkList.length === 0) {
			wx.showModal({
			  title: '',
			  content: '请选择你要删除的收藏',
				showCancel: false
			})
		} else {
			wx.showModal({
			  title: '',
			  content: '是否取消收藏',
			  success: res=>{
			    if (res.confirm) {
			    	this.removeBatchFavorite(data);
			    }
			  }
			})
		}
	},
	jump(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
		  url: '/pages/store/detail/detail?id=' + id
		})
	},
	// 查询收藏列表
	queryFavoriteList(status = 0, page = 1) {
		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/favorite',
			header: {
				Authorization: token
			},
			data: {
				page: page
			},
		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var total = res.meta.pagination.total;
                    res.data.forEach(v => {
                        v.remove = false;
                        v.isCheck = false
                    })
                    this.setData({
                        total: total,
                        [`dataList[${page -1}]`]: res.data,
                        meta: res.meta
                    })
                } else {
                    wx.showModal({
                        title: '',
                        content: res.message,
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    title: '',
                    content: "请求失败",
                    showCancel: false
                })
            }
            this.setData({
                show: false
            })
		}).catch(rej =>{
            this.setData({
                show: false
            })
		})
	},
	// 批量删除收藏
	removeBatchFavorite(data) {
		var token = cookieStorage.get('user_token');

		sandBox.post({
			api: 'api/favorite/delFavs',
			data: {
                ids: data.checkList,
				favoriteable_type: 'goods'
			},
			header: {
				Authorization: token
			},

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var dataList = data.dataList;
                    var checkList = data.checkList;
                    dataList.forEach((v, idx) => {
                        v.forEach((i, index) => {
                            if (checkList.indexOf(i.favoriteable_id) != -1) {
                                this.setData({
                                    [`dataList[${idx}][${index}].remove`]: true
                                })
                            }
                        })
                    });
                    this.queryFavoriteList();
                    this.setData({
                        checkList: []
                    })
                } else {
                    wx.showModal({
                        title: '',
                        content: res.message,
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    title: '',
                    content: "请求失败",
                    showCancel: false
                })
            }
		})
	}
})