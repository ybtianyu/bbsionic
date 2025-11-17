import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams, HttpHeaders, HttpRequest } from "@angular/common/http";
import { RegistPage } from '../regist/regist';
import { MePage } from '../me/me';
import {UserLogRegProvider} from '../../../src/providers/user-log-reg/user-log-reg'
import {Injectable, Provider} from '@angular/core';
import {BaseRequestOptions, RequestOptions} from '@angular/http'
import {BbsDetailPage} from "../bbs-detail/bbs-detail";
import {GlobalsProvider} from "../../providers/globals/globals";
import {UserGroupsProvider, GroupInfo, getgroupsResponse} from "../../providers/user-groups/user-groups";
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import {Md5Provider} from '../../providers/md5/md5';
import { BbsPage } from '../bbs/bbs';
import { SpringFestival } from '../../providers/festival/springfestival';
import { DatesUtils } from '../../providers/dates/dates';
import { BBSGroupsLastUpdate } from '../bbs/rtctrl-lastupdate';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient,
              public globals:GlobalsProvider, public userlogreg:UserLogRegProvider,
              public user_groups:UserGroupsProvider, public advancedSearchOpts:AdvancedBbsSearchOptProvider,
              public MD5:Md5Provider, public springfestival:SpringFestival, public datesUtils:DatesUtils) {
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  private regist()
  {
    let param = {
      loginPage:this
    }

    this.navCtrl.push(RegistPage, param);
  }

  public login(username: string, password: string) {
    //alert(this.MD5.hex_md5(password));
    let userinfo: string = '用户名：' + username + '密码：' + password;
    if (username == "" || password == "")
    {
      alert("用户名或密码为空");
      return;
    }
    console.log("login::login: user manual login.");
    //let headers = new HttpHeaders().set('Content-Type', 'application/json');
    //headers.set('sessionid', "session1");
    console.log("MD5PAssword=" + this.MD5.hex_md5(password));
    let body = {
      'username':username,
      'password':this.MD5.hex_md5(password)
    };
    let options = {
      withCredentials: true
      //headers:headers
    }
    this.http.post<any>(this.globals.server + 'user/login/', this.encodeHttpParams(body), 
        options
    )
    .subscribe(
      data => this.ProcessLoginResponse(username, data),
      err => this.ProcessLoginError(JSON.stringify(err))//console.log(JSON.stringify(err))
    )

  /*  this.http.request(new Request(new RequestOptions("this.globals.server + 'user/login/'")))
    options
    )*/
/*
this.http.request(new HttpRequest<any>(this.globals.server + 'login/',
     this.encodeHttpParams(body), {}))
    this.http.request(this.globals.server + 'login/', this.encodeHttpParams(body), {})
      //.toPromise()
      .subscribe(res => this.ProcessLoginResponse(username, res),
      )
*/
  }
  
  private getCookieFromResponse(res:any):any
  {
    
    console.log("Enter getCookieFromResponse");
    console.log(JSON.stringify(res));
    console.log(res.headers);
    let cookie =res.headers;//['Set-Cookie'];
    //console.log(cookie['sessionid']);
    return cookie;
    
   //return "sessionid";
  }
  private ProcessLoginResponse(username:string, res:any):boolean
  {
    //console.log("login::ProcessLoginResponse");
    //console.log(res);
    //console.log(res.headers.get('Set-Cookie'));
    let cookie = this.getCookieFromResponse(res);
    let data_str:string = JSON.stringify(res);
    let json_response: JSON = JSON.parse(data_str);
    //console.log(data_str);
    if (json_response["status_code"] == 0)
    {
      console.log("login.ts::ProcessLoginResponse: login success");
      this.globals.isLogin = true;
	    this.globals.username = username;
      let token = this.gettokenFromResponse(data_str);
      if (token != "")
      {
        console.log("login.ts::ProcessLoginResponse: save token");
        window.localStorage.setItem(username + '_authtoken', token); // save token
      }
      console.log("login.ts::ProcessLoginResponse: set BbsPage::isfirstload = true");
      this.globals.bbspage.isfirstload = true;
      this.globals.bbspage.navCtrl.setRoot(BbsPage);  //登录页设置为BbsPage页面，触发BbsPage再次构造      
      //设置默认新帖的判定时间是7天前
      this.globals.defaultlastupdatedate = this.datesUtils.getweekago();
      console.log("login.ts::ProcessLoginResponse: set global defaultlastupdatedate with " + this.globals.defaultlastupdatedate);
      //创建和加载和更新globals.bbsgroupsLastLatestUpdate
      if (this.globals.bbsgroupsLastLatestUpdate == null)
      {
        this.globals.bbsgroupsLastLatestUpdate = new BBSGroupsLastUpdate(this.globals);
        this.globals.bbsgroupsLastLatestUpdate.loadGroupsLastUpdatetimefromStorgage();
      }
      this.globals.bbsgroupsLastLatestUpdate.updateDeprecatedGroupDatetime();
/*
      this.springfestival.getSpringFestival().then( (res) =>{  
        //this.springfestival.ProcessSpringFestivalResponse(res);
        console.log("login.ts::ProcessLoginResponse: got spring festival");
        this.user_groups.updateUserGroups_Promise()
        .then( (res) =>{  
          //this.user_groups.onRecvGroupsData_json(JSON.parse(res));  //先构造user_groups.cachedgroups,设置更新缺省时间
          console.log("login.ts::ProcessLoginResponse: globals.bbspage.navCtrl.setRoot(BbsPage)");
          this.globals.bbspage.navCtrl.setRoot(BbsPage);  //触发BbsPage再次构造
        });
        console.log("login.ts::ProcessLoginResponse: call set_user");
        this.user_groups.set_user(this.globals.username);  //启动刷新
        },
        (err) =>{console.log("查询春节日期失败");}
        );
*/
      this.user_groups.set_user(this.globals.username);
      /*  this.springfestival.getSpringFestival().then( (res) =>{  
          //this.springfestival.ProcessSpringFestivalResponse(res);
          console.log("login.ts::ProcessLoginResponse: got spring festival");
          console.log("login.ts::ProcessLoginResponse: call set_user");
          this.user_groups.set_user(this.globals.username);  //启动刷新
          },
          (err) =>{console.log("查询春节日期失败");}
          );
          */
      return true;
    }

    else
    {
      console.log("login failed.")
      alert("用户密码验证错误");
      return false;
    }
    
  }

  private ProcessLoginError(err_str:string)
  {
    /*
    let json_response: JSON = JSON.parse(err_str);
    if (json_response.hasOwnProperty("status") && json_response["status"] == 401)
    {
      this.globals.isLogin =  false;
      console.log("login.ts::ProcessLoginError: code 401");
    }
    */
    console.log("login.ts::ProcessLoginError:Error response");
    alert("服务器目前不能登录");
  }
  private gettokenFromResponse(data_str:string):string
  {
    let token:string = "";
    let json_response: JSON = JSON.parse(data_str);
    if (json_response.hasOwnProperty('token'))
    {
      console.log("hasOwnProperty");
      token = json_response['token'];
    }
    console.log("gettokenFromResponse::token:" + token);
    return token;
  }
}


/*  //CSRF
    @Injectable()
    export class ExRequestOptions extends BaseRequestOptions  {
      constructor(public BaseRequestOptions) {
        super();
        this.headers.append('X-CSRFToken', this.getCookie('csrftoken'));
      }

      getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length == 2)
          return parts.pop().split(";").shift();
      }
    }

    let  app = bootstrap(EnviromentComponent, [
      HTTP_PROVIDERS,
      provide(RequestOptions, {useClass: ExRequestOptions})
    ]);*/
//////////////////////////////////////////////////
/* CRSF
   var myapp = angular.module('myapp', ['ngCookies', 'ui.bootstrap']).

   config(['$routeProvider', function($routeProvider){
     $routeProvider.
     when('/', {
       templateUrl: '/partials/home.html',
       controller: HomeCtrl
     }).
     when('/game/:gameId/shortlist/create',{
       templateUrl: '/partials/create-shortlist.html',
       controller: CreateShortlistCtrl
     }).
     otherwise({redirectTo: '/'});
   }]);
*/
