import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams, HttpRequest } from "@angular/common/http";
import {ViewUserBasicInfoPage} from '../../pages/view-user-basic-info/view-user-basic-info';
import {GlobalsProvider} from "../../providers/globals/globals";
import { ViewUserGroupInfoPage } from '../view-user-group-info/view-user-group-info';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
/**
 * Generated class for the GroupMemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class User
{
  userid:number;
  username:string;
  nickname:string;
};
class GroupUser
{
  user:User;
  isadmin:boolean;
}

@IonicPage()
@Component({
  selector: 'page-group-member',
  templateUrl: 'group-member.html',
})
export class GroupMemberPage {
  private groupname:string;
  private groupid:number;
  disableAdminconfig:boolean;
  bgpAdmin:boolean;
  private userlist:GroupUser[];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider, public user_groups:UserGroupsProvider) {
    this.groupname = this.navParams.get('groupname');
    this.groupid = this.navParams.get('groupid');
    this.disableAdminconfig = this.navParams.get('disableAdminconfig');
    this.userlist = [];
    this.bgpAdmin = this.user_groups.isGroupAdmin(this.groupid);
    this.searchAllGroupMember();
  }

  searchAllGroupMember()
  {
    console.log("searchAllGroupMember");
    this.http.get<any>(this.globals.server + 'group/getGroupUsers/'+ this.groupid + '/').
    subscribe(
      data => this.onResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onResponse(data:JSON)
  {
    let users_jsonarray:any[] = data['data'];
    for (let i = 0; i < users_jsonarray.length; i++)
    {
      let user:GroupUser = {
        'user':{
          'userid':users_jsonarray[i]['userid'],
          'username':users_jsonarray[i]['username'],
          'nickname':users_jsonarray[i]['nickname']
        },
        'isadmin':users_jsonarray[i]['isadmin']
      };
      this.userlist.push(user);
    }
  }

  viewUserGroupInfo(username:string)
  {
    this.navCtrl.push(ViewUserGroupInfoPage, {'username':username, 'groupid':this.groupid});
  }

  /*
  removeFromGroup
  只有组管理员可以访问该函数
  */
  removeFromGroup(username:string)
  {
    if (this.globals.username == username)
    {
      alert("组管理员不能将自己移出组");
      return;
    }
    let body = {
      "username":username,
      "groupid":this.groupid
    }
    let options = {
      "withCredentials":true
    }
    this.http.post<any>(this.globals.server + 'group/removeuserfromgroup/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.onRemoveUserFromGroupResponse(data, username),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }
  onRemoveUserFromGroupResponse(data:JSON, username:string)
  {
    if (data['status_code'] == 0)
    {
      // this.userlist里删除相应用户项
      var new_userlist:GroupUser[] = [];
      for (let user of this.userlist)
      {
        if (user.user.username != username)
        {
          new_userlist.push(user);
        }
      }
      this.userlist = new_userlist;
      alert(username + "已被移出组");
    }
    else
    {
      alert("用户移出组失败");
    }
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
}
