var t = getApp();

Component({
    properties: {
        opts: {
            type: Object,
            value: {},
            observer: function(t, a) {
                Object.keys(a).length && Object.keys(t).length && this.initOpts();
            }
        },
        url:{
            type:String,
            value:''
        }
    },
    data: {
        title: "WeChat",
        color: "#000000",
        bgColor: "#FFFFFF",
        opacity: 1,
        shadow: !0,
        publish: !1,
        headerBtns: !0,
        backable: !0,
        bganimateable: !1,
        bgImg: "rgba(0,0,0,0)",
        backBgColor: "",
       // p2r: t.globalData.p2r
    },
    methods: {
        initOpts: function() {
            Object.keys(this.data.opts).length && (getCurrentPages().length > 1 ? this.data.opts.backable = !0 : this.data.opts.backable = !1,
                this.setData(this.data.opts));
        },
        toHome: function(t) {
            this.data.publish ? this.triggerEvent("backConfirm", t.currentTarget.dataset) : wx.switchTab({
                    url: "/pages/index/index/index"
                });
        },
        back: function(t) {
            this.data.publish ? this.triggerEvent("backConfirm", t.currentTarget.dataset) : wx.navigateBack();
        }
    },
    created: function() {},
    attached: function() {
        this.setData(wx.getSystemInfoSync()), this.initOpts();
    },
    ready: function() {},
    moved: function(t) {},
    detached: function(t) {}
});