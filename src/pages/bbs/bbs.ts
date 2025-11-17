import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, SelectPopover, FabContainer, Content, DateTime } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BBSGroupsLastUpdate, RTCtrl_BBSLastupdatedate} from "../../pages/bbs/rtctrl-lastupdate";
import {BbsDetailPage} from '../bbs-detail/bbs-detail';
import {QuestionDetailPage} from '../question-detail/question-detail';
import {BbsNewPostEditPage} from "../bbs-new-post-edit/bbs-new-post-edit";
import {BbsNewQuestionPostPage} from "../bbs-new-question-post/bbs-new-question-post";
import {SetSortingPage} from "../set-sorting/set-sorting";
import { ChangeDetectorRef } from '@angular/core';
import {MePage} from "../me/me";
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import {BBSZoneName} from '../../../src/providers/globals/globals';
import {UserGroupsProvider, GroupInfo, UserGroupInfo} from "../../providers/user-groups/user-groups";
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import {AdvancedBbsSearchPage} from "../advanced-bbs-search/advanced-bbs-search";
import {BbsPostTargetGroupPickPage} from "../bbs-post-target-group-pick/bbs-post-target-group-pick";
import {BbsPostQuestionTargetGroupPickPage} from "../bbs-post-question-target-group-pick/bbs-post-question-target-group-pick";
import {RequestDetailPage, RequestMessage} from '../request-detail/request-detail';
import { GroupUIInfo } from '../../pages/bbs-voters-pick/bbs-voters-pick';
import { BbsUpdateNotifyProvider } from '../../providers/bbs-update-notify/bbs-update-notify';
import { ThrowStmt } from '@angular/compiler';
import { getLocaleDateTimeFormat } from '@angular/common';
import { BBSItem, BBSlist } from './bbslist';
import { SingleGroupRTCtrl } from './rtctrl-singlegroup'
import { BbsPageMultiGroupsRTCtrl } from './rtctrl-multipygroups'
import { BbsPageSearchResultRTCtrl } from './rtctrl-searchresult'
import { SpringFestival } from '../../providers/festival/springfestival';
import { SingleGroupCustomizedRTCtrl } from './rtctrl-customized-singlegroup';
import { DatesUtils } from '../../providers/dates/dates';
import { UserLogRegProvider } from '../../providers/user-log-reg/user-log-reg';
import { isType } from '@angular/core/src/type';

/**
 * Generated class for the BbsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class BBSlistResponse
{
  status_code:number;
  bbslist:BBSItem[];
}

export class FavoriteGroupInfo{
  public groupid:number;
  public groupname:string;
  public isJoined:boolean;
  public isPostful:boolean;
  public isAdmin:boolean;

  constructor() {}
}

class BBSZone
{
  public BBSZonename:BBSZoneName;
  public menuBtns:String;
}

class GroupMenuItem
{
  name:string;
  groupid:number;
  isFavorite:boolean;
  bUpdateNotify:boolean;
}

class BbsPageMenuGroups
{
  menu_long_gp_length:number;
  public short_menuGroups:GroupMenuItem[];
  public long_menuGroups:GroupMenuItem[];

  constructor(menu_long_gp_length:number)
  {
    this.menu_long_gp_length = menu_long_gp_length;
    this.short_menuGroups = [];
    this.long_menuGroups = [];
  }

  public updateMenuGroups(allgroups:UserGroupInfo[])
  {
    while (this.short_menuGroups.length > 0)  { this.short_menuGroups.pop(); }
    while (this.long_menuGroups.length > 0)  { this.long_menuGroups.pop(); }
    if (allgroups != undefined)
    {
      for (let i = 0; i < allgroups.length; i++)
      {
        let group = allgroups[i];
        let name:string;
        if ( !group.isJoined)  // 友邻组添加友邻标识
          name = group.groupname + ' [友邻]';
        else
          name = group.groupname;
        let item:GroupMenuItem = {
          'name':name,
          'groupid': group.groupid,
          'isFavorite': group.isFavorite,
          'bUpdateNotify':false //this.updateNotify.getGroupUpdateNotifyStatus(group.groupid) > 0 ? true:false
        };
        if (name.length < this.menu_long_gp_length)
          this.short_menuGroups.push(item);
        else
          this.long_menuGroups.push(item);
      }
    }
  }
}

/**
 * BbsPage
 * 使用RTCtrl进行数据请求和接收合并，具体非搜索模式使用的是SingleGroupRTCtrl，搜索模式使用BbsPageSearchResultRTCtrl
 * 搜索模式和非搜索模式之间切换的时候，要释放当前的RTCtrl,再创建新的RTCtrl
 * 按照下列顺序执行调用
      delete RTCtrl
 *    this.RTCtrl = new BbsPageMultiGroupsRTCtrl(this, this.LoadMoreCtrl, this.http);   //多组模式
      //this.RTCtrl = new BbsSearchRTCtrl(...)    //搜索模式
      this.RTCtrl.createbbslist();
      this.RTCtrl.reset();
      this.RTCtrl.setGroups([group1,...]);
      this.RTCtrl.updateAdvancedSearchOptions();  //搜索模式
      this.Refresh();  //刷新
   搜索后再搜索，使用已有的RTCtrl
      this.RTCtrl.setGroups(groups);
      this.RTCtrl.updateAdvancedSearchOptions();
	    this.Refresh();
   单组和多组切换
      delete RTCtrl
 *    this.RTCtrl = new SingleGroupRTCtrl(this, this.LoadMoreCtrl, this.http); //切换到单组
      //this.RTCtrl = new BbsPageMultiGroupsRTCtrl(this, this.LoadMoreCtrl, this.http);   //切换到多组
      this.RTCtrl.createbbslist();
      this.RTCtrl.reset();
      this.RTCtrl.setGroups(groups);
	    this.Refresh();
   单组之间切换，使用已有的RTCtrl
      this.RTCtrl.setGroups(groups);
	    this.Refresh();
   刷新实现顺序：
      this.RTCtrl.reset();
      this.LoadMoreCtrl.reset();
	    this.RTCtrl.Refresh();
 * 
 */

@IonicPage()
@Component({
  selector: 'page-bbs',
  templateUrl: 'bbs.html',
})
export class BbsPage {
  public isfirstload:boolean;
  private EnterRefresh:boolean;  // 从其他页面回到BbsPage页面是否要刷新
  public bSingleGroupMode:boolean;
  private bSearchResult:boolean;
  bCustomizedSingleGroup: boolean;
  private DisplayGroupMode:string;
  private singleGroup:UserGroupInfo;
  private bUpdateNotifyOverallStatus:number;  //0:没有更新话题；1：有更新话题
  //public cur_bbszonename:BBSZoneName;
  public BBSZone:String;
  public RTCtrl:any;//Lastupdatedate_CacheRTCtrl;
  private LoadMoreCtrl:any;//CacheLoadMoreCtrl;
  public loadMoreScrollText:string = this.globals.loadMoreScrollText;
  public jgroupsLatestdate:JSON;  // 记录各组的最新更新的帖子的更新时间
  private  menuGroups:BbsPageMenuGroups;
  private NotReadyPrompt:string;
  connectPrompt:string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http: HttpClient, public cd: ChangeDetectorRef,
              public updateNotify:BbsUpdateNotifyProvider, public user_groups:UserGroupsProvider, 
              public advancedSearchOpts:AdvancedBbsSearchOptProvider,
              public globals:GlobalsProvider, public userlogreg:UserLogRegProvider, public springfestival:SpringFestival,
              public datesUtils:DatesUtils) {
    console.log("BBsPage constructor...");
    this.DisplayGroupMode = "";
    this.NotReadyPrompt = ''; //this.globals.StartNotReadyPrompt;//用户提示信息
    this.BBSZone = "taolunqu";  // initialize default segment
    this.menuGroups = new BbsPageMenuGroups(this.globals.menu_long_gp_length);  //指定长组名的最小长度
    this.bUpdateNotifyOverallStatus = 0;
    //console.log("this.user_groups.getAllGroups()=" + this.user_groups.getAllGroups());
    console.log("BBsPage constructor: set BbsPage::isfirstload = true");
    this.isfirstload = true;
    this.EnterRefresh = false; 
    this.RTCtrl = null;
    this.LoadMoreCtrl = null;
    this.jgroupsLatestdate = JSON.parse("{}");
    this.globals.bbspage = this; // globals.bbspage完成指向BbsPage
    console.log("this.globals.bManualLogin is " + this.globals.bManualLogin);
    if (this.globals.bManualLogin == false)
      this.userlogreg.autologin();
    this.globals.isAppReady = true;    
    this.bSearchResult = false;
 } 

 onPause()
 {
  this.globals.bbsgroupsLastLatestUpdate.saveGroupsLastUpdatetimetoStorage();
 }
 onResume()
 {
  if (this.globals.isLogin == false)
  {
    return;
  }
  // resume后重新设置默认新帖的判定时间是7天前
  //更新globals.bbsgroupsLastLatestUpdate
  //设置默认新帖的判定时间是7天前
  this.globals.defaultlastupdatedate = this.datesUtils.getweekago();
  console.log("MyApp::resume: set global defaultlastupdatedate with " + this.globals.defaultlastupdatedate);
  //创建和加载和更新globals.bbsgroupsLastLatestUpdate
  if (this.globals.bbsgroupsLastLatestUpdate == null)
  {
    this.globals.bbsgroupsLastLatestUpdate = new BBSGroupsLastUpdate(this.globals);
    this.globals.bbsgroupsLastLatestUpdate.loadGroupsLastUpdatetimefromStorgage();
  }
  this.globals.bbsgroupsLastLatestUpdate.updateDeprecatedGroupDatetime();

  console.log("#############resume check globals.bbspage is defined");
  //获取请求数量信息并提醒用户
  this.user_groups.getNewRequestfromServer().then( (res) =>{  
    this.user_groups.onResponseNewRequests(res);
    console.log("MyApp::resume:Finished getNewRequestfromServer Promise");
    for (let i = 0; i < this.user_groups.getAllGroups().length; i++)
    {
      let groupid = this.user_groups.getAllGroups()[i].groupid;
      if (this.user_groups.getGroupReqCnt(groupid) > 0)
      {
        alert("你有待处理的请求信息，查看【我】->【我的组】");
        break;
      }
    }
  },
  (err) =>{alert("获取请求数量信息失败");}
  );
  let nMonth:number = this.datesUtils.getMonthNumber();
  if (nMonth == 1 || nMonth == 2)
  {
    //查询春节后刷新
    this.springfestival.getSpringFestival().then( (res) =>{  
      //this.springfestival.ProcessSpringFestivalResponse(res);
      //如果进入春节则更新BbsPage的groups,BbsPage自动刷新
      if (this.springfestival.isSpringFestival)
        this.globals.bbspage.RefreshOnResume();
        
      console.log("#############");
    },
    (err) =>{console.log("查询春节日期失败");}
    );
  }
  else
  {
      this.globals.bbspage.RefreshOnResume();
  }
 }

 firstRefresh()
 {
    //this.singleGroup or multiply groups
    this.bSearchResult = false;
    this.bSingleGroupMode = false;
    this.bCustomizedSingleGroup = false;
    this.DisplayGroupMode = "喜好头条";
    let groups:GroupInfo[] = this.converttoGroupInfos(this.user_groups.getFavoriteGroups());
    this.setFirstDBRTCtrl(groups);
    this.LoadMoreCtrl = new DBLoadMoreCtrl(this);
    this.Refresh();
 }

 public getSingleGroup():FavoriteGroupInfo
 {
   return this.singleGroup;
 }

 public setPrompt_ServerUnavailable()
 {
    this.connectPrompt = "服务器连接失败";
 }

 public clearPrompt_ServerUnavailable()
 {
    this.connectPrompt = "";
 }

 public setNotReadyPrompt_MultiplyGroupsMode()
 {
  console.log("BbsPage::setNotReadyPrompt_MultiplyGroupsMode.");
  if (this.globals.isLogin == false)
  {
    this.NotReadyPrompt = this.globals.StartNotReadyPrompt; //"你还没有登录";
    this.DisplayGroupMode = "未登陆";
  }
  else
  {
    if (this.user_groups.getJoinedUserGroups().length == 0)
    {
      this.NotReadyPrompt = "你还没有加入任何组";
    }
    else if (this.user_groups.getFavoriteGroups().length == 0)
    {//多组模式下提示添加喜好
        this.NotReadyPrompt = "请在我的组里面添加喜好";
    }
    else
    {
      this.NotReadyPrompt = '';
    }
  }
 }

 public clearNotReadyPrompt_MultiplyGroupsMode()
 {
  this.NotReadyPrompt = "";
 }

 /**
  * updateMenuGroups
  * 友邻标识的添加代码在html文件里
  */
 updateMenuGroups()
 {
  console.log("BbsPage::updateMenuGroups: update menu.");
  this.menuGroups.updateMenuGroups(this.user_groups.getAllGroups());
 }

 public firstRefreshonUpdateFavoriteGroups()
 {
  this.updateMenuGroups();
  //如果BbsPage是第一次进入，触发刷新
  console.log("bbs::firstRefreshonUpdateFavoriteGroups:this.isfirstload" + this.isfirstload);
  if (this.isfirstload)
  {
    console.log("bbs::firstRefreshonUpdateFavoriteGroups: BbsPage first loads. call BbsPage::Refresh()");
    if (this.globals.isLogin)  //检查防止退出后，进入BbsPage刷新以致isfirstload为false
    {
      console.log("BBsPage::firstRefreshonUpdateFavoriteGroups: set BbsPage::isfirstload = false");
      this.isfirstload = false;
    }
    this.firstRefresh();
  }
 }

 public onUserExit()
 {
  this.user_groups.clearUserGroups();
  this.updateMenuGroups();
  if (this.bSingleGroupMode == false)
    this.setNotReadyPrompt_MultiplyGroupsMode();
  //this.bSearchResult = false;
  this.jgroupsLatestdate = JSON.parse("{}");
  if (this.RTCtrl != null)
  {
    console.log("BbsPage::onUserExit: delete RTCtrls.");
    delete this.RTCtrl;
    this.RTCtrl = null;
  }
  if (this.LoadMoreCtrl != null)
  {
    console.log("BbsPage::onUserExit: delete LoadMoreCtrl.");
    delete this.LoadMoreCtrl;
    this.LoadMoreCtrl = null;
  }
  if (this.globals.bbsgroupsLastLatestUpdate != null)
  {
    console.log("BbsPage::onUserExit: delete globals.bbsgroupsLastLatestUpdate.");
    delete this.globals.bbsgroupsLastLatestUpdate;
    this.globals.bbsgroupsLastLatestUpdate = null;
  }
  this.globals.bManualLogin = true;
 }

 /**
  * onUpdateFavoriteGroups
  * BbsPage在非搜索模式时，重新设置RTCtrl的groups属性，
  * 同时对以下情况进行处理：
  * 当正在浏览单组时，去掉了该组的喜好设置，自动切换到多组模式
  * @returns 
  */
  public onUpdateFavoriteGroups()
  {
    
    console.log("BbsPage::onUpdateFavoriteGroups");
      this.updateMenuGroups();

      if (this.bSearchResult == false)
      {
        if (this.bSingleGroupMode)
        {
          let viewsingledeled = true;
          for (let group of this.user_groups.getAllGroups())
          {
            if (this.singleGroup.groupid == group.groupid)
            {
              viewsingledeled = false;
              console.log("BbsPage::onUpdateFavoriteGroups: Showing single group is still your group");
              break;
            }
          }
          if (viewsingledeled)
          {//当前浏览的单组已经没有在喜好组里，则把单组模式切换到多组模式,重新为RTCtrl设置groups
            console.log("BbsPage::onUpdateFavoriteGroups: Showing single group is now not your group, to switch multiply group mode");
            this.switchMultiplyGroupsMode();
            this.Refresh();
            return;
          }
        }
        else
        {// 多组模式则重新为RTCtrl设置groups
          let viewsgroupdeled = true;
          //for (let i = 0; i < this.user_groups.getFavoriteGroups().length; i++)
          //{            
          //}
          if (viewsgroupdeled)
          {
            this.setNotReadyPrompt_MultiplyGroupsMode();
            let groups = this.user_groups.getFavoriteGroups();
            this.RTCtrl.setGroups(this.converttoGroupInfos(groups));
            this.Refresh();
          }
        }
      }
      else
      { //搜索模式不更新RTCtrl,不刷新
          
      }
        
  }

  public setFirstDBRTCtrl(groups:GroupInfo[])
  {
    this.setNotReadyPrompt_MultiplyGroupsMode();
    console.log("BbsPage::switchMultiplyGroupsMode:create new BbsPageMultiGroupsRTCtrl");
    this.RTCtrl = new BbsPageMultiGroupsRTCtrl(this, this.http, this.user_groups, this.globals, this.datesUtils);
    this.RTCtrl.setGroups(groups);
    this.RTCtrl.createbbslist();
    //console.log("BbsPage::setFirstDBRTCtrl:groups count=" + this.RTCtrl.getgroups().length);
  }

  switchSingleGroup_UI(targetgroupid:number)
  {
    console.log("BbsPage:switchSingleGroup_UI: call BbsPage::switchSingleGroupMode");
    this.switchSingleGroupMode(targetgroupid);
    console.log("BbsPage:switchSingleGroup_UI: call BbsPage::Refresh");
    this.Refresh();
  }

  switchSingleGroupMode(groupid:number)
  {
    this.clearNotReadyPrompt_MultiplyGroupsMode();
    let gi: GroupInfo = {
      'groupid': groupid,
      'groupname': this.user_groups.getGroupName(groupid)
    };
    if (this.bSearchResult || this.bSingleGroupMode == false)
    {
      if (this.RTCtrl != null)
      {
        console.log("BbsPage::switchSingleGroupMode:delete RTCtrl");
        delete this.RTCtrl;
        this.RTCtrl = null;
      }
      console.log("BbsPage::switchSingleGroupMode:create new SingleGroupRTCtrl");
      this.RTCtrl = new SingleGroupRTCtrl(this, this.http, this.user_groups, this.globals, this.datesUtils);
      console.log("BbsPage::switchSingleGroupMode:create new bbs list of SingleGroupRTCtrl");
      console.log("BbsPage::switchSingleGroupMode:set groups for SingleGroupRTCtrl");
      this.RTCtrl.setGroups([gi]);
      this.RTCtrl.createbbslist();
    //  this.RTCtrl.reset();
    }
    else
    {
      //当前是单组模式
      console.log("BbsPage::switchSingleGroupMode: set target group");
      this.RTCtrl.setGroups([gi]);
    }
    this.singleGroup = this.user_groups.getGroup(groupid);
    this.bSingleGroupMode = true;
    this.bSearchResult = false;
    this.DisplayGroupMode = this.singleGroup.groupname;
    console.log('DisplayGroupMode.length=' + this.DisplayGroupMode.length);
    this.bSearchResult = false;
  }

  switchMultiplyGroupsMode_UI(event, fab: FabContainer)
  {
    this.CloseFab(event, fab);
    this.switchMultiplyGroupsMode();
    console.log("bbs::switchMultiplyGroupsMode_UI: call BbsPage::Refresh()");
    this.Refresh();
    console.log("bbs::switchMultiplyGroupsMode_UI: Finished Refresh");
  }


  switchMultiplyGroupsMode()
  {
    if (this.bSearchResult || this.bSingleGroupMode == true)
    {
      if (this.RTCtrl != null)
      {
        console.log("BbsPage::switchMultiplyGroupsMode:delete RTCtrl");
        delete this.RTCtrl;
      }
      console.log("BbsPage::switchMultiplyGroupsMode:create new BbsPageMultiGroupsRTCtrl");
      this.RTCtrl = new BbsPageMultiGroupsRTCtrl(this, this.http, this.user_groups, this.globals, this.datesUtils);
      this.RTCtrl.setGroups(this.converttoGroupInfos(this.user_groups.getFavoriteGroups()));
      this.RTCtrl.createbbslist();
      this.RTCtrl.reset();
    }
    else
    {//当前是多组模式
      
    }
    this.bSingleGroupMode = false;
    this.bSearchResult = false;
    this.DisplayGroupMode = "喜好头条";
    this.setNotReadyPrompt_MultiplyGroupsMode();
  }

  switchSearchResultMode()
  {
    this.clearNotReadyPrompt_MultiplyGroupsMode();
    if (this.bSearchResult == false || (this.bSearchResult && this.bCustomizedSingleGroup))
    {
      if (this.RTCtrl != null)
      {
        console.log("BbsPage::switchSearchResultMode:delete RTCtrl");
        delete this.RTCtrl;
      }
      console.log("BbsPage::switchSearchResultMode:create new BbsPageSearchResultRTCtrl");
      this.RTCtrl = new BbsPageSearchResultRTCtrl(this, this.http, this.advancedSearchOpts, this.user_groups, this.globals, this.datesUtils);
      this.RTCtrl.setGroups(this.advancedSearchOpts.getSelGroups());
      this.RTCtrl.createbbslist();
      this.RTCtrl.updateAdvancedSearchOptions();
    }
    else
    {//重新设置组
      this.RTCtrl.setGroups(this.advancedSearchOpts.getSelGroups());
      console.log("BbsPage::switchSearchResultMode: update advanced search options.");
      this.RTCtrl.updateAdvancedSearchOptions();
    }
    this.bSearchResult = true;
    this.bCustomizedSingleGroup = false;
    this.DisplayGroupMode = this.mysearchDisplayDescr();
    console.log(this.DisplayGroupMode);
  }

  isKeywordSearch():boolean
  {
    return (this.bCustomizedSingleGroup==false) && this.bSearchResult;
  }

  mysearchDisplayDescr():string
  {
    let text = "";
    let searchkey = JSON.parse(this.advancedSearchOpts.getAdvancedSearchOpt())['search_key'];
    let author_key = JSON.parse(this.advancedSearchOpts.getAdvancedSearchOpt())['author_key'];
    let postdatebegin_key =  JSON.parse(this.advancedSearchOpts.getAdvancedSearchOpt())['postdatebegin_key'];
    let postdateend_key =  JSON.parse(this.advancedSearchOpts.getAdvancedSearchOpt())['postdateend_key'];
    let customize_code = JSON.parse(this.advancedSearchOpts.getAdvancedSearchOpt())['customize_code'];
    //text = searchkey;  //text = "关键字：" + searchkey;
    if (this.advancedSearchOpts.getSelGroups().length == 1)
      text += this.advancedSearchOpts.getSelGroups()[0].groupname;
    if (postdatebegin_key != "" || postdateend_key != "")
      text += postdatebegin_key + '~' + postdateend_key;
    let author = "";
    if (customize_code == 1)
      author = author_key;
    else if (customize_code == 2)
      author = this.globals.username;
    if (author != "")
      text += ' '+author + "发表";
    text += "搜索结果";
    return text;
  }

  startAdvancedSearch()
  {
    this.switchSearchResultMode();
    this.Refresh();
  }

  switchSingleGroupCustomizedMode(group:GroupInfo)
  {
    this.clearNotReadyPrompt_MultiplyGroupsMode();
    // new class of RTCtrl
    if ( (this.bSearchResult && this.bCustomizedSingleGroup == false) || 
          (this.bSearchResult == false)
        )
    {
      if (this.RTCtrl != null)
      {
        console.log("BbsPage::switchSingleGroupCustomizedMode:delete RTCtrl");
        delete this.RTCtrl;
      }
      this.RTCtrl = new SingleGroupCustomizedRTCtrl(this, this.http, this.user_groups, this.globals, this.advancedSearchOpts, this.datesUtils);
      this.RTCtrl.setGroups([group]);
      this.RTCtrl.createbbslist();
      this.RTCtrl.updateAdvancedSearchOptions();
    }
    else
    {
      this.RTCtrl.setGroups([group]);
      this.RTCtrl.updateAdvancedSearchOptions();
    }
    this.bSearchResult = true;
    this.bCustomizedSingleGroup = true;
    this.DisplayGroupMode = this.mysearchDisplayDescr();
  }

  startSingleGroupCustomizedBrowse(group:GroupInfo)
  {
    console.log("BbsPage::startSingleGroupCustomizedBrowse: swtich to customized single group browse mode");
    this.switchSingleGroupCustomizedMode(group);
    this.Refresh();
  }

  /**
   * onCloseSearchResult
   * 从搜索结果模式或从单组定制模式退出到单组浏览模式或多组模式
   */
  onCloseSearchResult()
  {
    if (this.bSingleGroupMode)  //搜索前是单组模式，回到单组模式
    {
      this.switchSingleGroupMode(this.singleGroup.groupid);
    }
    else                //搜索前是多组模式，回到多组模式
    {
      this.switchMultiplyGroupsMode();
    }
    
    this.Refresh();
  }



  /**
 * resetCtrl
 * 重置RTCtrl(清除bbslist数据，初始化设置)
 * 重置LoadMoreCtrl
 */
   resetCtrl()
   {
    // this.RTCtrl.reset();
     this.LoadMoreCtrl.reset();
   }

  RefreshForNonSearch()
  {
    if (this.RTCtrl == null)
    {
      console.log("BbsPage::RefreshonResume: [Error] RTCtrl is not defined");
      alert("BbsPage出现错误");
      return;
    }
    if (this.bSearchResult == false)
    {//非搜索时刷新
      //1,2月份检测是否是春节
      let nMonth:number = this.datesUtils.getMonthNumber();
      if (nMonth == 1 || nMonth == 2)
      {
          this.springfestival.getSpringFestival().then( (res) =>{  
            //this.springfestival.ProcessSpringFestivalResponse(res);  
            this.clearPrompt_ServerUnavailable();      
            console.log("BbsPage::Refresh: call BbsPage::resetCtrl");
            //this.resetCtrl();
            console.log("BbsPage::Refresh: call RTCtrl.Refresh");
            this.RTCtrl.Refresh();
          },
          (err) =>{
            console.log("查询春节日期失败");
              this.setPrompt_ServerUnavailable();
          }
          );
        
      }
      else
      {
        console.log("BbsPage::Refresh: call BbsPage::resetCtrl");
        this.resetCtrl();
        console.log("BbsPage::Refresh: call RTCtrl.Refresh");
        this.RTCtrl.Refresh();  
      }
    }
  }

  public RefreshOnResume()
  {
    this.RefreshForNonSearch();
  }

   /**
    *   Refresh, 
    *   前提：已经创建了this.LoadMoreCtrl，this.RTCtrl，this.RTCtrl.bbs,选择RTCtrl操作的组
    */
  Refresh(refresher:any = undefined)
  {
    console.log("BbsPage::Refresh");
    if (this.RTCtrl == null)
    {
      console.log("BbsPage::Refresh: [Error] RTCtrl is not defined");
      alert("BbsPage出现错误");
      return;
    }
    //1,2月份检测是否是春节，当切换模式刷新时检测春节
    let nMonth:number = this.datesUtils.getMonthNumber();
    if (nMonth == 1 || nMonth == 2)
    {
        this.springfestival.getSpringFestival().then( (res) =>{  
          //this.springfestival.ProcessSpringFestivalResponse(res);        
          this.clearPrompt_ServerUnavailable();
          console.log("BbsPage::Refresh: call BbsPage::resetCtrl");
          //this.resetCtrl();
          console.log("BbsPage::Refresh: call RTCtrl.Refresh");
          this.RTCtrl.Refresh(refresher);
        },
        (err) =>{
          console.log("查询春节日期失败");
          if (refresher != undefined)
            refresher.complete();
            this.setPrompt_ServerUnavailable();
        }
        );
      
    }
    else
    {
      console.log("BbsPage::Refresh: call BbsPage::resetCtrl");
      //this.resetCtrl();
      console.log("BbsPage::Refresh: call RTCtrl.Refresh");
      this.clearPrompt_ServerUnavailable();
      this.RTCtrl.Refresh(refresher);
    }
  }

  /**
   * doRefresh
   * 手动刷新
   * @param refresher 
   */
   doRefresh(refresher:any)
   {
    if (this.bSearchResult == false && this.bSingleGroupMode)
    { //单组模式
      //设置当前组的最新时间作为判断帖子是否更新的依据
      for (let i = 0; i < this.RTCtrl.getgroups().length; i++)
      {
        let group:GroupInfo = this.RTCtrl.getgroups()[i];
        //let latestupdatetime = this.jgroupsLatestdate[group.groupid];  
        let latestupdatetime = "";
        try
        {
          latestupdatetime = this.RTCtrl.bbs_groups.get(Number(group.groupid)).getlist()[0].lastupdatedate;
          console.log("BbsPage::doRefresh: lastupdatetime of group " + group.groupid + " is " + latestupdatetime);
        }
        catch (e)
        {
          console.log("BbsPage::doRefresh: Exception ignored");
        }
        let numgroupid:number = Number(group.groupid);
        //console.log("latestupdatetime=" + latestupdatetime);
        if (latestupdatetime != "")
        {
          console.log("BbsPage::doRefresh: set the lastLatest update date of group" + numgroupid.toString());
          this.globals.bbsgroupsLastLatestUpdate.setLastLatestUpdatedate(numgroupid, latestupdatetime);  //设置用于判断更新帖的时间   
        }
        /*else
        {
          console.log("BbsPage::doRefresh: latestupdatetime is not got for group " + numgroupid.toString());
        }*/
      }

      
      this.Refresh(refresher);
    }
    else if (this.bSearchResult == false && this.bSingleGroupMode == false)
    {//多组模式
      if (this.user_groups.getFavoriteGroups().length == 0)
      {
      //多组模式下喜好组个数为0不会收发BBS数据
       refresher.complete();
       this.Refresh(refresher);  //1,2月份重新检测服务器连接是否中断
      }
      else
      {
        this.Refresh(refresher);
      }
    }
    else if (this.bSearchResult == true)
    { //搜索结果模式不支持刷新
      refresher.complete();
    }
    //else if 
   }

  public renewRTCtrl()
  {
    
  }

  public updateTopicsUpdateNotify(groupid:number)
  {
    this.updateOverallTopicsNotify();
    this.updateGroupMenuUpdateNotify(groupid);
  }
  public updateOverallTopicsNotify()
  {
    if (this.getOverAllTopicsNotifyStatus() == 1)
    {
      if (this.bUpdateNotifyOverallStatus == 0)
      {
        this.bUpdateNotifyOverallStatus = 1;
        this.updateOverAllUpdateNotifyUI();
      }
    }
    else
    {
      this.bUpdateNotifyOverallStatus = 0;
    }
  }

  updateOverAllUpdateNotifyUI()
  {
    alert("你有新消息");
  }

  public updateGroupMenuUpdateNotify(groupid:number)
  {
/*    for (let item of this.menuGroups)
    {
      if (item.group.groupid == groupid)
      {
        item.bUpdateNotify = this.updateNotify.getGroupUpdateNotifyStatus(groupid) > 0 ? true:false;
      }
    }
  */
  }
  /*
  getUpdateNotifyStatus
  获取喜好组的话题是否有更新，有更新返回1，没有更新返回0
  */
 public getOverAllTopicsNotifyStatus():number
 {
   for (let fav of this.user_groups.getFavoriteGroups())
   {
     if (this.updateNotify.getGroupUpdateNotifyStatus(fav.groupid) == 1)
     {
       return 1;
     }
   }
   return 0;
 }
  public pullLatestUpdates()
  {
    for (let fav of this.user_groups.getFavoriteGroups())
    {
      console.log("BbsPage::pullLatestUpdates: pull updates for group " + fav.groupid);
      this.updateNotify.pullLatestUpdates(fav.groupid);
    }
  }

  protected viewbbsDetail(groupid:number, bbs_id:number, question_issolved:any)
  {
    //标识该话题标识newupdatestatus=0
    //let i = this.RTCtrl.bbs.getitemIndex(bbs_id);
//    this.bbs.setNewUpdateTopic(this.bbs.getlist(), bbs_id, BBSlist.NO_UPDATE);
    
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'bbs/pre_viewdetail/' + bbs_id + '/', options).
    subscribe(
      data => this.onResponse1(data, groupid, bbs_id, question_issolved),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
	  
  }

  protected onResponse1(res:JSON, groupid:number, bbs_id:number, question_issolved:any)
  {
    if (res['status_code'] == -1)
      alert("不能查看该组内容");
    else
    {
      let keywords = [];
      let bhasKeywords:boolean;
      if ((this.RTCtrl instanceof BbsPageSearchResultRTCtrl) && this.RTCtrl.advancedSearchOpts.searchkeys().length > 0)
      {
        bhasKeywords = true;
        for (let i = 0; i < this.RTCtrl.advancedSearchOpts.searchkeys().length; i++)
        {
          keywords.push(this.RTCtrl.advancedSearchOpts.searchkeys()[i]);
          console.log(keywords[i]);
        }
      }  
      else
        bhasKeywords = false;
      console.log("bbs::onResponse1: debug: haskeyword=" + bhasKeywords);
      if (! res['isquestion'])
      {
        console.log("bbs::onResponse1: Open BbsDetailPage");
        this.navCtrl.push(BbsDetailPage, {'id':bbs_id, 'groupid':groupid, 'groupname':this.user_groups.getGroupName(groupid),
                                          'keywords':keywords}
                          );
      }
      else
      {
        console.log("bbs::onResponse1: Open QuestionDetailPage");
        this.navCtrl.push(QuestionDetailPage, {'id':bbs_id, 'groupid':groupid, 'groupname':this.user_groups.getGroupName(groupid),
                                          'keywords':keywords}
                        );
      }
    }
  }
/*
  clickNewPost(type:number)
  {
    if (this.globals.username == this.globals.dummyUsername) //没有登录
    {
      console.log("BbsNewPostEditPage::newPost: user has not logged in. Forbidden to post");
      alert("你还没有登录，不能发帖");
      return;
    }
    let targetgroupid:number = -1;
    let targetgroupname:string = "";
    if (this.bSingleGroupMode)
    {
      if (this.singleGroup.isPostful)
      {
        targetgroupid = this.singleGroup.groupid;
        targetgroupname = this.singleGroup.groupname;
        this.navCtrl.push(BbsNewPostEditPage, {'groupid':targetgroupid, 'groupname':targetgroupname});  
      }
      else
      {
        alert("你在当前查看的组内无权限发帖");
        return;
      }
    }
    else
    {
      var groups:GroupInfo[] = this.user_groups.getPostfulGroups();  // to do:type is wrong
      console.log("clickNewPost:groups.length=" + groups.length);
      if (groups.length == 1)
      {//用户只加入了一个组，直接到发帖编辑
        targetgroupid = groups[0].groupid;
        targetgroupname = groups[0].groupname;
        console.log("targetgroupname=" + targetgroupname);
        this.navCtrl.push(BbsNewPostEditPage, {'groupid':targetgroupid, 'groupname':targetgroupname, 'bbspage':this});
      }
      else if (groups.length > 1)
      {
        console.log("bbs::clickNewPost: Multiply postful groups, goto page BbsPostTargetGroupPickPage");
        this.navCtrl.push(BbsPostTargetGroupPickPage, {'bbspage':this});
      }
    }
  }*/

  clickNewPost()
  {
    this.NewPost(1);
  }
  
  clickNewQuestion()
  {
    this.NewPost(2);
  }

  NewPost(type:number)
  {
    if (this.globals.username == this.globals.dummyUsername) //没有登录
    {
      console.log("BbsPage::clickNewPost: user has not logged in. Forbidden to post");
      if (type == 1)
        alert("你还没有登录，不能发帖");
      else if (type == 2)
        alert("你还没有登录，不能提问");
      return;
    }
    let targetgroupid:number = -1;
    let targetgroupname:string = "";
    if (this.bSingleGroupMode && this.bSearchResult == false)
    {
      if (this.singleGroup.isPostful)
      {
        targetgroupid = this.singleGroup.groupid;
        targetgroupname = this.singleGroup.groupname;
        if (type == 1)
          this.navCtrl.push(BbsNewPostEditPage, {'groupid':targetgroupid, 'groupname':targetgroupname});  
        else if (type == 2)
          this.navCtrl.push(BbsNewQuestionPostPage, {'groupid':targetgroupid, 'groupname':targetgroupname});  
      }
      else
      {
        alert("你在当前查看的组内无权限发帖");
        return;
      }
    }
    else if (this.bSearchResult == true)
    {//搜索模式
      this.postselectedgroup(type, targetgroupid, targetgroupname);
    }
    else if (this.bSearchResult == false && this.bSingleGroupMode == false)
    {//多组模式
      this.postselectedgroup(type, targetgroupid, targetgroupname);
    }
  }

  postselectedgroup(posttype:number, targetgroupid:number, targetgroupname:string)
  {
    var groups = this.user_groups.getPostfulGroups();
    console.log("bbs::clickNewQuestion:groups.length=" + groups.length);
    if (groups.length == 1)
    {
      targetgroupid = groups[0].groupid;
      targetgroupname = groups[0].groupname;
      console.log("targetgroupname=" + targetgroupname);
      if (posttype == 1)
        this.navCtrl.push(BbsNewPostEditPage, {'groupid':targetgroupid, 'groupname':targetgroupname});
      else if (posttype == 2)
        this.navCtrl.push(BbsNewQuestionPostPage, {'groupid':targetgroupid, 'groupname':targetgroupname, 'bbspage':this});
    }
    else if (groups.length > 1)
    {
      console.log("bbs::clickNewQuestion: Multiply postful groups, goto page BbsPostTargetGroupPickPage");
      if (posttype == 1)
        this.navCtrl.push(BbsPostTargetGroupPickPage, {'bbspage':this});
      else if (posttype == 2)
        this.navCtrl.push(BbsPostQuestionTargetGroupPickPage, {'bbspage':this});
    }
  }
 /**
  * getViewGroups
  * BbsPage里当前显示和读取数据的组，同时也是喜好组
  * @returns GroupInfo[]
  */
  getViewGroups():GroupInfo[]
  {
    var groups:GroupInfo[] = [];
    if (this.bSearchResult == false)
    {
      if (this.bSingleGroupMode)    // 单组模式
      {
        let gisinglegroup = this.user_groups.convertUserGroupInfotoGroupInfo(this.singleGroup);
        groups.push(gisinglegroup);
      }
      else                          //多组模式
      {
        let favgroups = this.user_groups.getFavoriteGroups();
        for (let i = 0; i < favgroups.length; i++)
        {
          let gifavgroups = this.user_groups.convertFavGPInfotoGroupInfo(favgroups[i]);
          groups.push(gifavgroups);
        }
      }
    }
    else
    {//搜索模式
      groups = this.advancedSearchOpts.getSelGroups();
    }
    for (let group of groups)
    {
      console.log("getViewGroups:" + group.groupname);
    }
    return groups;
  }


 /**
  * loadMore
  * Actually in testing, loadMore will be triggered twice when scrolling down list in Ionic
  * @param infiniteScroll 
  */
  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	 
    this.RTCtrl.requestNextSeg(infiniteScroll);
  //  infiniteScroll.complete();
  }


  SetSorting()
  {
    this.navCtrl.push(SetSortingPage, {'bbspage':this});
  }

  AdvancedSearch(event, fab: FabContainer)
  {
    this.CloseFab(event, fab);
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录");
      return;
    }
    this.navCtrl.push(AdvancedBbsSearchPage, {'bbspage':this});
  }


  CloseFab(event, fab: FabContainer) {
    fab.close();
}

viewrequestDetail(request:RequestMessage)
{
  this.navCtrl.push(RequestDetailPage, {'request':request});
}

converttoGroupInfos(groups:FavoriteGroupInfo[]):GroupInfo[]
{
  let gis:GroupInfo[] = [];
  for (let i = 0; i < groups.length; i++)
  {
    gis.push(
      {
        'groupid': groups[i].groupid,
        'groupname': groups[i].groupname
      }
    )
  }
  return gis;
}


  /**
   * setRefreshCmd
   * 设置标记，非搜索结果时进入BbsPage自动刷新
   */
   public setRefreshCmd()
   {
       this.EnterRefresh = true;
   }

ionViewDidEnter() {
  console.log("###################");
  console.log('ionViewDidEnter BbsPage');
  console.log("###################");
  if (this.globals.isLogin == false)
  {
    console.log("BbsPage::ionViewDidEnter: user has not login.")
    return;
  }
  let brefreshed = false;
  //刷新并清除进入页面刷新标记
  if (this.EnterRefresh)
  {
    console.log("BbsPage::ionViewDidEnter: BbsPage.EnterRefresh is set true");
    this.RefreshForNonSearch();  //刷新已经包含了春节检测
    brefreshed = true;
    this.EnterRefresh = false;    //清除进入页面刷新标记
  }

  //1,2月份检测是否是春节
  let nMonth:number = this.datesUtils.getMonthNumber();
  if (nMonth == 1 || nMonth == 2)
  {
    // 如果前面没有刷新，并且是否是春节已经变化，刷新页面
    if (brefreshed == false)  
    {
      console.log("BbsPage::ionViewDidEnter: detect spring festival");
      let oldisspringfestival = this.springfestival.isSpringFestival;
      this.springfestival.getSpringFestival().then( (res) =>{  
        //this.springfestival.ProcessSpringFestivalResponse(res);        
        if (this.springfestival.isSpringFestival)//if (oldisspringfestival != this.springfestival.isSpringFestival)
        {
          console.log("BbsPage::ionViewDidEnter: spring festival Refresh");
          if (this.isfirstload)
            console.log("BbsPage::ionViewDidEnter: skip First Refresh due to it's regularly up to UserGroupsProvider set_user");
          else
            this.RefreshForNonSearch();
          //this.RefreshForNonSearch();
          brefreshed = false;   
        }
        else
        {
          console.log("BbsPage::ionViewDidEnter: not spring festival, do not Refresh");
        }
      },
      (err) =>{console.log("查询春节日期失败");}
      );
    }
  }
}

}

export class DBLoadMoreCtrl
{
  public DBLoadtimestamp:number;
  private DBinterval:number;
  constructor(private bbspage:any/*, private bbs:BBSlist*/)
  {
    console.log("constructor DBLoadMoreCtrl");
    this.DBLoadtimestamp = Date.now();
    this.DBinterval = 1000;
  }
  
  /**
   * 超过时间间隔返回true,否则返回false
   * @returns 
   */
  public intervalCheck():boolean
  {

    if (Date.now() - this.DBLoadtimestamp < this.DBinterval)
    { 
      console.log("Skip loadmore, because there is interval before the last loadmore");
      return false;
    }
    else
    {
       console.log("DBLoadMoreCtrl::intervalCheck: ok Datediff=");
      console.log(Date.now() - this.DBLoadtimestamp);
      //设置DB加载更多的时间间隔起始时间
      this.DBLoadtimestamp = Date.now();
      return true;
    }
  }

  public checkValidLoadMore(groupid:number) : boolean
  {
    console.log("bbs::DBLoadMoreCtrl::checkValidLoadMore");
    let group:string = groupid.toString();

    
      {
        if (this.bbspage.RTCtrl.hasReceivedLastData(groupid))
        {
          console.log("2222222222222");
          this.DBLoadtimestamp = Date.now();
          return true;
        }
        else
        {
          console.log("3333333333333");
          return false;
        }
      }
    }

    public reset()
    {
      this.DBLoadtimestamp = Date.now();
    }
}
