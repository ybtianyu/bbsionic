import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {GlobalsProvider} from "../../providers/globals/globals";
import {BbsNewPostEditPage} from "../bbs-new-post-edit/bbs-new-post-edit";
import { ImagePicker } from '@ionic-native/image-picker';
import { ToastServiceProvider } from '../../providers/toast-service/toast-service';
/**
 * Generated class for the BbsNewQuestionPostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-new-question-post',
  templateUrl: 'bbs-new-question-post.html',
})
export class BbsNewQuestionPostPage extends BbsNewPostEditPage {

  constructor( navCtrl: NavController,  navParams: NavParams,
     http: HttpClient,  globals:GlobalsProvider, 
			   imagePicker:ImagePicker, noticeSer:ToastServiceProvider) 
  {
    super(navCtrl, navParams, http, globals, imagePicker, noticeSer);
    console.log("BbsNewQuestionPostPage::constructor");
    this.groupid = this.navParams.get('groupid');
    this.groupname = this.navParams.get('groupname');
    console.log("BbsNewQuestionPostPage::constructor:this.groupname=" + this.groupname);
  }

  /**
   * requestnewPost
   * 发帖请求
   * 
   * @param imgids 上传的图片的id列表。缺省为空串，不传图片
   */
   requestnewPost(imgids:string = "")
   {
    let options = {
      "withCredentials":true
    };
    let body = {
      'title':this.title,
      'groupid':this.groupid,
      'username':this.globals.username,
      'content':this.content.replace(new RegExp(/\n/g), "<br>"),  //换行符转换为标签<br>
      "imgids":imgids
    }
    this.http.post<any>(this.globals.server + 'bbs/postquestion/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.processPostResponse(data),
      err => alert("提问时向服务器请求错误") //console.log(JSON.stringify(err))//console.log(JSON.stringify(err))
    )
   }

     /*
  * processPostResponse
  * 发帖成功则返回上一个页面
  */
  processPostResponse(data:JSON)
  {
    super.processPostResponse(data);
  }
}
