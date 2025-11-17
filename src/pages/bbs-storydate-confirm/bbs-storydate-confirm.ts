import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RequestMessage, RequestDetailPage} from '../request-detail/request-detail';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { GlobalsProvider } from '../../providers/globals/globals';
/**
 * Generated class for the UserRequestConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

class DateTime
{
  date:string;
  clock:number;

  enabled_ymd_exclude:boolean;
  enabled_clock:boolean;
  bMorning:boolean;
  bAfternoon:boolean;

  constructor(date:string)
  {
    this.date = date;
    this.clock = 0;
    this.enabled_ymd_exclude = false;
    this.enabled_clock = false;
    this.bMorning = true;
    this.bAfternoon = !this.bMorning;
  }

  /**
   * setAmPm
   * @param bMorning true:上午，false：下午
   */

  public setMorning(bMorning:boolean)
  {
    this.bMorning = bMorning;
    this.bAfternoon = !this.bMorning;
  }

  public setAfternoon(bAfternoon:boolean)
  {
    this.bAfternoon = bAfternoon;
    this.bMorning = !this.bAfternoon;
  }

  public enableClock():boolean
  {
    //console.log("enableclock=" + (this.enabled_ymd_exclude && this.enabled_clock));
    return this.enabled_ymd_exclude && this.enabled_clock;
  }

  public setClockTime(clock:number)
  {
    if (clock >= 0 && clock < 12)
    {
      this.clock = clock;
    }
    else
    {
      alert("时点输入在0-11之间");
    }
  }

  public verifyInput()
  {
    var alertmsg = "";
    if (this.date == "")
      alertmsg = "未选择日期";
    if (this.enabled_ymd_exclude && this.enabled_clock)
    {
      if (this.clock >= 12 || this.clock < 0)
        alertmsg += "，时点输入在0-11之间";
    }
    if (alertmsg != "")
    {
      alert(alertmsg);
      return false;
    }
    return true;
  }

}

@IonicPage()
@Component({
  selector: 'page-bbs-storydate-confirm',
  templateUrl: 'bbs-storydate-confirm.html',
})
export class BBSStoryDateConfirmPage {
  storydate:DateTime;
  clock:number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public user_groups:UserGroupsProvider, public globals:GlobalsProvider) {
      this.storydate = new DateTime(this.navParams.get('date'));  //初始化日期，不含时点信息
      this.clock = 0;
  }

  /*
  request:RequestMessage
  */
  sendRequest()
  {
    if (this.storydate.verifyInput())
    {
      //设置时点
      if (this.storydate.enableClock())
        this.storydate.setClockTime(this.clock);
      
      var body = JSON.parse("{}");
      body['id'] = this.navParams.get('bbsid');
      body['storydate'] = this.storydate.date;
      if (this.storydate.enabled_ymd_exclude)
      {
        if (this.storydate.enableClock()) //含上下午信息和时点信息
          body['ampm'] = this.storydate.bAfternoon ? 4 : 3;
        else  //只含上下午信息
          body['ampm'] = this.storydate.bAfternoon ? 2 : 1;
      }
      if (this.storydate.enableClock())
      {
        var h:number = this.storydate.bAfternoon ? Number(this.storydate.clock) + Number(12) : this.storydate.clock;
        console.log(h);
        var hh:string = h < 10 ? '0'+h.toString() : h.toString();
        console.log("hh=" + hh);
        var hms = hh + ":00:00";
        body['storydate'] += (' ' +  hms);
      }
      //alert(body['storydate']);
      //if (this.storydate.enabled_ymd_exclude)
      //  alert(body['ampm']? '上午' : '下午');
      let options = {
          "withCredentials":true
      };
      this.http.post<any>(this.globals.server + 'bbs/modifystorydate/', this.encodeHttpParams(body), options).
      subscribe(
          data => this.onRecvModifyResult(data), // refresh comments
          err => alert("请求服务器失败")//console.log(JSON.stringify(err))
      );
    }
  }

  onRecvModifyResult(data:any)
  {
    if (data['status_code'] == 0)
    {
      this.navParams.get('parent').popover_confirm.dismiss();
      //更新详情页的故事时间显示
      var storydate:string = data['storydate'];
      var ampm:number = data['ampm'];
      this.navParams.get('parent').parseStorydate(storydate, ampm);
    }
    else
    {
      alert("修改故事时间失败");
    }
  }

  cancel()
  {
    this.navParams.get('parent').popover_confirm.dismiss();
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

}
