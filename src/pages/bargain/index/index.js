import {
  config,
  is,
  pageLogin,
  getUrl,
  sandBox,
  cookieStorage
} from "../../../lib/myapp.js";
Page({
  data: {
    show: false,
    rule: "",
    list: [],
    prices: [],
    current_page: 0,
    total_pages: 1
  },
  showRule() {
    this.setData({
      show: true
    });
  },
  closeRule() {
    this.setData({
      show: false
    });
  },
  //发起砍价
  bargain(e) {
    let that = this;
    var token = cookieStorage.get("user_token");
    var id = e.currentTarget.dataset.id;
    var goods_id = e.currentTarget.dataset.goods_id;
    var data = {
      reduce_id: id
    };
    that.setData({
      id: id
    });
    if (token) {
      sandBox
        .post({
          api: `api/reduce`,
          header: {
            Authorization: token
          },
          data: data
        })
        .then(res => {
          if (res.statusCode == 200) {
            res = res.data;
            if (res.status) {
              that.setData({
                reduce_items_id: res.data.reduce_items_id
              });
              that.listgetMessage();
            }
          } else {
          }
        });
    } else {
      let url = "/pages/bargain/index/index";
      wx.showModal({
        content: "请重新登录",
        duration: 1500,
        showCancel: false,
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/user/register/register?url=${url}`
            });
            return;
          }
        },
        cancel: () => {
          wx.navigateTo({
            url: `/pages/user/register/register?url=${url}`
          });
          return;
        }
      });
    }
  },
  //获取详情页信息
  listgetMessage() {
    let that = this;
    var token = cookieStorage.get("user_token");
    sandBox
      .get({
        api: `api/reduce/showItem?reduce_items_id=${this.data.reduce_items_id}`,
        header: {
          Authorization: token
        }
      })
      .then(res => {
        if (res.statusCode == 200) {
          res = res.data;
          if (res.status) {
            if (res.data.order != null) {
              if (res.data.data.order.status == 1) {
                {
                  wx.navigateTo({
                    url: `/pages/order/detail/detail?no=${res.data.order.order_no}`
                  });
                }
              }
            }
            if (res.data.order != null) {
              if (res.data.order.status == 1) {
                wx.navigateTo({
                  url: `/pages/order/detail/detail?no=${res.data.order.order_no}`
                });
              } else {
                wx.navigateTo({
                  url: `/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}&id=${this.data.id}`
                });
              }
            } else {
              wx.navigateTo({
                url: `/pages/bargain/details/details?reduce_items_id=${this.data.reduce_items_id}&id=${this.data.id}`
              });
            }
          }
        } else {
          wx.showToast({
            title: res.data.data.message,
            icon: none,
            duration: 2000
          });
        }
      });
  },
  onLoad: function(options) {
    var token = cookieStorage.get("user_token");
    var windowHeight = wx.getSystemInfoSync().windowHeight; //获取设备的高度
    this.setData({
      Height: windowHeight
    });
    this.getMessage();
  },
  onShow: function() {
    this.getRule();
  },
  onPullDownRefresh: function() {
    this.getMessage();
  },
  getRule() {
    sandBox
      .get({
        api: "api/reduce/help/text"
      })
      .then(res => {
        if (res.statusCode == 200) {
          res = res.data;
          if (res.status) {
            this.setData({
              rule: res.data.reduce_help_text
            });
          }
        }
      });
  },
  getMessage() {
    let that = this;
    sandBox
      .get({
        api: "api/reduce/list",
        data: {
          current_page: this.data.current_page
        }
      })
      .then(res => {
        if (res.statusCode == 200) {
          res = res.data;
          if (res.status) {
            if (this.data.current_page < this.data.total_pages) {
                this.data.current_page = res.meta.pagination.current_page;
                that.setData({
                  [`list[${this.data.current_page - 1}]`]: res.data,
                  current_page: this.data.current_page,
                  total_pages: res.meta.pagination.total_pages
                });
                this.data.current_page++;
            } else {
                wx.showToast({
                    title: "再拉也没有了",
                    icon: "none",
                    duration: 2000
                  });
            }
          }
        }
      });
  },
  onReachBottom() {
    if (this.data.current_page < this.data.total_pages) {
      this.getMessage();
    } else {
      wx.showToast({
        title: "再拉也没有了",
        icon: "none",
        duration: 2000
      });
    }
  }
});
