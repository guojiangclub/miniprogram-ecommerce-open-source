// pages/order/index/index.js
import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        width: 0,
        tabList: [
            {
                title: "可申请",
                init: false,
                page: 0,
                id:0,
                name:"after",
                more: true,
                show: false
            },
            {
                title: "申请中",
                init: false,
                page: 0,
                id:1,
                name:"process",
                more: true,
                show: false
            },
            {
                title: "已结束",
                init: false,
                page: 0,
                id:2,
                name:"end",
                more: true,
                show: false
            }
        ],
        dataList: {
            0: [],
            1: [],
            2: []
        },
        statusList:[
            '临时订单',
            '待付款',
            '付款成功',
            '已发货',
            '已完成',
            '已完成',
            '已取消',
            '已退款',
            '已作废',
            '已删除'
        ],
        typeList: [
         '申请审核中',
         '申请已通过',
         '拒绝申请',
         '退款成功',
         '售后已关闭',
         '等待用户退货',
         '退货中',
         '等待商城发货'
        ],
        showText: '正在加载下一页数据',
        token:''
    },
    onShow(e) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    width: res.windowWidth / this.data.tabList.length,
                    sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
                })
            }
        });
        pageLogin(getUrl(),()=>{
            this.operabale(0,1);
        });

        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });


        // this.orderList(0, this.data.activeIndex);
    },
    // jump(e) {
    //     wx.navigateTo({
    //         url: '/pages/afterSales/apply/apply?no=' + e.currentTarget.dataset.no
    //     })
    // },
    tabClick(e) {

        var status = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: status
        });
        if (!this.data.tabList[status].init) {
            wx.showLoading({
                title: "加载中",
                mask: true
            });
            if(status==0){
                this.operabale(0, 1);
            }
            else{
                this.orderList(0, status);
            }

        }
    },
    viewRetreat(e){
        wx.navigateTo({
            url: '/pages/afterSales/apply/apply?no=' + e.currentTarget.dataset.no+'&id='+e.currentTarget.dataset.id
        })
    },
    viewSales(e){
        var refund_no=e.currentTarget.dataset.no;
        var refund_status=e.currentTarget.dataset.status;
        var type=e.currentTarget.dataset.type;
        if(refund_no==null){
            return
        }
        else{
            wx.navigateTo({
                url: '/pages/afterSales/detail/detail?no='+refund_no
            })
        }
    },
    onReachBottom(e) {
        var status = this.data.activeIndex;
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if (this.data.tabList[status].more) {
            this.setData({
                [`${tabList}.show`]: true
            })
            if(status==0){[]
                this.operabale(0, page);
            }
            else{
                this.orderList(0,status,page);
            }

        } else {
            wx.showToast({
                title: '再拉也没有啦'
            });
        }
    },

    operabale(status=0,pages=1,type=[0,1,2]){
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/order/refund/list',
            header: {
                Authorization: token
            },
            data: {
                pages,
                type
            },

        }).then(res =>{
            res = res.data;
            var page = res.meta.pagination;
            var total_pages = page.total_pages;
            var tabList = `tabList[${status}]`;
            this.setData({
                [`dataList.${status}[${pages-1}]`]:res.data,
                [`${tabList}.init`]: true,
                [`${tabList}.page`]: pages,
                [`${tabList}.more`]: pages < total_pages
            })
            wx.hideLoading()
        }).catch(rej =>{
            wx.hideLoading()
        })
    },
    // 获取订单列表
    orderList(offline = 0, status =1, pages = 1, type = 0) {
        var token = cookieStorage.get('user_token');
        // var token = wx.getStorageSync('token');
            var state=this.data.tabList[status].name;
            var params = status ? { status  } : {  };
            params.page = pages;
            params.status = state;

        // params.offline = offline;



        sandBox.get({
            api: 'api/refund/list',
            header: {
                Authorization: token
            },
            data: params,
        }).then(res =>{
            res = res.data;
            var page = res.meta.pagination;
            var current_page = page.current_page;
            var total_pages = page.total_pages;
            var tabList = `tabList[${status}]`;
            this.setData({
                [`dataList.${status}[${pages-1}]`] : res.data,
                [`${tabList}.init`]: true,
                [`${tabList}.page`]: current_page,
                [`${tabList}.more`]: current_page < total_pages
            })

            wx.hideLoading()
        }).catch(rej =>{
            wx.hideLoading()
        })
    },
    // 确认收货
    receiveOrder(orderNo) {
        var token = this.data.token;

        sandBox.post({
            api: 'api/shopping/order/received',
            header: {
                Authorization: token
            },
            data: {
                order_no: orderNo
            },

        }).then(res =>{
            res = res.data;
            wx.showModal({
                title: '',
                content: res.message,
                showCancel: false,
                success: res => {
                    if (res.confirm) {
                        this.orderList(0,this.data.activeIndex);
                    }
                }
            })
        }).catch(rej =>{


            if (rej.statusCode == 404) {
                wx.showModal({
                    title: '',
                    content: '接口不存在',
                    showCancel: false
                })
            }else {
                wx.showModal({
                    title: '',
                    content: '取消订单失败, 请检查您的网络状态',
                    showCancel: false
                })
            }
        })
    },
    // 删除订单
    deleteOrder(orderNo) {
        var token = this.data.token;
        sandBox.post({
            api:'api/shopping/order/delete',
            header: {
                Authorization: token
            },
            data: {
                'order_no': orderNo
            },

        }).then(res =>{
            wx.showToast({
                title: res.data.message
            });
            this.orderList(0,this.data.activeIndex);
        }).catch(rej =>{
            wx.showModal({
                title: '',
                content: '删除订单失败, 请检查您的网络状态',
                showCancel: false
            })
        })
    }
})