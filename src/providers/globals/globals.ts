import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HomePage } from '../../pages/home/home';
import { BbsPage } from '../../pages/bbs/bbs';
import { AdvancedBbsSearchPage } from '../../pages/advanced-bbs-search/advanced-bbs-search';
//import { MyGroupsPage } from '../../pages/my-groups/my-groups';
import { UserGroupsProvider } from '../user-groups/user-groups';
import { BBSGroupsLastUpdate} from '../../pages/bbs/rtctrl-lastupdate';
import { DatesUtils } from '../dates/dates';

/*
  Generated class for the GlobalsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export enum BBSZoneName{wuyetongzhi, zifahuodong, taolunqu, tiwenqu};

@Injectable()
export class GlobalsProvider {
  public isAppReady:boolean;
  public username:string;
  public dummyUsername:string;
  public favsStoreKeyname:string;
  public isLogin:boolean;
  public bbszone:BBSZoneName;
  public bbssorting:string;
  //public homePage:HomePage;
  public bbspage:BbsPage;
  //public mygroupspage:MyGroupsPage;
  public advancedsearchpage:AdvancedBbsSearchPage;
  public bbsgroupsLastLatestUpdate:BBSGroupsLastUpdate;
  public commonGroupName;
  public loadMoreScrollText:string = "更多...";
  public loadMoreNoContentText:string = "没有更多了";
  public serveripport:string;
  public server:string;
  StartNotReadyPrompt: string;
  optionplaceholder: string;
  key_groupsLastupdatetime:string = "key_groupsLastupdatetime";
  public defaultlastupdatedate: string;  // 默认新帖的判定时间是7天前
  homePage: any;
  NewSpringDay: any;
  bManualLogin: boolean;

  public bbspage_title_show_length = 10;
  //多组模式下BbsPage列表项标题行长度限制
  public mult_groups_title_show_length = 28;   //标题行的长度
  public mult_groups_gp_show_length = 20;   //组：组名的长度
  public mult_groups_author_show_length:number;  // |作者：作者名的长度

  public menu_long_gp_length: number = 30;    //菜单里的长组名的最小长度

  public question_status_wait4answer:string = "待回答";
  public question_status_confirmed:string = "已完成";
  public question_status_closed:string = "已关闭";
    // 调用相册时传入的参数
  public imagePickerOpt = {
      maximumImagesCount: 10,//选择一张图片
      width: 800,
      height: 800,
      quality: 80,
      mediaType: 2//为1时允许选择视频文件
    };
  widesocialRTCtrl: any;


  constructor(public http: HttpClient) {
    console.log('Hello GlobalsProvider Provider');
    this.isAppReady = false;
    this.homePage = null;
    this.isLogin = false;
    this.bManualLogin = false; //自动登录
    this.dummyUsername = "";
    this.username = this.dummyUsername;
    this.favsStoreKeyname = this.username + "_favids";
    this.bbsgroupsLastLatestUpdate = null;
    this.bbszone = BBSZoneName.wuyetongzhi;
    this.bbssorting = '-lastupdatedate';
    this.commonGroupName = "common";
    //
    this.serveripport = "2qc4221430.goho.co";
    this.server = "https://2qc4221430.goho.co/"; //必须以反斜线结束
    //this.serveripport = "192.168.101.102:8000";
    //this.server = "http://192.168.101.102:8000/"; //必须以反斜线结束
    this.NewSpringDay = "";
    this.StartNotReadyPrompt = "你还没有登录，请点击右下方【我】登录";  //用户提示信息
    this.optionplaceholder = "这儿输入投票选项后点击添加投票选项按钮";    // 添加投票的编辑框缺省内容

    this.mult_groups_author_show_length = this.mult_groups_title_show_length - this.mult_groups_gp_show_length;
  }

}
