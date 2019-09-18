/**
 * Created by lcfevr on 2018/5/8.
 */
import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        bankList: '',
        selectedIndex: '',
        bank_name: '',
        bank_card_number: '',
        sink: false,
        balance: '',
        limit: '',
        id: '',
        cash_type: '',
        inputValue: '',
        nameList: '',
        config: ''
    },
    onLoad(){
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        this.queryBalance();
        this.queryBankCardList();
    },
    jumpItem(e){
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    change(e){
        console.log(e);
        this.setData({
            selectedIndex:e.detail.value,
            bank_name: this.data.bankList[e.detail.value].bank.bank_name,
            bank_card_number: this.data.bankList[e.detail.value].bank_card_number,
            id: this.data.bankList[e.detail.value].id,
            sink: true
        })
    },
    eliminate(){
        this.setData({
            inputValue: ''
        })
    },
    allMoney(){
        this.setData({
            inputValue: this.data.balance
        })
    },
    inputMoney(e){
        this.setData({
            inputValue: e.detail.value
        })
    },
    submit(){
        var bank = {
            bank_name: this.data.nameList[this.data.selectedIndex] || '',
            money: Number(this.data.inputValue),
            id: this.data.id,
            cash_type: this.data.cash_type
        };
        var message = null;
        if (!bank.bank_name) {
            message = '请选择账户';
        } else if (!bank.money) {
            message = '请输入提现金额';
        }
        else if (bank.money > Number(this.data.balance)) {
            message = '可提现金额不足';
        } else if (bank.money < Number(this.data.limit)) {
            message = '提现金额不能少于' + this.data.limit + '元'
        }

        if (message) {
            wx.showModal({
                content: message,
                showCancel: false
            })
        } else {
            var data = {
                amount: Number(this.data.inputValue),
                bank_account_id: this.data.id,
                cash_type: this.data.cash_type
            }

            this.applyCash(data);
        }
    },
    // 直接提取到微信钱包，不需要支付宝以及其他渠道  2018.12.28
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
                    var arr=[];
                    var name=[];
                    this.setData({
                        cash_type: res.meta.type
                    })

                    var info = {
                        bank:{
                            id: '',
                            bank_name: '微信钱包',
                        },
                        id: '',
                        bank_card_number: '微信钱包直接提现到微信钱包'
                    };
                    arr.push(info);
                    name.push('微信钱包')

                    this.setData({
                        bankList: arr,
                        nameList: name
                    })
                    //customer_wechat
                   /* if (res.meta.type == 'customer_wechat') {
                        var info = {
                            bank:{
                                id: '',
                                bank_name: '微信钱包',
                            },
                            id: '',
                            bank_card_number: '微信钱包直接提现到微信钱包'
                        };
                        arr.push(info);
                        name.push('微信钱包')

                        this.setData({
                            bankList: arr,
                            nameList: name
                        })
                    } else {
                        res.data.forEach((val)=>{
                            if(val.bank.bank_name == "支付宝"){
                                arr.push(val);
                                var list = val.bank.bank_name + val.bank_card_number
                                name.push(list)
                                this.setData({
                                    bankList: arr,
                                    nameList: name
                                })
                            }
                        })
                    }*/
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
    //分销中心余额
    queryBalance() {
        sandBox.get({
            api:"api/distribution/cash/balanceSum",
            header:{
                Authorization:cookieStorage.get('user_token')
            }
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if (res.status) {
                    this.setData({
                        balance: res.data.sumBalance/100,
                        limit: res.data.limit
                    })
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
    //提现
    applyCash(data) {
        sandBox.post({
            api:"api/distribution/cash/apply",
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data: data
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data
                if (res.status) {
                    wx.showModal({
                        content: '提现申请已提交，将在7天内到账，请注意查收',
                        showCancel: false,
                        success:(res)=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                wx.redirectTo({
                                    url: '/pages/distribution/distributionCenter/distributionCenter'
                                })
                            }
                        }
                    })
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
    }


})