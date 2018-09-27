import {
	connect,
	bindActionCreators,
	store,
	actions,
	sandBox,
	cookieStorage,
	config
} from '../../../lib/myapp.js'

Page({
	data: {
		block: {
			order: {
				items: ''
			}
		}
	},
	onLoad(e) {
		var block = e.type == 'entity' ? cookieStorage.get('entity_local_order') : cookieStorage.get('local_order');
		if (block && block.order.order_no == e.no) {
			this.setData({
				block: block
			})
		} else {
			wx.showModal({
			  content: '没有找到商品数据',
				showCancel: false,
			  success: res=>{
			    if (res.confirm) {
				    wx.navigateBack();
			    }
			  }
			})
		}
	}
})