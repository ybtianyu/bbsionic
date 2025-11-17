import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams, HttpRequest } from "@angular/common/http";
import {GlobalsProvider} from "../../providers/globals/globals";
import {MePage} from '../me/me';

/**
 * Generated class for the ModifyUserInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class Msg
{
  nickname:string;
  tel:string;
}
class GetResponse {
	msg:Msg;
	status_code:number;
}

@IonicPage()
@Component({
  selector: 'page-modify-user-info',
  templateUrl: 'modify-user-info.html',
})
export class ModifyUserInfoPage {
  private nickname:string;
  private tel:string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globals:GlobalsProvider, public http:HttpClient) 
  {
    this.loadBasicUserInfo();
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  private loadBasicUserInfo()
  {
    const params = new HttpParams().set('username', this.globals.username)
    let options = {
      "params":params,
      "withCredentials":true
    }
    this.http.get<any>(this.globals.server + 'user/getmyuserbasic/', options)
    .subscribe(
      data => this.ProcessGetResponse(data),
      err => alert("获取用户信息失败")
    )
  }
  private ModifyUserBasicInfo()
  {
    let body = {
      'nickname':this.nickname,
      'tel':this.tel
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'user/modifyuserinfo/', this.encodeHttpParams(body), options
    )
    .subscribe(
      data => this.ProcessPOSTResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }
  private ProcessGetResponse(res:JSON)
  {
    this.nickname = res['msg']['nickname'];
    this.tel = res['msg']['tel'];
  }
  private ProcessPOSTResponse(res:JSON)
  {
    if (res['status_code'] == 0)
    {
      alert("修改成功！");
    }
    else
    {
      alert("修改失败！");
    }
  }
  private cancel()
  {
    var Mepage:MePage = this.navParams.get('MePage');
    Mepage.navCtrl.pop();
  }

}
