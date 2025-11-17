import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams } from "@angular/common/http";
import { GroupInfo } from '../../providers/user-groups/user-groups';
import { GlobalsProvider } from '../../providers/globals/globals';
/**
 * Generated class for the ViewUserBasicInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export class User
{
  username:string;
  nickname:string;
  tel:string;
};


@IonicPage()
@Component({
  selector: 'page-view-user-basic-info',
  templateUrl: 'view-user-basic-info.html',
})
export class ViewUserBasicInfoPage {
  private username:string;
  private userinfo:User;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient,
              public globals:GlobalsProvider) 
  {
    this.username = this.navParams.get("username");
    this.userinfo = {
      username:'username',
      nickname:'还没有设置昵称',
      tel:''
    };
    const params = new HttpParams().set('username',this.username)
    let options = {
      "withCredentials":true,
      "params":params
    }
    this.http.get<any>(this.globals.server + "user/getuserbasic/", options).subscribe(
      data => this.onResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onResponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      let info = data['msg'];
      this.userinfo.username = info['username'];
      if (info['nickname'].length > 0)
        this.userinfo.nickname = info['nickname'];
      this.userinfo.tel = info['tel'];
    }
  }

}
