import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
data:{
    erweima:{},
    config: '',
    init: false,
    is_refused:false

},
    onShow(){
    this.getspread();

    },
    onLoad() {
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
    },
    closeAlert(){
        this.setData({
            is_refused:false
        })
    },

    getspread(){
        sandBox.get({
            api:  'api/distribution/getMiniShareHomeInfo',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if (res.statusCode == 200){
                res = res.data;
                if (res.status){
                    this.setData({
                        erweima: res.data,
                        init: true
                    })

                }else{
                    wx.showModal({
                        title:'请求失败，请稍后重试',
                        showCancel: false
                    })

                }
            }else {
                wx.showModal({
                    title:'请求失败，请稍后重试',
                    showCancel: false
                })
            }

        })
    },
    onShareAppMessage(res){
        return {
            title: this.data.erweima.share_title,
            path:'/pages/user/personal/personal?agent_code=' + this.data.erweima.agent_code,
            imageUrl: this.data.erweima.share_img
        }
    },
    // 下载图片
    down(){
        let that =this
        if(this.data.erweima.agent_mini){
            wx.downloadFile({
                url: this.data.erweima.agent_mini,
                success (res) {
                    if (res.statusCode === 200) {
                        wx.getSetting({
                            success :ret =>{
                                //如果之前没有授权
                                if(!ret.authSetting['scope.writePhotosAlbum']){
                                    wx.authorize({
                                        scope:'scope.writePhotosAlbum',
                                        success: rej =>{
                                            that.saveImg(res.tempFilePath);
                                        },
                                        //用户拒绝授权
                                        fail:ret =>{
                                            this.setData({
                                                is_refused:true
                                            })
                                            wx.hideLoading();
                                        }
                                    })
                                } else{
                                    that.saveImg(res.tempFilePath);
                                }
                            }
                        })
                    }
                }
            })
        }
    },
    // 保存图片
    saveImg(path) {
        wx.saveImageToPhotosAlbum({
            filePath: path,
            success: res => {
                wx.hideLoading();
            },
            fail: rej => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存图片失败',
                    icon: 'none'
                })
            }
        })
    }
})