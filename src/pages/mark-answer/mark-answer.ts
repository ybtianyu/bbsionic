import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GlobalsProvider} from "../../providers/globals/globals";
import {HttpClient, HttpParams} from "@angular/common/http";
/**
 * Generated class for the MarkAnswerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mark-answer',
  templateUrl: 'mark-answer.html',
})
export class MarkAnswerPage {
  private questiondetailpage:any;
  private bbsid:number;
  private commentid:number;
  private whoanswers:string;
  private PageTitle:string;
  private message:string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public globals:GlobalsProvider) {
      this.questiondetailpage = navParams.get('questiondetailpage');
      this.bbsid = navParams.get('bbsid');  //get bbs id from navParams
      this.commentid = navParams.get('commentid');
      this.whoanswers = navParams.get('whoanswers');
      this.PageTitle = "找到答案了";
      this.message = "确认把" + this.whoanswers + "的回复作为正确的答案了吗？";
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  onOK()
  {
    let body = {
      'bbsid':this.bbsid,
      'commentid':this.commentid,
      'whoanswers':this.whoanswers,
      'score':1
    }
    this.http.post(this.globals.server + 'bbs/closequestion/', this.encodeHttpParams(body), {}).
    subscribe(
      data => ( 
                (
                  (data['status_code'] == 0 &&                  
                  this.questiondetailpage.updateSolved(this.commentid) &&
                  this.questiondetailpage.popover.dismiss() // dismiss()成功返回true. 
                  )
                )
                || alert("关闭问题操作失败")  // status_code不等于0时弹错误提示框
              ),
              
                            
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }
  onCancel()
  {
    this.questiondetailpage.popover.dismiss();
  }

}
