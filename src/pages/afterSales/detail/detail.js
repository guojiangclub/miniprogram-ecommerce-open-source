/**
 * Created by admin on 2017/8/31.
 */
import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
    data:{
        showReason:false,
        detail:"",
        cancelReason:"",
        statusList:[
            '待审核',
            '审核通过',
            '拒绝申请',
            '已完成',
            '已关闭',
            '等待买家退货',
            '买家已退货',
            '等待商城发货',
            "等待商城退款"
        ],
        showStatus:[
            '申请审核中',
            '申请已通过',
            '拒绝申请',
            '已完成',
            '售后已关闭',
            '等待用户退货',
            '用户已退货',
            '等待商城发货',
            "等待商城退款"
        ]
    },
    onLoad(e){
        var id=e.no;
        pageLogin(getUrl(),()=>{
            this.queryAfterSalesDetail(id)
        });
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
    viewExpress(e){
        var refund_no=e.currentTarget.dataset.refundNo;
        wx.navigateTo({
            url: '/pages/afterSales/retreat/retreat?no='+refund_no
        })
    },

    // 查询售后订单详情
    queryAfterSalesDetail(id){
        sandBox.get({
            api:"api/refund/show/"+id,
            header:{
                Authorization:cookieStorage.get('user_token')
            },

        }).then(res =>{
            var tips=res.data.data.tips;
            tips=tips.replace(/\<br\>/g,"\n");
            res.data.data.tips=tips;
            if(res.data.status){
                this.setData({
                    detail:res.data
                });
            }
        })
    },
    close(){
        this.setData({
            showReason:true
        });
        // wx.showModal({
        //     title:"是否取消",
        //     content:"<input type='text'/>",
        // });
    },
    jumpMeal(e){

    },
    cancel(){
        this.setData({
            showReason:false
        })
    },
    changeReason(e){
        this.setData({
            cancelReason: e.detail.value
        })
    },
    confirm(){
         if(!this.data.cancelReason){
             return
         }
         var reason =this.data.cancelReason;
         var refund_no=this.data.detail.data.refund_no;
        this.setData({
            showReason:false,
            cancelReason:""
        });
         // 退款
        sandBox.post({
            api:"api/refund/user/close",
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data:{
                refund_no:refund_no,
                remark:reason
            },
        }).then(res =>{
            if(res.data.status){
                wx.showToast({
                    title:"取消成功",
                    duration: 1500,
                    success:()=>{
                        setTimeout(()=>{
                            wx.redirectTo({
                                url: '/pages/afterSales/index/index'
                            })
                        },1500);
                    }
                })
            }
            else{
                wx.showToast({
                    title:"取消失败",
                    duration: 1000
                })
            }
        })
    },
    onReady(){
    }
})