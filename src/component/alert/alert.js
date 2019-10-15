Component({
    properties:{
        is_refused:{
            type:Boolean,
            value:false
            //相当于 vue watch,当is_refused改变时，所执行的方法

        }
    },
    data:{

    },
    methods:{
        changeSave(){
            this.triggerEvent('close')
        }
    }
})