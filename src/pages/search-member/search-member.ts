import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams, HttpRequest } from "@angular/common/http";
import {ViewUserBasicInfoPage} from '../../pages/view-user-basic-info/view-user-basic-info';
import {GlobalsProvider} from "../../providers/globals/globals";
/**
 * Generated class for the SearchMemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class User
{
  userid:number;
  username:string;
};

@IonicPage()
@Component({
  selector: 'page-search-member',
  templateUrl: 'search-member.html',
})
export class SearchMemberPage {
  private userlist:User[];
  private name_input:string;
  private toGroupid:number;
  private toGroupname:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider) {
    this.toGroupid = this.navParams.get("groupid");
    this.toGroupname = this.navParams.get("groupname");
    this.userlist = [];
    this.name_input = "";
  }

  searchName(name:string)
  {
    if (name == "")
      return;
    this.userlist = [];
    const params = new HttpParams()
    .set('name', name)
    this.http.get<any>(this.globals.server + 'user/searchname/', {params}).
    subscribe(
      data => this.onSearchResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onSearchResponse(data:JSON)
  {
    if (data['data'].length == 0)
    {
      alert("没有查找到相应用户");
      return;
    }
    let users_jsonarray:any[] = data['data'];
    for (let i = 0; i < users_jsonarray.length; i++)
    {
      let user:User = {
        userid:0,
        username:"username"
      };
      user.userid = users_jsonarray[i].userid;
      user.username = users_jsonarray[i].username;
      //if (users_jsonarray[i]['nickname'] != "")
      //  user.name = users_jsonarray[i]['nickname'];
      this.userlist.push(user);
    }
  }

  viewUserBasicInfo(username:string)
  {
    this.navCtrl.push(ViewUserBasicInfoPage, {'username':username});
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  invitetoGroup(toGroupid:number, username:string)
  {
    let params = {
      'username':username,
      'groupid':toGroupid
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/inviteuser/', this.encodeHttpParams(params), options).subscribe(
      data => this.onInviteResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onInviteResponse(data:JSON)
  {
    if (data['status_code'] < 0)
    {
      alert("添加用户失败");  //alert(data['msg']);
    }
    else if (data['status_code'] == 0)
    {
      alert("添加用户成功");  //alert(data['msg']); //添加成功
    }
  }


}
