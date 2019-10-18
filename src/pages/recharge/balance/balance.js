import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
   data:{
       activeIndex: 0,
       tabList:[
           {
               id:0,
               name:"收入",
               init:false,
               page:0,
               more:true,
               show:false
           },
           {
               id:1,
               name:"支出",
               init:false,
               page:0,
               more:true,
               show:false
           }
       ],
       token:"",
       dataList:{
           0:[],
           1:[]
       },
       num:"",
       showText:'正在加载下一页数据',
       config: ''
   },
   onLoad(e){

        // 第三方平台配置颜色
       var bgConfig = cookieStorage.get('globalConfig') || '';
       this.setData({
           config: bgConfig
       })
       // var status=0,page=1;
       // this.queryBalanceList(token);
       var status=e.type?e.type:0;
       var page=this.data.tabList[status].page;
       pageLogin(getUrl(),(token)=>{
           this.setData({
               'token':token
           });
           this.queryBalanceList(token,status,page);
           this.queryUserSum(token);
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
    jump() {
	    wx.navigateTo({
	        url: '/pages/recharge/index/index'
        })
    },
   tabClick(e){
       // console.log(e.currentTarget.id);
       var status =e.currentTarget.id;
       this.setData({
           activeIndex:status
       });
       if(!this.data.tabList[status].init){
           var page=this.data.tabList[status].page;
           wx.showLoading({
               title: "加载中",
               mask: true
           });
           this.queryBalanceList(this.data.token,status,page);
       }
   },
    onReachBottom(e){
       // console.log(e);
        var status =this.data.activeIndex;
        var page = this.data.tabList[status].page + 1;
        var tabList = `tabList[${status}]`;
        if(this.data.tabList[status].more){
            this.setData({
                [`${tabList}.show`]: true
            });
            var token=this.data.token;
            this.queryBalanceList(token,status,page);
        }else{
            wx.showToast({
                image: '../../../assets/image/error.png',
                title: '再拉也没有啦'
            });
        }
    },
    result(res,status){
       if(res.status){
           var list;
           var page = res.meta.pagination;
           var current_page = page.current_page;
           var total_pages = page.total_pages;
           var tabList =`tabList[${status}]`;
           list =res.data;
           this.setData({
               [`dataList.${status}[${current_page-1}]`]:list,
               [`${tabList}.init`]: true,
               [`${tabList}.page`]: current_page,
               [`${tabList}.more`]: current_page < total_pages,
               [`${tabList}.show`]: false
           })

       }
    },
    queryBalanceList(token,status,page){
        var type = status ? 'consume' : 'recharge';
        var params = type ? { type } : {};
        params.page =page;
        sandBox.get({
            api:'api/users/balance/list',
            header:{
                Authorization:token
            },
            data:params
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                this.result(res,status);
            }
            else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
            wx.hideLoading()
        }).catch(rej=>{
            wx.showToast({
                title: "请求失败",
                image: '../../../assets/image/error.png'
            })
            wx.hideLoading()
        })
    },
    queryUserSum(token){
        sandBox.get({
            api:"api/users/balance/sum",
            header:{
                Authorization:token
            }
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                this.setData({
                    "num":res.data.sum
                })
            }else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
        })
    }
})