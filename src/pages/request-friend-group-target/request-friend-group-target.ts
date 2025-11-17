import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, Popover } from 'ionic-angular';
import { GlobalsProvider } from '../../providers/globals/globals';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserGroupsProvider, UserGroupInfo } from '../../providers/user-groups/user-groups';
import { TribeSearchInfo } from '../wild-social-search/wild-social-search';
import { UserRequestConfirmPage } from '../user-request-confirm/user-request-confirm';

/**
 * Generated class for the RequestFriendGroupTargetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-request-friend-group-target',
  templateUrl: 'request-friend-group-target.html',
})
export class RequestFriendGroupTargetPage {
  public popover_confirm:Popover;
  targetgroup:TribeSearchInfo;
  groups:UserGroupInfo[];
  
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globals:GlobalsProvider, public http:HttpClient,
              public user_groups:UserGroupsProvider, public popoverCtrl:PopoverController) {
    this.targetgroup = this.navParams.get('group');
    this.groups = this.user_groups.getJoinedUserGroups();
  }

  onPickFromGroup(group:UserGroupInfo)
  {
    const params = new HttpParams()
    .set('groupid', group.groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/isuseradmin/', options).
    subscribe(
    data => this.onJudgeAdminresponse(data, group),
    err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )

  }
  onJudgeAdminresponse(data:JSON, group:UserGroupInfo)
  {
    if (data['status_code'] == 0)
    {
      let isAdmin = data['isadmin'];
      this.requestFriendGroupVisit(group, isAdmin);
    }
  }

  /*
  group:申请从group组访问targetgroup
  */
  requestFriendGroupVisit(group:UserGroupInfo, isAdmin:boolean)
  {
    let request = {};
    if (isAdmin)
    {//直接发送请求到group
       request = {
        "fromusername":this.globals.username,
        "fromgroupid":group.groupid,
        "targetgroupid":this.targetgroup.groupid,
        'targetgroupname':this.targetgroup.groupname,
        //"biddirectvisit":false,
        "groupid":this.targetgroup.groupid,
        "requestcode":2
      };
      let param = {
        'request':request,
        'requestgroupid':this.targetgroup.groupid, //请求发送的目标组
        'parent':this
      };
      this.popover_confirm = this.popoverCtrl.create(UserRequestConfirmPage, param);
      this.popover_confirm.present();    
    }
    else
    {//发送请求到group,待组管理员来转发请求
       request = {
        "fromusername":"",
        "fromgroupid":group.groupid,
        "targetgroupid":this.targetgroup.groupid,
        'targetgroupname':this.targetgroup.groupname,
        //"biddirectvisit":false,
        "groupid":group.groupid,
        "requestcode":2,
      };
      let param = {
        'request':request,
        'requestgroupid':group.groupid, //请求发送的目标组
        'parent':this
      };
      this.popover_confirm = this.popoverCtrl.create(UserRequestConfirmPage, param);
      this.popover_confirm.present(); 
    }

  }


  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
}
