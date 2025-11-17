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

@IonicPage()
@Component({
  selector: 'page-user-request-confirm',
  templateUrl: 'user-request-confirm.html',
})
export class UserRequestConfirmPage {
  request:JSON;        //请求体
  requesttext:string = "";   //输入验证信息
  title:string;     //窗口标题
  prompt: string;
  requestgroupid:number; //请求发送的目标组
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public user_groups:UserGroupsProvider, public globals:GlobalsProvider) {
    this.request = this.navParams.get('request');
    this.requestgroupid = this.navParams.get('requestgroupid');
    if (this.request['requestcode'] == 1)
    {
      this.title = "加入组" + this.request['targetgroupname'];
      this.prompt = "需要组管理员同意才能加入组，请输入验证信息";
    }
    else if (this.request['requestcode'] == 2)
    {
      this.title = "访问组" + this.request['targetgroupname'];
      if (this.requestgroupid == this.request['targetgroupid'])//当组管理员向targetgroupid组发出友邻访问时，请求直接发往友邻访问目标组targetgroup，该分支条件成立
        this.prompt = this.user_groups.getGroupName(this.request['fromgroupid']) + "需要对方组管理员同意才能访问对方组，请输入验证内容";
      else if (this.requestgroupid == this.request['fromgroupid'])//当组非管理员向targetgroupid组发出友邻访问时，请求发往友邻访问源组fromgroup，该分支条件成立
        this.prompt = "需要先经过" + this.user_groups.getGroupName(this.request['fromgroupid']) +"管理员同意，请输入验证内容";
    }
  }

  /*
  request:RequestMessage
  */
  sendRequest(request:any)
  {
    if (this.request['requestcode'] == 1)
      this.sendJoinGroupRequest(request);
    else if (this.request['requestcode'] == 2)
      this.sendFriendGroupVisitRequest(request)
  }

  sendJoinGroupRequest(request:JSON)  /*RequestMessage*/
  {
    let body = {
      "groupid":request['groupid'],
      "requesttext":this.requesttext
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/request_join_group/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.onSendJoinresult(data), // refresh comments
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }
  onSendJoinresult(data:JSON)
  {
    if (data['status_code'] != 0)
      alert("服务器出现异常");
    else
    {
      this.navParams.get('parent').popover_confirm.dismiss();
      alert("发送入组请求成功,请等待管理员审核通过");
    }
  }

  /*
  发送通过友邻方式访问目标组的请求
  */
 sendFriendGroupVisitRequest(request:JSON)  /*RequestMessage*/
 {
     let body = {
      'groupid':request['groupid'],
      'fromgroupid':request['fromgroupid'],
      'targetgroupid': request['targetgroupid'],
      //'biddirectvisit': request['biddirectvisit'],
      'requesttext': this.requesttext
    };
     let options = {
       "withCredentials":true
     };
     this.http.post<any>(this.globals.server + 'group/request_friendgroupvisit/', this.encodeHttpParams(body), options).
     subscribe(
       data => this.onSendVisitresult(data), 
       err => alert("请求服务器失败")//console.log(JSON.stringify(err))
     )
 }

 onSendVisitresult(data:JSON)
 {
    if (data['status_code'] == 0)
    {
      let parent = this.navParams.get('parent');
      if (this.navParams.get('updateparent') == true)
        parent.ApproveVisitGroup();
      parent.navCtrl.pop();
      parent.popover_confirm.dismiss();
      alert("发送友邻访问请求成功,请等待管理员审核通过");
    }
    else if (data['status_code'] == -1)
    {
      alert("服务器出现异常");
    }
    else if (data['status_code'] == -2)
    {
      alert("不允许该操作");
    }
    else
    {
      alert("错误操作");
    }
 }

  ionViewDidLeave() {
    console.log('ionViewDidLeave UserRequestConfirmPage');
    let parent = this.navParams.get('parent');
    parent.popover_confirm = null;
    
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
}
