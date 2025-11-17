import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { BbsPage } from '../pages/bbs/bbs';
import { BbsUpdateNotifyProvider } from '../providers/bbs-update-notify/bbs-update-notify';
import { GlobalsProvider } from '../providers/globals/globals';
import {UserGroupsProvider} from "../providers/user-groups/user-groups";
import { SpringFestival } from '../providers/festival/springfestival';
import { DatesUtils } from '../providers/dates/dates';
import { BBSGroupsLastUpdate } from '../pages/bbs/rtctrl-lastupdate';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  pages: Array<{title: string, component: any}>;
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
              public globals:GlobalsProvider, public user_groups:UserGroupsProvider, 
              public springfestival:SpringFestival, public datesUtils:DatesUtils) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
//      statusBar.styleDefault();
//      splashScreen.hide();
      document.addEventListener("resume", () => {
        statusBar.styleDefault();
        splashScreen.hide();
        //alert("进入，前台展示"); //进入，前台展示      
        //未登陆不执行后面的语句  
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
        (err) =>{alert("获取请求数量信息失败"); return;}
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
      
      }, false);
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      document.addEventListener("pause", () => {
      /*  let groups = this.globals.bbspage.getViewGroups();
        for (let i = 0; i < groups.length; i++)
        {
          let group = groups[i];
          console.log("#########saving bbspage.bbs.lastupdatedate for group" + group.groupname);
          let key = "lastupdate_" + group.groupid.toString();
          let val = this.globals.bbspage.bbs.getLastLatestUpdatedate(group.groupid.toString());
          window.localStorage.setItem(key, val);
        }
        */
        //alert("退出，后台运行"); //退出，后台运行
        //未登陆不执行后面的语句  
        if (this.globals.isLogin == false)
        {
          return;
        }
        this.globals.bbsgroupsLastLatestUpdate.saveGroupsLastUpdatetimetoStorage();

      }, false);
    });

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Home', component: HomePage }
    ];
  }
}

