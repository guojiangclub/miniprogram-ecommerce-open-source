
import config from './config';
import { getUrl } from "./myapp.js"
export const sandBox = {

    get({api, data, header}){

        return new Promise((resolve, reject) => {

            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                header:header,
                data:data,
                method:'GET',
                success:res => {

                    sandBox.error(res).then(()=>{
                        resolve(res)
                    })

                },
                fail:rej => {

                    reject(rej)
                }
            })
        })
    },
    post({api, data, header}){
        return new Promise((resolve, reject) => {

            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                data:data,
                header:header,
                method:'POST',
                success:res => {

                    sandBox.error(res).then(()=>{
                        resolve(res)
                    })
                },
                fail:rej => {
                    reject(rej)
                }
            })
        })
    },
    error(res){
        return new Promise((resolve,reject)=>{

            var url = getUrl();
            if (res.data.message == 'Unauthenticated.') {

                wx.removeStorageSync('user_token');
                wx.showModal({
                    content:'请重新登录',
                    duration:1500,
                    showCancel: false,
                    success:(res)=>{
                        if (res.confirm) {
                            wx.navigateTo({
                                url:`/pages/user/register/register?url=${url}`
                            })
                            return;
                        }
                    },
                    cancel:()=>{
                        wx.navigateTo({
                            url:`/pages/user/register/register?url=${url}`
                        })
                        return;
                    }
                })
                reject()
                return
            }

            resolve();
            return
        })

    },
    ajax({api, data, method, header}) {
        return new Promise((resolve,reject) => {
            wx.request({
                url:`${config.GLOBAL.baseUrl}${api}`,
                data,
                header,
                method:method.toUpperCase(),
                success:res => {

                    sandBox.error(res).then(()=>{
                        resolve(res)
                    })
                },
                fail:rej => {
                    reject(rej)
                }
            })
        })
    }
};