import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import { BbsDetailPage} from '../../pages/bbs-detail/bbs-detail'
import {GlobalsProvider} from "../../providers/globals/globals";
/**
 * Generated class for the CommentReplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comment-reply',
  templateUrl: 'comment-reply.html',
})
export class CommentReplyPage {
  private PageTitle:string;
  public bbsdetailpage:any; //BbsDetailPage;
  public bbsid:number;
  public replyto:string;
  public topcommentid:string;
  public text:string;   // comment in text input

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public http: HttpClient, public globals:GlobalsProvider) {
    this.text = "";
    this.bbsdetailpage = navParams.get('bbsdetailpage');
    this.bbsid = navParams.get('bbsid');  //get bbs id from navParams
    this.replyto = navParams.get('replyto');
    this.topcommentid = navParams.get('topcommentid');
    this.PageTitle = "回复 " + this.replyto;

  }


  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  private replyComment(replyto:string, topcommentid:string, content:string)
  {
    console.log("Enter replyComment");
    if (this.text.length == 0)
      return; 
    let body = {
      'bbsid':this.bbsid,
      'replyfrom':this.globals.username,
      'replyto':replyto,
      'topcommentid':topcommentid,
      'content':this.text      
    }
    this.http.post(this.globals.server + 'comments/post_sublevel/', this.encodeHttpParams(body), {}).
    subscribe(
      data => this.bbsdetailpage.getcomments(), //refresh comments
      err => alert("获取评论失败")//console.log(JSON.stringify(err))
    )
    this.bbsdetailpage.popover.dismiss();
  }

  cancel()
  {
    this.bbsdetailpage.popover.dismiss();
  }
}
