
import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
import Rater from '../../../component/rater/rater';
Page({
    data:{
        orderData: '',
        minLength: 5,
        disabled: true,
        order_no: '',
        length: ''
    },
    onLoad(e) {
        console.log(e);
        var order_no = e.order_no;
        this.initOrderComment(order_no);
        this.setData({
            order_no: order_no
        })
    },
    upload(e){
        console.log(e);
        var index = e.currentTarget.dataset.index;
        var that = this
        wx.chooseImage({
            count: 1, // 默认9
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                var token=cookieStorage.get('user_token');

                wx.uploadFile({
                    header: {
                        'content-type':'multipart/form-data',
                        Authorization:token
                    },
                    url: `${config.GLOBAL.baseUrl}api/users/upload/avatar`, //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'avatar_file',
                    success: res => {
                        var result = JSON.parse(res.data);
                        var arr = that.data.orderData.items[index].upload_images
                        arr.push(result.data.url);
                        var uploadData = `orderData.items[${index}]`;
                        that.setData({
                            [`${uploadData}.upload_images`] : arr
                        })
                    }
                })
            }
        })

    },
    changeEvaluate(e){
        var len = e.detail.value;
        var index = e.currentTarget.dataset.index;
        if (e.detail.value.length > 500) {
            wx.showModal({
                title: '提示',
                content: '超出字数限制'
            });
            len = len.slice(0, 500);
        }
        this.setData({
            [`orderData.items[${index}].comment` ]: len,
            length: e.detail.value.length
        });
    },
    deleteImg(e) {
        console.log(e);
        var index = e.currentTarget.dataset.index;
        var idx = e.currentTarget.dataset.idx;
        var images = e.currentTarget.dataset.images;
        images.splice(idx, 1);
        this.setData({
            [`orderData.items[${index}].upload_images` ]: images
        })
        console.log(images);
    },
    allowComment() {
        if (this.data.orderData.items && this.data.orderData.items.length) {
            for (let item of this.data.orderData.items) {
                if (item.comment.length < this.data.minLength) return false;
            }
            return true;

        } else {
            return false;
        }
    },
    submit(){
        if (this.allowComment()) {
            var order_no = this.data.order_no;
            var comments = [];
            var data = this.data.orderData.items;
            var rater = this.data.$vlc.rater;
            data.forEach((item,index) => {
                comments.push({
                    order_no,
                    order_item_id: item.id,
                    contents: item.comment,
                    point: rater[index].value,
                    images:item.upload_images
                })
            });
            this.postSubmit(comments);
        } else {
            wx.showModal({
                content:"所有订单请填写完",
                showCancel:false
            });
        }
    },
    postSubmit(comments){
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        var data = {};
        comments.forEach((comment, index) => {
            data[index] = comment;
        });

        sandBox.post({
            api:  'api/shopping/order/review',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data: data
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if(res.status && comments.length){
                    wx.showModal({
                        content: '评价成功',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                wx.redirectTo({
                                    url: '/pages/order/comment/comment'
                                })
                            }
                        }
                    })
                } else {
                    wx.showModal({
                        content: res.message || "请求失败",
                        showCancel:false
                    });
                    wx.hideLoading()

                }
            } else {
                wx.showModal({
                    content:"请求失败",
                    showCancel:false
                });
                wx.hideLoading()
            }

        })
    },
    initOrderComment(id){
        wx.showLoading({
            title: "加载中",
            mask: true
        });

        sandBox.get({
            api:  'api/order/' + id,
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if(res.status){
                    var start = Rater;
                    var data = res.data;
                    data.items.forEach((v,index) => {
                        start.init(index, {
                            value: 5
                        })
                        v.score = '';
                        v.comment = '';
                        v.upload_images=[];
                    });


                    this.setData({
                        orderData: data
                    })
                } else {
                    wx.showModal({
                        content: res.message || "请求失败",
                        showCancel:false
                    });
                }
                wx.hideLoading()
            } else {
                wx.showModal({
                    content:"请求失败",
                    showCancel:false
                });
                wx.hideLoading()
            }

        })

    }
})