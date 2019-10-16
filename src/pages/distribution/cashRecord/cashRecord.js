import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        dataList:[],
        meta:'',
        page:1,
        init:false,
        statusList:[
            "待审核",
            "待打款",
            "已打款",
            "提现申请已拒绝"
        ],
        show:false

    },
    onLoad(e){
        this.getRecordList(1);
    },
    onReachBottom() {
        var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
        if (hasMore) {
            this.setData({
                show: true
            })
            var page = this.data.meta.pagination.current_page + 1;
            this.getRecordList(page);
        } else {
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    //获取数据提现记录列表
    getRecordList(page=1){
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api:'api/distribution/cash/list',
            header: {
                Authorization: token
            },
            data:{
                page:page
            }
        }).then(res=>{
            if (res.statusCode==200){
                res = res.data;
                if (res.status){
                    this.setData({
                        [`dataList.${page - 1}`] : res.data,
                        meta:res.meta,
                        init:true
                    })
                }

            }else{
                wx.showModal({
                    title:'请求失败，请稍后重试',
                    showCancel: false
                })
            }
        })
    }
})