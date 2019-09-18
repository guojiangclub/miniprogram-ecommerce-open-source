Page({
    data: {
        show:false,
        rule:'京东方公安三季度非公开'
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
    bargain(){
        console.log("..")
        wx.navigateTo({
            url:'/pages/bargain/details/details'
        })
    },
    onLoad: function(options) {        
        
    },
    onShow: function() {
        
    },
    onPullDownRefresh: function() {
    
        
    }
})