import {cookieStorage} from '../../lib/myapp.js';
let _compData ={
    'birthdayToast.isShow':false,
    'birthdayToast.data':''
};
let toastPannel ={
    showText:function(data){
        this.setData({'birthdayToast.isShow':true,'birthdayToast.data':data});
    },
    closeBirthdayTap(){
        this.setData({'birthdayToast.isShow':false});
        var gift=cookieStorage.get("birthday_gift");
        gift.flag=true;
        cookieStorage.set("birthday_gift",gift);
    }
};
function ToastPannel(){
    let pages=getCurrentPages();
    let curPage =pages[pages.length-1];
    this.__page=curPage;
    Object.assign(curPage,toastPannel);
    curPage.toastPannel =this;
    curPage.setData(_compData);
    return this;
}
export default ToastPannel