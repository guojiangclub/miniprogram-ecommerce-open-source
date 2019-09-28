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
                    url:`/pages/bargain/details/details?reduce_items_id=${res.data.data.reduce_items_id}&id=${id}`
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
        this.getRule()
    },
    onPullDownRefresh: function() {
        console.log("刷新下数据")
        
    },
    getRule(){
        sandBox.get({
            api:'api/reduce/help/text'
        }).then(res=>{
            if(res.statusCode == 200){
                console.log("规则",res.data.data.reduce_help_text)
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
                console.log("res.data.meta.pagination.current_page",res.data.meta.pagination.current_page)
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
            console.log("current_page",this.data.current_page)
            console.log("total_pages",this.data.total_pages)
            console.log("list",this.data.list)
        })
    },
    onReachBottom(){
        this.getMessage()
    }
})