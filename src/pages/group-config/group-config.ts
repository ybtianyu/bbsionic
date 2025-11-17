import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GlobalsProvider} from "../../providers/globals/globals";
import { HttpClient, HttpParams } from '@angular/common/http';
import {FriendVisitFromGroupConfigPage} from '../friendfrom-group-config/friendfrom-group-config';
import {GroupSetTagPage} from '../group-set-tag/group-set-tag';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
/**
 * Generated class for the GroupConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export class GroupConfig
{
  groupid:number;
  groupname:string;
  isprivate:boolean;
  friendVisitFromGroups:FriendVisitFromGroup[]; //保存进入页面后初始化的友邻发起组，即所有能访问本组的其他组
  tags:GroupTag[];
}
export class FriendVisitFromGroup{
  groupid:number;
  groupname:string;
  admin:string;
}
export class GroupTag{
  tagname:string;
}
@IonicPage()
@Component({
  selector: 'page-group-config',
  templateUrl: 'group-config.html',
})
export class GroupConfigPage {
  group:GroupConfig;
  friendvisitFromGroupsName:string;
  friendGroupsName:string;
  tagstext:string;
  bgpMember:boolean;
  bgpAdmin:boolean;
  disableAdminconfig:boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider, public user_groups:UserGroupsProvider) {
    this.group = {"groupid": -1, "groupname":"", "isprivate":true, "friendVisitFromGroups":[], "tags":[] };
    //console.log("this.group.friendgroups.length=" + this.group.friendGroups.length);
    this.group.groupid = this.navParams.get('groupid');
    this.group.groupname = this.navParams.get('groupname');
    this.disableAdminconfig = this.navParams.get('disableAdminconfig');
    console.log("this.disableAdminconfig=" + this.disableAdminconfig);
    this.friendvisitFromGroupsName = "";  // 页面显示的友邻发起组的名称，以逗号分割
    this.friendGroupsName = "";
    this.tagstext = "";
    console.log("GroupConfigPage::constructor:call GroupConfigPage()");
    this.getGroupConfig(this.group.groupid);
    //用户权限判断
    this.bgpMember = this.user_groups.isGroupMember(this.group.groupid);
    this.bgpAdmin = this.user_groups.isGroupAdmin(this.group.groupid);
    console.log("this.bgpAdmin=" + this.bgpAdmin);
  }

  getGroupConfig(groupid:number)
  {
    const params = new HttpParams().set('groupid', groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/getgroupconfig/', options).
    subscribe(
    data => this.onRecvGroupConfig(data),
    err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  onRecvGroupConfig(data:JSON)
  {
    console.log(data['status_code']);
    console.log(data['isprivate']);
    if (data['status_code'] == 0)
    {
      this.group.isprivate = data['isprivate'];
      //if (this.group.isprivate)
      {
        for (let friendgroup_json of data['friendvisitfromgroups'])
        {
          let friendfromgroup:FriendVisitFromGroup = {
            "groupid":friendgroup_json['groupid'],
            "groupname":friendgroup_json['groupname'],
            "admin":friendgroup_json['admin']
          }
          this.group.friendVisitFromGroups.push(friendfromgroup);
        }
        for (let tag_json of data['groupTags'])
        {
          let tag:GroupTag = {
            "tagname":tag_json['tagname']
          }
          this.group.tags.push(tag);
        }
      }
      this.updateFriendVisitFromGroupsName();

      this.updateGroupTagText();
    }
  }

  updateFriendVisitFromGroupsName()
  {
    if (this.group.isprivate)
    {
      if (this.group.friendVisitFromGroups.length == 0)
        this.friendvisitFromGroupsName = "无";
      else
      {
        this.friendvisitFromGroupsName = "";
        for (let friendfromgroup of this.group.friendVisitFromGroups)
        {
          this.friendvisitFromGroupsName += friendfromgroup.groupname;
          this.friendvisitFromGroupsName += ",";
        }
      }
    }
    else
    {
      this.friendvisitFromGroupsName = "所有";
    }
  }

  updateGroupTagText()
  {
        this.tagstext = "";
        for (let tag of this.group.tags)
        {
          this.tagstext += tag.tagname;
          this.tagstext += ",";
        }
  }

  onChangePrivateSwitch()
  {
    this.group.isprivate = ! this.group.isprivate;
    this.updateFriendVisitFromGroupsName();
    let body = {
      'groupid':this.group.groupid.toString(),
      'isprivate':this.group.isprivate
    }
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/switchprivatepublic/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.onRecvPrivateSwitchResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onRecvPrivateSwitchResponse(data:JSON)
  {
    if (data['status_code'] < 0)
      alert("服务器操作失败");
  }
  public updateFriendVisitFromGroups(friendfromgroups:FriendVisitFromGroup[])
  {
    this.group.friendVisitFromGroups = [];
    for (let i = 0; i < friendfromgroups.length; i++)
      this.group.friendVisitFromGroups.push(friendfromgroups[i]);
  }

  public updateGroupTags(tags:GroupTag[])
  {
    this.group.tags = tags;
  }

  setFriendVisitFromGroups(groupid:number)
  {
    if (this.group.isprivate)
      this.navCtrl.push(FriendVisitFromGroupConfigPage, {'groupconfigPage':this, 'groupconfig':this.group});
  }

  setGroupTag(groupid:number)
  {
    let params = {
      'groupconfigPage':this, 
      'groupinfo':{
         'groupid':this.group.groupid,
         'groupname':this.group.groupname
      },
      'grouptags':this.group.tags
    }
    this.navCtrl.push(GroupSetTagPage, params);
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

}
