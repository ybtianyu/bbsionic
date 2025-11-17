import {HttpClient, HttpParams} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import {UserGroupsProvider} from "../../providers/user-groups/user-groups";
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { Injectable } from '@angular/core';
import {MePage} from "../../pages/me/me";
import {HomePage} from "../../pages/home/home";
import { timeout } from 'rxjs/operators/timeout';
import { SpringFestival } from '../festival/springfestival';
import { LoginPage } from '../../pages/login/login';
import { BBSGroupsLastUpdate } from '../../pages/bbs/rtctrl-lastupdate';
import { DatesUtils } from '../dates/dates';

/*
  Generated class for the UserLogRegProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserLogRegProvider {
  
  constructor(public http: HttpClient, public globals:GlobalsProvider,
              private user_groups:UserGroupsProvider, public advancedSearchOpts:AdvancedBbsSearchOptProvider,
              public springfestival: SpringFestival, public datesUtils:DatesUtils) {
    console.log('Hello UserLogRegProvider Provider');
  }


  /*
  ProcessLoginResponse
  return true: response indicates the login is successful
   */
  ProcessLoginResponse(str_response: string):void {
    console.log("UserLogRegProvider::ProcessLoginResponse:" + str_response);
    let json_response: JSON = JSON.parse(str_response);
    if (json_response["status_code"] == 0)
    {
      console.log("UserLogRegProvider::ProcessLoginResponse: auth succ");
      this.onloginSuccess(json_response["username"]);
    //  this.globals.homePage.setTabBbsPageBbsPage();
    }
    else
    {
      this.globals.isLogin =  false;
      this.globals.username = "";
      console.log("UserLogRegProvider::ProcessLoginResponse: auth fail");
      //homepage.setTabBbsPageLoginPage();
      if (this.globals.bbspage != undefined)
      { //确保this.globals.bbspage != undefined
        //console.log("UserLogRegProvider::ProcessLoginResponse: using globals.bbspage to set LoginPage");
        //this.globals.homePage.BbsPage.navCtrl.setRoot(LoginPage);  //Error this.globals.homePage.BbsPage is undefined
        //this.globals.homePage.setTabBbsPageLoginPage();  //不起作用
        //使用globals.bbspage.navCtrl.setRoot
        console.log("UserLogRegProvider::ProcessLoginResponse: globals.bbspage.navCtrl.setRoot(LoginPage)");
        this.globals.bbspage.navCtrl.setRoot(LoginPage);
        // 测试this.globals.bbspage仍然指向BbsPage  this.globals.bbspage.memberfun(); 
      }
      else
      {
        console.log("UserLogRegProvider::ProcessLoginResponse: [warnning] globals.bbspage is not initialized.");
        alert("程序错误：自动登录失败后，设置【我的圈】为登录页面失败");
      }
      this.globals.bManualLogin = true;
    }
  }

  onloginSuccess(username:string)
  {
    this.globals.isLogin = true;
    this.globals.username = username;
    console.log(this.globals.username);
    console.log("UserLogRegProvider::onloginSuccess: set BbsPage::isfirstload = true");
    this.globals.bbspage.isfirstload = true;
      //设置默认新帖的判定时间是7天前
      this.globals.defaultlastupdatedate = this.datesUtils.getweekago();
      console.log("UserLogRegProvider::onloginSuccess: set global defaultlastupdatedate with " + this.globals.defaultlastupdatedate);
      //创建和加载和更新globals.bbsgroupsLastLatestUpdate
      if (this.globals.bbsgroupsLastLatestUpdate == null)
      {
        this.globals.bbsgroupsLastLatestUpdate = new BBSGroupsLastUpdate(this.globals);
        this.globals.bbsgroupsLastLatestUpdate.loadGroupsLastUpdatetimefromStorgage();
      }
      this.globals.bbsgroupsLastLatestUpdate.updateDeprecatedGroupDatetime();

      this.user_groups.set_user(this.globals.username);
    /*this.springfestival.getSpringFestival().then( (res) =>{  
      //this.springfestival.ProcessSpringFestivalResponse(res);
      console.log("UserLogRegProvider::onloginSuccess: got spring festival" + this.springfestival.isSpringFestival);
      console.log("UserLogRegProvider::onloginSuccess: call set_user");
      this.user_groups.set_user(this.globals.username);
      },
      (err) =>{console.log("查询春节日期失败");}
      );
      */
  }

  ProcessLoginError(err_str: string):void {
    this.globals.isLogin =  false;
    let json_response: JSON = JSON.parse(err_str);
      //homepage.setTabBbsPageLoginPage();
      console.log("UserLogRegProvider::ProcessLoginError: globals.bbspage.navCtrl.setRoot(LoginPage)");
      this.globals.bbspage.navCtrl.setRoot(LoginPage);
      this.globals.bManualLogin = true;
    alert("服务器目前不能登录");
  }

  public autologin() {

    //let user_token: string = window.localStorage.getItem('authtoken');
    //console.log("autologin::token:" + user_token);

    //let headers1 = new Headers();
    //headers1.append("Cookie", "sessionid=v");
    const headers = new HttpHeaders().set("Access-Control-Request-Method", "POST, OPTIONS")
    .set("Cookie", "sessionid=tlikemu4syawevedarpir2my3pii23we")
    .set("Access-Control-Request-Headers", "accept, content-type, cookie");
    let options = {
      "withCredentials":true,
    //  "headers":headers,
      "timeout":timeout(3000)
    };
    /*this.http.get(this.globals.server + 'bbs/getarticledetail/1', options).
    subscribe(
      data => console.log("....................."),
    err => alert(JSON.stringify(err))//console.log(JSON.stringify(err))
    )*/

    this.http.post(this.globals.server + 'user/login/', {}, options).pipe(timeout(3000)).subscribe(
      data => this.ProcessLoginResponse(JSON.stringify(data)) ,
      err => this.ProcessLoginError(JSON.stringify(err))//console.log(JSON.stringify(err))
    )

  }

}
