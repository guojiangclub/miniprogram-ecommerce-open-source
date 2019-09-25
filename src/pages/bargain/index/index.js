import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        show:false,
        rule:'京东方公安三季度非附近的双方各见风使舵公开',
        list:[],
        prices:[],
        current_page:1,


    },
    showRule(){
        console.log("显示活动规则")
        this.setData({
            show:true
        })
    },
    closeRule(){
        this.setData({
            show:false
        })
    },
    //发起砍价
    bargain(e){
        var token = cookieStorage.get('user_token'); 
        var id = e.currentTarget.dataset.id;
        var goods_id = e.currentTarget.dataset.goods_id;
        console.log(id,goods_id)
        sandBox.post({
            api:`api/reduce?reduce_id=${id}`,
            header: {
				Authorization: token
			},
        }).then(res =>{
            console.log("res发起",res.data.data.reduce_items_id)
            if (res.statusCode == 200) {
                wx.navigateTo({
                    url:`/pages/bargain/details/details?reduce_items_id=${res.data.data.reduce_items_id}`
                })
            }else{}
        })
    },
    onLoad: function(options) { 
        var token = cookieStorage.get('user_token');       
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
        console.log("windowHeight",windowHeight)
        this.setData({
            Height:windowHeight
        })
        this.getMessage();
    },
    onShow: function() {
        
    },
    onPullDownRefresh: function() {
        console.log("刷新下数据")
        
    },
    getMessage(){
        let older_prices=[]
        sandBox.get({
            api:'api/reduce/list',
            data:{
                current_page:this.data.current_page 
            }
        }).then(res=>{
            if(res.statusCode == 200){
                console.log("res.data",res.data)
                this.setData({
                    list:res.data.data,
                    current_page:this.data.current_page++
                })
                console.log("this.data.list",this.data.list)
                this.data.list.forEach(item => {
                    item.older=parseInt(item.reduce_total) + parseInt(item.price)
                    item.older_price=item.older.toFixed(2)
                    older_prices.push(item.older_price)
                    this.setData({
                        prices:older_prices
                    })
                    console.log("item.older_price",item.older_price)
                });
                console.log("this.data.list",this.data.list)
            }
        })
    },
    onReachBottom(){
        this.getMessage()
    }
})