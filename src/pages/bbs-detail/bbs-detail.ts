import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverOptions} from 'ionic-angular';
import { PopoverController, Popover } from 'ionic-angular'
import { CommentReplyPage} from '../../pages/comment-reply/comment-reply'
import {HttpClient, HttpParams} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {GlobalsProvider} from "../../providers/globals/globals";
import {ImageBrowserPage} from "../image-browser/image-browser";
import {UserGroupsProvider} from "../../providers/user-groups/user-groups";
//图片
import { ImagePicker } from '@ionic-native/image-picker';
import { ToastServiceProvider } from "../../providers/toast-service/toast-service";
import { ImageUpload, ImageUploadCallBackObj, ImageUploadCtrl } from '../../providers/image-upload/image-upload';
import { CalendarImagesList } from '../images-list/CalendarImagesList';
import {Image} from '../images-list/image';
import { DatesUtils } from '../../providers/dates/dates';
import { BBSStoryDateConfirmPage } from '../bbs-storydate-confirm/bbs-storydate-confirm';
import { ThrowStmt } from '@angular/compiler';

/**
 * Generated class for the BbsDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

export class Info {
  title:string;
  author:string;
	content:string;
  createdate:string;
  storydate:string; //yyyy-mm-dd 或 yyyy-mm-dd hh:mm:ss
  storyampm:number; //1：上午， 2：下午， 0：没有上下午信息
  title_modified_dates:string[]
  content_modified_dates:string[]
	lastupdatedate:string;
	viewcount:number;
  dianzancount:number;
  hasDianzaned:boolean;
  vote_options:string;
  vote_rlt:string;
  ihasvoted:boolean
  images:Image[];
  question_issolved:number;
  question_answerid:number;
}
export class ItemsResponse {
	info:Info;
	status_code:number;
}

/* each Comment is all comments under one TopLevel comment */
export class ReplyData {
  reply:string;
  from:string;
  to:string;
  reply_time:string;
  id:number;  //问题贴的comment使用
  isanswer:boolean;  //问题贴的comment使用
}
export class CommentData { 
  id:number;
  comment:string;
  replyfrom:string;
  replyto:string;
  comment_time:string;
  replies:ReplyData[];
  isanswer:boolean;  //问题贴的comment使用
}

class optVoteUIInfo{  //单个投票选项的汇总信息
  public ID:string;  //投票选项的数组下标
  public option:string; //投票选项名称
  public nVote:number;  //投票数量

  constructor(ID, option, nVote)
  {
    this.ID = ID;
    this.option = option;
    this.nVote = nVote;
  }
}

class Option
{
  public ID:string;
  public index:number;  //删除选项的时候才使用
  public text:string;
}
class optionVote
{
  public optionLabelbaseAscii:number = 'A'.charCodeAt(0); //'A'
  public optionNewIDAscii:number;  //即将添加的投票选项的编号(如'A')对应的Ascii码
  //options: Option[];
  public votes:optVoteUIInfo[];

  constructor(votes:optVoteUIInfo[])
  {
    this.votes = [];
    this.CopyArrary(this.votes, votes);
    let len = this.votes.length;
    this.optionLabelbaseAscii = this.votes[len - 1].ID.charCodeAt(0) + 1;
    this.optionNewIDAscii = this.optionLabelbaseAscii;
  }

  CopyArrary(target:optVoteUIInfo[], objs:optVoteUIInfo[])
  {
    while(target.length > 0)  target.pop();
    let str = "";
    for (let i = 0; i < objs.length; i++)
    {
      var obj = objs[i];
      str = JSON.stringify(obj);
      target.push(JSON.parse(str));
    }
  }

  public getVotes():optVoteUIInfo[]  {return this.votes; }

  public hasOption(optext:string):boolean
  {
    for (let i = 0; i < this.votes.length; i++)
    {
      if (optext == this.votes[i].option)
        return true;
    }
    return false;
  }
/*
  public getOptions() 
  {
    let votes:optVoteUIInfo[] = [];
    for (let opt in this.votes)
    {
      votes.push(
        {
          'ID': opt.ID,
          'option': opt.text,
          'nVote': 0
        }
      );
    }
    return 
  }
  */
  /**
   * name
   */
  public newOption(optionText:string)
  {
    console.log("optionVote::newOption()...................")
    var optionlabelChar:string = String.fromCharCode(this.optionNewIDAscii)   //把ASCII码转化为字符
    console.log('optionlabelChar=' + optionlabelChar);
    var ID:string = optionlabelChar;
    var optionindex:number = this.optionNewIDAscii - 65;  // 65 is 'A'
    
    let vote:optVoteUIInfo = {
      'ID': ID,
      'option': optionText,
      'nVote': 0
    };
    this.votes.push(
      {
        'ID': ID,
        'option': optionText,
        'nVote': 0
      }
    );
    this.optionNewIDAscii += 1;
    console.log("optionVote::newOption==============================");
    /*
    for(let i = 0; i < this.votes.length; i++)
    {
      console.log("optionVote::votes options====" + this.votes[i].option);
    }
    */

  }
}

class BBS_DETAIL_ImageUploadCallBackObj extends ImageUploadCallBackObj
{
  page:any;
  bbsid:number;

  constructor(page:any, public http: HttpClient, public globals:GlobalsProvider)
  {
    super();
    this.page = page;
    this.bbsid = this.page.getbbsid();
    this.finished_callback = false;
  }

  /**
   * 全部图片上传成功后回调该函数，添加帖子到上传的图片的关联
   * @param isimageUploadsucc 
   * @returns 
   */
  public allImagesUploadProcedured_callback(isimageUploadsucc:boolean)
  {
    if (! isimageUploadsucc)
    {
      console.log("postcall_1_newPost:upload had error!");
      alert("上传图片发生错误！");
    }
    //关联上传成功的图片
    console.log("newPost:getUploadedImagesIDs=");
    console.log(this.uploadImg.getUploadedImagesIDs());
    let uploadedimgs:Image[] = this.uploadImg.getUploadedImages();
    if (uploadedimgs.length > 0)
    {
      let body = {
        'id':this.bbsid,
        'imgids':this.uploadImg.getUploadedImagesIDs()
      };
      let options = {
        withCredentials: true
      };
        this.http.post<ItemsResponse>(this.globals.server + 'bbs/attachimages/',
        this.encodeHttpParams(body), options).
          subscribe(
            data => this.onRecvAttachBBSImagesRST(data),
          err => alert("关联帖子和上传的图片请求失败")//console.log(JSON.stringify(err))
          );
    }

  }

  onRecvAttachBBSImagesRST(data:any)
  {
    this.finished_callback = true;
    if (data['status_code'] == 0)
    {
      /* since after attach images, images' server path changed. 
      so we update new server path in Bbs-Detail page's uploadImg.imglist's image path*/
      for (let i = 0; i < data['imgs'].length; i++)
      {
        let img = data['imgs'][i];
        this.uploadImg.setImagePath(img['imgid'], img['path']);
      }
      let updatedimgs = this.uploadImg.getUploadedImages();
      if (this.page != undefined)
        this.page.appendImgstoImageList(updatedimgs);
    }
    else
      alert("关联帖子和上传的图片失败");
  }

  encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
}

@IonicPage()
@Component({
  selector: 'page-bbs-detail',
  templateUrl: 'bbs-detail.html',
})
export class BbsDetailPage {
  optionText: string;

  //public detail:Info;
  protected id:number;  // bbs id
  protected groupid:number;    // 文章所在的组
  protected groupname:string;
  protected content:string;  // plain text of bbs content
  protected title:string;
  protected author:string;
  protected createdate:string;
  protected storydateDisplay: string;
  dianzancount:number;
  hasDianzaned:boolean;
  protected title_modified_dates:string[];
  protected content_modified_dates:string[];
  protected viewcount:number;
  options_vote_rlt:optVoteUIInfo[];  // 如果没有投票选项，是空列表。列表每个投票选项都在该列表里有一个元素，如果该选项没有投票，其计数为0
  protected ihasvoted:boolean;      // 当前用户是否已投票
  protected voteprompt:string;
  optionEdit:optionVote;
  protected sanitizeHtml:any; // Html object of bbs content
  protected text:string;   // comment in text input
  protected allcomments:CommentData[];  // all comments of this bbs topic of type CommentData[]
  protected popover:Popover;
  protected buserableEdit:boolean;
  protected EditBtnTxt:string;
  protected isEditing:boolean;
  protected title_edit:string;
  protected content_edit:string;
  protected imglist:Image[];
  protected imgUIRows:number[];   // [0,1,2,3,...]
  protected picLoadComplete: boolean;

  optionplaceholder: string;
  protected bKWhighlight: boolean;
  protected renderedContent: string;
  //图片上传
  protected uploadimglist:ImageUpload[];
  protected uploadImg:ImageUploadCtrl;
  protected upload_callback: ImageUploadCallBackObj;
  protected popover_confirm: Popover;
  protected timer: number; //NodeJS.TimeOut | null = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public popoverCtrl:PopoverController,
    public http: HttpClient, public sanitize:DomSanitizer, public globals:GlobalsProvider, public user_groups:UserGroupsProvider,
    public imagePicker:ImagePicker, public noticeSer:ToastServiceProvider, public datesUtils: DatesUtils)
  {
    this.id = navParams.get('id');  //get bbs id from navParams;
    this.groupid = navParams.get('groupid');
    this.groupname = navParams.get('groupname'); //this.user_groups.getGroupName(this.groupid);
    this.bKWhighlight = (navParams.get('keywords').length > 0);
    this.title = "";
    this.content = "";
    this.setcontent(this.content);
    this.text = "";
    this.storydateDisplay = "";
    this.hasDianzaned = false;
    this.dianzancount = -1;
    this.title_modified_dates = [];
    this.content_modified_dates = [];
    this.EditBtnTxt = "编辑";
    this.isEditing = false;
    this.imglist = [];
    this.imgUIRows = [];
    this.picLoadComplete = false;
    this.options_vote_rlt = [];  //初始化为没有投票信息
    this.voteprompt = "";
    this.uploadimglist = [];
    this.uploadImg = null;
    this.upload_callback = null;
	  //let testdata:any = {"id":"1","title":"title1"};
	  console.log("BbsDetailPage:id=" + navParams.get('id'));
    console.log("BbsDetailPage:groupid=" + this.groupid.toString());
    console.log("BbsDetailPage:groupname=" + this.groupname);
    /* get topic detail */
    let options = {
      withCredentials: true
    };
      this.http.get<ItemsResponse>(this.globals.server + 'bbs/getarticledetail/' + this.id + '/',
            options).
        subscribe(
          data => this.onRecvBBSDetailData(data),
        err => alert("获取帖子内容失败")//console.log(JSON.stringify(err))
        );

    
    this.getcomments();      
        
  }

  public getbbsid():number
  {
    return this.id;
  }

  protected setcontent(s:string)
  {
    this.content = s;
    this.renderedContent = this.content;
    if (this.bKWhighlight)
      this.renderedContent = this.HighLighthtml(this.content, this.navParams.get('keywords'));
  }

  protected HighLighthtml(str:string, kws:string[]):string
  {
    let HLstr = str;
    for (let i = 0; i < kws.length; i++)
    {
      var re = new RegExp(kws[i], 'gi');
      HLstr = HLstr.replace(re, '<span class=\"hightlight\">' + kws[i] + '</span>');
    }
    console.log("HighLighthtml:HLstr="+HLstr);
    return HLstr;
  }

  protected encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  protected onRecvBBSDetailData(data:ItemsResponse)
  {
    this.content = data.info.content;
    // Replace Image src domain
    this.content = this.replaceImgSrc(this.content);
    this.setcontent(this.content);
    this.content_edit = "";
    this.title = data.info.title;
    this.title_edit = this.title;
    this.createdate = data.info.createdate;
    var ampm = data.info.storyampm;
    var storydate = data.info.storydate;
    this.parseStorydate(storydate, ampm);
    this.dianzancount = data.info.dianzancount;
    this.hasDianzaned = data.info.hasDianzaned;
    this.viewcount = data.info.viewcount;
    this.title_modified_dates = data.info.title_modified_dates;
    this.content_modified_dates = data.info.content_modified_dates;
    console.log("this.content_modified_dates.length=" + this.content_modified_dates.length);
    console.log("this.hasDianzaned=" + this.hasDianzaned);
    this.sanitizeHtml = this.sanitize.bypassSecurityTrustHtml(this.content);
    console.log(this.sanitizeHtml);
    this.author = data.info.author;
    this.buserableEdit = this.isUserabletoEdit();
    console.log("data.info.vote_options=" + data.info.vote_options);
    //判断vote_options是否为空
    if (data.info.vote_options != null)
      this.parseVoteData(data.info.vote_options, data.info.vote_rlt, data.info.ihasvoted);
    let images = data.info.images;  
    for (let i = 0; i < images.length; i++)
    {
      this.imglist.push({"imgid":images[i].imgid, "path":images[i].path});
      console.log("onRecvBBSDetailData: get image: path=" + images[i].path);
    }
    this.reformImageRows();

    if (this.imglist.length > 0)
    {
        this.timer = setTimeout(
          () => {
            console.log("set picLoadComplete = true");
            this.picLoadComplete = true;
            console.log("imglist length=" + this.imglist.length);
          },
          6000 //6秒后执行setTimeout的handler
        );
    }
    
    console.log("onRecvBBSDetailData:options_vote_rlt.length = " + this.options_vote_rlt.length);
    console.log("onRecvBBSDetailData:options_vote_rlt=" + this.options_vote_rlt);
  }
  
  /**
   * 
   * @param strdt 
   * @param ampm 0：不含上下午信息， 1,2,3,4含上下午信息，1或3是上午，2或4是下午，1和2不含时点，3和4含时点
   */
  public parseStorydate(strdt:string, ampm:number)
  {
    console.log("parseStorydate");
    console.log(strdt);
    console.log(ampm);
    if (ampm == 0)
      this.storydateDisplay = strdt.substring(0, 10);
    else if (ampm == 1 || ampm == 2)
    {
      this.storydateDisplay = strdt.substring(0, 10);
      this.storydateDisplay += (ampm == 1 ? '上午' : '下午');
    }
    else if (ampm == 3 || ampm == 4)
    {
        this.storydateDisplay = strdt.substring(0, 10);
        this.storydateDisplay += (ampm == 3 ? '上午' : '下午');
        var h:number = strdt[11] == '0' ? Number(strdt.substring(12, 13)) : Number(strdt.substring(11, 13))
        h = h >= 12 ? Number(h - 12) : h;
        this.storydateDisplay += h.toString();
        this.storydateDisplay += '点';
    }
  }

  private parseVoteData(vote_options_db:string, options_vote_rlt_db:string, ihasvoted:boolean)
  {
    console.log("Entering bbs-detail::parseVoteData");
    console.log("vote_options_db=" + vote_options_db);
    this.ihasvoted = ihasvoted;
    this.voteprompt = ihasvoted ? "你已投票" : "请投票";
    var vote_options:string[] = vote_options_db.split('#');
    //console.log("1111111111111111111");
    console.log(vote_options);
    //console.log("222222222222222222");
    console.log(options_vote_rlt_db);
    var options_vote_rlt_json:JSON = JSON.parse(options_vote_rlt_db);
    //console.log("qqqqqqqqqqqqqqqqqqqq");
    this.options_vote_rlt = [];
    var optionLabelAscii:number = 65; // 'A'
    for (var i:number = 0; i < vote_options.length; i++)
    {
      var optvoteInfo:optVoteUIInfo = {
        'ID':'A',
        'option':"option_name",
        'nVote':0
      };
      optvoteInfo.ID = String.fromCharCode(optionLabelAscii + i);
      optvoteInfo.option = vote_options[i];
      var nVote:number = 0;
      //console.log("3333333333333333333");
      try
      {
        nVote = options_vote_rlt_json[(vote_options[i])].length;
      }
      catch(e)
      { //没有vote_options[i]的投票计数
        nVote = 0;
        console.log("Info: Some option is not voted");
      }
      //console.log("4444444444444444444");
      optvoteInfo.nVote = nVote;
      this.options_vote_rlt.push(optvoteInfo);

      //console.log("parseVoteData==============================");
      //console.log("optvoteInfo.option:" + optvoteInfo.option);
      
      console.log(optvoteInfo.ID);console.log(optvoteInfo.option);console.log(optvoteInfo.nVote);
    }

    console.log("parseVoteData==============================");
/*    for(let vote in this.options_vote_rlt)
    {
      //console.log("vote:" + vote);
      console.log("for1 option:" + vote['option']);
      console.log("for1 option:" + vote.option);
    }*/
    for (let i = 0; i < this.options_vote_rlt.length; i ++)
    {
      //console.log("vote:" + vote);
      console.log("for2 option:" + this.options_vote_rlt[i]['option']);
      console.log("for2 option:" + this.options_vote_rlt[i].option);
    }





    //console.log(this.options_vote_rlt.length);
    console.log("bbs-detail::parseVoteData ends")
  }

  protected assembleHTML(strHTML: any) 
  {
    let largeFontHTML:string = this.enlargeHTMLFontSize(strHTML);
    return this.sanitize.bypassSecurityTrustHtml(strHTML);
  }

  protected enlargeHTMLFontSize(content):string
  {
    let commonFontSize = "midsize";
    return this.getcontentFontSizeMarkBegin() + content + this.getcontentFontSizeMarkEnd();
  }

  protected switchKWHighLight()
  {
    if (this.navParams.get('keywords').length > 0)
    {
      this.bKWhighlight = ! this.bKWhighlight;
      this.setcontent(this.content);
    }
  }

  protected getcontentFontSizeMarkBegin():string
  {
    let commonFontSize = "midsize";
    //return "<div class=" + commonFontSize + " row" +">";
    //console.log("getcontentFontSizeMarkBegin:<div style=\"font-size: large;\">")
    return "<div style=\"font-size: large;\">";
  }
  protected getcontentFontSizeMarkEnd():string
  {
    //return "</div>";
    return "</div>";
  }
  protected decreaseHTMLFontSize(content:string):string
  {
    console.log("decreaseHTML:" + content);
    if (content.startsWith(this.getcontentFontSizeMarkBegin()) && content.endsWith("</div>"))
    {
        var newstr = content.slice(this.getcontentFontSizeMarkBegin().length, content.length - this.getcontentFontSizeMarkEnd().length);
        
        console.log(content.length);
        console.log(this.getcontentFontSizeMarkBegin().length);
        console.log(this.getcontentFontSizeMarkEnd().length);
        console.log(content.length - this.getcontentFontSizeMarkBegin().length - this.getcontentFontSizeMarkEnd().length);
        console.log("decreaseHTML:" + newstr);
        return newstr;
    }
    return content;
  }
/* Replace Image src domain
 e.g img src="../../img/6/11.jpg/" 
  to img src=this.globals.server + "img/6/11.jpg/"
*/
protected replaceImgSrc(content:string):string
{
  let server = this.globals.server; //"192.168.0.198:8000";
  var newcontent:string = content.replace(new RegExp(/img src=\"..\/..\//g), "img src=" + server);
  console.log("BbsDetail::replaceImgSrc: newcontent=" + newcontent);
  return newcontent
}
protected reversereplaceImgSrc(content:string):string
{
  let server = this.globals.server; //"192.168.0.198:8000";
  let str = "img src=" + server;
  var newcontent:string = content.replace(new RegExp(str, "g"), "img src=\"../../");
  return newcontent
}
protected modifyStorydate()
{
  let params = {
    'bbsid': this.id,
    'date': this.storydateDisplay.substring(0,10),
    'parent':this
  };
  this.popover_confirm = this.popoverCtrl.create(BBSStoryDateConfirmPage, params);
  this.popover_confirm.present();    
}

protected deleteStorydate()
{
  var body = JSON.parse("{}");
  body['id'] = this.id;
  let options = {
      "withCredentials":true
  };
  this.http.post<any>(this.globals.server + 'bbs/deletestorydate/', this.encodeHttpParams(body), options).
  subscribe(
      data => this.onRecvDeleteStorydateResult(data), // refresh comments
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
  );
}

protected onRecvDeleteStorydateResult(data:any)
{
  if (data['status_code'] == 0)
  {
    this.parseStorydate("", 0);
  }
  else
  {
    alert("删除故事时间失败");
  }
  
}

 protected uploadImagefromImagePicker() {
  this.uploadimglist = [];
  let temp = '';
  this.imagePicker.getPictures(this.globals.imagePickerOpt).then((results)=> {
    console.log("uploadImagefromImagePicker::openImgPicker");

      for (var i=0; i< results.length; i++) {
      temp = results[i];
      console.log("uploadImagefromImagePicker::openImgPicker: temp=" + temp);
      this.uploadimglist.push({
        "imgid":-1,
        "isuploaded":false,
        "path":temp
      });
      }
      if (this.upload_callback == null)
        this.upload_callback = new BBS_DETAIL_ImageUploadCallBackObj(this, this.http, this.globals);
      if (this.uploadImg == null)
        this.uploadImg = new ImageUploadCtrl(this.upload_callback, this.globals.server);
      console.log("uploadImagefromImagePicker::uploadImagefromImagePicker: imglist.length="+this.uploadimglist.length.toString());
      if (this.uploadimglist.length > 0)
      {  
          this.uploadImg.setImagelist(this.uploadimglist);
          let ret = this.uploadImg.uploadImageList();
          console.log("uploadImagefromImagePicker::uploadImgList: return=");
          console.log(ret);
      }  
    }, 
    (err)=> {
    this.noticeSer.showToast('打开相册发生错误:'+ err);//错误：无法从手机相册中选择图片！
  });                                                                                                                                                                              
  console.log("ImageUploadPick::openImgPicker end");
  }

  public appendImgstoImageList(imgs:Image[])
  {
    for (let i = 0; i < imgs.length; i++)
      this.imglist.push(imgs[i]);
    this.reformImageRows();
  }

  private dianzan(id:number)
  {
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录，不能点赞");
      return;
    }
    let body = {
      'id':this.id
    }
    if (this.hasDianzaned) //用户已经点过赞
    {
      alert("不能重复点赞，你已经点过赞了");
      return;
    }
    let options = {
      'withCredentials':true
    }
    this.http.post<any>(this.globals.server + 'bbs/dianzanarticle/', this.encodeHttpParams(body), options).
    subscribe(
      data => (this.hasDianzaned = true) && (this.dianzancount = data['dianzan']),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  /* make member variable of type CommentData[] */
  protected onReceiveComments(commentstr:string)
  {
    console.log("bbs-detail::onReceiveComments");
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
        isanswer:false  //问题贴使用
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
        let reply:ReplyData;
        reply = {
          from:'from',
          to:'to',
          reply:'reply',
          reply_time:'reply_time',
          id:-1,  //问题贴的comment使用
          isanswer:false  //问题贴的comment使用
        };
        reply.from = comments[i]['replies'][j]['from'];
        reply.to = comments[i]['replies'][j]['to'];
        reply.reply = comments[i]['replies'][j]['reply'];
        reply.reply_time = comments[i]['replies'][j]['reply_time'];
        replies.push(reply);
      }
      comment.replies = replies;
      this.allcomments.push(comment);
    }
  }

  protected getcomments()
  {
    this.http.get(this.globals.server + 'comments/getcomments/' + this.id + '/').
    subscribe(
      data => this.onReceiveComments(JSON.stringify(data)),
      err => alert("获取评论失败")//console.log(JSON.stringify(err))
    )
  }

  /*
   submitComment:
   submit direct reply of bbs topic. This comment is at top level
  */
   protected submitComment(comment:string)
  {
    console.log("Enter submitComment");
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录，不能评论");
      return;
    }
    if (this.text.length == 0)
      return;
    let body = {
      'bbsid':this.id,
      'replyfrom':this.globals.username,
      'replyto':this.author,
      'content':this.text      
    }
    this.text = "";
    this.http.post(this.globals.server + 'comments/post_toplevel/', this.encodeHttpParams(body), {}).
    subscribe(
      data => this.getcomments(), // refresh comments
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  protected replyComment(replyto:string, topcommentid:string, content:string)
  {
    console.log("Enter replyComment");
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录，不能回复");
      return;
    }
    this.showReplyUIPopover(this.id, this.globals.username, replyto, topcommentid);
  }

  protected showReplyUIPopover(bbsid:number, replyfrom:string, replyto:string, topcommentid:string)
  {
    /* 传入弹窗参数 */
    let param = {
      bbsdetailpage:this,
      bbsid:this.id,
      replyto:replyto,
      topcommentid:topcommentid
    };
    let opts:PopoverOptions = {
      "cssClass":"stype=height:100px"
    };
    this.popover = this.popoverCtrl.create(CommentReplyPage, param, opts);
    this.popover.present();
    //console.log(this.popover._config.get("cssClass"));
    //var s = document.querySelector('.CommentReplyPage');
    //alert(s.className);
    //s['style'].width = '10px';
  
  }
  
  private focusOptionText()
  {
    // 如果投票选项输入框里是缺省的内容就清空内容，否则不清空内容
    if (this.optionText == this.globals.optionplaceholder)
      this.optionText = "";
  }
  getVoteOptions():string[]
  {
    let ret = [];
    for (let i = 0; i < this.options_vote_rlt.length; i++)
    {
      ret.push(this.options_vote_rlt[i].option);
    }
    return ret;
  }
  
  newOption()
  {
    if (this.optionText == this.optionplaceholder)
    {
      console.log("no user input");
      return;
    }
    if (this.optionText.length == 0)
    {
      console.log("empty option input");
      return;
    }
    if (this.optionEdit.hasOption(this.optionText))
    {
      console.log("can not add duplicated option");
      alert("该选项已经存在");
      return;
    }
    console.log("bbsdetailpage::newOption.............");
    for(let i = 0; i < this.options_vote_rlt.length; i++)
    {
      console.log("BbsDetailPageoption before optionVote::newOption:" + this.options_vote_rlt[i].option);
    }

    this.optionEdit.newOption(this.optionText);

    this.optionText = "";
  //  console.log("bbsdetailpage::newOption.............");
    /*for(let i = 0; i < this.options_vote_rlt.length; i++)
    {
      console.log("BbsDetailPageoption after optionVote::newOption:" + this.options_vote_rlt[i].option);
    }
    */
  }

  getOptionListfromVote(optionVotes:optVoteUIInfo[]):Option[]
  {
    let options = [];
    for (let i = 0; i < optionVotes.length; i++) 
    {
      options.push(
        {
          'ID':optionVotes[i].ID,
          'index':0,
          'text':optionVotes[i].option
        }
      )
    }
    return options;
  }
  
  private vote(optionID:string)
  {
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录");
      return;
    }
    var optionid:number = optionID.charCodeAt(0) - 65;
    var bbsid:number = this.id;
    let body = {
      'bbsid':bbsid,
      'optionid':optionid,
      'username':this.globals.username
    }
    this.http.post(this.globals.server + 'bbs/votebbs/', this.encodeHttpParams(body), {}).
    subscribe(
      data => this.onRecvVoteResponse(JSON.stringify(data)), // refresh comments
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }
  private onRecvVoteResponse(res:string)
  {
    var resp_json:JSON = JSON.parse(res);
    var msg:string = resp_json['msg'];
    if (resp_json['status_code'] == 0)
    {
      let optionid:number = resp_json['optionid'];
      for (let item of this.options_vote_rlt)
      {
        if (item.ID.charCodeAt(0) - 65 == optionid)
        {
          item.nVote += 1;
        }
      }
      alert("投票成功！");
    }

    else if (resp_json['status_code'] == -2)
    {
      alert("你已投过票了，不能多投票！");  //alert(msg);
    }
    else if (resp_json['status_code'] == -3)
    {
      alert("你不能投票！");
    }
    else
    {
      alert("投票失败! 未知原因");
    }
  }
  /*private get_vote_rlt_by_optionid(optionid:number):optVoteUIInfo
  {
    
  }*/
  private getUseriDbyName(usernames:string[]):number[]
  {
/*    var usersid:number[] = [];
    let body = {
      'usernames':usernames
    }
    this.http.post(this.globals.server + 'getuserid/', this.encodeHttpParams(body), {}).
    subscribe(
      data => this.getcomments(), // refresh comments
      err => alert(JSON.stringify(err))//console.log(JSON.stringify(err))
    )*/
    return [6];
  //  return usersid;
  }

  protected onClickEditBtn()
  {
    
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录");
      return;
    }
    
    this.isEditing = ! this.isEditing;
    if (this.isEditing)
    {
      this.EditBtnTxt = "保存";
      this.title_edit = this.title;
      this.content_edit = (this.content);
      console.log(this.content_edit);

      console.log("onClickEditBtn==============================");
      console.log("onClickEditBtn:options_vote_rlt.length=" + this.options_vote_rlt.length.toString());
      // 判断是否编辑投票信息
      if (this.options_vote_rlt.length > 0)
      { // 有投票选项
        console.log("onClickEditBtn: before create optionVote");
        this.optionEdit = new optionVote(this.options_vote_rlt);
        console.log("onClickEditBtn: after create optionVote");
      }
      console.log("onClickEditBtn: 111111111111");
    }
    else 
    {
      this.EditBtnTxt = "编辑";
      let body = {};
      let bhaschange:boolean = false;
      /*if (this.content_edit == this.content && this.title_edit == this.title)
        return;
      */
      // post save changes
      console.log("BbsDetail::onClickEditBtn:content:" + this.content);
      console.log("BbsDetail::onClickEditBtn:decreasecontent:" + (this.content));
      if (this.content_edit == (this.content) && this.title_edit == this.title)
      {
        //do nothing
      }
      else if (this.content_edit != (this.content) && this.title_edit == this.title)
      {
        body = {
          'username':this.globals.username,
          'content':this.reversereplaceImgSrc(this.content_edit)
        };
        bhaschange = true;
      }
      else if (this.content_edit == (this.content) && this.title_edit != this.title)
      {
        body = {
          'username':this.globals.username,
          'title':this.title_edit
        };
        bhaschange = true;
      }      
      else
      {
        body = {
          'username':this.globals.username,
          'title':this.title_edit,
          'content':this.reversereplaceImgSrc(this.content_edit)
        };
        bhaschange = true;
      }

      // 判断是否有投票信息
      //body['newopts] = set(optionEdit.options) - set(options)
      if (this.optionEdit)
      {
        let newopts:string[] = [];  //添加投票选项
        for (let i = 0; i < this.optionEdit.getVotes().length; i++)
        {
          var edopt = this.optionEdit.getVotes()[i];
          console.log("edop.option=" + edopt.option);
          console.log("getVoteOptions=" + this.getVoteOptions());
          //if ( ! (edopt.option in this.getVoteOptions()) )
          let bnewopt = true;
          for (let ied = 0; ied < this.getVoteOptions().length; ied++)
          {
            if (edopt.option == this.getVoteOptions()[ied])
            {
              bnewopt = false;
              break;
            }
          }
          if (bnewopt)
          {
            newopts.push(edopt.option);
          }
        }
        console.log("newopts.length=" + newopts.length);
        if (newopts.length > 0)
        {
          bhaschange = true;
          body['newopts'] = "";
          for (let i = 0; i < newopts.length; i++)
          {
            body['newopts'] += newopts[i].concat("#");
          } 
          body['newopts'] = body['newopts'].substring(0, body['newopts'].length-1);
          console.log("body['newopts']=" + body['newopts']);
        }
        console.log("body=");
        console.log(JSON.stringify(body));
      }
      if (bhaschange)
      {
        let options = {
          "withCredentials":true
        }
        this.http.post<any>(this.globals.server + 'bbs/modifycontent/'+this.id+'/', this.encodeHttpParams(body), options).
        subscribe(
          data => this.onRecvModifyResult(data), // refresh comments
          err => this.postcallEdit_destroyobjests() && alert("服务器请求失败，修改失败")  //释放对象
        )
      }

    }
    
      
  }
  protected onRecvModifyResult(res:JSON)
  {
    if (res['status_code'] == 0)
    {
      if (res['title_modified_date'] != "")
        this.title_modified_dates.push(res['title_modified_date']);
      if (res['content_modified_date'] != "")
        this.content_modified_dates.push(res['content_modified_date']);
      this.title = this.title_edit;
      this.content = this.content_edit;
      this.setcontent(this.content);
      // 判断是否有投票信息
      if (this.optionEdit)
        this.CopyArrary(this.options_vote_rlt, this.optionEdit.getVotes());
    }
    else
    {
      alert("服务器修改发生错误！");
    }
    //释放对象
    this.postcallEdit_destroyobjests();
  }

  protected onClickCancelEditBtn()
  {
    this.isEditing = ! this.isEditing;
    this.EditBtnTxt = "编辑";
    this.postcallEdit_destroyobjests();
  }

  /**
   * postcallEdit_destroyobjests
   * 编辑完成和取消时最好释放对象
   */
  protected postcallEdit_destroyobjests():boolean
  {
    if (this.optionEdit)
    {
      console.log("BbsDetailPage::postcallEdit_destroyobjests: relase edit objects.");
      delete this.optionEdit;      
    }
    return true;
  }

  protected isUserabletoEdit():boolean
  {
    console.log(this.globals.username);
    console.log(this.author);
    //console.log(this.globals.username == this.author);
    return (this.globals.username == this.author && this.user_groups.isGroupMember(this.groupid));
  }
  CopyArrary(target:any[], objs:any[])
  {
    while(target.length > 0)  target.pop();
    let str = "";
    for (let i = 0; i < objs.length; i++)
    {
      var obj = objs[i];
      str = JSON.stringify(obj);
      target.push(JSON.parse(str));
    }
  }
  protected isHTMLContent(content:string):boolean
  {
    /*
example 
<h1 style="text-align: center;"><span style="text-decoration: line-through; color:
#ff0000; background-color: #99cc00;"><span style="text-decoration:
underline;"><em><strong>g</strong></em></span></span></h1> <blockquote> <ul> <li><span style="color:
#ff0000;"><strong><em><span style="text-decoration: underline;"><span style="text-decoration:
line-through;">d</span></span></em></strong></span></li> </ul> <ol> <li><span style="color:
#ff0000;"><strong><em><span style="text-decoration: underline;"><span style="text-decoration:
line-through;">sf</span></span></em></strong></span></li> </ol> <table style="height: 44px; width: 250px;"
border="0"> <tbody> <tr> <td><span style="color: #ff0000;">1</span></td> <td>2</td> </tr> <tr> <td>3</td>
<td>4</td> </tr> </tbody> </table> <p>&nbsp;</p> <p>&amp;</p> <p><span style="color:
#ff0000;"><strong><em><span style="text-decoration: underline;"><span style="text-decoration:
line-through;"><img title="Embarassed"
src="../../../static/tiny_mce/plugins/emotions/img/smiley-embarassed.gif" alt="Embarassed" border="0"
/></span></span></em></strong></span></p> <p>&nbsp;</p> <p>--</p> <hr style="width: 90%;" width="90%" />
<p>&nbsp;</p> <p>&nbsp;</p> <p>&nbsp;</p> </blockquote> <p style="text-align: center;">&nbsp;</p> <p
style="text-align: right;">2019-08-1010:57:54</p>
    */
   let marks = ["<p>","</h1>","</h2>","</h3>","</h4>","</h5>","</h6>","</span","style=\"","</table>"];
   for (let mark of marks)
   {
    if (content.indexOf(mark, 0) >= 0)
      return true;
   }
   return false;
  }

  /*
  根据this.imglist大小计算图片显示的行数，重新生成imgUIRows
  */
  protected reformImageRows()
 {
   let nRows = this.imglist.length / 5;
   this.imgUIRows = [];
   for (let i = 0; i <= nRows; i++)
   {
     this.imgUIRows.push(i);
   }
 }

 protected viewImage(index:number)
 {
    let bbsimages = [];
    let bbsimage = JSON.parse("{}");
    bbsimage['bbsid'] = this.getbbsid();
    bbsimage['title'] = this.title;
    bbsimage['createdate'] = this.createdate,
    bbsimage['groupid']= this.groupid;
    bbsimage['imgs'] = this.imglist;
    let bbsimageList:CalendarImagesList = new CalendarImagesList(this.user_groups, this.datesUtils);
    bbsimageList.MergeUniques_RecvedList(bbsimageList.convertJSONstoItems([bbsimage]));
    console.log(bbsimageList.convertJSONstoItems([bbsimage]).length);
    console.log("viewImage bbsimageList length=" + bbsimageList.getlist().length);
    let param = {
      'bbsimages':bbsimageList.getlist(),
      'bbsindex':0,
      'imageindex':index
    };
    this.navCtrl.push(ImageBrowserPage, param);
 }

   /**
   * 
   * 点击添加图片后立即点击导航返回上一页测试结果：
   * 图片上传成功，没有打印delete...
   * 对比：添加图片后，留在页面等待显示添加的图片，会打印delete...
   */
 protected ionViewWillLeave() {
  console.log('ionViewDidLeave BbsDetailPage');
  if (this.upload_callback != null && this.uploadImg != null)
  {
    if (this.upload_callback.finished_callback == true)
    {
      console.log("delete upload_callback");
      delete this.upload_callback;
      console.log("delete uploadImg");
      delete this.uploadImg;
    }
  }
 }

 /*
 protected static timestampDetect():boolean
 {
  var timestamp:number = Date.parse(new Date().toString())/1000;
  console.log("timestampDetect:" + timestamp);
  if (timestamp - this.timestamp_recveddata < 5)
    this.bshowPicLoading = true;
  else
  {
    console.log("timestampDetect:set bshowPicLoading = false");
    this.bshowPicLoading = false;
    this.picLoadComplete = true;
  }
  return true;
 }
*/
}



