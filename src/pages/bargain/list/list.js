import {config,is,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        list:[],
        Height:'',
        total_pages:'',
        current_page:1,
        reduce_items_id:'',
        limit:10

    },
    onLoad: function() {
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
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
            if(res.statusCode == 200){
                res=res.data
                if(res.status){
                var new_data=[]
                res.data.forEach(v=>{
                    if(!this.data.list.length){
                        new_data.push(v)
                    }else{
                        this.data.list.forEach(e => {
                            if(v.id!=e.id){
                                new_data.push(v)
                            }
                        });
                    }
                    })
                    console.log('new_data',new_data)
                    that.setData({
                        current_page:res.meta.pagination.current_page,
                        [`list[${res.meta.pagination.current_page-1}]`]:new_data,
                        length:res.data.length,
                        total_pages:res.meta.pagination.total_pages,
                    })
                }else{
                    wx.showToast({
                        title:'获取砍价列表失败',
                        icon: 'none',
                        duration:2000
                    })
                }
            }
        })
    },
    toDetail(e){
        this.setData({
            reduce_items_id:e.currentTarget.dataset.reduceId
        })
        wx.navigateTo({
            url: `/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}`
        })
    },
    onPullDownRefresh: function() {
        
    },
    onReachBottom(){
        if(this.data.current_page<this.data.total_pages){
            var the_limit=this.data.limit+10
            this.setData({
                limit:the_limit
            })
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