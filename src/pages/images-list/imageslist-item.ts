import { ThrowStmt } from "@angular/compiler";
import { Image } from "./image";

export class ImagesListItem
{
    itemid:number;
    bbsid:number;
    public title:string;
    date:string;  //CalendarImagesList里记录中的图片列表对应的bbs帖子创建时间
    groupid:number;
    images:Image[];
    imagesui:ImagesListItemImagesUI;

    constructor(itemid:number, bbsid:number, title:string, date:string, groupid:number, images:Image[])
    {
        this.itemid = itemid;
        this.bbsid = bbsid;
        this.title = title;
        this.date = date;
        this.groupid = groupid;   
        this.initImages(images);
        this.imagesui = new ImagesListItemImagesUI(this.images);
    }

    initImages(images:Image[])
    {
        //console.log("initImages...");
        this.images = [];
        for (let i = 0; i < images.length; i++)
        {
            //console.log("1111111111111");
            this.images.push(images[i]);
        }
        //console.log("initImages  end  ..");
    }

    public getImagesUI():ImagesListItemImagesUI
    {
        return this.imagesui;
    }

    public getImages():Image[]
    {
        return this.images;
    }
}

class ImagesListItemImagesUI
{
    imgUIRows:number[];
    rowcount:number = 5;
    imglist:Image[];
    
    constructor(imglist:Image[])
    {
        this.imglist = imglist;
        this.reformImageRows();
    }

  /*
  根据this.imglist大小计算图片显示的行数，重新生成imgUIRows
  */

  protected reformImageRows()
  {
    this.imgUIRows = [];
    let nRows = this.imglist.length / this.rowcount;
    for (let i = 0; i < nRows; i++)
        this.imgUIRows.push(i);
  }

  protected reformImageRowsTwoRows()
 {
    this.imgUIRows = [];
    let nRows = this.imglist.length / this.rowcount + 1;
    let nRowsUI = nRows > 2 ? 2 : nRows;
    if (nRowsUI == 1)
    {
        let cnt = this.imglist.length % this.rowcount > 0 ? this.imglist.length % this.rowcount : this.rowcount;
        this.imgUIRows.push(cnt);
    }
    else
    {
        this.imgUIRows[0] = this.rowcount;
        if (nRowsUI == 2 && this.imglist.length > nRowsUI * this.rowcount)
        {
            this.imgUIRows[1] = this.rowcount - 1;
        }
        else
            this.imgUIRows[1] = this.imglist.length % this.rowcount > 0 ? this.imglist.length % this.rowcount : this.rowcount;
    }
 }
}