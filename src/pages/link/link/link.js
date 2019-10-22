Page({
    data: {
        
    },
    onLoad: function(e) {
        console.log(e,'e')
        if(e.link){
            this.setData({
              link:e.link  
            })
        }    
    },
})