import { Component } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BbsNewPostEditPage, GroupPickedItem } from '../bbs-new-post-edit/bbs-new-post-edit';
import { GlobalsProvider } from '../../providers/globals/globals';

/**
 * Generated class for the BbsVotersPickPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

class GroupInfo
{
  groupid:number;
  groupname:string;
}
class getgroupsResponse
{
  info:GroupInfo[];
}
export class GroupUIInfo
{
  groupid:number;
  groupname:string;
  ischecked:boolean;
} 

@IonicPage()
@Component({
  selector: 'page-bbs-voters-pick',
  templateUrl: 'bbs-voters-pick.html',
})
export class BbsVotersPickPage {
  private groupsUIInfo:GroupUIInfo[];
  private pickedgroups:GroupPickedItem[];
  private bbsnewposteditpage:BbsNewPostEditPage;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http: HttpClient, public globals:GlobalsProvider) {
    console.log("BbsVotersPickPage constructor");
    this.bbsnewposteditpage = navParams.get('bbsnewposteditpage');
    this.pickedgroups = navParams.get('pickedgroups');
    this.groupsUIInfo = [];
    this.init_pickedgroups();

  }

  private init_pickedgroups()
  {
    this.http.get<getgroupsResponse>(this.globals.server + 'group/getAllgroups/').
    subscribe(
    data => this.onRecvGroupsData(data),
    err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  private onRecvGroupsData(group_resp:getgroupsResponse)
  {
    this.groupsUIInfo = [];
    var groupsInfo:GroupInfo[] = group_resp.info;
    for (var i:number = 0; i < groupsInfo.length; i++)
    {
      var UIItem:GroupUIInfo = {
          'groupid': 0,
          'groupname':'groupname',
          'ischecked':false
      };
      UIItem.groupid = groupsInfo[i].groupid;
      UIItem.groupname = groupsInfo[i].groupname;
      if (this.hasgroupidinPickedGroups(this.pickedgroups, UIItem.groupid))
        UIItem.ischecked = true;
      else
        UIItem.ischecked = false;
      this.groupsUIInfo.push(UIItem);
    }
    
  }

  private hasgroupidinPickedGroups(PickedGroups:GroupPickedItem[], groupid:number):boolean
  {
    for (let i:number = 0; i < this.pickedgroups.length; i++)
    {
      if (PickedGroups[i].groupid == groupid)
        return true;
    }
    return false;
  }
  
  private onOK()
  {
    this.updateEditPagePickedGroups();
    this.bbsnewposteditpage.modalVoterPickPage.dismiss();
  }

  /*
  updateEditPagePickedGroups
     write from groupsUIInfo[] to GroupPickedItem[]
  */
  public updateEditPagePickedGroups()
  {
    var PickedGroups:GroupPickedItem[] = [];
    for (var i = 0; i < this.groupsUIInfo.length; i++)
    {
      if (this.groupsUIInfo[i].ischecked == true)
      {
        var groupvoters:GroupPickedItem = {
          'groupid':0,
          'exclude':[]
        };
        groupvoters.groupid = this.groupsUIInfo[i].groupid;
        groupvoters.exclude = [];
        PickedGroups.push(groupvoters);
      }
    }
    this.bbsnewposteditpage.updatePickedGroups(PickedGroups);
  
  }

}
