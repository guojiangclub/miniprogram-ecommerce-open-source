import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';
import { compose } from 'redux';
Page({
    data: {
        userInfo:{},
        left:0,
        show:false,//控制活动规则的显示
        rule:'的叫法是看到了福建省的<br/><br/>打梵蒂冈飞机速度快放假',//活动规则
        number:17,
        is_leader:1,//1为自己，0为好友
        message:'',
        showShare:false,//显示分享
        showNotice:false,//控制砍价后弹框显示
        theReduce:10,//
        step:1,//控制好友按钮显示,1为还未助力；2为助力成功；3为助力失败
        showTell:false,//控制活动结束，好友新开零元拿显示的弹层
        success:true,//模拟好友点击砍价接口是否成功
        buy:true,//系统是否设置了可提前购买
        over:false,//砍价是否完成
        overTime:false,//用户时间是否超时
        overActivity:false,//活动是否结束
        ends_at:'',//结束时间
        starts_at:'',//开始时间
        setColor:'fb5054',//进度条的颜色
        page:1,//页
        heroList:[]//砍价英雄榜的数据
    },
    onLoad(e) {
        let that =this
        this.getServer()
        console.log("e.reduce_items_id",e.reduce_items_id)
        if(e.reduce_items_id){
            this.setData({
                reduce_items_id:e.reduce_items_id
            })
        that.getMessage()

        }
        console.log("e",e)
        if(this.data.overTime==true || this.data.overActivity==true){
            that.setData({
                setColor:'AAAAAA'
            })
        }    
        var windowHeight = wx.getSystemInfoSync().windowHeight//获取设备的高度
        console.log("windowHeight",windowHeight)
        this.setData({
            Height:windowHeight
        })
        //this.getUserInfo();  
        this.showWitch();
    },
    //获取详情页信息
    getMessage(){
        let that=this
        var token = cookieStorage.get('user_token'); 
        sandBox.get({
            api:`api/reduce/showItem?reduce_items_id=${this.data.reduce_items_id}`,
            header: {
				Authorization: token
			},
        }).then(res =>{
            if (res.statusCode == 200) {
                console.log("is_leader",res.data.data.user_is_leader)
                if(res.data.data.status_text !=="进行中" && res.data.data.reduce.status_text=="进行中" && res.data.data.time_price !=="0.00"){
                    this.setData({
                        overTime:true,
                        overActivity:false,
                        setColor:'AAAAAA'
                    })
                }else if(res.data.data.reduce.status_text !=="进行中"){
                    this.setData({
                        overActivity:true,
                        setColor:'AAAAAA'
                    })
                 }if(res.data.data.time_price=="0.00"){
                     this.setData({
                        over:true
                     })
                 }
                that.setData({
                    detailsMessage:res.data.data,
                   is_leader:res.data.data.user_is_leader
                   //is_leader:0
                })
                console.log("this.data.is_leader",this.data.is_leader)
                that.showWitch()
                console.log("detailsMessage",this.data.detailsMessage)
               if(this.data.detailsMessage.progress_par>0.17 && this.data.detailsMessage.progress_par<0.83){
                let percent=parseInt(this.data.detailsMessage.progress_par*100)-17
                that.setData({
                    left:percent
                })
               }else if(this.data.detailsMessage.progress_par==0.83 ||this.data.detailsMessage.progress_par>0.83){
                    that.setData({
                        left:67
                    })
               }else{
                   that.setData({
                       left:0
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
        //this.showWitch()
    },
    bargainAgin(){
        wx.navigateTo({
            url: '/pages/bargain/index/index'
        })
    },
    showWitch(){
        if(this.data.is_leader==1){
            this.setData({
                message:'邀请好友砍价'
            })
        }else if(this.data.is_leader==0 && this.data.step==1){
            this.setData({
                message:'帮TA砍价'
            })
        }else if(this.data.is_leader==0 && this.data.step==2){
            this.setData({
                message:'我也要去砍价'
            })
        } 
    },
    //获取当前时间
    
    getServer () {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
	var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
	var server = date.getFullYear() + seperator1  + month  + seperator1  + strDate
			+ " "  + date.getHours()  + seperator2  + date.getMinutes()
			+ seperator2 + date.getSeconds();
    console.log(server,"server")
    this.setData({
        server:server
    })
},
    closeTell(){
        this.setData({
            showTell:false
        })
    },
    showTell(){
        this.setData({
            showTell:true
        })
    },
    closeShare(){
        this.setData({
            showShare:false
        })
    },
     // 生成海报
     createShareImg(){
        wx.showLoading({
            title: "生成中",
            mask: true
        })
       var token = cookieStorage.get('user_token') || '';
       sandBox.get({
           api :`api/reduce/share?reduce_items_id=${this.data.reduce_items_id}`,
           header:{
               Authorization: token
           },
           data:{
               goods_id: this.data.showItemDate.multi_groupon_goods_id,
           }
       }).then(res => {
           if(res.statusCode == 200){
               res = res.data;
               console.log('res',res)
               if(res.status){
                   this.setData({
                       createImgUrl : res.data.image
                   });
                   this.getShearImg();
               } else {
                   wx.showModal({
                       content: res.message || '请求失败',
                       showCancel: false
                   })
               }
           } else{
               wx.showModal({
                   content: '请求失败',
                   showCancel: false
               });
           }
           wx.hideLoading();
           this.changeShare();
       }).catch(rej =>{
           wx.showModal({
               content: '内部错误',
               showCancel: false
           })
           wx.hideLoading();
           this.changeShare();
       })
    },
    closeAlert(){
        this.setData({
            is_refused:false
        })
    },
    helpShare(){
        this.setData({
            showShare:true
        })
    },
    showNotice(){
        this.setData({
            showNotice:true
        })
    },
    closeNotice(){
        this.setData({
            showNotice:false
        })
    },
    //好友也要零元拿
    joinBargain(){
        if(this.data.overActivity==true){
            this.setData({
                showTell:true
            })
        }else{
            wx.navigateTo({
                url:'/pages/bargain/index/index'
            })
        }
    },
    goStore(){
        wx.switchTab({
            url: '/pages/index/index/index'
          })
    },

    //帮好友砍价
    bargain(){
        console.log("kanjia ")
        let that =this
        var token = cookieStorage.get('user_token'); 
        if(this.data.is_leader==0){
            if(this.data.success){
                console.log("这里请求砍价的接口,并且计算进度条")
                sandBox.post({
                    api:`api/reduce/help?reduce_items_id=${this.data.reduce_items_id}`,
                    header: {
                            Authorization: token
                        },
                }).then(res=>{
                    if (res.statusCode == 200){
                        console.log("this.data.detailsMessage.reduce_items_id",this.data.detailsMessage.reduce_items_id)
                        console.log("res",res.data.data.reduce_amount)
                        that.setData({
                            reduce_amount:res.data.data.reduce_amount
                        })
                        if(res.data.code==400){
                            wx.showToast({
                                title:res.data.message,
                                icon: 'none',
                                duration: 2000
                              })
                              setTimeout(function(){
                            that.setData({
                                step:2
                              })
                              that.showWitch();  
                          },2000)
                        }else{
                            that.setData({
                                showNotice:true,
                                step:2
                            })
                        }
                        that.showWitch();
                    }else{
                        wx.showToast({
                            title: '您暂时不能帮好友砍价',
                            icon: 'none',
                            duration: 2000
                          })
                          setTimeout(function(){
                            that.setData({
                                step:2
                              })
                              that.showWitch();  
                          },2000)
                    }
                })
            }
        }
        that.showWitch();
        that.getMessage()
    },
    onShareAppMessage: function (res) {
        let that =this
        if (res.from === 'button') {
          // 来自页面内转发按钮
          console.log(res.target)
        }
        return {
          title: '砍价帮帮忙',
          path: `/pages/bargain/details/details?id=${this.data.id}`
        }
      },
    showRule(){
        console.log("show")
        this.setData({
            show:true
        })
    },
    closeRule(){
        this.setData({
            show:false
        })
    },
    //获取商品信息
     // 获取用户信息
     getUserInfo() {
         let _this =this
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                _this.setData({
                    userInfo:res.data.data,
                }, () => {
                    if (res.data.data.agent_code) {
                        wx.updateShareMenu();
                    }
                })
            }
        })
    },
    onShow: function() {
        this.getRule()       
    },
    //活动规则
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
    onPullDownRefresh: function() {
       console.log("刷新下数据")
        
    },
//触底加载
  onReachBottom: function () { 
      console.log("触底加载")     
    let that = this;
    wx.showLoading({
        title: '玩命加载中',
        duration: 1000,
      })
      that.setData({
        page : this.data.page + 1
      })
      sandBox.get({
        api: '',
        header: {
            Authorization: token
        },
        data:{

        }
      }).then(res=>{
            if(res.statusCode == 200){

            }else{

            }
      })
    wx.hideLoading()
  }
})