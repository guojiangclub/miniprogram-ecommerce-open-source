import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
    data:{
        twitterList:[],//推客列表
        page:1,
        more:true,
        init:false
    },
    onLoad(){
        this.queryTwitterList(1);

    },
    onReachBottom(){
      if(this.data.more){
          var page = this.data.page + 1;
          this.queryTwitterList(page);
      } else {
          wx.showToast({
              image: '../../../assets/image/error.png',
              title: '再拉也没有啦'
          });
      }
    },
    //请求推客列表
    queryTwitterList(page) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });

        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/distribution/twitter/list',
            header: {
                Authorization: token
            },
            data:{
                page:page
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    var pages = res.meta.pagination;
                    var current_page = pages.current_page;
                    var total_pages = pages.total_pages;
                    this.setData({
                        [`twitterList[${page - 1}]`] : res.data,
                        more:current_page < total_pages,
                        page:current_page,
                        init:true
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading()
            wx.showModal({
                content: res.message || '请求失败',
                showCancel: false
            })
        })

    }
})