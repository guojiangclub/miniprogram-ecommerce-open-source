Component({
    //组件的对外属性，是属性名到属性设置的映射表
    properties:{
        config:{
            type:Object,
            value:''
        },
        indexCoupon:{
            type:Array,
            value:''
        }
    },
    //组件的内部数据，和properties 一同用于组件的模板渲染
    data:{

    },
    //组件数据字段监听器，用于监听properties 和 data的变化
    observers:{

    },
    //组件的方法
    methods:{
        //分发事件出去
        getCoupon(e){
            var code = e.currentTarget.dataset.code;
            var index = e.currentTarget.dataset.index;
            var myEventDetail = {
                code:code,
                index:index
            }
            this.triggerEvent('myGetCoupon',myEventDetail)
        },
        _jumpList(e) {
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/pages/coupon/goods/goods?id=' + id
            })

        },

    }
})