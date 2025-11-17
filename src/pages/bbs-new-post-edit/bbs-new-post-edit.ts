import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GlobalsProvider} from "../../providers/globals/globals";
import {HttpClient, HttpParams} from "@angular/common/http";

import { ModalController, Modal } from 'ionic-angular';
import {BbsVotersPickPage} from "../../pages/bbs-voters-pick/bbs-voters-pick";
import * as tinymce from "tinymce";
import { stringify } from '@angular/core/src/util';
import { isTrueProperty } from 'ionic-angular/umd/util/util';
//图片
import { ImagePicker } from '@ionic-native/image-picker';
import { ToastServiceProvider } from "../../providers/toast-service/toast-service";
import {Image} from "../../pages/images-list/image";
import { ImageUpload, ImageUploadCallBackObj, ImageUploadCtrl } from '../../providers/image-upload/image-upload';
/**
 * Generated class for the BbsNewPostEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class Option
{
  ID:string;
  index:number;
  text:string;
}

export class GroupPickedItem
{
  groupid:number;
  exclude:number[];  // user id of whoever are excluded corresponding to the groupid.
} 

class ImageSortUI
{
  image:ImageUpload;
  isblank:boolean;
  index:number;
}

//   // SortImageUI usage
//   onSortImgList()
//   {
//   try
//   {  
//     this.sortImg = new SortImageUI(this.imglist);
//   }
//   catch(e)
//   {
//     alert("图片排序初始化失败");
//   }
// }

//   /**
//    * finishSortImgList
//    * 结束排序
//    * 完成排序并更新服务器序列后，把sortImg.sortimglist的图片拷贝到imglist
//    */
//   finishSortImgList()
//   {
//     let sortimglist = this.sortImg.GetImages();
//     this.sortImg.pickprompt = "";
//     let uploadedimgids:number[] = [];
//     let postimgs = "";
//     for (let img of sortimglist)
//     {
//       if (img.isuploaded == true)
//       {
//         uploadedimgids.push(img.imgid);
//         postimgs += img.imgid.toString();
//         postimgs += '#'
//       }
//     }
//     this.imglist = sortimglist;
//     delete this.sortImg;
//   }
//   onPickSortPos(index:number)
//   {
//     this.sortImg.onPickSortPos(index);
//     if (this.sortImg.isIndexBlank(index)) //索引指向图片之间的间隔的位置, 结束排序
//     {
//         this.finishSortImgList();
//     }
//   }
//   // end of  Sort Images usage
//  SortImageUI implementation below is dropped!!!
//  sort list element type and sort method need to be dropped.
// class SortImageUI{
//   sortimglist:ImageSortUI[];
//   public sortimgUIRowIndexes:number[];
//   manualsort:boolean;  //用户是否在排序操作中
//   picktimes:number;
//   sortMoveFromindex:number;
//   sortMoveToindex:number;
//   pickprompt:string;

//   constructor(imglist:ImageUpload[]){
//     this.manualsort = true;
//     this.sortimglist = [];
//     this.picktimes = 0;
//     this.pickprompt = "请选择要重新排序的图片";
//     this.sortimgUIRowIndexes = [];
//     let i = 0;
//     for (let img of imglist)
//     {
//       //添加blank节点
//       this.sortimglist.push({
//         "index":i++,
//         "isblank":true,
//         "image":undefined
//       });
//       this.sortimglist.push({
//         "index":i++,
//         "isblank":false,
//         "image":img
//       });
//     }
//     //添加最后的一个blank节点
//     this.sortimglist.push({
//       "index":i++,
//       "isblank":true,
//       "image":undefined
//     });
//     for (let img of this.sortimglist)
//     {
//       console.log("-----------------");
//       console.log(img.isblank);
//       if (img.isblank == false)
//         console.log(img.image.path);
//     }  

//     this.reformSortImageRows();
//   }

//   /**
//    * isIndexBlank
//    * index是选中的图片返回false。若index是图片间隔位置，返回true
//    * 参看html里排序的布局以及构造函数
//    * @param index 
//    * @returns 
//    */
//   public isIndexBlank(index:number)
//   {
//     return index in [0, 2, 4, 6, 8];
//   }
//   private getTailIndex():number 
//   {
//     return this.sortimglist.length - 1;
//   }
//   public addImagetoList(img:ImageUpload)
//   {
//     this.sortimglist.push({
//       "index":this.getTailIndex() + 1,
//       "isblank":false,
//       "image":img
//     });
//     //添加最后一个blank节点
//     this.sortimglist.push({
//       "index":this.getTailIndex() + 1,
//       "isblank":true,
//       "image":undefined
//     });
//   }
  
// onPickSortPos(index:number)
// {
//   console.log("onPickSortPos: index=" + index);
//   console.log("sortimglist.length=" + this.sortimglist.length);
//   if (this.picktimes == 0)
//   {
//     if (this.sortimglist[index].isblank == false)
//     {
//       this.picktimes = 1;
//       this.sortMoveFromindex = index;
//       this.pickprompt = "请点击新位置";
//     }
//   }
//   else if (this.picktimes == 1)
//   {
//     if (this.sortimglist[index].isblank == true)
//     {
//       this.picktimes = 2;
//       this.sortMoveToindex = index; 
//     }
//   }
  
//   if (this.picktimes == 2)
//   {
//     //重新排列
//     let sortimglist:ImageSortUI[] = [];
//     if (this.sortMoveFromindex < this.sortMoveToindex)
//     {
//       let index = 0;
//       let insertedblank = false;
//       for (let i = 0; i < this.sortMoveFromindex; i++)
//       {
//         if (this.sortimglist[i].isblank == false)
//         {
//           if (insertedblank == false)
//             sortimglist.push({
//               "image":undefined,
//               "index":index ++,
//               "isblank": true
//             });
//           sortimglist.push({
//             "image":this.sortimglist[i].image,
//             "index": index ++,
//             "isblank": false
//           });
//           insertedblank = false;  
//         }
//       }
//       for (let i = this.sortMoveFromindex + 1; i < this.sortimglist.length; i++)
//       {
//         if (this.sortMoveToindex == i)
//         {
//           if (this.sortimglist[i].isblank == true)
//           {
//             if (insertedblank == false)
//               sortimglist.push({
//                 "image":undefined,
//                 "index":index ++,
//                 "isblank": true
//               });
//             sortimglist.push({
//               "image":this.sortimglist[this.sortMoveFromindex].image,
//               "index": index ++,
//               "isblank": false
//             });
//             insertedblank = false;  
//           }
//         }
//         else if (this.sortimglist[i].isblank == false)
//         {
//           if (insertedblank == false)
//             sortimglist.push({
//               "image":undefined,
//               "index":index ++,
//               "isblank": true
//             });
//           sortimglist.push({
//             "image":this.sortimglist[i].image,
//             "index": index ++,
//             "isblank": false
//           });
//           insertedblank = false;  
//         }
//       }
//       sortimglist.push({
//         "image":undefined,
//         "index":index ++,
//         "isblank": true
//       });
//     }
//     else if (this.sortMoveFromindex > this.sortMoveToindex)
//     {
//       let index = 0;
//       let insertedblank = false;
//       for (let i = 0; i < this.sortMoveToindex; i++)
//       {
//         if (this.sortimglist[i].isblank == false)
//         {
//           if (insertedblank == false)
//             sortimglist.push({
//               "image":undefined,
//               "index":index ++,
//               "isblank": true
//             });
//           sortimglist.push({
//             "image":this.sortimglist[i].image,
//             "index": index ++,
//             "isblank": false
//           });
//           insertedblank = false;  
//         }
//       }
//       if (insertedblank == false)
//         sortimglist.push({
//           "image":undefined,
//           "index":index ++,
//           "isblank": true
//         });
//       sortimglist.push({
//         "image":this.sortimglist[this.sortMoveFromindex].image,
//         "index": index ++,
//         "isblank": false
//       });
//       insertedblank = false;  
//       for (let i = this.sortMoveToindex + 1; i < this.sortimglist.length; i++)
//       {
//         if (this.sortMoveFromindex == i ||
//           this.sortimglist[i].isblank == true
//           )
//           continue;
//         else{
//           if (insertedblank == false)
//             sortimglist.push({
//               "image":undefined,
//               "index":index ++,
//               "isblank": true
//             });
//           sortimglist.push({
//             "image":this.sortimglist[i].image,
//             "index": index ++,
//             "isblank": false
//           });
//           insertedblank = false;  
//         }
//       }
//     }
//     sortimglist.push({
//       "image":undefined,
//       "index":index ++,
//       "isblank": true
//     });

//     for (let img of sortimglist)
//     {
//       console.log("sort-----");
//       console.log(img.isblank);
//       if (img.isblank == false)
//         console.log(img.image.path);
//     }
//     this.sortimglist = sortimglist;
//     this.picktimes = 0;
//     this.pickprompt = "请选择要重新排序的图片";
//   }

//   }
//   /*
//    根据排序的图片列表里获取排序的ImageUpload[]对象* */
//   public GetImages():ImageUpload[]
//   {
//     let imglist:ImageUpload[] = [];
//     let index = 0;
//     for (let img of this.sortimglist)
//     {
//       if (img.isblank == false)
//       {
//         imglist.push({
//           "index":index ++,
//           "imgid":img.image.imgid,
//           "isuploaded":img.image.isuploaded,
//           "pre_imgid":img.image.pre_imgid,
//           "next_imgid":img.image.next_imgid,
//           "path":img.image.path
//         });
//       }
//     }
//     return imglist;
//   }

//     /*
//   根据this.imglist大小计算图片显示的行数，重新生成imgUIRowsIndexes
//   */
//   reformSortImageRows()
//   {
//     if (this.sortimglist.length == 0)
//     {
//       this.sortimgUIRowIndexes = [0];
//     }
//     let nPicPerRow = 5;
//    let nRows = (this.sortimglist.length - 1) / (nPicPerRow * 2);
//    this.sortimgUIRowIndexes = [];
//    for (let i = 0; i <= nRows; i++)
//    {
//      this.sortimgUIRowIndexes.push(i);
//    }
//   }
// }

export class ImageUploadPick
{
  // 调用相册时传入的参数
  imagePickerOpt:any = this.globals.imagePickerOpt;
  uploadimglist:ImageUpload[];
  public imgUIRowsIndexes:number[];   // [0,1,2,3,...]

  constructor(public imagePicker:ImagePicker, public globals:GlobalsProvider,
    public noticeSer:ToastServiceProvider)
    {
      this.uploadimglist = [];
      this.imgUIRowsIndexes = [];
    }
  
  public getUploadImageList():ImageUpload[]
  {
    return this.uploadimglist;
  }

  /**
   * openImgPicker
   * 打开手机相册
   */
   public openImgPicker() {
    let temp = '';
    this.imagePicker.getPictures(this.imagePickerOpt).then((results)=> {
        console.log("ImageUploadPick::openImgPicker");  
        for (var i=0; i< results.length; i++) {
        temp = results[i];
        console.log("ImageUploadPick::openImgPicker: temp=" + temp);
        this.uploadimglist.push({
          "imgid":-1,
          "isuploaded":false,
          "path":temp
        });
        }
      this.reformImageRows();    
      }, 
      (err)=> {
      this.noticeSer.showToast('打开相册发生错误:'+ err);//错误：无法从手机相册中选择图片！
    });                                                                                                                                                                              
    console.log("ImageUploadPick::openImgPicker end");
    }

    /**
   * reformImageRows
   *  根据this.uploadimglist大小计算图片显示的行数，重新生成imgUIRowsIndexes
   */
     protected reformImageRows()
     {
       let nPicPerRow = 5;
       let nRows = this.uploadimglist.length / nPicPerRow;
       this.imgUIRowsIndexes = [];
       for (let i = 0; i <= nRows; i++)
       {
         this.imgUIRowsIndexes.push(i);
       }
     }

     public setImageStatusUploaded(i:number, imgid:number)
     {
       this.uploadimglist[i].isuploaded = true;
       this.uploadimglist[i].imgid = imgid;
       console.log("setImageStatusUploaded: path=" + this.uploadimglist[i].path);
     }
}

class BBS_POST_ImageUploadCallBackObj extends ImageUploadCallBackObj
{
  page:any;
  constructor(page:any)
  {
    super();
    this.page = page;
  }

  public allImagesUploadProcedured_callback(isimageUploadsucc:boolean)
  {
    if (! isimageUploadsucc)
     {
       console.log("allImagesUploadProcedured_callback:upload had error!");
       alert("上传图片发生错误！");
     }
     /*
     //删除本地imagePicker产生的本地临时图片
    */
    console.log("allImagesUploadProcedured_callback:getUploadedImagesIDs=");
    console.log(this.uploadImg.getUploadedImagesIDs());
    let imgids = this.uploadImg.getUploadedImagesIDs();
    this.page.requestnewPost(imgids);
  }

  public imageupload_callback(i:number, imgid:number)
  {//imgUploadPick.imglist中对应的序列元素修改imgid和isuploaded, path保留为本地图片路径不修改
    if (this.page != undefined)
      this.page.imgUploadPick.setImageStatusUploaded(i, imgid);
  }
}

@IonicPage()
@Component({
  selector: 'page-bbs-new-post-edit',
  templateUrl: 'bbs-new-post-edit.html',
})
export class BbsNewPostEditPage{
  protected groupid:number;
  protected groupname:string;
  protected title:string = "";
  protected content:string = "";
  protected contentPlaceholder:string = "如题";
  // Vote
  private bShowVoteUI:boolean;
  private ShowVoteBtnText:string;
  public options:Option[];
  public optionText:string;
  public optionLabelbaseAscii:number; //'A'
  public optionNewIDAscii:number;  //即将添加的投票选项的编号(如'A')对应的Ascii码
  public modalVoterPickPage:Modal;
  private PickedGroups:GroupPickedItem[];
  private groupvoters_bodystr:string;
  //图片
  public imgUploadPick:ImageUploadPick;
  protected uploadImg:ImageUploadCtrl;
  protected upload_callback:ImageUploadCallBackObj;
  protected xhr:XMLHttpRequest;
  optionplaceholder: string = this.globals.optionplaceholder;
  protected finishedpost: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              protected http: HttpClient, public globals:GlobalsProvider,
              public imagePicker:ImagePicker, public noticeSer:ToastServiceProvider) 
  {
  console.log("BbsNewPostEditPage::constructor");
  this.groupid = this.navParams.get('groupid');
  this.groupname = this.navParams.get('groupname');
  console.log("BbsNewPostEditPage::constructor:this.groupname=" + this.groupname);
  this.bShowVoteUI = false;
  this.ShowVoteBtnText = "显示投票";
  this.optionText = "";
  this.optionLabelbaseAscii = 'A'.charCodeAt(0);
  this.optionNewIDAscii = this.optionLabelbaseAscii;
  this.options = [];
  this.groupvoters_bodystr = "";
  this.finishedpost = true;
  this.PickedGroups = [];
  this.imgUploadPick = null;
  this.uploadImg = null;
  this.upload_callback = null;
}

  /**
   * requestnewPost
   * 发帖请求
   * 
   * @param imgids 上传的图片的id列表。缺省为空串，不传图片
   */
   protected requestnewPost(imgids:string = "")
   {
    let options = {
      "withCredentials":true
    };
    //初始化为不带投票信息
    let options_str:string = "";
    let groupvoters_bodystr = "";
    if(this.bShowVoteUI && this.options.length > 0)
    { //带投票信息
      options_str = this.vote_options_str(this.options);
      groupvoters_bodystr = this.groupvoters_bodystr;
      console.log("requestnewPost: request with vote info");
    }
    else
    {
      console.log("requestnewPost: request with no voting"); 
    }
    console.log("this.vote_options_str=" + options_str);
    let body = {
      'title':this.title,
      'groupid':this.groupid,
      'username':this.globals.username,
      'content':this.content.replace(new RegExp(/\n/g), "<br>"),  //换行符转换为标签<br>
      "imgids":imgids,
      'vote_options':options_str,
      'vote_members':groupvoters_bodystr
    }
    this.http.post<any>(this.globals.server + 'bbs/postvotebbs/', this.encodeHttpParams(body), options).
    subscribe(
      data => this.processPostResponse(data),
      err => alert("发帖时向服务器请求错误")  //console.log(JSON.stringify(err))//console.log(JSON.stringify(err))
    )
   }

   protected encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  protected newPost()
  {
    console.log("newPost:groupid=" + this.groupid);
    console.log("newPost");
    if (this.content.length == 0)
      this.content = this.contentPlaceholder;
    if (this.title.length == 0)
    {
      alert("你还没有填写标题");
      return;
    }
    let matarr = this.title.match(';');
    if (matarr != null && matarr.length > 0)
    {
      alert("标题不能包含英文下的分号;");
      return;
    }

    matarr = this.content.match(';');
    if (matarr != null && matarr.length > 0)
    {
      alert("内容不能使用英文下的分号;");
      return;
    }
  //  let title:string = "test";
  //  let content:string = tinymce.tinymce.activeEditor.getContent();
    if (this.bShowVoteUI && this.options.length == 0)
    {
      alert("你勾选了投票功能，请添加投票选项再发帖");
      return;
    }
    if (this.options.length > 0)
    {
      console.log("newPost: to setVoters");
      this.setVoters();
      if (this.PickedGroups.length == 0)
      {
        alert("未选择参与投票的组员");
        return;
      }
    }

    this.finishedpost = false;
      //上传图片，上传成功的图片id保存在ImageUploadCtrl
      //uploadImgList() does not return after images are uploaded, but immeduately before upload is complete.
      // !!!NOTICE!!!:
      //   Operation of ImageUploadCtrl after this statement is dangerous. If necessary, put them in ImageUploadCtrl.callbackObj.post_call_x()
      if (this.imgUploadPick != null && this.imgUploadPick.getUploadImageList().length > 0)
      { //上传图片后，会自动调用postcall_1_newPost发送发帖请求
        this.uploadImgList(); 
      }
      else
      {
        //不上传图片，直接发送发帖请求
        this.requestnewPost();
      }

  }
 

  /*
  * processPostResponse
  * 发帖成功则返回上一个页面
  */
  protected processPostResponse(data:JSON)
  {
    this.finishedpost = true;
    var status_code = data['status_code'];
    console.log("BbsNewPostEditPage::processPostResponse:status_code="+status_code.toString());
    /*
    if (status_code == -1)
    {
      var msg = data['msg'];
      if (msg == "Forbidden to post in common groups")
      {
        alert("不能在公共组发帖");
      }
    }
    */
    if (status_code == 0)
    //发帖成功返回话题列表
    {
      console.log("BbsNewPostEditPage::processPostResponse: post success!");
      this.globals.bbspage.setRefreshCmd();
      this.navCtrl.pop();
      if (this.navParams.get('popparent') != undefined)
        this.navParams.get('popparent').navCtrl.pop();
    }
    else
    {
      console.log("BbsNewPostEditPage::processPostResponse: post failed!");
      alert("发帖失败");
    }

  }


  /* onClickBtnUploadPicture
  点击选择图片按钮时调用 */
  protected onClickBtnUploadPicture()
  {
    console.log("BbsNewPostEditPage::onClickBtnUploadPicture");
	  if (this.imgUploadPick == null)
      this.imgUploadPick = new ImageUploadPick(this.imagePicker, this.globals, this.noticeSer);
    this.imgUploadPick.openImgPicker();
  }



  /**
   * uploadImgList
   *  uploadImgList上传this.imglist列表里的图片
   *  this.uploadImg创建对象后可以调用其方法上传
   */
  protected uploadImgList()
  {
    console.log("BbsNewPostEditPage::uploadImgList: imglist.length="+this.imgUploadPick.getUploadImageList().length.toString());
    if (this.imgUploadPick.getUploadImageList().length > 0)
    {  
      if (this.upload_callback == null)
        this.upload_callback = new BBS_POST_ImageUploadCallBackObj(this);
      if (this.uploadImg == null)
      //第一次上传图片操作
      { console.log("BbsNewPostEditPage::uploadImgList:to create uploadImg object");
        this.uploadImg = new ImageUploadCtrl(this.upload_callback, this.globals.server);
      }
        this.uploadImg.setImagelist(this.imgUploadPick.getUploadImageList());
        for (let img of this.imgUploadPick.getUploadImageList())
          console.log(".....path=" + img.path);
        let ret = this.uploadImg.uploadImageList();
        console.log("BbsNewPostEditPage::uploadImgList: return=");
        console.log(ret);
    }
  }

  private vote_options_str(options:Option[]):string
  {
    var str:string = "";
    for (var i:number = 0; i < options.length; i++)
    {
      str += options[i].text;
      str += "#"
    }
    str = str.slice(0, str.length-1);
    return str;
  }

  private newOption()
  {
    console.log("newOption()...................")
    if (this.optionText == this.optionplaceholder)
    {
      console.log("no user input");
      return;
    }
    console.log("this.optionNewIDAscii = " + this.optionNewIDAscii);
    if (this.optionText.length == 0)
    {
      console.log("empty option input");
      return;
    }
    let bDuplicated = false;
    for (let i = 0; i < this.options.length; i++)
    {
      if (this.optionText == this.options[i].text)
      {
        bDuplicated = true;
        break;
      }
    }
    if (bDuplicated)
    {
      alert("该选项已经存在");
      return;
    }
    //去掉分号和#
    this.optionText = this.optionText.replace(new RegExp(';', "g"), ' ');
    this.optionText = this.optionText.replace(new RegExp('#', "g"), ' ');
    var optionlabelChar:string = String.fromCharCode(this.optionNewIDAscii)   //把ASCII码转化为字符
    console.log('optionlabelChar=' + optionlabelChar);
    var ID:string = optionlabelChar;
    var optionstext:string = this.optionText;
    var optionindex:number = this.optionNewIDAscii - 65;  // 65 is 'A'
    var option:Option = {'ID':'A','index':0,'text':'text'};
    option.ID = ID;
    option.index = optionindex;
    option.text = this.optionText;
    this.options.push(option);
    console.log("this.option = " + option);
    console.log("this.options = " + this.options);
    this.optionNewIDAscii += 1;

    this.optionText = "";

    console.log("options==============================");

  }

  private delOption(optionid)
  {
    var temp:Option[] = [];
    //依次弹出队列，this.options只保留index小于optionid的元素
    do
    {
      var option:Option = this.options.pop();
      console.log(option.ID);
      console.log(option.index);
      temp.push(option);
    }while(option.index > optionid && this.options.length > 0);
    //删除temp里最后压进去的元素
    temp.pop();
    //依次将temp弹出，并将每个元素的index-1，重新计算ID，将原来ID对应的ascii-1. 重新压回this.options
    while(temp.length > 0)
    {
      var option:Option = temp.pop();
      option.index -= 1;
      var idAscii:number = option.ID.charCodeAt(0);   //把字符转化成Ascii
      idAscii -=1;
      option.ID = String.fromCharCode(idAscii);
      this.options.push(option);
    }
    // 重新设置this.optionNewIDAscii
    if (this.options.length == 0)
    this.optionNewIDAscii = this.optionLabelbaseAscii;   // 65, 'A'
    else
    {
      var idAscii:number = this.options[this.options.length-1].ID.charCodeAt(0);
      this.optionNewIDAscii = idAscii + 1;
    }
    console.log("this.optionNewIDAscii = " + this.optionNewIDAscii);
  }
  private focusOptionText()
  {
    this.optionText = "";
  }

 /**
  * makePickedGroupVotersJson
  * @returns 
  *   make json data from this.PickedGroups
      {
        'groups':[
          {
            'groupid':0,
            'exclude':[]
          },
          {
            'groupid':1,
            'exclude':[]
          }
        ]
      }
  */
  private makePickedGroupVotersJson():JSON
  {
    var root:JSON = JSON.parse("{}");
    var groups_json:JSON[] = [];
    for (let i = 0; i < this.PickedGroups.length; i++)
    {
      var group_json:JSON = JSON.parse("{}");
      group_json['groupid'] = this.PickedGroups[i].groupid;
      group_json['exclude'] = this.PickedGroups[i].exclude;
      groups_json.push(group_json);
    }
    root['groups'] = groups_json;
    return root
  }

  private makePickedGroupVotersHttpBody(bodyjson:JSON):string
  {
    var bodystr:string = JSON.stringify(bodyjson);
    return bodystr;
  }

  public updatePickedGroups(PickedGroups:GroupPickedItem[])
  {
    this.PickedGroups = PickedGroups;
    var bodyjson:JSON = this.makePickedGroupVotersJson();
    this.groupvoters_bodystr = this.makePickedGroupVotersHttpBody(bodyjson);
    console.log("this.groupvoters_bodystr=" + this.groupvoters_bodystr);
  }


  private setVoters()
  {
    /*
    //选择可以投票的组
    let param = {
      bbsnewposteditpage:this,
      pickedgroups:this.PickedGroups
    };
    this.modalVoterPickPage = this.modalCtrl.create(BbsVotersPickPage, param);
    this.modalVoterPickPage.present();
    */
    let pickedGroup:GroupPickedItem = {
      'groupid':this.groupid,
      'exclude':[]
    }
    this.updatePickedGroups([pickedGroup]);
  }

  private openvoteUI()
  {
    this.bShowVoteUI = ! this.bShowVoteUI;
    if (this.bShowVoteUI)
      this.ShowVoteBtnText = "取消投票";
    else
      this.ShowVoteBtnText = "显示投票";
  }

  /*
  removeFile(path:string):boolean
  {
    let fe:FileEntry;
    console.log("remove file:" + fe.filesystem.encodeURIPath(path));
    //fe.remove(null);
    return true;
  }
  */

  /**
   * 
   * 点击“提交”发帖后立即点击导航返回上一页测试结果：
   * 测试了上传4张图片，图片上传成功，没有打印delete...
   * 对比：点击“提交”后，等待自动返回上一页，会打印delete...
   */
  protected ionViewWillLeave()
  {
    if (this.finishedpost == true)
    {
      if (this.upload_callback != null)
      {
        console.log("delete upload_callback");
        delete this.upload_callback;
      }
      if (this.uploadImg != null)
      {
        console.log("delete this.uploadImg");
        delete this.uploadImg;
      }  
      if (this.imgUploadPick != null)
      {
        console.log("delete this.imgUploadPick");
        for (let img of this.imgUploadPick.getUploadImageList())
        {
          // remove file img.path
        }
        delete this.imgUploadPick;
      }
    }
  }

}//class BbsNewPostEditPage
