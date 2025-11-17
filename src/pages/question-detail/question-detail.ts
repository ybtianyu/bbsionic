import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ItemsResponse, CommentData, ReplyData} from '../../pages/bbs-detail/bbs-detail';
import { CommentReplyPage} from '../../pages/comment-reply/comment-reply'
import {MarkAnswerPage} from '../../pages/mark-answer/mark-answer'
import { PopoverController, Popover } from 'ionic-angular'
import {HttpClient, HttpParams} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {GlobalsProvider} from "../../providers/globals/globals";
import { BbsDetailPage} from '../bbs-detail/bbs-detail';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { ImagePicker } from '@ionic-native/image-picker';
import { ToastServiceProvider } from '../../providers/toast-service/toast-service';
import { DatesUtils } from '../../providers/dates/dates';
/**
 * Generated class for the QuestionDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 class Info {
  title:string;
  author:string;
	content:string;
  createdate:string;
  title_modified_dates:string[]
  content_modified_dates:string[]
	lastupdatedate:string;
	viewcount:number;
  dianzancount:number;
  hasDianzaned:boolean;
  vote_options:string;  //提问贴不使用
  vote_rlt:string;  //提问贴不使用
  images:Image[];
  question_answerid:number;
  question_issolved:number;
}
class Image{
  path:string;
  imgid:number;
}

@IonicPage()
@Component({
  selector: 'page-question-detail',
  templateUrl: 'question-detail.html',
})
export class QuestionDetailPage extends BbsDetailPage
{
  question_answerid:number;
  question_issolved:boolean = true;
  status_text:string;
  hasApplyBtn = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public popoverCtrl:PopoverController,
    public http: HttpClient, public sanitize:DomSanitizer, public globals:GlobalsProvider, public user_groups:UserGroupsProvider,
    public imagePicker:ImagePicker, public noticeSer:ToastServiceProvider, public datesUtils:DatesUtils)
    {
      super(navCtrl, navParams, popoverCtrl, http, sanitize, globals, user_groups, imagePicker, noticeSer, datesUtils);
      this.status_text = "解答状态";
      this.question_answerid = -1;
      this.hasApplyBtn = false;
    }

    protected onRecvBBSDetailData(data:ItemsResponse)
    {
      super.onRecvBBSDetailData(data);
      this.question_issolved = (data.info.question_issolved > 0);
      this.setStatusText(this.question_issolved);
      this.question_answerid = data.info.question_answerid; if (this.question_answerid == null) this.question_answerid = -1;
      this.updateCommentAnswer();
      //console.log("this.content_modified_dates.length=" + this.content_modified_dates.length);
      console.log("QuestionDetailPage::onRecvBBSDetailData: this.question_answerid=" + this.question_answerid);
      this.hasApplyBtn = this.isUserabletoApply();
      console.log("buserableEdit=" + this.buserableEdit);
      console.log("hasApplyBtn=" + this.hasApplyBtn);
      if (this.imglist.length > 0)
      {
          this.timer = setTimeout(
            () => {
              console.log("set picLoadComplete = true");
              this.picLoadComplete = true;
              console.log("imglist length=" + this.imglist.length);
            },
            2000 //2秒后执行setTimeout的handler
          );
      }
    }

    protected onReceiveComments(commentstr:string)
    {
      //console.log("QuestionDetailPage::onReceiveComments: this.question_answerid=" + this.question_answerid);
      var comments:JSON[];
      comments = JSON.parse(commentstr)['comments'];
      this.allcomments=[];
      for (var i=0; i < comments.length; i++)
      {
        let comment:CommentData;
        comment = {
          id:0,
          comment:'string',
          replyfrom:'replyfrom',
          replyto:'replyto',
          comment_time:'string',     
          replies:[],
          isanswer:false
        };
       // console.log(typeof(comment));
        comment.id = comments[i]['id']; 
        comment.comment = comments[i]['comment']; 
        comment.replyfrom = comments[i]['replyfrom'];
        comment.replyto = comments[i]['replyto'];
        comment.comment_time = comments[i]['comment_time'];
        let replies:ReplyData[] = [];
        for (var j=0; j < comments[i]['replies'].length; j++)
        {
          let reply = {
            id: comments[i]['replies'][j]['id'],
            from: comments[i]['replies'][j]['from'],
            to: comments[i]['replies'][j]['to'],
            reply: comments[i]['replies'][j]['reply'],
            reply_time: comments[i]['replies'][j]['reply_time'],
            isanswer:false
          };
          replies.push(reply);
        }
        comment.replies = replies;
        this.allcomments.push(comment);
      }
  
      this.updateCommentAnswer();
    }

    protected issolved():boolean
    {
      if (this.status_text == this.globals.question_status_confirmed)
        return true;
      else if(this.status_text = this.globals.question_status_wait4answer)
        return false;
    }

    public updateSolved(question_answerid):boolean
    {
      this.question_issolved = true;
      this.question_answerid = question_answerid;
      this.hasApplyBtn = this.isUserabletoApply();
      this.setStatusText(this.question_issolved);
      this.updateCommentAnswer();
      return true;
    }

    public updateCommentAnswer()
    {
      for (var i=0; i < this.allcomments.length; i++)
      {
        let isanswer:boolean = false;
        let answerid:number = -1;
        if (this.allcomments[i].id == this.question_answerid)
        {
          this.allcomments[i].isanswer = true;
        }
        for (var j=0; j < this.allcomments[i].replies.length; j++)
        {
          isanswer = false;
          if (this.allcomments[i].replies[j].id == this.question_answerid)
          {
            this.allcomments[i].replies[j].isanswer = true;
          }
        }
      }
    }

    protected markAnswer(commentid:number, whoanswers:string)
    {
      console.log("markAnswer");
      if (this.globals.username == this.globals.dummyUsername)
      {
        alert("你还没有登录");
        return;
      }
      if (this.issolved())
        return;
      if (this.globals.username != this.author)
        return;
      this.showMarkAnswerUIPopover(commentid, this.id, whoanswers);
    }

    protected showMarkAnswerUIPopover(commentid:number, bbsid:number, whoanswers:string)
    {
      /* 传入弹窗参数 */
      let param = {
        questiondetailpage:this,
        bbsid:this.id,
        commentid:commentid,
        whoanswers:whoanswers
      };
      this.popover = this.popoverCtrl.create(MarkAnswerPage, param);
      this.popover.present();    
    }

    private isUserabletoApply():boolean
    {
      //console.log("QuestionDetailPage::isUserabletoApply");
      //console.log(this.question_issolved); console.log(this.question_answerid);
      //console.log(this.globals.username);
      //console.log(this.author);
      if ( (this.question_answerid == -1)  &&
            (this.author == this.globals.username)
      )
          return true;
      else
        return false;
    }


  /*
  setStatusText
  返回true，输入正确
  返回false，输入不是预期
  */
  setStatusText(question_issolved:boolean):boolean
  {
    if (question_issolved == true)
    {
      this.status_text = this.globals.question_status_confirmed;
      return true;
    }
    else if (question_issolved == false)
    {
      this.status_text = this.globals.question_status_wait4answer;
      return true;
    }
    return false;
  }

}