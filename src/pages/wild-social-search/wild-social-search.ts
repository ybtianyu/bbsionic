import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Popover, PopoverController } from 'ionic-angular';
import { WideSocialPage } from '../wide-social/wide-social';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GroupTag } from '../group-config/group-config';
import { DatesUtils } from '../../providers/dates/dates';
import { SpringFestival } from '../../providers/festival/springfestival';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { GlobalsProvider } from '../../providers/globals/globals';
import { UserRequestConfirmPage } from '../user-request-confirm/user-request-confirm';
import { BrowseOneTribeTopicsPage } from '../browse-one-tribe-topics/browse-one-tribe-topics';
import { GroupInfoPage } from '../group-info/group-info';
import { RequestFriendGroupTargetPage } from '../request-friend-group-target/request-friend-group-target';
import { RTCtrl_DBSearchGroupsName } from './rtctrl-searchrlt';
import { List } from '../bbs/list';

/**
 * Generated class for the WildSocialSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 class TribleGroupsList extends List
 {
   constructor()
   {
     super();
   }
 
   public convertJSONstoItems(data:JSON[]):any[]
   {
     var list:TribeSearchInfo[] = [];
     for (let i = 0; i < data.length; i++)
     {
       let group:TribeSearchInfo = {
         groupid:data[i]['groupid'],
         groupname:data[i]['groupname'],
         memberNbr:data[i]['memberNbr'],
         admin:data[i]['admin'],
         ismember:data[i]['ismember'],
         isprivate:data[i]['isprivate'],
         isbrowsable:data[i]['isbrowsable']
       }
       list.push(group);
     }
     return list;
   }
 }
 
 export class TribeSearchInfo
 {
   groupid:number;
   groupname:string;
   memberNbr:number;
   admin:string;
   ismember:boolean;
   isprivate:boolean;
   isbrowsable:boolean;
 }

@IonicPage()
@Component({
  selector: 'page-wild-social-search',
  templateUrl: 'wild-social-search.html',
})
export class WildSocialSearchPage {
  name_input:string;
  private RTCtrl:any;  //SearchResultRTCtrl;
  searchNoneText: string;
  searchCode:number;
  searched_name:string = "";
  groupTags:GroupTag[];
  //public popover_confirm:Popover;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient, 
              public user_groups:UserGroupsProvider, public globals:GlobalsProvider, public popoverCtrl:PopoverController,
              public springfestival:SpringFestival, public datesUtils:DatesUtils) {

    //this.groupTags = ['音乐','旅游','亲子','诗词','小说','电影电视剧','体育','母婴','早教','天文','数学','化学','物理','语文','历史','生物','英语','美术','户外','健身','游戏','家庭','社区'];
    this.searchCode = 0;
    this.name_input = "";
    this.searchNoneText = "没有搜索到匹配的组";
    this.groupTags = null;
    this.getSystemGroupTags();
    console.log("WildSocialSearchPage constructor......");
  }

  getSystemGroupTags()
  {
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'grouptag/getallservertags/', options).
    subscribe(
      data => this.groupTags = data['tags'],
      err => console.log("获取系统组标签失败!")
    );
  }
  
  searchGroups()
  {
    console.log("WildSocialSearchPage::searchGroups: search=" + this.searched_name);
    if (this.searchCode == 0)
    {
      this.searchGroupByName(this.searched_name);
    }
  }

  searchGroupByName(name:string)
  {
    this.searched_name = name;
    if (name == "") return;
    this.searchCode = 0;
    if (this.RTCtrl != null)
    {
      delete this.RTCtrl;
      this.RTCtrl = null;
    }
    this.RTCtrl = new RTCtrl_DBSearchGroupsName(this, this.http, this.globals.server);
    this.RTCtrl.create_searchrlt();
    this.startsearchGroupsByName(name);
  }
  
  switchWideSocialHome()
  {
    this.navCtrl.setRoot(WideSocialPage);
  }


  startsearchGroupsByName(name:string)
  {
    this.RTCtrl.setSearchGroupName(name);
    this.RTCtrl.Refresh();
  }

  startsearchGroupsByTag(groupTag:string)
  {
    //this.RTCtrl.sendReadSegRequest();
  }

  loadMore(infiniteScroll)
  {
    console.log("WildSocialSearchPage Entering loadMore");	 

    // 前面LoadMore有效触发检查完毕
    this.RTCtrl.requestNextSeg(infiniteScroll);
  }

  viewGroupInfoPage(group:TribeSearchInfo)
  {
    console.log("viewGroupSearhInfo:group=" + group.groupid + ":" + group.groupname);
    this.navCtrl.push(GroupInfoPage, 
      {'group':group, 'brief':true}
    );
  }


  enterGroupbbs(group:TribeSearchInfo)
  {
    let param = {
      'group': group
    };
    this.navCtrl.push(BrowseOneTribeTopicsPage, param);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter WildSocialSearchPage');
    console.log("WildSocialSearchPage::ionViewDidEnter: detect spring festival");
    this.searchGroups();
    //1,2月份检测是否是春节，当切换模式刷新时检测春节
    let nMonth:number = this.datesUtils.getMonthNumber();
    if (nMonth == 1 || nMonth == 2)
    {
        this.springfestival.getSpringFestival().then( (res) =>{  
          //this.springfestival.ProcessSpringFestivalResponse(res);        
        },
        (err) =>{console.log("WildSocialSearchPage::ionViewDidEnter: detect spring festival error");}
        );
      
    }
  }
  
}
