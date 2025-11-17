import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BBSItem, BBSlist } from '../bbs/bbslist';
import {BbsDetailPage} from '../bbs-detail/bbs-detail';
import {QuestionDetailPage} from '../question-detail/question-detail';
import {TribeSearchInfo, WildSocialSearchPage} from '../wild-social-search/wild-social-search';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { GlobalsProvider } from '../../providers/globals/globals';
import { SpringFestival } from '../../providers/festival/springfestival';
import { DatesUtils } from '../../providers/dates/dates';
import { SearchResultRTCtrl } from '../wild-social-search/rtctrl-searchrlt';
import { BrowseOneTribeTopicsPage } from '../browse-one-tribe-topics/browse-one-tribe-topics';
import { GroupInfoPage } from '../group-info/group-info';

/**
 * Generated class for the WideSocialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/*
GroupSearchInfo
存放HotTopic的话题，都是来自公开组
*/
class GroupSearchInfo
{
  groupid:number;
  groupname:string;
  memberNbr:number;
  isprivate:boolean;
}

export class MultiplyGroupsBBSlist extends BBSlist
{
  constructor(user_groups:UserGroupsProvider, public datesUtils:DatesUtils)
  {
    super(user_groups, datesUtils);
  }

}
/*
class RTCtrl_HotTopics extends SearchResultRTCtrl
{
  constructor(public listpage:any, public list:BBSlist, public http:HttpClient)
    {
      super(http);
    }
  
  public sendReadSegRequest(UICtrl:any = undefined)
  {
    super.sendReadSegRequest();
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'bbs/getHotTopics/' + this.nseg + '/', options).
    subscribe(
      data => (this.listpage.hasgotHottopics = true) && this.ProcessServerResponse(data, UICtrl),
      err => (this.listpage.hasgotHottopics = false) && console.log("WideSocialPage::getHotTopics:Error response")
    );
  }

}
*/

class RTCtrl_TopPubTribes extends SearchResultRTCtrl
{
  constructor(public globals:GlobalsProvider, public http:HttpClient)
    {
      super(http);
    }
  
  public sendReadSegRequest(UICtrl:any = undefined)
  {
    super.sendReadSegRequest();
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/getrecommendGroups/' + this.nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, UICtrl),
      err => console.log("RTCtrl_TopPubTribes::getrecommendGroups:Error response")
    );
  }

  ProcessServerResponse(data, UICtrl)
  {
    super.ProcessServerResponse(data, UICtrl);
    /*this.globals.recommendtribes = [];
    for (let i = 0; i < this.searchrlts.getlist().length; i++)
      this.globals.recommendtribes
      */
      if (this.globals.widesocialRTCtrl == null)
      {
        this.globals.widesocialRTCtrl = new RTCtrl_TopPubTribes(this.globals, this.http);
        this.globals.widesocialRTCtrl.create_searchrlt();
      }
      this.globals.widesocialRTCtrl.getsearchrlts().Merge(data['data']);
  }

  public copy_searchrlts_from(superRTCtrl)
  {
    for (let i = 0; i < superRTCtrl.getsearchrlts().getlist().length; i++)
    {
      this.searchrlts.Merge(superRTCtrl.getsearchrlts().getlist());
    }
  }
}


@IonicPage()
@Component({
  selector: 'page-wide-social',
  templateUrl: 'wide-social.html',
})
export class WideSocialPage {
  private searchNoneText:string;
  private name_input:string;
  private bfocusSearch:boolean = false;
  private list:BBSItem[];
  private bbs:MultiplyGroupsBBSlist;
  private RTCtrl:RTCtrl_TopPubTribes = null;
  public grouplist:GroupSearchInfo[];
  hasgotHottopics: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider, user_groups:UserGroupsProvider, 
              public springfestival:SpringFestival, public datesUtils:DatesUtils) {
    console.log("WideSocialPage constructor");
    this.searchNoneText = "";
    if (this.globals.widesocialRTCtrl == null)
    {
      console.log("WideSocialPage constructor globals.widesocialRTCtrl is null");
      this.RTCtrl = new RTCtrl_TopPubTribes(this.globals, this.http);
      this.RTCtrl.create_searchrlt();
      this.RTCtrl.Refresh();
    }
    else
      console.log("WideSocialPage constructor globals.widesocialRTCtrl is not null");

  }

  protected viewbbsDetail(groupid:number, bbs_id:number, question_issolved:any)
  {

    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'bbs/pre_viewdetail/' + bbs_id + '/', options).
    subscribe(
      data => console.log("this.onResponse1(data, groupid, bbs_id, question_issolved)"),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
	  
  }
  
  viewGroupInfoPage(group:TribeSearchInfo)
  {
    console.log("viewGroupSearhInfo:group=" + group.groupid + ":" + group.groupname);
    this.navCtrl.push(GroupInfoPage, 
      {'group':group, 'brief':true}
    );
  }

  enterGroupbbs(groupid:number)
  {
    const params = new HttpParams().set('groupid', groupid.toString());
    let options = {
      "withCredentials":true,
      "params":params
    };
    this.http.get<any>(this.globals.server + 'group/getGroupInfo/', options).
    subscribe(
      data => this.ongetGroupInfo(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  protected ongetGroupInfo(res:JSON)
  {
    if (res['status_code'] != 0)
    {
      alert("获取目标信息失败");
      return;
    }
    else
    {
      let group:TribeSearchInfo = res['data'][0];
      let param = {
        'group': group
      };
      console.log("ongetGroupInfo" + group.groupid);
      if (group.isprivate == false)
      {
        console.log("WideSocialPage::ongetGroupInfo: enter public group" + group.groupid);
        this.navCtrl.push(BrowseOneTribeTopicsPage, param);
      }
      else
      {
        alert("该组目前是私有组");
      }
    }
  }
  onUpdateSearchResultText()
  {
    // empty
  }
  blurSearchInput()
  {
    this.bfocusSearch = false;
  }
  focusSearchInput()
  {
    this.bfocusSearch = true;
    //this.navCtrl.push(WildSocialSearchPage);
    this.navCtrl.setRoot(WildSocialSearchPage);
  }
  Refresh()
  {
    this.RTCtrl.Refresh();
  }


  doRefresh(refresher)
  {
    //this.Refresh();
    refresher.complete();
  }

  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	
    infiniteScroll.complete();
  }



  ionViewDidLeave() {
    console.log('ionViewDidLeave WideSocialPage');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter WideSocialPage');
    console.log("WideSocialPage::ionViewDidEnter: detect spring festival");
    //1,2月份检测是否是春节，当切换模式刷新时检测春节
    let nMonth:number = this.datesUtils.getMonthNumber();
    if (nMonth == 1 || nMonth == 2)
    {
        this.springfestival.getSpringFestival().then( (res) =>{  
          //this.springfestival.ProcessSpringFestivalResponse(res);        
        },
        (err) =>{console.log("WideSocialPage::ionViewDidEnter: detect spring festival error");}
        );
      
    }
  }
}
