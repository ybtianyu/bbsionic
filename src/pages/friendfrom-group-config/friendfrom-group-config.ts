import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import {GroupConfig, FriendVisitFromGroup, GroupConfigPage} from '../group-config/group-config';
import { GlobalsProvider } from '../../providers/globals/globals';
/**
 * Generated class for the FriendVisitFromGroupConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class SearchGroupForFriendInfo
{
  groupid:number;
  groupname:string;
  memberNbr:number;
  admin:string;
  isprivate:boolean;
}

@IonicPage()
@Component({
  selector: 'page-friendfrom-group-config',
  templateUrl: 'friendfrom-group-config.html',
})
export class FriendVisitFromGroupConfigPage {
  group:GroupConfig;
  parentPage:GroupConfigPage;
  searchNoneText:string;
  searchgrouplist:SearchGroupForFriendInfo[];
  bbslist:number[];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider) {
      this.group = this.navParams.get('groupconfig');
      this.parentPage = this.navParams.get('groupconfigPage');
      console.log(this.group.friendVisitFromGroups.length);
      for (let g of this.group.friendVisitFromGroups)
            console.log(g.groupname);
      this.searchNoneText = "";
      this.searchgrouplist = [];
      this.bbslist = [1,2,3];
  }

  delFriendVisitFromGroup(friendfromgroup:FriendVisitFromGroup)
  {
    this.delServerFriendVisitFromGroups(friendfromgroup);
  }

  addFriendVisitFromGroup(groupid:number)
  {
    var group:SearchGroupForFriendInfo = this.getGroupofFriendInfoFromSearchResult(groupid);
    let isnew:boolean = true;
    for (let group of this.group.friendVisitFromGroups)
    {
      if (groupid == group.groupid)
      {
        isnew = false;
        console.log("addFriendVisitFromGroup:skip add new friend visit from group");
        break;
      }
    }
    if (isnew)
    {
      console.log("addFriendVisitFromGroup:Add new friend visit from group");
      let friendfromgroup:FriendVisitFromGroup = {
        'groupid':groupid,
        'groupname':group.groupname,
        'admin':group.admin
      };
      this.addServerFriendVisitFromGroups(friendfromgroup);
    }
  }

  addServerFriendVisitFromGroups(friendfromgroup:FriendVisitFromGroup)
  {
    let body = {
      'groupid':this.group.groupid.toString(),
      'friendgroupid':friendfromgroup.groupid.toString()
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/add_friendvisitfrom_group/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.onAddFriendGroupVisitFromResponse(data, friendfromgroup),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  onAddFriendGroupVisitFromResponse(data:JSON, friendfromgroup:FriendVisitFromGroup)
  {
    if (data['status_code'] == 0)
    {
      let isnew:boolean = true;
      for (let group of this.group.friendVisitFromGroups)
      {
        if (friendfromgroup.groupid == group.groupid)
        {
          isnew = false;
          console.log("addFriendGroup:skip add new friend group");
          break;
        }
      }
      if (isnew)
      {
        this.group.friendVisitFromGroups.push(friendfromgroup);
      }
    }
    else
      alert("服务器更新失败！");
  }
  
  delServerFriendVisitFromGroups(friendfromgroup:FriendVisitFromGroup)
  {
    let body = {
      'groupid':this.group.groupid.toString(),
      'friendfromgroupid':friendfromgroup.groupid.toString()
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/del_friendvisitfrom_group/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.onDeleteFriendVisitFromGroupResponse(data, friendfromgroup),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }  

  onDeleteFriendVisitFromGroupResponse(data:JSON, friendfromgroup:FriendVisitFromGroup)
  {
    if (data['status_code'] == 0)
    {
      //把this.group.friendVisitFromGroups复制到tmpgroups
      var tmpgroups:FriendVisitFromGroup[] = [];
      for (let i = 0; i < this.group.friendVisitFromGroups.length; i++)
        tmpgroups.push(this.group.friendVisitFromGroups[i]);

      this.group.friendVisitFromGroups = [];
      for (let group of this.group.friendVisitFromGroups)
      {
        if (friendfromgroup.groupid != group.groupid)
          this.group.friendVisitFromGroups.push(group);
      }
      alert("删除" + friendfromgroup.groupname + "对" + this.group.groupname + "的友邻访问成功！");
    }
    else
      alert("服务器更新失败！");
  }

  getGroupofFriendInfoFromSearchResult(groupid:number):SearchGroupForFriendInfo
  {
    for (let group of this.searchgrouplist)
    {
      if (groupid == group.groupid)
        return group;
    }
    return undefined;
  }

  /*
  搜索组
  */
  searchGroup(name:string)
  {
    this.searchgrouplist = [];
    this.searchNoneText = "";
    const params = new HttpParams()
    .set('name', name)
    this.http.get<any>(this.globals.server + 'group/searchgroupoffriend/', {params}).
    subscribe(
      data => this.onSearchResponse(data),
      err => alert("按名称搜索组失败")//console.log(JSON.stringify(err))
    );
  }

  onSearchResponse(data:JSON)
  {
    let groups_jsonarray:any[] = data['data'];
    if (groups_jsonarray.length == 0)
      this.searchNoneText = "没有搜索到匹配的组";
    for (let i = 0; i < groups_jsonarray.length; i++)
    {
      let group:SearchGroupForFriendInfo = {
        groupid:groups_jsonarray[i].groupid,
        groupname:groups_jsonarray[i].groupname,
        memberNbr:groups_jsonarray[i].memberNbr,
        admin:groups_jsonarray[i].admin,
        isprivate:groups_jsonarray[i].isprivate
      }
      this.searchgrouplist.push(group);
    }
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  ionViewDidLeave()
  {
    this.parentPage.updateFriendVisitFromGroups(this.group.friendVisitFromGroups);
    this.parentPage.updateFriendVisitFromGroupsName();
  }
}
