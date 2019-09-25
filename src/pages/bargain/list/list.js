import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        list:[],
        Height:'',
        total_pages:1,
        current_page:1

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
            api:`api/reduce/list/me?current_page=${this.data.current_page} `,
            header: {
				Authorization: token
            },
            // data:{
            //     current_page:this.data.current_page
            // }
        }).then(res=>{
            console.log(res.data.data,"reslist")
            if(res.statusCode == 200){
                    res.data.data.forEach(item=>{
                        this.data.list.push(item)
                    })
                that.setData({
                    list:this.data.list,
                    total_pages:res.data.meta.total_pages,
                    current_page:res.data.meta.current_page++
                })
                console.log("list",this.data.list)
            }
        })
    },
    onPullDownRefresh: function() {
        
    },
    onReachBottom(){
        this.getList()
    }
})