import { Injectable } from '@angular/core';
import {GroupUIInfo} from "../../pages/bbs-voters-pick/bbs-voters-pick";
import {UserGroupsProvider, UserGroupInfo, GroupInfo } from "../../providers/user-groups/user-groups";
import {HttpClient, HttpParams} from "@angular/common/http";
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import { FavoriteGroupInfo } from '../../pages/bbs/bbs';
/*
  Generated class for the AdvancedBbsSearchOptProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AdvancedBbsSearchOptProvider {

  private groups:GroupInfo[];
  private username:string;
  public hascached:boolean;
  //高级搜索选项
  private AdvancedSearchOpt:JSON = JSON.parse("{}");
  private author_key:string;
  private postdatebegin_key:string;
  private postdateend_key:string;
  private search_key:string;

  constructor(public http:HttpClient, public globals:GlobalsProvider/*, public user_groups:UserGroupsProvider*/) 
  {
    this.groups = [];
  //  this.hascached = false;
  //  this.username = this.globals.dummyUsername;
    this.AdvancedSearchOpt['customize_code'] = 0;
    this.AdvancedSearchOpt["author_key"] = "";
    this.AdvancedSearchOpt["postdatebegin_key"] = "";
    this.AdvancedSearchOpt["postdateend_key"] = "";
    this.AdvancedSearchOpt["search_key"] = "";
    console.log('Hello AdvancedBbsSearchOptProvider Provider');
  }

  /*
  This method is called at login.
  */
  // public set_user(username:string)
  // {
  //   console.log("AdvancedBbsSearchOptProvider:set_user: username=" + username);
  //   this.hascached = false;
  //   this.groups = [];
  //   this.username = username;
  //   this.initGroups();
  //   //this.setAllGroupsSelTrue();
  // }

  CopyArrary(target:any[], objs:any[])
  {
    while(target.length > 0)  target.pop();
    let str = "";
    for (let i = 0; i < objs.length; i++)
    {
      var obj = objs[i];
      str = JSON.stringify(obj);
      target.push(JSON.parse(str));
    }
  }

  public getAdvancedSearchOpt():string
  {
    return JSON.stringify(this.AdvancedSearchOpt);
  }

  public searchkeys():string[]
  {
    let searchKeys = [];
    let searchkeys_str = this.AdvancedSearchOpt["search_key"];
    searchKeys = searchkeys_str.split(' ');
    return searchKeys
  }

  public setAdvancedSearchOpt(customize_code:number, author_key:string, postdatebegin_key:string, postdateend_key:string, search_key:string)
  {
    this.AdvancedSearchOpt['customize_code'] = customize_code;
    this.AdvancedSearchOpt["author_key"] = author_key;
    this.AdvancedSearchOpt["postdatebegin_key"] = postdatebegin_key;
    this.AdvancedSearchOpt["postdateend_key"] = postdateend_key;
    this.AdvancedSearchOpt["search_key"] = search_key;
    console.log(this.getAdvancedSearchOpt());
  }

  // public getGroups():UserGroupSelUIInfo[]
  // {
  //   return this.groups;
  // }
  // /*
  // 初始化this.groups为设置为Favorite的组
  // */
  // public initGroups()
  // {
  //   this.groups = [];
  //   for (let group of this.user_groups.getFavoriteGroups())
  //   {
  //     this.groups.push(
  //       {
  //         "groupid":group.groupid,
  //         "groupname":group.groupname,
  //         "ischecked":true,
  //         "isPostful":group.isPostful,
  //         "isjoined":group.isJoined,
  //         "isAdmin":group.isAdmin
  //       }
  //     )
  //   }
  // }
   public getSelGroups():GroupInfo[]
   {
     return this.groups;
   }

   public setGroups(groups:GroupInfo[])
   {
      this.CopyArrary(this.groups, groups);
   }

  // private encodeHttpParams(params: any): any {
  //   if (!params) return null;
  //   return new HttpParams({fromObject: params});
  // }

  // public  updateGroups()
  // {
  //   console.log("AdvancedBbsSearchOptProvider:updateGroups");
  //   var favoritegroups:FavoriteGroupInfo[] = this.user_groups.getFavoriteGroups();
  //   // this.groups在user_groups.getFavoriteGroups()里面没有，则去掉
  //   var groups:UserGroupSelUIInfo[] = [];
  //   for (let group of this.groups)
  //   {
  //     var isgroupdeled:boolean = true;
  //     for (let favgroup of favoritegroups)
  //     {
  //       if (group.groupid == favgroup.groupid)
  //       {
  //         isgroupdeled = false;
  //         break;
  //       }
  //     }
  //     if (isgroupdeled == false)
  //       groups.push(group);
  //   }
  //   this.groups = groups;
  //   // this.groups里面没有该groupid，则添加
  //   for (let favgroup of favoritegroups)
  //   {
  //     var isgroupadded = true;
  //     for (let group of this.groups)
  //     {
  //       if (favgroup.groupid == group.groupid)
  //       {
  //         isgroupadded = false;
  //         break;
  //       }
  //     }
  //   if (isgroupadded == true)
  //     this.groups.push( {
  //           "groupid":favgroup.groupid,
  //           "groupname":favgroup.groupname,
  //           "isPostful":favgroup.isPostful,
  //           "ischecked":true,
  //           "isjoined":favgroup.isJoined,
  //           "isAdmin":favgroup.isAdmin
  //           }
  //     );
  //   }

  // }

  // /*
  //   Param: groups includes all groups of current user
  // */
  // public setGroupsSel(groups:UserGroupSelUIInfo[])
  // {
  //   //console.log("Enter setGroupsSel");
  //   //this.groups = groups;
  //   this.groups = groups;
  //   this.sel_groups = [];
  //   for (let i:number = 0; i < this.groups.length; i++)
  //   {
  //     if (this.groups[i].ischecked)
  //     {
  //       //console.log("UserGroupsProvider:getSelGroups:groupid=" + this.groups[i].groupid);
  //       var group:GroupInfo = {
  //         'groupid':this.groups[i].groupid,
  //         'groupname':this.groups[i].groupname
  //       }
  //       this.sel_groups.push(group);
  //     }
  //   }

  //   console.log("AdvancedBbsSearchOptProvider:setGroupsSel..................");
  //   for (let i =0; i< this.sel_groups.length; i++)
  //         console.log(this.sel_groups[i].groupname);
  //   for (let i =0; i< this.groups.length; i++)
  //         console.log(this.groups[i].groupname + ":" + this.groups[i].ischecked);
  //   console.log("AdvancedBbsSearchOptProvider:setGroupsSel..................");

  // }
}
