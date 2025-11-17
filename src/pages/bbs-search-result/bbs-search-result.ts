import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BBSItem, BBSlist} from "../../pages/bbs/bbslist";
import {BbsDetailPage} from "../../pages/bbs-detail/bbs-detail";
import {QuestionDetailPage} from "../../pages/question-detail/question-detail";
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import {UserGroupsProvider, GroupInfo, UserGroupsSel, UserGroupInfo} from "../../providers/user-groups/user-groups";
import {DBLoadMoreCtrl} from "../../pages/bbs/bbs";

/**
 * Generated class for the BbsSearchResultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-search-result',
  templateUrl: 'bbs-search-result.html',
})
/*
指定Group进行帖子搜索
*/
export class BbsSearchResultPage {
  private DisplayGroupMode:string;
  private groups:UserGroupInfo[];
  public RTCtrl:any;//Lastupdatedate_CacheRTCtrl;
  private LoadMoreCtrl:any;//CacheLoadMoreCtrl;
  private bbs:BBSlist;
  public bbslist:BBSItem[];
  public customize_code;
  public author_key;
  public postdatebegin_key;
  public postdateend_key;
  public title_key;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http: HttpClient, public user_groups:UserGroupsProvider,
              public globals:GlobalsProvider) {
      this.customize_code = this.navParams.get('customize_code');
      this.author_key = this.navParams.get('author_key');
      this.postdatebegin_key = this.navParams.get('postdatebegin_key');
      this.postdateend_key = this.navParams.get('postdateend_key');
      this.title_key = this.navParams.get('title_key');
  //    this.bbs = new MultiplyGroupsBBSlist(this.user_groups);
      this.LoadMoreCtrl = new DBLoadMoreCtrl(this/*, this.bbs*/);
  //    this.RTCtrl = new RTCtrl_BBSLastupdatedate(this, this.LoadMoreCtrl, this.http);
      this.RTCtrl.setAdvancedSearchOpt(this.customize_code, this.author_key, this.postdatebegin_key, this.postdateend_key, this.title_key);
      this.groups = this.user_groups.getAllGroups();
      this.Refresh();
  }

  Refresh()
  {
    var groups:UserGroupInfo[] = this.user_groups.getAllGroups();
    for (let i:number=0; i < groups.length; i++)
    {
        console.log("BbsSearchResultPage::Rfresh:groupid"+groups[i].groupid);
        this.RTCtrl.Refresh(groups[i].groupid);
    }
  }
  viewbbsDetail(bbs_id:number, question_issolved:any)
  {
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'bbs/pre_viewdetail/' + bbs_id + '/', options).
    subscribe(
      data => this.onResponse1(data, bbs_id, question_issolved),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
	  
  }

  onResponse1(res:JSON, bbs_id:number, question_issolved:any)
  {
    if (res['status_code'] == -1)
      alert("不能查看该组内容");
    else
    {
      if (! res['isquestion'])
      {
        console.log("BbsSearchResultPage::onResponse1: Open BbsDetailPage");
        this.navCtrl.push(BbsDetailPage, {'id':bbs_id, 'groupid':0, 'groupname':"", 'keywords':[]});
      }
      else
      {
        console.log("BbsSearchResultPage::onResponse1: Open QuestionDetailPage");
        this.navCtrl.push(QuestionDetailPage, {'id':bbs_id, 'groupid':0, 'groupname':"", 'keywords':[]});
      }
    }
  }

  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	 
    var groups:UserGroupInfo[] = this.user_groups.getAllGroups();
    for (let i:number=0; i < groups.length; i++)
    {      
        let groupid:number = groups[i].groupid;
        let group:string = groupid.toString();
        if(this.LoadMoreCtrl instanceof DBLoadMoreCtrl)
        {
          if (! this.LoadMoreCtrl.checkValidLoadMore(groupid))
            continue;
        }
        if (this.RTCtrl.hasMoreDataofGroup(groupid) == false)
            continue;
        // 前面LoadMore有效触发检查完毕
        console.log("BbsSearchResultPage::loadMore:To request ");
        this.RTCtrl.requestNextSeg(groupid);
    }
    infiniteScroll.complete();
  }
  onCloseSearchResult()
  {
    this.navCtrl.pop();
  }

}
