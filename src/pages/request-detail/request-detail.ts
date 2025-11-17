import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, Popover } from 'ionic-angular';
import { GlobalsProvider } from '../../providers/globals/globals';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserRequestConfirmPage } from '../user-request-confirm/user-request-confirm';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
/**
 * Generated class for the RequestDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/*
RequestMessage
群里的请求消息，包含用户申请加入的消息
*/
export class RequestMessage
{
  requestcode:number; // requestcode 1:加入组；2：申请友邻访问
  fromuser:string;
  fromgroupid:number;
  targetgroupid:number;
  fromgroupname:string;
  targetgroupname:string;
  //biddirectvisit:boolean;  //双向访问
  title:string;
  requesttext:string;
  groupname:string;
  groupid:number;
  requestdatetime:string;
}

@IonicPage()
@Component({
  selector: 'page-request-detail',
  templateUrl: 'request-detail.html',
})
export class RequestDetailPage {
  request:RequestMessage;
  bgpAdmin:boolean;
  requeststatus:number = -1;    // -1(获取失败，不允许操作)，0(未处理)，1(已处理)，
  public popover_confirm:Popover;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globals:GlobalsProvider, public http:HttpClient, public popoverCtrl:PopoverController,
              public user_groups:UserGroupsProvider) {
    this.request = this.navParams.get('request');console.log("request['fromgroupid']" + this.request['fromgroupid']);
    if (this.request.requesttext == "")
      this.request.requesttext = "无";
    this.getRequestStatus(this.request);
    this.bgpAdmin = this.user_groups.isGroupAdmin(this.request.groupid);
  }

  Approve()
  {
    if (this.request.requestcode == 1)
    {
      this.ApproveJoinGroup();
    }
    else if (this.request.requestcode == 2)
    {
      this.ApproveVisitGroup();
    }
  //  this.user_groups.getNewRequestfromServer();
  }
  
  Refuse()
  {
    console.log("request.requestcode=" + this.request.requestcode);
    if (this.request.requestcode == 1)
      this.RefuseJoinGroup();
    else if (this.request.requestcode == 2)
      this.RefuseVisitGroup();
  //  this.user_groups.getNewRequestfromServer();
  }

  ApproveJoinGroup()
  {
    let body = {
      "username":this.request.fromuser,
      "groupid":this.request.groupid
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/approvejoin/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.ProcessApproveResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }
  ProcessApproveResponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      this.requeststatus = 1;
    }
    else
    {
      this.requeststatus = -1;
      alert("服务器出现异常");      
    }
  }

  RefuseJoinGroup()
  {
    console.log("RefuseJoinGroup");
    let body = {
      "username":this.request.fromuser,
      "groupid":this.request.groupid
    }
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/refusejoin/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.ProcessApproveResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  /*
  同意请求,
  当请求是组内申请时，调用此函数可以同意组内的请求，完成后将App端请求状态requeststatus更新为已处理
  当请求是其他组的友邻访问时，调用此函数可以同意请求组发来的请求，服务器端添加友邻设置
  */
  public ApproveVisitGroup()
  {
    console.log("ApproveVisitGroup");
    let body = {
      "fromgroupid":this.request.fromgroupid,
      "groupid":this.request.groupid,
      "targetgroupid":this.request.targetgroupid,
      "fromuser":this.request.fromuser
      //"biddirectvisit":this.request.biddirectvisit
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/approvefriendgroupvisit/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.ProcessApproveResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }

  /*
  ApproveAndRequestTargetGroup
  发送访问其他组的请求
  发送的请求是在当前组内请求上修改request的groupid为targetgroupid
  */
  ApproveAndRequestTargetGroup()
  {
    //往组外转发请求
    let request = {
      "fromusername":this.globals.username,
      "fromgroupid":this.request.fromgroupid,
      "targetgroupid":this.request.targetgroupid,
      "targetgroupname":this.request.targetgroupname,
      //"biddirectvisit":false,
      "groupid":this.request.targetgroupid,
      "requestcode":2,
      "requesttext":this.request.requesttext
    };
    let param = {
      'request':request,
      'parent':this,
      'updateparent':true
    };
    this.popover_confirm = this.popoverCtrl.create(UserRequestConfirmPage, param);
    this.popover_confirm.present(); 
    // 在UserRequestConfirmPage里发送请求成功后，调用RequestDetailPage.ApproveVisitGroup();
  }
  onSendVisitresult(data:JSON)
  {
    if (data['status_code'] != 0)
      alert("服务器出现异常");
  }
  /*
  RefuseVisitGroup
  拒绝打开的请求
  */
  RefuseVisitGroup()
  {
    console.log("RefuseVisitGroup");
    let body = {
      "fromuser":this.request.fromuser,
      "fromgroupid":this.request.fromgroupid,
      "groupid":this.request.groupid,
      "targetgroupid":this.request.targetgroupid
      //"biddirectvisit":this.request.biddirectvisit
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/refusefriendgroupvisit/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.ProcessApproveResponse(data),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  getRequestStatus(request:RequestMessage)
  {
    if (request.requestcode == 1)
    {
      const params = new HttpParams()
      .set('fromuser',request.fromuser)
      .set('groupid', request.groupid.toString())
      .set('requestcode', request.requestcode.toString())
      let options = {
        "withCredentials":true,
        params:params
      };
      this.http.get<any>(this.globals.server + 'userrequest/isrequesthandled/', options).
      subscribe(
        data => this.ProcessResponseStatus(data),
        err => alert("请求服务器失败")//console.log(JSON.stringify(err))
      );
    }
    else if (request.requestcode == 2)
    {
      /*let biddirectvisit = "";
      if (request.biddirectvisit == true)
        biddirectvisit = "true"
      else
        biddirectvisit = "false"
      */
      const params = new HttpParams()
      .set('fromuser',request.fromuser)
      .set('fromgroupid',request.fromgroupid.toString())
      .set('groupid', request.groupid.toString())
      .set('targetgroupid', request.targetgroupid.toString())
      //.set('biddirectvisit',biddirectvisit)
      .set('requestcode', request.requestcode.toString())
      let options = {
        "withCredentials":true,
        params:params
      };
      this.http.get<any>(this.globals.server + 'userrequest/isrequesthandled/', options).
      subscribe(
        data => this.ProcessResponseStatus(data),
        err => (this.requeststatus = -1) && alert("获取请求状态失败")//console.log(JSON.stringify(err))
      );
    }

  }
  ProcessResponseStatus(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      if (data['requesthandled'] == true)
        this.requeststatus = 1;
      else if (data['requesthandled'] == false)
        this.requeststatus = 0;
    }
    else
    {
      this.requeststatus = -1;
      alert("获取请求状态失败");
    }
  }

}
