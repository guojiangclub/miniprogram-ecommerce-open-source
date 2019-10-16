import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        show:false,
        rule:'京东方公安三季度非附近的双方各见风使舵公开',
        list:[],
        prices:[],
        current_page:1,
        total_pages:1
    },
    showRule(){
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
        let that =this
        var token = cookieStorage.get('user_token'); 
        var id = e.currentTarget.dataset.id;
        var goods_id = e.currentTarget.dataset.goods_id;
        var data={
            reduce_id:id
        }
        that.setData({
            id:id
        })
        sandBox.post({
            api:`api/reduce`,
            header: {
				Authorization: token
            },
            data:data
        }).then(res =>{
            if (res.statusCode == 200) {
                that.setData({
                    reduce_items_id: res.data.data.reduce_items_id 
                })
                that.listgetMessage();
            }else{}
        })
    },
    //获取详情页信息
    listgetMessage(){
        let that=this
        var token = cookieStorage.get('user_token'); 
        sandBox.get({
            api:`api/reduce/showItem?reduce_items_id=${this.data.reduce_items_id}`,
            header: {
				Authorization: token
			},
        }).then(res =>{
            if (res.statusCode == 200) {
                if(res.data.data.order !=null){
                    if(res.data.data.order.status==1){{
                        wx.navigateTo({
                            url:`/pages/order/detail/detail?no=${res.data.data.order.order_no}`
                        })
                    }}
                }
                if(res.data.data.order !=null){
                    if(res.data.data.order.status==1){
                        wx.navigateTo({
                            url:`/pages/order/detail/detail?no=${res.data.data.order.order_no}`
                        })
                    }else{
                        wx.navigateTo({
                            url:`/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}&id=${this.data.id}`
                        })
                    }
                }
                else{
                    wx.navigateTo({
                            url:`/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}&id=${this.data.id}`
                        })               
            } 
            }else{
                wx.showToast({
                    title:res.data.data.message,
                    icon:none,
                    duration: 2000,
                    
                })
            }
        })
    },
    onLoad: function(options) { 
        var token = cookieStorage.get('user_token');       
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
        this.setData({
            Height:windowHeight
        })
        this.getMessage();
    },
    onShow: function() {
        this.getRule()
    },
    onPullDownRefresh: function() {
        this.getMessage()
        
    },
    getRule(){
        sandBox.get({
            api:'api/reduce/help/text'
        }).then(res=>{
            if(res.statusCode == 200){
                this.setData({
                    rule:res.data.data.reduce_help_text
                })
            }
        })
    },
    getMessage(){
        let that =this
        sandBox.get({
            api:'api/reduce/list',
            data:{
                current_page:this.data.current_page 
            }
        }).then(res=>{
            if(res.statusCode == 200){
                if(this.data.total_pages<this.data.current_page){
                    wx.showToast({
                        title: '再拉没有了',
                        icon: 'none',
                        duration:2000
                    })
                }else{
                    res.data.data.forEach(item=>{
                        this.data.list.push(item)
                    })
                }
            }
            this.data.current_page=res.data.meta.pagination.current_page
            this.data.current_page++
            that.setData({
                list:this.data.list,
                current_page:this.data.current_page,
                total_pages:res.data.meta.pagination.total_pages
            })
        })
    },
    onReachBottom(){
        this.getMessage()
    }
})