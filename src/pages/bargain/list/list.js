import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        list:[],
        Height:'',
        total_pages:1,
        current_page:1,
        reduce_items_id:'',
        limit:10

    },
    onLoad: function() {
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
        console.log("windowHeight",windowHeight)
        this.setData({
            Height:windowHeight
        })
        this.getList();
    },
    getList(){
        var token = cookieStorage.get('user_token'); 
        let that =this
        sandBox.get({
            api:`api/reduce/list/me?limit=${that.data.limit} `,
            header: {
				Authorization: token
            },
            // data:{
            //     current_page:this.data.current_page
            // }
        }).then(res=>{
            console.log(res.data.data,"reslist")
            if(res.statusCode == 200){
                    // res.data.data.forEach(item=>{
                    //     this.data.list.push(item)
                    // })
                that.setData({
                    list:res.data.data,
                    length:res.data.data.length,
                    total_pages:res.data.meta.total_pages,
                    current_page:res.data.meta.pagination.current_page
                })
                console.log("list",this.data.list)
            }
        })
    },
    toDetail(e){
        console.log('e',e)
        this.setData({
            reduce_items_id:e.currentTarget.dataset.reduceId
        })
        console.log('this.data.reduce_items_id',this.data.reduce_items_id)
        wx.navigateTo({
            url: `/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}`
        })
    },
    onPullDownRefresh: function() {
        
    },
    onReachBottom(){
        if(this.data.length<this.data.limit){
            var the_limit=this.data.limit+10
            this.setData({
                limit:the_limit
            })
            console.log('the_limit',the_limit)
            this.getList()
        }else{
            wx.showToast({
                title: '再拉也没有了',
                icon: 'none',
                duration:2000
            })
        }
    }
})