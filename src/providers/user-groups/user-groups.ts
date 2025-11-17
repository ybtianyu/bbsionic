import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { checkAndUpdateElementDynamic } from '@angular/core/src/view/element';
import { GroupUIInfo } from '../../pages/bbs-voters-pick/bbs-voters-pick';
import {GlobalsProvider} from '../../../src/providers/globals/globals';
//import { assert, isBoolean } from 'ionic-angular/umd/util/util'; //使用assert, umd会导致出现Runtime Error Error: Cannot find module "."
import { GroupSetTagPage } from '../../pages/group-set-tag/group-set-tag';
import { FavoriteGroupInfo } from '../../pages/bbs/bbs';
import { BbsUpdateNotifyProvider } from '../bbs-update-notify/bbs-update-notify';
import { GroupReqInfo } from '../../pages/my-groups/my-groups';
import { BBSGroupsLastUpdate } from '../../pages/bbs/rtctrl-lastupdate';
import { SpringFestival } from '../festival/springfestival';
import { DatesUtils } from '../dates/dates';
import { FriendVisitFromGroup } from '../../pages/group-config/group-config';
import { UserGroupSelUIInfo } from '../../pages/advanced-bbs-search/advanced-bbs-search';
//import { Promise } from '@angular/common/axios';

export class UserGroupInfo  //服务器返回
{
  groupid:number;
  groupname:string;
  admin:string;
  isPostful:boolean;  //是否能够发帖
  isFavorite:boolean;// 喜好组
  isJoined:boolean;
  isAdmin:boolean;
}
export class FriendVisitGroupInfo  //用户能友邻访问的组的信息
{
  groupid:number;       //用户能友邻访问的组
  groupname:string;
  admin:string;
  isPostful:boolean;  //是否能够发帖
  isFavorite:boolean;// 喜好组
  isJoined:boolean;
  isAdmin:boolean;
  visitedfromgids:number[]; //用户通过列表中的任一个groupid组可以拥有访问groupid组的权限
}

export class GroupInfo
{
  groupid:number;
  groupname:string;
}
export class getgroupsResponse
{
  info:GroupInfo[];
}
export class UserGroupsSel
{
  groupid:number;
  groupname:string;
  issel:boolean;  // whether or not the group is selected by current user
}
/*
  Generated class for the UserGroupsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserGroupsProvider {
  joinedgroups:UserGroupInfo[];
  friendviewablegroups:FriendVisitGroupInfo[];
  hascached:boolean;  //当joinedgroups,friendviewablegroups都更新后，hascached=true
  public NewReqsMap:Map<string, number>;  //喜好组里需要用户处理的消息，Map<groupid, request count>
  private username:string;

  constructor(public http: HttpClient, public globals: GlobalsProvider, public datesUtils:DatesUtils/*, public updateNotify:BbsUpdateNotifyProvider*/) {
    this.joinedgroups = [];
    this.friendviewablegroups = [];
    this.hascached = false;
    this.username = this.globals.dummyUsername;
    this.NewReqsMap= new Map<string, number>();
    console.log('Hello UserGroupsProvider Provider');
  }

  /*
  This method is called at login.
  */
  public set_user(username:string)
  {
    console.log("UserGroupsProvider:set_user: username=" + username);
    this.hascached = false;
    this.joinedgroups = [];
    this.friendviewablegroups = [];
    this.username = username;
    this.globals.favsStoreKeyname = this.username + "_favids";
    this.updateUserGroups();
    //this.setAllGroupsSelTrue();
  }

  /*
  getGroupName
   返回指定groupid的组名
   客户端内查找不到groupid，返回空串
  */
  public getGroupName(groupid:number)
  {
    if (!this.hascached) return "";
    for (let group of this.getAllGroups())
    {
      if (group.groupid == groupid)
        return group.groupname;
    }
    return "";
  }

  public clearUserGroups()
  {
    console.log("UserGroupsProvider::clearUserGroups.");
    this.joinedgroups = [];
    this.friendviewablegroups = [];
    this.hascached = false;
  }

  public getJoinedUserGroups():UserGroupInfo[]
  {
    if (this.hascached)
      return this.joinedgroups;
    else
    {
      console.log("UserGroupsProvider::getJoinedUserGroups [Warning]: this.joinedgroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }
  }

  public getFriendVisitGroups():FriendVisitGroupInfo[]
  {
    if (this.hascached)
      return this.friendviewablegroups;
    else
    {
      console.log("UserGroupsProvider::getFriendVisitGroups [Warning]: this.friendviewablegroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }
  }

  public getFriendVisitGroup(groupid:number):FriendVisitGroupInfo
  {
    if (this.hascached)
    {
      for (let i = 0; i < this.friendviewablegroups.length; i++)
      {
        if (groupid == this.friendviewablegroups[i].groupid)
          return this.friendviewablegroups[i];
      }
      console.log("UserGroupsProvider::getFriendVisitGroup [Error] failed to get friend visit group " + groupid.toString());
    }
    
    else
    {
      console.log("UserGroupsProvider::[Warning]: this.friendviewablegroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }
  }

  public isFriendVIsitGroup(groupid:number):boolean
  {
    if (this.hascached)
    {
      for (let i = 0; i < this.friendviewablegroups.length; i++)
      {
        if (groupid == this.friendviewablegroups[i].groupid)
          return true;
      }
      return false;
    }
    
    else
    {
      console.log("UserGroupsProvider::[Warning]: this.friendviewablegroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }
  }

  public getGroup(groupid:number):UserGroupInfo
  {
    if (this.hascached)
    {
      for (let i = 0; i < this.joinedgroups.length; i++)
      {
        if (groupid == this.joinedgroups[i].groupid)
          return this.joinedgroups[i];
      }
      for (let i = 0; i < this.friendviewablegroups.length; i++)
      {
        if (groupid == this.friendviewablegroups[i].groupid)
          return this.convertFriendGroupInfotoUserGroupInfo(this.friendviewablegroups[i]);
      }
      console.log("UserGroupsProvider::getFriendVisitGroup [Error] failed to get friend visit group " + groupid.toString());
    }
    
    else
    {
      console.log("UserGroupsProvider::[Warning]: this.friendviewablegroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }
  }
    /*
  getViewableUserGroups
  经友邻方式为可访问的组
  */
 /*
  public getViewableUserGroups():UserGroupInfo[]
  {
    if (this.hascached)
      return this.friendviewablegroups;
    else
    {
      console.log("UserGroupsProvider::[Warning]: this.friendviewablegroups is not ready");
      return undefined;
      //this.getServerUserGroups(); //使用Promise
    }    
  }
*/

  public getAllGroups():UserGroupInfo[]
  {
    if (this.hascached)
    {
      let allgroups:UserGroupInfo[] = [];
      for (let group of this.joinedgroups)
        allgroups.push(group);
      for (let group of this.friendviewablegroups)
      {
        let ugi:UserGroupInfo = this.convertFriendGroupInfotoUserGroupInfo(group);
        allgroups.push(ugi);
      }
      return allgroups;
    }
    else
    {
        console.log("UserGroupsProvider::getAllGroups [Warning]: user group information is not ready");
        return undefined;
        //this.getServerUserGroups(); //使用Promise
    }  
  }

  onUpdateGroupList(joinedgroups:JSON[], friendviewablegroups:JSON[], friendvisitgroupsvisitedfrom:JSON[])
  {
    console.log("UserGroupsProvider::onUpdateGroupList");
    console.log(friendvisitgroupsvisitedfrom.length);
    /*for (let i = 0; i < friendvisitgroupsvisitedfrom.length; i++)
    {
      console.log(friendvisitgroupsvisitedfrom[i]['groupid']);
      console.log(friendvisitgroupsvisitedfrom[i]['visitedfromgids']);
    }*/
    if (friendviewablegroups.length != friendvisitgroupsvisitedfrom.length)
    {
      console.log("UserGroupsProvider::onUpdateGroupList: [Warnning] friendvisit param friendviewablegroups and friendvisitgroupsvisitedfrom should have the same groups");
      return;
    }
    this.joinedgroups = [];
    for (let i = 0; i < joinedgroups.length; i++)
      this.joinedgroups.push(this.getUserGroupInfofromJSON(joinedgroups[i]));
    this.friendviewablegroups = [];
    for (let group of this.joinedgroups)
    {
      //console.log("JoinedGroups:" + group.groupname + ":isPostful("+group.isPostful+")");
    }
    for (let group of this.friendviewablegroups)
    {
      //console.log("friendviewablegroups:" + group.groupname + ":isPostful("+group.isPostful+")");
    }
    for (let i = 0; i < friendviewablegroups.length; i++)
    {
      let visitedfromgids:number[] = [];
      //get visitedfromgids for friendviewablegroups[i]
      for (let ii = 0; ii < friendvisitgroupsvisitedfrom.length; ii++)
      {
        if (friendvisitgroupsvisitedfrom[ii]['groupid'] == friendviewablegroups[i]['groupid'])
          visitedfromgids = friendvisitgroupsvisitedfrom[ii]['visitedfromgids'];
      }
      // add this.friendviewablegroups element
      this.friendviewablegroups.push({
        'groupid': friendviewablegroups[i]['groupid'],
        'groupname': friendviewablegroups[i]['groupname'],
        'admin': friendviewablegroups[i]['admin'],
        'isAdmin': friendviewablegroups[i]['isAdmin'],
        'isFavorite': false, //friendviewablegroups[i]['isFavorite'],
        'isJoined': friendviewablegroups[i]['isJoined'],
        'isPostful': friendviewablegroups[i]['isPostful'],
        'visitedfromgids': visitedfromgids
      })
    }
    this.hascached = true;

    this.AddDupNameSuffix();
  }

  AddDupNameSuffix()
  {
    let dupNames = [];
    let names = [];  
    for (let i = 0; i < this.joinedgroups.length; i++)
    {
      let name = this.joinedgroups[i].groupname;
      //console.log(name);
      for (let n = 0; n < names.length; n++)
      {        
        if (names[n] == name)
        {
          let bmark = 0;  //当前遍历的组名在dupNames中已存在置1
          for (let d = 0; d < dupNames.length; d++)
          {
            if (dupNames[d] == name)
            {
              bmark = 1;
              break;
            }
          }
          console.log("bmark=" + bmark);
          if (bmark == 0)
            dupNames.push(name);
          break;  
        }
        
      }
      names.push(name);        
    }

    for (let i = 0; i < this.friendviewablegroups.length; i++)
    {
      let name = this.friendviewablegroups[i].groupname;
      //console.log(name);
      for (let n = 0; n < names.length; n++)
      {        
        if (names[n] == name)
        {
          let bmark = 0;  //当前遍历的组名在dupNames中已存在置1
          for (let d = 0; d < dupNames.length; d++)
          {
            if (dupNames[d] == name)
            {
              bmark = 1;
              break;
            }
          }
          console.log("bmark=" + bmark);
          if (bmark == 0)
            dupNames.push(name);
          break;  
        }
        
      }
      names.push(name);        
    }

    console.log("names:");
    for (let i = 0; i < names.length; i++)
      console.log(names[i]);
    console.log("dupnames:");
    for (let i = 0; i < dupNames.length; i++)
      console.log(dupNames[i]);
    // add groupname suffix
    for (let d = 0; d < dupNames.length; d++)
    {
      let dupname = dupNames[d];
      for (let i = 0; i < this.joinedgroups.length; i++)
      {        
        if (dupname == this.joinedgroups[i].groupname)
        {
          this.joinedgroups[i].groupname += '_' ;
          this.joinedgroups[i].groupname += this.joinedgroups[i].admin;
        }
      }
      for (let i = 0; i < this.friendviewablegroups.length; i++)
      {
        if (dupname == this.friendviewablegroups[i].groupname)
        {
          this.friendviewablegroups[i].groupname += '_' ;
          this.friendviewablegroups[i].groupname += this.friendviewablegroups[i].admin;
        }
      } 
    }
  }

  /**
   * getPostfulGroups
   * 返回当前用户加入的所有组
   * @returns GroupInfo[]
   */
  public getPostfulGroups():GroupInfo[]
  {
    console.log("getPostfulGroups");
    var groups:GroupInfo[] = [];
    for (let group of this.joinedgroups)
    {
      if (group.isPostful)
      {
        let gi = this.convertUserGroupInfotoGroupInfo(group);
        groups.push(group);
      }
    }
    for (let group of this.friendviewablegroups)
    {
      if (group.isPostful)
      {
        let gi = this.convertUserGroupInfotoGroupInfo(group);
        groups.push(group);
      }
    }
    return groups;
  }
/*  public add(group:UserGroupInfo)
  {
    let addgroup = {
      "groupid":group.groupid,
      "groupname":group.groupname,
      "ischecked":false,
      "isPostful":group.isPostful
    }
    this.groups.push(addgroup)
  }
*/  
/*  public getPostfulGroups():GroupInfo[]
  {
    var groups:GroupInfo[] = [];
    for (let i = 0; i < this.groups.length; i++)
    {
      console.log("getPostfulGroups=" +this.groups[i].groupname + this.groups[i].isPostful);
      //console.log( isBoolean(this.groups[i].isPostful));
      if (this.groups[i].isPostful)
      {
        let groupinfo = {
          "groupid":this.groups[i].groupid,
          "groupname":this.groups[i].groupname
        }
        groups.push(groupinfo);
      }
    }
    return groups;
  }

  public isGroupPostful(groupid:number):boolean
  {
    var postfulGroups:GroupInfo[] = this.getPostfulGroups();
    for (let i = 0; i < postfulGroups.length; i++)
    {
      console.log("isGroupPostful:" + postfulGroups[i].groupid);
      if (groupid == postfulGroups[i].groupid)
        return true;
    }
    return false;
  }
*/  

  /*
  getFavoriteGroups
  为了运行效率，尽量只在其他页面update组信息操作的时候才调用此函数
  */
 public getFavoriteGroups():FavoriteGroupInfo[]
 {
   var groups:FavoriteGroupInfo[] = [];
   for (let i = 0; i < this.joinedgroups.length; i++)
   {
      let group = this.joinedgroups[i];
    //  console.log("UserGroupsProvider::getFavoriteGroups:joined group.name=" + group.groupname);
     if (group.isFavorite)
     {
      //var ngp:FavoriteGroupInfo = new FavoriteGroupInfo();
      /*var gp = new FavoriteGroupInfo();
      gp.groupid = group.groupid;
      gp.groupname = group.groupname;
      gp.isJoined = true;
      gp.isPostful = group.isPostful;
      gp.isAdmin = group.isAdmin;
      */     
      var gp:FavoriteGroupInfo = {
        "groupid": group.groupid,
        "groupname": group.groupname,
        "isJoined": true,
        "isPostful": group.isPostful,
        "isAdmin": group.isAdmin
      };
      groups.push(gp);
    }
  }
   
   for (let i = 0; i < this.friendviewablegroups.length; i++)
   {
      let group = this.friendviewablegroups[i];
     if (group.isFavorite)
     {
      var gp:FavoriteGroupInfo = {
        "groupid": group.groupid,
        "groupname": group.groupname,
        "isJoined": false,
        "isPostful": group.isPostful,
        "isAdmin": group.isAdmin
      };
      groups.push(gp);
      }
      
     }
     return groups;
   }
   
   /*
  isGroupFav
  返回groupid组是否是喜好组
  */
  public isGroupFav(groupid:number)
  {
    for (let group of this.joinedgroups)
    {
      if (group.groupid == groupid)
      {
        if (group.isFavorite == true)
          return true;
      }
    }
    for (let group of this.friendviewablegroups)
    {
      if (group.groupid == groupid)
      {
        if (group.isFavorite == true)
          return true;
      }
    }
    return false;
  }
  
  /**
   * isGroupMember
   * 返回当前用户是否是groupid组的成员
   * @param groupid 
   * @returns 
   */
  public isGroupMember(groupid:number):boolean
  {
    for (let i = 0; i < this.joinedgroups.length; i++)
    {
      if (groupid == this.joinedgroups[i].groupid)
        return true;
    }
    return false;
  }

  public isGroupAdmin(groupid:number):boolean
  {
    for (let i = 0; i < this.joinedgroups.length; i++)
    {
      if (groupid == this.joinedgroups[i].groupid && this.joinedgroups[i].isAdmin)
        return true;
    }
    return false;
  }

  public onRecvGroupsData_json(group_resp:JSON):UserGroupInfo[]
  { //服务器返回的所有组的isFavorite为false
    console.log("UserGroupsProvider::onRecvGroupsData_json");
    this.onUpdateGroupList(group_resp['joinedgroups'], group_resp['friendviewablegroups'], group_resp['friendvisitgroupsvisitedfrom']);

    // 读取Favorite设置
    this.loadFavGroupfromLocalStorage();
   //user groups and favorites are ready.
    return this.getAllGroups();
    
  } 

  loadFavGroupfromLocalStorage()
  {
  let favids_str = this.getFavidsfromLocalStorage(); 
  console.log("loadFavGroupfromLocalStorage:read this.globals.favsStoreKeyname ="+ this.globals.favsStoreKeyname);
  console.log("loadFavGroupfromLocalStorage:read favids_str ="+ favids_str);
  let favoriteids = []//[1,2,3];
  if (favids_str != null) //华为手机上测试，当localStorage没有存储key时，favids_str=null
  {
      for (let s of favids_str.split(";"))
      {
        this.setFavorite(Number(s));
      }
  }

}


setFavoriteofAllGroupsandSave()
{
  for (let group of this.joinedgroups)
  {
    this.setFavorite(group.groupid);
  }
  for (let group of this.friendviewablegroups)
  {
    this.setFavorite(group.groupid);
  }
  //写favids
  this.updateFavLocalStorage();
}

  /*
  setFavorite
  设置喜好标记，设置成功返回true
  */
  public setFavorite(groupid):boolean
  {
    console.log("UserGroupsProvider::setFavorite for group " + groupid.toString());
    for (let group of this.joinedgroups)
    {
        if (groupid == group.groupid)
        {
          group.isFavorite = true;
        //  this.updateNotify.addFav(groupid);          
          return true;
        }  
    }
    for (let group of this.friendviewablegroups)
    {
        if (groupid == group.groupid)
        {
          group.isFavorite = true;
        //  this.updateNotify.addFav(groupid);
          return true;
        } 
    }
    return false;
  }

  /*
  unsetFavorite
  取消喜好标记，取消成功返回true
  */
 public unsetFavorite(groupid):boolean
 {
   for (let group of this.joinedgroups)
   {
       if (groupid == group.groupid)
       {
         group.isFavorite = false;
        // this.updateNotify.removeFav(groupid);
         return true;
       }  
   }
   for (let group of this.friendviewablegroups)
   {

       if (groupid == group.groupid)
       {
         group.isFavorite = false;
        // this.updateNotify.removeFav(groupid);
         return true;
       } 
   }
   return false;
 }

 /**
  * updateUserGroups
  * 从服务器获取最新的用户组信息
  */
  public  updateUserGroups()
  {
    console.log("UserGroupsProvider:updateUserGroups");
    this.getServerUserGroups();    
  }

  /**
   * getFavids_str_from_groups
   * 返回groupid1;groupid2;...;groupidn
   * @returns 
   */
  getFavids_str_from_groups():string
  {
    let favids_str = "";
    for (let group of this.getFavoriteGroups())
    {
      favids_str += group.groupid.toString();
      favids_str += ";";
    }
    favids_str = favids_str.slice(0, favids_str.length-1);
    return favids_str;
  }

  public updateFavLocalStorage()
  {
    let favids_str = this.getFavids_str_from_groups();
    console.log("UserGroupsProvider::updateFavLocalStorage:write this.globals.favsStoreKeyname =" + this.globals.favsStoreKeyname);
    console.log("UserGroupsProvider::updateFavLocalStorage:write favids_str =" + favids_str);
    window.localStorage.setItem(this.globals.favsStoreKeyname, favids_str);
  }

  getFavidsfromLocalStorage():string
  {
    return window.localStorage.getItem(this.globals.favsStoreKeyname);
  }


  public getServerUserGroups()
  {
    //if (this.username == this.globals.dummyUsername)  //没有登录时，返回空列表
    //  return this.getCommonGroups();

      console.log("UserGroupsProvider::getServerUserGroups: get user groups from server");
      this.updateUserGroups_Promise()
      .then( (res) =>{  
        //console.log("typeof(res)=" + typeof(res));
        //console.log("res=" + res);                
        if (this.globals.bbspage.isfirstload)
        {
          console.log("UserGroupsProvider::getServerUserGroups: First Refresh at set_user");
          this.globals.bbspage.firstRefreshonUpdateFavoriteGroups();  //设置BBsPage的成员变量groups
        }
        //获取请求数量信息并提醒用户
        this.getNewRequestfromServer().then( (res) =>{  
          this.onResponseNewRequests(res);
          console.log("UserGroupsProvider::getServerUserGroups:Finished getNewRequestfromServer Promise");
          for (let i = 0; i < this.getAllGroups().length; i++)
          {
            let groupid = this.getAllGroups()[i].groupid;
            if (this.getGroupReqCnt(groupid) > 0)
            {
              alert("你有待处理的请求信息，查看【我】->【我的组】");
              break;
            }
          }
        },
        (err) =>{alert("获取请求数量信息失败");}
        );
          //  console.log("res[0]." + res.length);
          //console.info(res);       // then - 成功后执行
        });
  }

  public updateUserGroups_Promise(){  
    let username:string = this.username;
    return new Promise<string> ((resolve, reject) => {
      const params = new HttpParams().set('username', username)
      let options = {
        "withCredentials":true
      };
      this.http.get<any>(this.globals.server + 'group/getUsergroups/', options).subscribe(res => {
          console.log("OK.Received user group informations");//('%c 请求处理成功 %c', 'color:red', 'url', url, 'res', res);
          this.onRecvGroupsData_json(res);
          try{
            //if (res['status_code'] == 0)
            //console.log(res);
              resolve(JSON.stringify(res));
          }catch(error){
            reject("fail");        // 失败
          }
        }, error => {
          console.log("Fail get user group information from server");//('%c 请求处理失败 %c', 'color:red', 'url', url, 'err', error);
        reject(error);
    }); })
      /*  try{      
          onRecvGroupsData("success");    // 成功
        }
        catch(error){
            reject("fail");        // 失败
        }  */

  }

  /*
  从服务器获取待当前用户处理的请求个数信息
  */
  public getNewRequestfromServer()
  {
    console.log("UserGroupsProviders::getNewRequestfromServer");
    return new Promise<string> ((resolve, reject) => {
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'user/getnewrequest/', options).subscribe(res => {
    try{
      //if (res['status_code'] == 0)
      //console.log(res);
        resolve(JSON.stringify(res));
    }catch(error){
      reject("fail");        // 失败
    }
  }, error => {
    console.log("Fail");//('%c 请求处理失败 %c', 'color:red', 'url', url, 'err', error);
    reject(error);
  });
  });
  }

  public onResponseNewRequests(data:string) /* data:JSON*/
  {
    let jdata = JSON.parse(data);
    if (jdata['status_code'] == 0)
    {
      this.NewReqsMap.clear();
      let requests = jdata['data'];
      let totalcnt = 0;
      for (let request of requests)
      {
        let groupid = request['groupid'];
        let reqCnt = request['requestcnt'];
        totalcnt += reqCnt;
        this.NewReqsMap.set(groupid.toString(), reqCnt);
      }
      console.log("UserGroupsProviders::onResponseNewRequests");
      //alert("Get my updated total requests number is " + testcnt);
      console.log("UserGroupsProviders::onResponseNewRequests: Get my updated total requests number is " + totalcnt.toString())
    }
  }

  public getGroupReqCnt(groupid:number):number
  {
    let reqCnt = 0;
    this.NewReqsMap.forEach((value , key) =>{
      if (key == groupid.toString())
      {
        reqCnt = value;
        return reqCnt;
      }
    });
    return reqCnt;
  }

  /**
   * getNewRequestfromLocal
   * 执行getNewRequestfromServer后调用getNewRequestfromLocal来更新groups::GroupReqInfo[]的reqCnt属性值
   * @param groups 
   * @returns groups
   */
  public getNewRequestfromLocal(groups:GroupReqInfo[]):GroupReqInfo[]
  {
    for (let i = 0; i < groups.length; i++)
    {
        //保存groupsreqCnt
        let reqCnt = this.getGroupReqCnt(groups[i].group.groupid);
        groups[i].reqCnt = reqCnt;
    }
    return groups;
  }


/**
 * Helper function
 * convert FavoriteGroupInfo to GroupInfo
 * @returns 
 */
  public convertFavGPInfotoGroupInfo(group:FavoriteGroupInfo):GroupInfo
  {
    var ret:GroupInfo = {
      'groupid': group.groupid,
      'groupname': group.groupname
    };
    return ret;
  }

  public convertUserGroupInfotoGroupInfo(group:UserGroupInfo):GroupInfo
  {
    var ret:GroupInfo = {
      'groupid': group.groupid,
      'groupname': group.groupname
    };
    return ret;
  }

  public convertFriendGroupInfotoUserGroupInfo(group:FriendVisitGroupInfo):UserGroupInfo
  {
    let ugi:UserGroupInfo = {
      'groupid': group.groupid,
      'groupname': group.groupname,
      'admin': group.admin,
      'isAdmin': group.isAdmin,
      'isFavorite': group.isFavorite,
      'isJoined': group.isJoined,
      'isPostful': group.isPostful
    };
    return ugi;
  }

  public convertGroupSelUIInfotoGroupInfo(selgroup:UserGroupSelUIInfo):GroupInfo
  {
    let gi:GroupInfo = {
        'groupid':selgroup.group.groupid,
        'groupname':selgroup.group.groupname
      };
    return gi;
  }

  getUserGroupInfofromJSON(js:JSON):UserGroupInfo
  {
    let ugi:UserGroupInfo = {
      'groupid':js['groupid'],
      'groupname':js['groupname'],
      'admin':js['admin'],
      'isPostful':js['isPostful'],
      'isFavorite':js['isFavorite'],
      'isJoined': js['isJoined'],
      'isAdmin':js['isAdmin']
    };
    return ugi;
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

}