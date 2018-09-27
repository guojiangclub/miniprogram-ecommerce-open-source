/**
 * Created by admin on 2017/8/30.
 */
import {config,is,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
    data:{
       list:[
           '男',
           '女',
       ],
        selectedIndex:"",
        detail:"",
        birthdaydate:'',
        mobileNum:"",
        emailSet:""
    },
    onLoad(){
        Date.prototype.format = function(fmt) {
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        };
        var time = new Date().format("yyyy-MM-dd");
        this.setData({
            end: time
        });

        this.gitUserInfo();
    },
    change:function(e){
        this.setData({
            selectedIndex:e.detail.value
        })
    },
    changeName(e){
        this.setData({
            'detail.nick_name':e.detail.value
        })
    },
    changeDate(e){
        this.setData({
            birthdaydate:e.detail.value
        })
    },
    changeMobile(){
       wx.navigateTo({
           url:'/pages/user/bindingphone/bindingphone'
       })
    },
    changeEmail(e){
        this.setData({
            emailSet:e.detail.value
        })
    },
    gitUserInfo(){
        sandBox.get({
            api:  'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                var sex=res.data.data.sex;
                var index=this.data.list.findIndex((val)=>{ return val==sex});
                if(index==-1) index="";
                this.setData({
                    detail:res.data.data,
                    selectedIndex:index,
                    birthdaydate:res.data.data.birthday,
                    mobileNum:res.data.data.mobile,
                    emailSet:res.data.data.email

                })
            }
        })

    },
    changeImage:function(){
        wx.chooseImage({
            count:1,
            success: res => {
                var tempFilePaths = res.tempFilePaths;
                var token=cookieStorage.get('user_token');
                 wx.uploadFile({
                    header: {
                        'content-type':'multipart/form-data',
                        Authorization:token
                    },
                    url: `${config.GLOBAL.baseUrl}api/users/upload/avatar`, //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'avatar_file',
                    success: (res)=>{
                        console.log(res);
                        var result = JSON.parse(res.data);
                        console.log(result);
                        this.setData({
                            'detail.avatar':result.data.url
                        });
                    }
                });
            }
        })
    },
    updateUserInfo(){
        var message=null;
        if(!this.data.detail.nick_name){
            message="请填写用户昵称";
        } else if (this.data.emailSet !="" && !is.email(this.data.emailSet)) {
            message="请填写正确的邮箱";
        }
        if(message){
            wx.showModal({
              content: message,
                showCancel: false
            });
            return
        }
         sandBox.post({
             api: 'api/users/update/info',
             header:{
                 Authorization:cookieStorage.get('user_token')
             },

             data:{
                 nick_name:this.data.detail.nick_name,
                 sex:this.data.list[this.data.selectedIndex],
                 avatar:this.data.detail.avatar,
                 birthday:this.data.birthdaydate,
                 email:this.data.emailSet
             },
         }).then(res =>{
             console.log(res);
             if(res.statusCode==200){
                 wx.showToast({
                     title:'修改成功',
                     duration: 1500,
                     success:()=>{
                         setTimeout(()=>{
                             wx.switchTab({
                                 url: '/pages/user/user/user'
                             })
                         },1500);
                     }
                 })
             }
             else{
                 wx.showModal({
                     content:"修改失败",
                     showCancel: false
                 });
             }
         })
    }
})