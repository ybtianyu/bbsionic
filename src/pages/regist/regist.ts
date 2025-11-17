import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import { LoginPage } from '../login/login';
import { Md5Provider } from '../../providers/md5/md5';
import { GlobalsProvider } from '../../providers/globals/globals';

/**
 * Generated class for the RegistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-regist',
  templateUrl: 'regist.html',
})
export class RegistPage {
  private username:string;
  private password:string;
  private confirm_password:string;
  private message:string;
  public loginPage:LoginPage;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http: HttpClient, public globals:GlobalsProvider, public MD5:Md5Provider) {
    this.loginPage = this.navParams.get('loginPage');
    this.username = "";
    this.password = "";
    this.confirm_password = "";
    this.message = "";
  }


  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  private regist()
  {
    if (this.username.length == 0)
    {
      alert("请填写用户名进行注册");
      return;
    }  
    if (this.password.length==0)
    {
      alert("请填写密码进行注册");
      return;
    }  
    if (this.password != this.confirm_password)
    {
      alert("密码确认不对，请重新输入密码");
      return;
    }  
    console.log("validate pass...");  
    let body = {
      'username':this.username,
      'password':this.MD5.hex_md5(this.password)
    }
    this.http.post<any>(this.globals.server + 'user/register/', this.encodeHttpParams(body), {}).
    subscribe(
      data => this.onRegistResponse(data),
      err => this.message = "现在不能注册"//console.log(JSON.stringify(err))
    )
    this.message = "正在提交注册信息...";
  }

  
//自定义js 延时

  private sleep(delay:number){
    var t = Date.now();
    while((Date.now() - t) <= delay){
    }
  }

  private onRegistResponse(res:JSON)
  {
    if (res['status_code'] == 0)
    {
      console.log("Regist successful!");
      this.message = "注册成功，即将转到登录页面...";
      this.sleep(3000); 
      //进入注册页面前，登录页面做过push操作，此时登录页面做pop操作可以回到登录页面
      this.loginPage.navCtrl.pop();
    }
    else if (res['status_code'] == -1)
    {
      this.message = '用户名已经存在';
    }
  }

  focusUsernameInput()
  {
    this.message = "";
  }

}
