import {FileTransfer, FileTransferObject, FileUploadOptions} from "@ionic-native/file-transfer";
import {File, FileEntry} from '@ionic-native/file'

export class ImageUpload{
    path:string;
    imgid:number;
    isuploaded:boolean;
  }

/**
 * callbackObj is only a class only to indicates it's derived class has callback function.
 * postcall_x indicates it xth callback function
 */
 export class ImageUploadCallBackObj
 {
   uploadImg:ImageUploadCtrl;
   public finished_callback:boolean;  //上传图片相关回调过程（可以包含上传后续事件）完成的标识

   constructor()
   {
    this.uploadImg = null;
   }

   public setImageUploadCtrl(uploadImg:ImageUploadCtrl)
   {
    this.uploadImg = uploadImg;
   }

   public clearProcedureFinishMark()
   {
    this.finished_callback = false;
   }

   public allImagesUploadProcedured_callback(isimageUploadsucc:boolean) {}
   public imageupload_callback(i:number, imgid:number) {}  // ImageUploadCtrl.imglist的第i个图片上传完成的回调函数
   //public postcall_2(){}
   //public postcall_3(){}
 
 }
 
 export class ImageUploadCtrl{
   public imglist:ImageUpload[]; //ImageUpload.path存放上传后的服务器图片的文件路径
   private hasFailure:boolean;
   fileTransfer: FileTransfer;
   public ntasks:number;
   imguploadUrl:string;
   callbackObj: ImageUploadCallBackObj; //callbackObj;
 
   constructor(callbackObj:any, server:string)
   {
     this.imglist = [];
     this.hasFailure = false;
     this.ntasks = 0;
     this.imguploadUrl = server + "image/uploadbbsImage/";
     this.setCallBackObj(callbackObj);
   }
 
   setCallBackObj(callbackObj:ImageUploadCallBackObj)
   {
      this.callbackObj = callbackObj;
      this.callbackObj.setImageUploadCtrl(this);
   }

   public setImagelist(imglist:ImageUpload[])
   {
      this.imglist = [];
     for (let i = 0; i < imglist.length; i++)
       this.imglist.push(
          {
          'imgid':imglist[i].imgid,
          'isuploaded':imglist[i].isuploaded,
          'path':imglist[i].path
          } 
        );
     this.ntasks = this.imglist.length;
     this.hasFailure = false;
     console.log("ImageUploadCtrl::setImagelist imglist.length" + this.imglist.length.toString());
   }
 
 
 /**
  * uploadImageList
  * this function does not return after images are uploaded, but immeduately returns 
  * before upload is complete, due to it eventually calls FileTransferObject.upload
  * which immeduately before upload is completed.
  */
 public uploadImageList()
 {
   this.hasFailure = false; //清除错误标识
   this.callbackObj.clearProcedureFinishMark();
   this.ntasks = this.imglist.length - this.getUploadedImagesIDs().length;  //需要上传的图片数量
 
   let succindexes = this.uploadList(0);
   console.log("ImageUploadCtrl::uploadImageList:succindexes=");
   console.log(succindexes);
   console.log("ImageUploadCtrl::uploadList imglist.length" + this.imglist.length.toString());
 }
 
 /**
  * uploadList
  * 通过递归调用遍历完imglist的元素，对列表内的图片进行上传
  * 每调用一次，startindex加1.如果startindex需要上传则上传一张startindex图片，否则不上传图片。以下步骤之后，startindex+1,继续调用该函数上传
  * this.uploadList(0)则遍历全部图片
  * @param startindex 
  * @returns 
  */
 private uploadList(startindex:number):number[]
 {
   console.log("ImageUploadCtrl::uploadList:ntask = "+ this.ntasks.toString());
   let succindexes:number[] = []; //上传成功的图片在imglist的index
   if (startindex >= this.imglist.length)
   {
     console.log("ImageUploadCtrl::uploadList: The image list upload procedure is completed");
     console.log(succindexes);
     //upload procedure is completed
     this.callbackObj.allImagesUploadProcedured_callback(!this.hasFailure); 
     return [];          //不用再递归上传下一个图片任务     
   }

   if (this.imglist[startindex].isuploaded == true)
   {
     return this.uploadList(startindex + 1)  //不统计当前index
   }
   else
   {
     let path = this.imglist[startindex].path;
     console.log("path=" + path);                                        
     //上传startindex图片
     this.fileTransfer = new FileTransfer();
     let options: FileUploadOptions;
       options = {
         fileKey:"imgfile",
         fileName:path.substring(path.lastIndexOf("/") + 1 + "tmp_".length, path.length),
         httpMethod: 'POST',
         mimeType: "image/jpeg'",
         headers: {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                   'Accept-Encoding': 'gzip, deflate',
                   'Accept-Language': 'zh-CN,zh;q=0.8' },//不加入 发生错误！！
         params: {},
         chunkedMode:false
       };
 
       let uploadret = -1;
       let fto:FileTransferObject = this.fileTransfer.create();
       fto.upload(path, encodeURI(this.imguploadUrl), options, true)
             .then((data) => {
               //this.imglist.push({"path":path, "imgid":JSON.parse(data.response)['imgid']});
               let imgid = -1;
               if (JSON.parse(data.response)['status_code'] == 0)
               {
                console.log("ImageUploadCtrl::uploadList:upload success....."); /*uploadret = JSON.parse(data.response)['imgid']; */
                this.imglist[startindex].isuploaded = true;
                this.ntasks --;
                imgid = JSON.parse(data.response)['imgid'];
                this.imglist[startindex].imgid = imgid;
                this.imglist[startindex].path = JSON.parse(data.response)['path'];
                this.callbackObj.imageupload_callback(startindex, imgid);
                //this.removeFile(path);
               }
               else
               {
                console.log("ImageUploadCtrl::uploadList:upload fail....."); /*uploadret = JSON.parse(data.response)['imgid']; */
                this.imglist[startindex].isuploaded = false;
                this.hasFailure = true;
               }
 
              //继续上传startindex+1
               console.log("late return of uploadList(" + startindex + ')');
               return [imgid].concat(this.uploadList(startindex + 1));  //返回// [imgid]连接下 一个图片的返回列表
               //删除本地图片文件
             }, (err) => {
                 console.log("ImageUploadCtrl::uploadList:upload error.....");
                 this.imglist[startindex].isuploaded = false;
                 this.hasFailure = true;
                 //删除本地图片文件
                 //alert('上传文件失败！');
                   return this.uploadList(startindex + 1);  //返回里不统计当前index,继续上传startindex+1
               }
             );      
         return [1,2,3,4]; // test, it's always the return
   }
 }
 
 removeFile(path:string):boolean
 {
   let fe:FileEntry;
   console.log("remove file:" + fe.filesystem.encodeURIPath(path));
   
   //fe.remove(null);
   return true;
 }
 /**
  * getUploadedImagesIDs
  * 返回imglist里上传成功的图片的id
  * @returns id1#id2#...idn
  */
   public getUploadedImagesIDs():string
   {
     let imgids_str = "";
     for (let img of this.imglist)
     {
       //console.log("img.imgid=" + img.imgid);
       if (img.imgid != -1 || img.isuploaded == true)
       {
         imgids_str += img.imgid.toString();
         imgids_str += '#';
       }    
     }
     if (imgids_str.length > 0)
     imgids_str = imgids_str.substr(0, imgids_str.length - 1);
     return imgids_str;
   }
 
   public getUploadedImages():any[]
   {
     let uploadedimgs:any[] = [];
     for (let img of this.imglist)
     {
       //console.log("img.imgid=" + img.imgid);
       if (img.imgid != -1 || img.isuploaded == true)
       {
         uploadedimgs.push({
           'path':img.path,
           'imgid':img.imgid
         });
       }    
     }  
     return uploadedimgs;
   }

   public setImagePath(imgid:number, path:string)
   {
      for (let i = 0; i < this.imglist.length; i++)
      {
        if (imgid == this.imglist[i].imgid)
          this.imglist[i].path = path;
      }
   }
 
 }
 