import {config,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
		storeList: [],
		text: '',
		clear:true,
		searches: [],
		show: true,
		meta: '',
		init: false
	},
	onReady() {
		var searches = cookieStorage.get('goods_search_history');
		if (searches && searches.length) {
			this.setData({
				searches: searches
			})
		}
	},
	onReachBottom() {
		var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
		if (hasMore) {
			var query = {
				keyword: this.data.text
			};
			var page = this.data.meta.pagination.current_page + 1;
			this.querySearchList(query,page);
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}

	},
	jump(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/store/detail/detail?id=' + id
		})
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
	// 单击搜索
	searchKeywords() {

		var keyword = this.data.text;
		if (!keyword || !keyword.length) return;
		var searches = JSON.parse(JSON.stringify(this.data.searches));
		for (let i = 0, len = searches.length; i < len; i++) {
			let  search = searches[i];
			if (search === keyword) {
				searches.splice(i, 1);
				break;
			}
		}

		searches.unshift(keyword);
		cookieStorage.set('goods_search_history', searches);

		wx.setNavigationBarTitle({
			title: '搜索：' + "'" + keyword + "'"
		})
		this.querySearchList({keyword: keyword});

		this.setData({
			show: false,
			searches: searches
		})

	},
	// 点击单个搜索记录搜索
	searchHistory(e) {

		var searches = JSON.parse(JSON.stringify(this.data.searches));
		var keyword = searches[e.currentTarget.dataset.index];

		searches.splice(e.currentTarget.dataset.index, 1);
		searches.unshift(keyword);


		cookieStorage.set('goods_search_history', searches);

		wx.setNavigationBarTitle({
			title: '搜索：' + "'" + keyword + "'"
		})
		this.querySearchList({keyword: keyword});

		this.setData({
			show: false,
			searches: searches,
			text: keyword
		});
	},
	// 删除单个搜索记录
	removeSearchHistory(e) {
		var searches = JSON.parse(JSON.stringify(this.data.searches));

		searches.splice(e.currentTarget.dataset.index, 1);

		cookieStorage.set('goods_search_history', searches);

		this.setData({
			searches: searches
		})
	},
	// 清空搜索记录
	clearSearchHistory() {
		cookieStorage.clear('goods_search_history');
		this.setData({
			show: false,
			searches:[]
		})
	},

	// 搜索商品
	querySearchList(query = {}, page = 1) {
		var params = Object.assign({}, query, { page });

		wx.showLoading({
			title: '加载中',
			mask: true
		});

		sandBox.get({
			api: 'api/store/list',
			data: params,
		}).then(res =>{
            res = res.data;

            if (res.status) {
                this.setData({
                    [`storeList.${page - 1}`]: res.data,
                    meta: res.meta,
                    init: true
                })

            } else {
                wx.showModal({
                    title: '',
                    content: res.message
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
	}
})