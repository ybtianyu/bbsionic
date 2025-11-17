import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Popover, PopoverController } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BBSlist} from "../../pages/bbs/bbslist";
import {BbsDetailPage} from '../bbs-detail/bbs-detail';
import {BBSItem} from '../bbs/bbslist';
import {QuestionDetailPage} from '../question-detail/question-detail';
import { BbsNewPostEditPage } from '../bbs-new-post-edit/bbs-new-post-edit';
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import { BbsNewQuestionPostPage } from '../bbs-new-question-post/bbs-new-question-post';
import { GroupInfo, UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { BBSGroupsLastUpdate, RTCtrl_BBSLastupdatedate } from '../bbs/rtctrl-lastupdate';
import { DBLoadMoreCtrl } from '../bbs/bbs';
import { DatesUtils } from '../../providers/dates/dates';
import { SpringFestival } from '../../providers/festival/springfestival';
import { TribeSearchInfo } from '../wild-social-search/wild-social-search';
import { UserRequestConfirmPage } from '../user-request-confirm/user-request-confirm';
//import { ThrowStmt } from '@angular/compiler';
/**
 * Generated class for the BrowseOneTribeTopicsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/*
export class BBSItem
{
  viewcount:number;
  lastupdatedate:string;
  id:number;
  title:string;
  groupid:number;
  groupname:string;
  authorname:string;
  lastupdateuser:string;
  isvote:boolean;
  question_issolved:number;  // -1, 0, 1
  public newupdatestatus:number;  // 0, 1,2
};*/

/**
 * BBSlist has a list of bbs items which are in sequence of lastupdate. 
 */

@IonicPage()
@Component({
  selector: 'page-browse-one-tribe-topics',
  templateUrl: 'browse-one-tribe-topics.html',
})
export class BrowseOneTribeTopicsPage {
  public RTCtrl:any;//Lastupdatedate_CacheRTCtrl;
  private LoadMoreCtrl:any;//CacheLoadMoreCtrl;
  private bbs:BBSlist;
  public bbslist:BBSItem[];
  public customize_code;
  public author_key;
  public postdatebegin_key;
  public postdateend_key;
  public title_key;
  public popover_confirm:Popover;
  bGroupMember:boolean = false;
  group:TribeSearchInfo;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, 
              public globals:GlobalsProvider, public user_groups:UserGroupsProvider, public popoverCtrl:PopoverController,
              public springfestival:SpringFestival, public datesUtils:DatesUtils) 
  {
    console.log("BrowseOneTribeTopicsPage constructor..........");
    this.group = this.navParams.get('group');
    this.popover_confirm = null;
    if (this.globals.isLogin)
      this.bGroupMember = this.user_groups.isGroupMember(this.group.groupid);
        //创建和加载和更新globals.bbsgroupsLastLatestUpdate
        if (this.globals.bbsgroupsLastLatestUpdate == null)
        {
          this.globals.bbsgroupsLastLatestUpdate = new BBSGroupsLastUpdate(this.globals);
          this.globals.bbsgroupsLastLatestUpdate.loadGroupsLastUpdatetimefromStorgage();
        }
        this.globals.bbsgroupsLastLatestUpdate.updateDeprecatedGroupDatetime();
    this.RTCtrl = new RTCtrl_BBSLastupdatedate(this.http, this.user_groups, this.globals, this.datesUtils);
    let group:GroupInfo = {
      'groupid': this.group.groupid,
      'groupname': this.group.groupname
    };
    this.RTCtrl.setGroups([group]);
    this.RTCtrl.createbbslist();
    this.Refresh();
  }

  jointoGroup()
  {
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录，无法加入");
      return;
    }
    if (this.bGroupMember)
    {
        alert("你已经在该组");
        return;
    }
    else if (this.group.isprivate == false)
    {
        let params = {
          'username':this.globals.username,
          'groupid':this.group.groupid
        };
        let options = {
          "withCredentials":true
        };
        this.http.post<any>(this.globals.server + 'group/joingroup/', this.encodeHttpParams(params), options).subscribe(
          data => this.onDirectJoinResponse(data, this.group.groupid),
          err => alert("请求服务器失败")//console.log(JSON.stringify(err))
        );
    }
  }
  
  onDirectJoinResponse(data:JSON, groupid:number)
  {
    console.log("onDirectJoinResponse:status_code=" + data['status_code'].toString());
    if (data['status_code'] == -1)
    {
      alert("添加组失败，请稍后尝试");
    }
    else if (data['status_code'] == -2)
    {
      alert("你已经在该组");
    }
    else if (data['status_code'] == 0)
    {
      
      alert("添加组成功！"); //添加成功
      this.bGroupMember = true;
      // 添加成功后重新从服务器我的所有的组
      this.user_groups.updateUserGroups_Promise()
      .then( (res) =>{
        if (this.globals.bbspage != undefined)
          this.globals.bbspage.onUpdateFavoriteGroups();
      });
      this.RTCtrl.Refresh();  //更新人数数据显示
    }
    else
    {
    }
  }

  doRefresh(refresher:any)
  {
    this.Refresh(refresher);
  }

  Refresh(refresher = undefined)
  {
        console.log("BrowseOneTribeTopicsPage::Rfresh:groupid"+this.group.groupid);
        if (this.RTCtrl == null)
        {
          console.log("BrowseOneTribeTopicsPage::Refresh: [Error] RTCtrl is not defined");
          alert("BrowseOneTribeTopicsPage出现错误");
          return;
        }
        //1,2月份检测是否是春节，当切换模式刷新时检测春节
        let nMonth:number = this.datesUtils.getMonthNumber();
        if (nMonth == 1 || nMonth == 2)
        {
            this.springfestival.getSpringFestival().then( (res) =>{  
              //this.springfestival.ProcessSpringFestivalResponse(res);        
              console.log("BrowseOneTribeTopicsPage::Refresh: call BbsPage::resetCtrl");
              //this.resetCtrl();
              console.log("BrowseOneTribeTopicsPage::Refresh: call RTCtrl.Refresh");
              this.RTCtrl.Refresh(refresher);
            },
            (err) =>{console.log("查询春节日期失败");}
            );
          
        }
        else
        {
          console.log("BrowseOneTribeTopicsPage::Refresh: call RTCtrl.Refresh");
          this.RTCtrl.Refresh(refresher);
        }
  }

  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	
    this.RTCtrl.requestNextSeg(infiniteScroll);
  }

  viewbbsDetail(groupid:number, bbs_id:number, question_issolved:any)
  {
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'bbs/pre_viewdetail/' + bbs_id + '/', options).
    subscribe(
      data => this.onResponse1(data, groupid, bbs_id, question_issolved),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
	  
  }

  protected onResponse1(res:JSON, groupid, bbs_id:number, question_issolved:any)
  {
    if (res['status_code'] == -1)
      alert("不能查看该组内容");
    else
    {
      if (! res['isquestion'])
      {
        console.log("bbs::onResponse1: Open BbsDetailPage");
        this.navCtrl.push(BbsDetailPage, {'id':bbs_id, 'groupid':groupid, 'groupname':this.group.groupname, 'keywords':[]});
      }
      else
      {
        console.log("bbs::onResponse1: Open QuestionDetailPage");
        this.navCtrl.push(QuestionDetailPage, {'id':bbs_id, 'groupid':groupid, 'groupname':this.group.groupname, 'keywords':[]});
      }
    }
  }

  clickNewPost()
  {
    if (this.globals.isLogin == false)
    {
      alert("你还没有登录，不能发帖");
      return;
    }
    if (this.user_groups.getGroup(this.group.groupid).isPostful)
    {
      let targetgroupid = this.group.groupid;
      let targetgroupname = this.group.groupname;
      this.navCtrl.push(BbsNewPostEditPage, {'groupid':targetgroupid, 'groupname':targetgroupname});  
    }
    else
    {
      alert("你在当前查看的组内无权限发帖");
      return;
    }
  }

  clickNewQuestion()
  {
      if (this.globals.isLogin == false)
      {
        alert("你还没有登录，不能提问");
        return;
      }
      if (this.user_groups.getGroup(this.group.groupid).isPostful)
      {
        let targetgroupid = this.group.groupid;
        let targetgroupname = this.group.groupname;
        this.navCtrl.push(BbsNewQuestionPostPage, {'groupid':targetgroupid, 'groupname':targetgroupname});  
      }
      else
      {
        alert("你在当前查看的组内无权限提问");
        return;
      }

  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave BrowseOneTribeTopicsPage');
    if (this.popover_confirm != null)
    {
      //console.log("WildSocialSearchPage::ionViewDidLeave: to dismiss popover pointing to UserRequestConfirmPage");
      this.popover_confirm.dismiss();
    }
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  
}
