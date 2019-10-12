Component({
    //组件的对外属性，是属性名到属性设置的映射表
    properties:{
        showType:{
            type:String,
            value:''

        },
        cubeData:{
            type:Array,
            value:''
        },
        cubeTitle:{
            type:String,
            value:''
        }

    },
    //组件的内部数据，和properties 一同用于组件的模板渲染
    data:{
        mode:''
    },
    //组件数据字段监听器，用于监听properties 和 data的变化
    observers:{


    },
    //组件的方法
    methods:{

    //    图片跳链接
        _jumpLink(e){
                var src = e.currentTarget.dataset.src;
                if (!src || src == 'uto_miniprogram') return

                wx.navigateTo({
                    url: src
                })

        }


    },
    ready(){
        var type = this.data.showType;
        var mode = '';
        mode = type.split('_')[0];
        this.setData({
            mode:mode
        })
    }

})