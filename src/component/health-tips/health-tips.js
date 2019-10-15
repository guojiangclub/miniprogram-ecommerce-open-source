Component({
    //组件的对外属性，是属性名到属性设置的映射表
    properties:{
        data: {
            type: Array,
            value: ''
        },
        title: {
            type: String,
            value: ''
        },
        show:{
          type:Number,
          value:''
        },
        meta:{
            type:Object,
            value:""
        }



    },
    //组件的内部数据，和properties 一同用于组件的模板渲染
    data:{
        tipsData: '',
        tapIndex:0

    },
    //组件数据字段监听器，用于监听properties 和 data的变化
    observers:{

    },
    //组件的方法
    methods:{
        _changeItem(e){
            var index = this.data.tapIndex;
            if (index == this.data.data.length - 1) {
                index = 0
            } else {
                index++
            }
            this.setData({
                tipsData:this.data.data[index],
                tapIndex:index
            })
        },
        _jumpToDetail(e){
            var id = e.currentTarget.dataset.id
            wx.navigateTo({
                url:`/pages/store/detail/detail?id=${id}`
            })
        },

    },
    ready(){
        this.setData({
            tipsData:this.data.data[0]
        })
    }
    //生成的组件实例可以在组件的方法，生命周期函数和属性observer中通过this访问。
    /*组件包含一些属性和方法
    属性名
    * is  string  组件的文件路径
    * is  string  节点id
    * dataset  string  节点dataset
    * data object  组件数据，包括内部数据和属性值
    * properties object 组件数据，包括内部数据和属性值（与data一致）
    *
    *
    方法名
    * setData       object      设置data并执行视图层渲染
    * hasBehavio    object      检查组件是否具有 behavior （检查时会递归检查被直接或间接引入的所有behavior）
    * triggerEvent  String name, Object detail, Object options      触发事件
    * */
})