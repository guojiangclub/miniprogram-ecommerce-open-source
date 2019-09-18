/**
 * Created by lcfevr on 2018/5/23.
 */
import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        classData: '',
        screenWidth: '',
        activeIndex:0,
        init:false
    },
    onLoad(){
        this.classificationList();
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
    },
    //切换menu
    change(e){
        var activeIndex = e.currentTarget.dataset.index;
        this.setData({
            activeIndex:activeIndex
        })
    },
    jumpItem(e){
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url:url
        })
    },
    imgLoad(e){
        var height = e.detail.height
        var width = e.detail.width;
        var ratio = width / height;
        var screenWidth = this.data.screenWidth;
        this.setData({
            imgHeight: screenWidth / ratio
        })
    },
    classificationList() {
        wx.showLoading({
            title:'加载中',
            mask:true
        })
        sandBox.get({
            api:'api/category'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data
                if (res.status) {
                    console.log(res.data);
                    this.setData({
                        init:true,
                        classData: res.data
                    })
                } else {
                    wx.showModal({
                        content: '请求失败',
                        showCancel:false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel:false
                })
            }
            wx.hideLoading();
        },err=>{
            wx.showModal({
                content: '请求失败',
                showCancel:false
            })
            wx.hideLoading();
        })
    }
})