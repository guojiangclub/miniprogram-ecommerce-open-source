import {config, is, getUrl, pageLogin, sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        list: [],
        // 最大的申请数量
        maxNum: "",
        selectedIndex: "",
        // 申请数量
        applyNum: 1,
        // 退款金额
        amount: "",
        // 问题描述
        qestionDetail: "",
        // 可退的金额
        availableAmount: "",
        reason: [],
        reasonIndex: '',
        imgList: [],
        order_id: "",
        order_item_id: "",
        good: {
            money: "",
            number: ""
        },
        config: ''
    },
    onShow(){
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });
    },
    changeValue(e){
        let amount = e.detail.value;
        if (!amount) {
            amount = ''
        } else if (/\S*$/.test(amount)) {
            amount = amount.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
        }
        if (Number(amount) > this.data.availableAmount) {
            amount = this.data.availableAmount
        }
        this.setData({
            amount: amount
        });
    },
    changeDetail(e){
        var str = e.detail.value;
        if (e.detail.value.length > 150) {
            wx.showModal({
                title: '提示',
                content: '超出字数限制'
            });
            str = str.slice(0, 150);
        }
        this.setData({
            qestionDetail: str
        });
    },
    setAmount(i){
        this.setData({
            availableAmount: (((this.data.good.money) / this.data.good.number) * i).toFixed(2)
        })
    },
    change: function (e) {
        // 修改选中项文案
        this.setData({
            selectedIndex: e.detail.value
        })
    },
    changeCause: function (e) {
        this.setData({
            reasonIndex: e.detail.value
        })
    },
    getValue: function (e) {
    },
    onLoad(e){
        // 第三方平台配置颜色
        var config = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: config
        })
        var id = e.id,
            no = e.no;
        this.setData({
            order_id: no,
            order_item_id: id
        });
        pageLogin(getUrl(), () => {
            this.queryRefundBaseInfo(id);
            this.queryCauseList();
        });
    },
    deleteImg(e){
        var i = e.currentTarget.dataset.index;
        var arr = this.data.imgList;
        arr.splice(i, 1);
        this.setData({
            imgList: arr
        })
    },
    selectImage(){
        wx.chooseImage({
            count: 1,
            success: res => {
                var tempFilePaths = res.tempFilePaths;
                var token = cookieStorage.get('user_token');
                sandBox.uploadFile({
                    header: {
                        'content-type': 'multipart/form-data',
                        Authorization: token
                    },
                    api: 'api/users/upload/avatar', //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'avatar_file',
                }).then(res =>{
                    var result = JSON.parse(res.data);
                    var arr = this.data.imgList;
                    arr.push(result.data.url);
                    // this.data.imgList.push();
                    this.setData({
                        imgList: arr
                    });
                })
                // uploadTask.onProgressUpdate((res) => {
                //     wx.showLoading({
                //         title: "上传中",
                //         mask: true
                //     });
                // })
            }
        })
    },
    submitApplication(){
        var applyItem = {
            order_no: this.data.order_id,
            order_item_id: parseInt(this.data.order_item_id),
            quantity: parseInt(this.data.applyNum),
            images: this.data.imgList,
            amount: parseFloat(this.data.amount),
            content: this.data.qestionDetail,
            type: this.data.selectedIndex == '' ? '' : this.data.list[this.data.selectedIndex].value,
            reason: this.data.reasonIndex == '' ? '' : this.data.reason[this.data.reasonIndex].value
        }, message = null;
        if (!is.has(applyItem.type)) {
            message = "请选择售后类型";
        } else if (!is.has(applyItem.reason)) {
            message = '请填写退换原因';
        } else if (!is.has(applyItem.amount)) {
            message = '请填写退款金额';
        } else if (!is.has(applyItem.content)) {
            message = "请输入问题描述";
        }
        if (message) {
            wx.showModal({
                title: '提示',
                content: message,
                showCancel:false
            })
        } else {
            applyItem.type = parseInt(applyItem.type);
            this.applyretreat(applyItem);
        }
    },
    applyretreat(data){
        wx.showLoading({
            mask: true,
            title: '正在申请'
        })
        sandBox.post({
            api: "api/refund/apply",
            data: data,
            header: {
                Authorization: cookieStorage.get('user_token')
            },

        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showToast({
                        title: "申请成功请等待审核",
                        duration: 1500,
                        success: () => {
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: '/pages/afterSales/detail/detail?no=' + res.data.refund_no
                                })
                            }, 1500);
                        }
                    })
                } else {
                    wx.showModal({
                        content: res.message || '申请失败',
                        showCancel: false,
                    })
                }
                wx.hideLoading();
            } else {
                wx.showModal({
                    content: '申请失败',
                    showCancel:false
                })
                wx.hideLoading();
            }
        })
    },
    plus(){
        var num = this.data.applyNum;
        num++;
        if (num > this.data.maxNum) return;
        this.setData({
            applyNum: num
        });
        this.setAmount(num)
    },
    minus(){
        var num = this.data.applyNum;
        if (num <= 1) return;
        num--;
        this.setData({
            applyNum: num
        });
        this.setAmount(num);
    },
    queryRefundBaseInfo(id){
        sandBox.get({
            api: "api/refund/base_info",//服务类型接口
            header: {
                Authorization: cookieStorage.get('user_token')
            },
            data: {
                order_item_id: id
            },

        }).then(res => {
            var store = res.data.data;
            var meta = res.data.meta.type;
            var list=[];
            meta.forEach((v)=>{
                list.push({
                    name: v.value,
                    value: String(v.key)
                })
            })
            /*var list=[{
                name: meta[0].value,
                value: meta[0].key
            }];*/


            this.setData({
                'good.money': (store.total) / 100,
                'good.number': store.quantity,
                availableAmount: ((store.total) / 100 / store.quantity).toFixed(2),
                maxNum: store.quantity,
                list:list
            })
        })
    },
    queryServiceList(status,distribution_status){
        sandBox.get({
            api:'api/users/BankAccount/show-bank',
            header: {
                Authorization: cookieStorage.get('user_token')
            }
        }).then(res=>{
            res=res.data;
        });
    },
    queryCauseList(type = 'order_refund_reason') {
        sandBox.get({
            api:'api/system/settings',//退换原因接口
            header: {
                Authorization: cookieStorage.get('user_token')
            },
            data: {
                type: type
            }
        }).then(res=>{
            res = res.data;
            var list=[];
            res.data.forEach((v)=>{
                if(v.is_enabled!=0){
                    list.push({
                        name: v.value,
                        value: String(v.key)
                    })
                }
            })
            this.setData({
                reason: list
            })
        })
    }
});