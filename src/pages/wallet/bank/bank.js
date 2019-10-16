import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        bankList: '',
        total: 0,
        edit: false,
        checkList: [],
        allCheck: false,
        id: '',
        config: ''
    },
    onLoad(){
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        this.queryBankCardList();
    },
    editBank(e) {
       wx.navigateTo({
            url: '/pages/wallet/bank-add/bank-add?id=' + e.currentTarget.dataset.id
       })
    },
    edit() {
        this.setData({
            edit: !this.data.edit
        })
    },
    select(e) {
        var value = e.detail.value;
        var newList = [];
        if (value.length == this.data.total) {
            this.setData({
                allCheck: true
            })
        } else {
            this.setData({
                allCheck: false
            })
        }

        value.forEach(v => {
            v=parseInt(v);
            newList.push(v);
        })
        this.setData({
            checkList: newList
        })
    },
    click() {
        var newList = this.data.bankList;
        if (this.data.allCheck) {
            newList.forEach(v => {
                v.isCheck =false
            });
            this.setData({
                checkList: []
            })
        } else {
            var checkList = [];
            newList.forEach(v => {
                v.isCheck =true
            });
            newList.forEach(v => {
                checkList.push(v.id)
            });
            this.setData({
                checkList: checkList
            })
        }
        this.setData({
            bankList: newList,
            allCheck: !this.data.allCheck
        })

    },
    fClick(e) {
        var value = e.currentTarget.dataset.value;
        this.setData({
            id: value
        })

        var fIndex = e.currentTarget.dataset.findex;
        var isCheck = e.currentTarget.dataset.ischecked;
        var list = `bankList[${fIndex}]`;
        this.setData({
            [`${list}.isCheck`]: !this.data.bankList[fIndex].isCheck
        })
    },
    cancel() {
        var data = this.data.checkList;
        data.forEach((v) => {
            this.setData({
                id: v
            })
        })
        if (this.data.checkList.length === 0) {
            wx.showModal({
                content: '请选择你要删除的账号',
                showCancel: false
            })
        } else {
            wx.showModal({
                content: '是否删除账号',
                success: res=>{
                    if (res.confirm) {
                        this.removeBankCard(this.data.id);
                    }
                }
            })
        }
    },
    jumpItem(e){
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    removeBankCard(id){
        sandBox.ajax({
            api:"api/users/BankAccount/delete/"+ id,
            method: 'delete',
            header:{
                Authorization:cookieStorage.get('user_token')
            },

        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if (res.status) {
                    this.queryBankCardList();
                    this.setData({
                        checkList: [],
                    })
                } else{
                    wx.showModal({
                        content: res.message || '删除失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }

        })
    },
    queryBankCardList(){
        sandBox.get({
            api:"api/users/BankAccount/show",
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if (res.status) {
                    var arr=[]
                    res.data.forEach((val)=>{
                        if(val.bank.bank_name == "支付宝"){
                            arr.push(val);
                            this.setData({
                                bankList: arr,
                                total: arr.length
                            })
                        }
                    })

                    if (!res.data.length) {
                        this.setData({
                            bankList: []
                        })
                    }
                } else{
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

        })
    },

})