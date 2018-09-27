import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		code:{
			total:60,
			access_token:null,
			codeText:"获取验证码"
		},
		sending:false,
		tellphone: '',
		identifyingcode: '',
		url: ''
	},
	onLoad(e) {
		if (e.url) {
			this.setData({
				url: e.url
			})
		}
	},
	getCode(){
		if(this.data.sending) return;
		var randoms=this.random();
		this.setData({
			sending:true,
			'code.codeText':"短信发送中",
			'code.access_token':randoms
		});
		var fn;
		fn=this.getLoginCode;
		fn(()=>{
			var total =this.data.code.total;
			this.setData({
				'code.codeText':total+"秒后再发送"
			});
			var timer =setInterval(()=>{
				total--;
				this.setData({
					'code.codeText':total+"秒后再发送"
				});
				if(total<1){
					this.setData({
						sending:false,
						'code.codeText':"获取验证码"
					});
					clearInterval(timer);
				}
			},1000);
		},()=>{
			this.setData({
				sending:false,
				'code.codeText':"获取验证码"
			});
		});
	},
	changeCode(e){
		this.setData({
			tellphone: e.detail.value
		})
	},
	changeIdentifyCode(e){

		this.setData({
			identifyingcode: e.detail.value
		})
	},
	random(){
		return Math.random().toString(36).substr(2,24);
	},
	getLoginCode(resolve,reject){
		var message =null;
		if(!is.has(this.data.tellphone)){
			message = "请输入您的手机号";
		} else if(!is.mobile(this.data.tellphone)){
			message = '手机号格式不正确，请重新输入';
		}
		if(message){
			this.setData({
				message:message
			});
			reject();
			setTimeout(()=>{
				this.setData({
					message:""
				});
			},3000)
			return
		}
		sandBox.post({
			api:"api/sms/verify-code",

			data:{
				mobile:this.data.tellphone,
				access_token:this.data.code.access_token
			},
		}).then(res =>{
			if(res.data.success){
				resolve();
			}
			else{
				reject();
			}
		})
		// resolve();
	},
	submit(){
		var message=null;
		if(!is.has(this.data.tellphone)){
			message = "请输入您的手机号";
		} else if(!is.mobile(this.data.tellphone)){
			message = '手机号格式不正确，请重新输入';
		} else if(!is.has(this.data.identifyingcode)){
			message="请填写验证码";
		}
		if(message){
			this.setData({
				message:message
			});
			setTimeout(()=>{
				this.setData({
					message:""
				});
			},3000)
			return
		}
		this.setData({
			showLoading: true
		})
		this.bindUserMobile();
	},
	bindUserMobile() {
		sandBox.post({
			api: 'api/users/update/mobile',
			data: {
				mobile: this.data.tellphone,
				code: this.data.identifyingcode,
				access_token: this.data.code.access_token
			},
			header:{
				Authorization: cookieStorage.get('user_token')
			},
		}).then(res => {
			wx.hideLoading();
			if (res.statusCode == 200) {
				res =res.data;
				if (res.status) {
					wx.showModal({
						content: '绑定成功',
						showCancel: false,
						success: res=>{
							if (res.confirm || (!res.cancel && !res.confirm)) {
								if (this.data.url) {
									wx.redirectTo({
										url: '/' + decodeURIComponent(this.data.url)
									})
								} else {
									wx.switchTab({
										url: '/pages/user/user/user'
									})
								}
							}
						}
					})
				} else {
					wx.showModal({
						content: res.message || '绑定失败',
						showCancel: false,
					})
				}
			} else {
				wx.showModal({
					content: '请求失败，请重试',
					showCancel: false
				})
			}
		}).catch(rej => {
			res =res.data;
			wx.showModal({
				content: '请求失败，请重试',
				showCancel: false
			})
		})
	},
	back() {
		if (this.data.url) {
			wx.redirectTo({
				url: '/' + decodeURIComponent(this.data.url)
			})
		} else {
			wx.navigateBack();
		}
	}
})
