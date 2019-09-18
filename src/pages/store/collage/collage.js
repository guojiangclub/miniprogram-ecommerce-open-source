import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
import Animation from '../../../utils/animation.js'

Page({
    data:{
        show_share:false,
        show_friend:false,
        showItemDate:{},
        percent:50,
        showItemMeta:{},
        endTime: {
            interval: '',
            day: 0,
            hour: 0,
            minute: 0,
            second:0,
            count: 0
        },
        timer:'',
        endmessage:'',
        endtype:0,
        createImgUrl:'',
        config: '',
        author: '',
        is_refused:false

    },
    //弹出分享
    changeShare(){
        this.setData({
            show_share : !this.data.show_share
        })
    },
    //弹出朋友圈
    getShearImg(){
        this.setData({
            show_friend : !this.data.show_friend,
            show_share:false
        });
    },
    onLoad(e){
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        var init = cookieStorage.get('init');
        this.setData({
            config: gbConfig,
            author: init ? init.other_technical_support : ''
        })
        var multi_groupon_item_id = e.multi_groupon_item_id;
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                multi_groupon_item_id = sceneArr[0]
            }
        }
        if(multi_groupon_item_id){
            this.showItem(multi_groupon_item_id);
            //this.createShareImg()
        } else {
            wx.showModal({
                content:'非法进入',
                showCancel:false
            })
        }
    },
    jumpAuthor() {
        wx.navigateTo({
            url:'/pages/index/author/author'
        });
    },
    //获取拼团详情页数据
    showItem(multi_groupon_item_id){
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/multiGroupon/showItem',
            header: {
                Authorization: token
            },
            data: {
                multi_groupon_item_id: multi_groupon_item_id
            },
        }).then(res =>{
            if(res.statusCode == 200){
                res = res.data;
                if(res.status){
                    this.setData({
                        showItemDate:res.data,
                        showItemMeta:res.meta
                    });
                    this.controlProgress();
                    if(this.data.showItemDate.overdue_status == 0 && this.data.showItemDate.status == 0){
                        this.setData({
                            timer: setInterval(this.countTime, 1000)
                        })
                    }
                   /*  timer = setInterval(this.countTime, 1000);*/


                } else {
                    wx.showModal({
                        content:res.message || '请求数据失败',
                        showCancel:false
                    })
                }
            } else {
                wx.showModal({
                    content:res.message || '请求数据失败',
                    showCancel:false
                })
            }
            wx.hideLoading()
        }).catch(rej =>{
            wx.hideLoading()
            wx.showModal({
                content: res.message || '请求失败',
                showCancel: false
            })
        })
    },
    //控制进度条颜色
    controlProgress(){
        if(this.data.showItemDate.status != 0) {
            this.setData({
                percent: 100
            })
       }
    },
    //发送给好友
    onShareAppMessage(res){
        this.changeShare();
        var groupon_item_id = this.data.showItemDate.id;
        return {
            title:this.data.showItemDate.groupon.goods.name,
            path: '/pages/store/collage/collage?multi_groupon_item_id=' + groupon_item_id,
            imageUrl:this.data.showItemDate.groupon.goods.img
        }
    },
    // 发送到朋友圈
    createShareImg(){
        wx.showLoading({
            title: "生成中",
            mask: true
        })
       var token = cookieStorage.get('user_token') || '';
       sandBox.get({
           api :'api/multiGroupon/createShareImage',
           header:{
               Authorization: token
           },
           data:{
               goods_id: this.data.showItemDate.multi_groupon_goods_id,
               multi_groupon_item_id:this.data.showItemDate.id
           }
       }).then(res => {
           if(res.statusCode == 200){
               res = res.data;
               if(res.status){
                   this.setData({
                       createImgUrl : res.data.image
                   });
                   this.getShearImg();
               } else {
                   wx.showModal({
                       content: res.message || '请求失败',
                       showCancel: false
                   })
               }
           } else{
               wx.showModal({
                   content: '请求失败',
                   showCancel: false
               });
           }
           wx.hideLoading();
           this.changeShare();
       }).catch(rej =>{
           wx.showModal({
               content: '内部错误',
               showCancel: false
           })
           wx.hideLoading();
           this.changeShare();
       })
    },
    closeAlert(){
        this.setData({
            is_refused:false
        })
    },
    downImg(){
        let that =this
        if(this.data.createImgUrl){
            wx.downloadFile({
                url: this.data.createImgUrl,
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
   //下载图片
//    downImg(){
//     if(this.data.createImgUrl){
//         wx.showLoading({
//             title:'正在下载',
//             mask:true
//         });
//         sandBox.dowloadFile({
//             api: this.data.createImgUrl
//         }).then(res=>{
//             if(res.statusCode == 200){
//                 wx.getSetting({
//                     success :ret =>{
//                         //如果之前没有授权
//                         if(!ret.authSetting['scope.writePhotosAlbum']){
//                             wx.authorize({
//                                 scope:'scope.writePhotosAlbum',
//                                 success: rej =>{
//                                     this.saveImg(res.tempFilePath);
//                                 },
//                                 //用户拒绝授权
//                                 fail:ret =>{
//                                     this.setData({
//                                         is_refused:true
//                                     })
//                                     wx.hideLoading();
//                                 }
//                             })
//                         } else{
//                             this.saveImg(res.tempFilePath);
//                         }
//                     }
//                 })
//             } else {
//                 wx.hideLoading();
//                 wx.showToast({
//                     title: '下载图片失败',
//                     icon: 'none'
//                 })
//             }
//         },err=>{

//         })
//     }
// },
    //保存图片
    saveImg(path){
       wx.saveImageToPhotosAlbum({
           filePath:path,
           success:res =>{
               wx.hideLoading();
           },
           fail:rej =>{
               wx.hideLoading();
               wx.showToast({
                   title:'保存图片失败',
                   icon:'none'
               })
           }
       })
    },
    // 倒计时
    countTime(){
        var d = 86400000,
            h = 3600000,
            n = 60000,
            end = this.data.showItemDate.ends_at,
            server = this.data.showItemMeta.server_time,
            arr = String(end).split(/\D/),
            newArr = String(server).split(/\D/);
        newArr = newArr.map(Number);
        arr = arr.map(Number);
        var serverTime = new Date(newArr[0], newArr[1] - 1, newArr[2], newArr[3], newArr[4], newArr[5]).getTime();
        var endTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
        //计算开始时间跟结束时间的差值
        var timeDiff = endTime - serverTime;
        // 在本地计算倒计时
        var allTime = this.data.endTime.count + 1000;
        this.setData({
            'endTime.count': allTime
        })
        // this.endTime.count += 1000;
        var interval = timeDiff - this.data.endTime.count;
        if (interval < d){
            this.setData({
                endtype:1
            })
            if (interval < 0) {
//		        	活动结束
                this.showItem(this.data.showItemDate.id);
                clearInterval(this.data.timer);

// 			this.$emit('end',this.index)
            } else {
                var day = Math.floor(interval / d);
                Math.floor(interval -= day * d);
                var hour = Math.floor(interval / h);
                Math.floor(interval -= hour * h);
                var minute = Math.floor(interval / n);
                var second = Math.floor(interval % n / 1000);
                this.setData({
                    'endTime.day': day,
                    'endTime.hour': hour,
                    'endTime.minute': minute,
                    'endTime.second': second
                })
            }
        } else{
            this.setData({
                endmessage:`${arr[1]} 月 ${arr[2]} 日，${arr[3]} : ${arr[4]} 结束`
            })
        }
    },
    jumpDetail() {
        var id = this.data.showItemDate.groupon.goods.id;
        var item_id = this.data.showItemDate.id
        if (this.data.showItemDate.overdue_status == 0) {
            wx.navigateTo({
                url: '/pages/store/detail/detail?id=' + id + '&groupon_item_id=' + item_id
            })
        } else {
            wx.navigateTo({
                url: '/pages/store/detail/detail?id=' + id
            })
        }

    },
    jumpMore() {

        wx.navigateTo({
            url: '/pages/store/list/list'
        })
    },
    jumpOrder() {
        var order_no = this.data.showItemDate.order_no
        wx.navigateTo({
            url: '/pages/order/detail/detail?no=' + order_no
        })
    }


})