import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        bankList: '',
        selectedIndex: '',
        mobilePhone: '',
        name: '',
        bank_name: '',
        bank_id: '',
        id: '',
        config: ''
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        if (e.id) {
            wx.showLoading({
                title: "加载中",
                mask: true
            });
            this.setData({
                id: e.id
            })
            this.queryBankCard(e.id);
            this.queryBankList();
        } else {
            this.queryBankList();
        }
    },
    jumpItem(e){
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    change(e){
        this.setData({
            selectedIndex:e.detail.value,
            bank_name: this.data.bankList[e.detail.value].bank_name || ''
        })
    },
    AccountNumber(e){
        this.setData({
            mobilePhone:e.detail.value
        })
    },
    AccountHolder(e){
        this.setData({
            name:e.detail.value
        })
    },
    preservation(){
        var message=null;
        if (!is.has(this.data.bank_name)) {
            message = "请选择账户"
        } else if(!is.has(this.data.mobilePhone)){
            message = "请输入您的手机号";
        } else if(!is.has(this.data.name)){
            message="请输入姓名";
        }
        if(message) {
            wx.showModal({
                content: message,
                showCancel: false
            })
        } else {

            if (this.data.id) {
                var data = {
                    bank_name: this.data.bank_name,
                    bank_id: this.data.bank_id,
                    bank_card_number: this.data.mobilePhone,
                    owner_name: this.data.name
                }
                console.log(1);
                this.updateBankCard(this.data.id,data)
            } else {
                var data = {
                    bank_name: this.data.bank_name,
                    bank_id: this.data.bankList[this.data.selectedIndex].id,
                    bank_card_number: this.data.mobilePhone,
                    owner_name: this.data.name
                }
                this.addBankCard(data);
            }

        }

    },
    //添加账号
    addBankCard(data){
        sandBox.post({
            api:"api/users/BankAccount/add",
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data:data,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if(res.status){
                    wx.showModal({
                        content:"添加成功",
                        showCancel: false,
                        success:(res)=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                wx.redirectTo({
                                    url: '/pages/wallet/bank/bank'
                                })
                            }
                        }
                    })
                } else{
                    wx.showModal({
                        content: res.message ||  "添加失败",
                        showCancel: false
                    })
                }
            } else{
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }

        })
    },
    //查看账号列表
    queryBankList(){
        sandBox.get({
            api:"api/users/BankAccount/show-bank",
            header:{
                Authorization: cookieStorage.get('user_token')
            }
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                if (res.status) {
                    var arr=[]
                    res.data.forEach((val)=>{
                        if(val.bank_name == "支付宝"){
                            arr.push(val);
                            this.setData({
                                bankList: arr
                            })
                        }
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }

            }else{
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
        })
    },
    //查询账号信息
    queryBankCard(id){
        sandBox.get({
            api:"api/users/BankAccount/show/" + id,
            header:{
                Authorization: cookieStorage.get('user_token')
            }
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                if (res.status) {
                    this.setData({
                        bank_name: res.data.bank.bank_name,
                        mobilePhone: res.data.bank_card_number,
                        name: res.data.owner_name,
                        bank_id: res.data.bank_id
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
                wx.hideLoading();
            }else{
                wx.hideLoading();
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
        })
    },
    //修改账号
    updateBankCard(id,data){
        sandBox.ajax({
            api:"api/users/BankAccount/update/" + id,
            method: 'PUT',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data:data,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if(res.status){
                    wx.showModal({
                        content:"修改成功",
                        showCancel: false,
                        success:(res)=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                wx.redirectTo({
                                    url: '/pages/wallet/bank/bank'
                                })
                            }
                        }
                    })
                } else{
                    wx.showModal({
                        content: res.message || "修改失败",
                        showCancel: false
                    })
                }
            } else{
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }

        })
    }
})