import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {GlobalsProvider} from "../../providers/globals/globals";
import {UserGroupsProvider, GroupInfo, UserGroupsSel, UserGroupInfo} from "../../providers/user-groups/user-groups";
import {GroupInfoPage} from "../group-info/group-info";
import {NewGroupPage} from "../new-group/new-group";
import { GroupUIInfo } from '../bbs-voters-pick/bbs-voters-pick';
import VConsole from 'vconsole';
var vconsole = new VConsole();

export class GroupReqInfo
{
  group:UserGroupInfo;
  reqCnt:number;   //该组的需要我处理的请求个数
}

/**
 * Generated class for the MyGroupsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-groups',
  templateUrl: 'my-groups.html',
})

export class MyGroupsPage {
  private groups:GroupReqInfo[]; 
  private markFavs:Map<string, UserGroupInfo>;
  private unmarkFavs:Map<string, UserGroupInfo>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http: HttpClient, public globals:GlobalsProvider, public user_groups:UserGroupsProvider) {
    console.log("MyGroupsPage constructor");
    this.groups = [];
    this.markFavs= new Map<string, UserGroupInfo>();
    this.unmarkFavs= new Map<string, UserGroupInfo>();
  } 

  private EnterGroupInfoPage(groupid:number, groupname:string)
  {
    this.navCtrl.push(GroupInfoPage, {'groupid':groupid, 'groupname':groupname, 'brief':false});
  }

  private newGroup()
  {
    this.navCtrl.push(NewGroupPage, {'mygroupsPage':this});
  }

  /**
   * refreshMyGroups
   * 更新用户组信息，并且获取最新的组管理员请求数量信息
   */
  private refreshMyGroups()
  {
    //更新组信息
    var tmpgroups:GroupReqInfo[] = [];
    var username:string = this.globals.username;
    this.user_groups.updateUserGroups_Promise()
    .then( (res) =>{  
      //console.log("typeof(res)=" + typeof(res));
      //console.log("res=" + res);
      console.log("MyGroupsMage::refreshMyGroups.111111111");
      //this.user_groups.onRecvGroupsData_json(JSON.parse(res));
      console.log("MyGroupsMage::refreshMyGroups.222222222222");
      var groups:UserGroupInfo[] = this.user_groups.getAllGroups();
      console.log("MyGroupsMage::refreshMyGroups.33333333333");
      for (let i = 0; i < groups.length; i++)
      {
        tmpgroups.push(
          {
            "group":{
              "groupid":groups[i].groupid,
              "groupname":groups[i].groupname,
              'admin':groups[i].admin,
              "isPostful":groups[i].isPostful,
              "isFavorite":groups[i].isFavorite,
              "isJoined":groups[i].isJoined,
              "isAdmin":groups[i].isAdmin
            },
            "reqCnt":0
          }
        );
      }
      this.groups = tmpgroups;
      //获取请求数量信息
      this.user_groups.getNewRequestfromServer().then( (res) =>{  
        this.user_groups.onResponseNewRequests(res);
        this.user_groups.getNewRequestfromLocal(this.groups);
        console.log("MyGroupsMage::refreshMyGroups:Finished getNewRequestfromServer Promise");
      },
      (err) =>{alert("获取请求数量信息失败");}
      );
    },
    (err) =>{console.log("获取请求数量信息失败");}
    );
    console.log("MyGroupsMage::refreshMyGroups:Finished updateUserGroups_Promise");    
  }


  ionViewWillEnter()
  {
    console.log('ionViewDidEnter MyGroupsPage');
    this.groups = [];
    var groups:UserGroupInfo[] = this.user_groups.getAllGroups();
    for (let i = 0; i < groups.length; i++)
    {
      this.groups.push(
        {
          "group":{
            "groupid":groups[i].groupid,
            "groupname":groups[i].groupname,
            'admin':groups[i].admin,
            "isPostful":groups[i].isPostful,
            "isFavorite":groups[i].isFavorite,
            "isJoined":groups[i].isJoined,
            "isAdmin":groups[i].isAdmin
          },
          "reqCnt":0
        }
      );
    }
    this.refreshMyGroups();
  }
  ionViewDidEnter() {
    
  }

  private updateandSaveUserGroupsFavs()
  {
      // 更新user_groups
      this.markFavs.forEach((group , groupid) =>{
        console.log("ionViewDidLeave:mark " + group.groupname);
          this.user_groups.setFavorite(group.groupid);
      });
      this.unmarkFavs.forEach((group , groupid) =>{
        console.log("ionViewDidLeave:unmark " + group.groupname);
        this.user_groups.unsetFavorite(group.groupid);
      });
      this.user_groups.updateFavLocalStorage();
  }

  isFavoriteChanged():boolean
  {
    if (this.markFavs.size > 0 || this.unmarkFavs.size > 0)
    {
      console.log("MyGroups::isFavoriteChanged: favorite is changed");
      return true;
    }
    else
    {
      console.log("MyGroups::isFavoriteChanged favorite is not changed");
      return false;
    }
    
  }
  onChangeFavoriteSel(checkbox, groupreq:GroupReqInfo)
  {
    var group:UserGroupInfo = groupreq.group;
    if (checkbox.checked)
    {
      console.log("MyGroups::onChangeFavoriteSel:checkbox.checked=");console.log(checkbox.checked);
      if (this.unmarkFavs.has(group.groupid.toString()))
        this.unmarkFavs.delete(group.groupid.toString());
      else
        this.markFavs.set(group.groupid.toString(), group);
    }
    else
    {
      if (this.markFavs.has(group.groupid.toString()))
        this.markFavs.delete(group.groupid.toString());
      else
        this.unmarkFavs.set(group.groupid.toString(), group);
    }
    this.updateandSaveUserGroupsFavs();
  }

  ionViewDidLeave()
  {
    //更新BbsPage的groups,BbsPage自动刷新
      this.globals.bbspage.onUpdateFavoriteGroups();
    //
      /*
      //置以后进入BbsPage后自动刷新标记
      if (this.globals.bbspage.bSingleGroupMode == false ||
          (this.globals.bbspage.bSingleGroupMode == true) && ! this.user_groups.isGroupFav(this.globals.bbspage.getSingleGroup().groupid) )
        this.globals.bbspage.setRefreshCmd();

      }
      */
  }
}
