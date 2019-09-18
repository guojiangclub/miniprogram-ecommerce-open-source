import {config,sandBox,pageLogin,getUrl,cookieStorage} from '../../../lib/myapp.js';

Page({
	data: {
		detail: '',
		barcode: '',
		is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
		init: false,
        show_share: false,
		config: ''
	},
	onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
		var id = e.id;
		var coupon_id = e.coupon_id;
		this.setData({
            id: e.id
        })
		this.queryCouponDetail(id, coupon_id);
	},
    changeShare() {
        this.setData({
            show_share: !this.data.show_share
        })
    },
    onShareAppMessage() {
        this.setData({
            show_share: false
        })
        return {
            title: this.data.detail.title,
            path: '/pages/coupon/onDetail/onDetail?id=' + this.data.id + '&is_coupon=1&agent_code='+this.data.detail.agent_code
        }
    },
    //生成海报
    getShearImg(){
        wx.navigateTo({
            url:'/pages/distribution/shareImg/shareImg?id='+this.data.id+'&channel='+this.data.detail.channel
        })
		this.changeShare()
    },
	// 查询优惠券详情
	queryCouponDetail(id,coupon_id) {
		wx.showLoading({
			title: "加载中",
			mask: true
		});
		var coupon_ids = coupon_id ? coupon_id : ''

		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/discount/' + id + '/detail',
            data: {
                is_agent:1,
                coupon_id: coupon_ids
            },
			header: {
				Authorization: token
			}

		}).then(res =>{
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status) {
					this.setData({
						detail: res.data,
						init: true
					})

                    if (!res.data.agent_code) {
                        wx.showModal({
                            content: '当前用户非分销员',
                            showCancel: false,
                            success: res => {
                                if (res.confirm || (!res.cancel && !res.confirm)) {
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            }
                        })
                        this.setData({
                            init: false
                        })
                        wx.hideShareMenu();
                    }
				} else {
                    wx.hideShareMenu();
					wx.showModal({
						content: res.message || '请求失败',
						showCancel: false
					})
				}
			} else {
                wx.hideShareMenu();
				wx.showModal({
					content: "请求失败",
					showCancel: false
				})
			}
			wx.hideLoading()
		}).catch(rej => {
            wx.hideShareMenu();
			wx.hideLoading()
			wx.showModal({
				content: '请求失败',
				showCancel: false
			})
		})
	}
})