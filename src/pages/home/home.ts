import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { MePage } from '../me/me';
import {TabBbsPage} from '../tab-bbs/tab-bbs';
import { BbsPage } from '../bbs/bbs';
import {WideSocialPage} from '../wide-social/wide-social';
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import {HttpClient} from "@angular/common/http";
import {UserLogRegProvider} from "../../providers/user-log-reg/user-log-reg";
import { HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  tabmybbs : any;
  tabme : any;
  BbsPage:any;
  WideSocialPage:any;
 // user : User = {isLogin : true};
  //Globals.user.isLogin = true;
  constructor(public navCtrl: NavController, public http: HttpClient, public globals:GlobalsProvider, public userlogreg:UserLogRegProvider) {
    this.globals.homePage = this;
  //  this.tabmybbs = TabBbsPage;
    this.tabmybbs = BbsPage; //LoginPage; //;
    this.tabme = MePage;
    this.WideSocialPage = WideSocialPage;
  /*  const headers = new HttpHeaders().set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "accept, content-type")
    .set("myCookie", "sessionid=tlikemu4syawevedarpir2my3pii23we");//+user_token);
    let options = {
      "withCredentials":true,
      headers:headers
    }
    this.http.get(this.globals.server + 'bbs/getarticledetail/1', options).
    subscribe(
      data => console.log("....................."),
    err => alert(JSON.stringify(err))//console.log(JSON.stringify(err))
    )
    this.http.post(this.globals.server + 'user/login/', {}, options).subscribe(
      data => console.log("...OK......") ,
      err => console.log("Fail......")//console.log(JSON.stringify(err))
    )*/


  //alert("alert");
    console.log("HomePage::constructor: App starts!");
  //  this.userlogreg.autologin();   // This statement is moved to BbsPage constructor after valuing globals.BbsPage in BbsPage constructor, in order to avoid autoLogin being executed before globals.BbsPage is assigned with value.
  }

  public setTabBbsPageLoginPage()
  {
    this.tabmybbs = LoginPage;  //测试不起作用，对tabmybbs赋值只有在constructor里初始化起作用
    console.log("setTabBbsPageLoginPagesetTabBbsPageLoginPagesetTabBbsPageLoginPagesetTabBbsPageLoginPage");
  }
  public setTabBbsPageBbsPage()
  {
    this.tabmybbs = BbsPage;
  }

  private sleep(delay:number){
    var t = Date.now();
    while((Date.now() - t) <= delay){
    }
  }

}
