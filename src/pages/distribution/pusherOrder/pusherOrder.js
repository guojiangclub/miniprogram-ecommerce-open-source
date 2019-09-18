import {config,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data: {
        order: {},
        detail:{},
        typeList: {
            0: '临时订单',
            1: '待付款',
            2: '付款成功',
            3: '已发货',
            4: '已完成',
            5: '已完成',
            6: '已取消',
            7: '已退款',
            8: '已作废',
            9: '已删除',
            31: '部分已发货'
        },
        refundStatus:[
            '待审核',
            '审核通过',
            '拒绝申请',
            '已完成',
            '已关闭',
            '等待买家退货',
            '买家已退货',
            '等待商城发货'
        ],
        muStatus: [
            '待成团',
            '已成团',
            '拼团失败'
        ],
        norder_no: '',
        config: ''
    },
    onShow(){
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        this.queryOrderDetail(this.data.norder_no);
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        this.setData({
            norder_no: e.order_no
        })
    },
    jump() {
        wx.navigateTo({
            url: '/pages/store/collage/collage?multi_groupon_item_id=' + this.data.order.multi_groupon_users[0].multi_groupon_items_id
        })
    },
    jumpDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/store/detail/detail?id=' + id
        })
    },
    // 获取订单详情
    queryOrderDetail(orderNo) {
        var token =cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/distribution/order/detail/' + orderNo,
            header: {
                Authorization: token
            },
        }).then(res =>{
            if (res.statusCode = 200) {
                res = res.data;
                this.setData({
                    detail: res.data,
                    order:res.data.order
                })
            } else {
                wx.showModal({
                    title: '',
                    content: '请求失败，请稍后重试'
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