import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {User} from "../home/user";
import {GlobalsProvider} from "../../providers/globals/globals";
import { MyGroupsPage } from '../my-groups/my-groups';
import { ModifyUserInfoPage } from '../modify-user-info/modify-user-info';
import {UserGroupsProvider} from "../../providers/user-groups/user-groups";
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { LoginPage } from '../login/login';
import {BbsMyPage} from '../bbs-my/bbs-my';

/**
 * Generated class for the MePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-me',
  templateUrl: 'me.html',
})
export class MePage {
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public http: HttpClient, public globals:GlobalsProvider,
    public user_groups: UserGroupsProvider, public advancedSearchOpts:AdvancedBbsSearchOptProvider) {

  }


  ionViewDidEnter() {
    console.log('ionViewDidEnter MePage');
  }
  
  private showMyGroups()
  {
    this.navCtrl.push(MyGroupsPage);
  }

  private myBBS()
  {
    this.navCtrl.push(BbsMyPage);
  }
  private modifyUserInfo()
  {
    this.navCtrl.push(ModifyUserInfoPage,{'MePage':this});
  }

  private logoff()
  {
    let options = {
      withCredentials: true
    }
    this.http.post(this.globals.server + 'user/logout/', {}, options).
    subscribe(
      data => this.processLogoff(),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  processLogoff()
  {
    this.globals.isLogin = false;
    this.globals.username = this.globals.dummyUsername;
    //this.user_groups.set_user(this.globals.username);
    this.globals.bbspage.onUserExit();
    this.globals.bbspage.navCtrl.setRoot(LoginPage);
  }
}
