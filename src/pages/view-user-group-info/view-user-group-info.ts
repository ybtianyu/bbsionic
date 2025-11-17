import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../view-user-basic-info/view-user-basic-info';
import { HttpParams, HttpClient } from '@angular/common/http';
import { GlobalsProvider } from '../../providers/globals/globals';

/**
 * Generated class for the ViewUserGroupInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class GroupUser
{
  user:User;
  groupinfo:UserGroupInfo
};
class UserGroupInfo
{
  groupid:number;
  score:number;
}

@IonicPage()
@Component({
  selector: 'page-view-user-group-info',
  templateUrl: 'view-user-group-info.html',
})
export class ViewUserGroupInfoPage {
  private username:string;
  private groupid:number;
  private userinfo:GroupUser;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient,
              public globals:GlobalsProvider) 
  {
    this.username = this.navParams.get("username");
    this.groupid = this.navParams.get("groupid");
    this.userinfo = {
      user:{
        username:'username',
        nickname:'还没有设置昵称',
        tel:''
      },
      groupinfo:{groupid:this.groupid, score:0}
    };
    const params = new HttpParams()
    .set('username',this.username)
    .set('groupid', this.groupid.toString())
    let options = {
      "withCredentials":true,
      "params":params
    }
    this.http.get<any>(this.globals.server + "user/getgroupuserinfo/", options).subscribe(
      data => this.onResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onResponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      let info = data['msg'];
      this.userinfo.user.username = info['username'];
      if (info['nickname'].length > 0)
        this.userinfo.user.nickname = info['nickname'];
      this.userinfo.user.tel = info['tel'];
      this.userinfo.groupinfo.score = info['score']
    }
  }

}
