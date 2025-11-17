import { HttpClient, HttpParams } from "@angular/common/http";
import { AdvancedBbsSearchOptProvider } from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { GroupInfo, UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { AdvancedBbsSearchPage } from "../advanced-bbs-search/advanced-bbs-search";
import { List } from "../bbs/list";
import { BbsPageSearchResultRTCtrl } from "../bbs/rtctrl-searchresult";
import { CalendarImagesList } from "./CalendarImagesList";
import { ImagesListItem } from "./imageslist-item";
import { SearchOpt } from "./search-opt";
import { SearchResultRTCtrl } from "./search-result";

export class ImagesSearchResultRTCtrl extends SearchResultRTCtrl
{
  startpos: number;

  constructor(searchOpts:SearchOpt, public http:HttpClient, 
              public user_groups:UserGroupsProvider, public globals:GlobalsProvider, public datesUtils:DatesUtils)
  {
    super(searchOpts);    
    this.startpos = 0;
    this.createRSTList();
  }

  createRSTList(): void 
  {
    this.rstlist = new CalendarImagesList(this.user_groups, this.datesUtils);
  }

  setGroups(groups:GroupInfo[])
  {
    this.searchOpts.setGroups(groups);
  }

  public getgroups():GroupInfo[]  
  {
    let grps:GroupInfo[] = [];
    let grpstr:string = this.searchOpts.getOptValbyname('groupids');
    for (let grpid_str in grpstr.split('#'))
    {
      grps.push({
        'groupid':Number(grpid_str),
        'groupname':this.user_groups.getGroupName(Number(grpid_str))
      });
    }
    return grps; 
  }

  public reset()
  {
    super.reset();
    this.startpos = 0;
  }

 
  sendReadSegRequest(UICtrl:any = undefined)
  {
    this.bhasReceivedLastData = false;
    console.log("ImagesSearchResultRTCtrl::sendReadSegRequest of nseg " + this.nseg);
    
    let filterRo = this.searchOpts.getOptValbyname('filterRo');
    let RoLogic = this.searchOpts.getOptValbyname('RoLogic');
    let groupstr = this.searchOpts.getOptValbyname('groupids');  
    let postdatebegin_key = this.searchOpts.getOptValbyname('postdatebegin_key');
    let postdateend_key = this.searchOpts.getOptValbyname('postdateend_key');
    console.log("ImagesSearchResultRTCtrl::sendReadSegRequest: filterRo=" + filterRo);
    console.log("ImagesSearchResultRTCtrl::sendReadSegRequest: RoLogic=" + RoLogic);

    if (filterRo == "")
    {
      let params = new HttpParams().set('groups',groupstr)
      .set('postdatebegin_key', postdatebegin_key)
      .set('postdateend_key', postdateend_key)
      .set('startpos', this.startpos.toString());
      
      let options = {
        "withCredentials":true,
        params:params
      };
      this.http.get<any>(this.globals.server + 'image/getImages/', options).
      subscribe(
        data => this.ProcessServerResponse(data, UICtrl),
        err => this.requestServerErrorProcedure(this.nseg, UICtrl)//console.log(JSON.stringify(err))
      );
    }
    else
    {
      let params = new HttpParams().set('groups',groupstr)
      .set('postdatebegin_key', postdatebegin_key)
      .set('postdateend_key', postdateend_key)
      .set('startpos', this.startpos.toString())
    //设置对象过滤参数
      .set('filterRo', filterRo)
      .set('RoLogic', RoLogic);
      
      let options = {
        "withCredentials":true,
        params:params
      };
      this.http.get<any>(this.globals.server + 'image/getImages/', options).
      subscribe(
        data => this.ProcessServerResponse(data, UICtrl),
        err => this.requestServerErrorProcedure(this.nseg, UICtrl)//console.log(JSON.stringify(err))
      );
    }

  }

  public requestNextSeg(infiniteScroll:any)
  {
    if (this.bhasReceivedLastData == true && this.bhasMoreData)
    {
      this.nseg += 1;
      console.log("ImagesSearchResultRTCtrl::requestNextSeg: "+ this.nseg.toString());
      this.sendReadSegRequest(infiniteScroll);
    }
    else if (this.bhasMoreData == false)
    {
      console.log("ImagesSearchResultRTCtrl::requestNextSeg: skip request, because the requested search has no more data.");
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
    else
    {
      console.log("ImagesSearchResultRTCtrl::requestNextSeg: skip request, because the previous request has not received data");
      console.log("ImagesSearchResultRTCtrl::requestNextSeg: skiped sequence " +  this.nseg.toString());
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
  }

  protected ProcessServerResponse(data, UICtrl:any)
  {
    console.log("ImagesSearchResultRTCtrl::ProcessServerResponse");
    var status_code:number = data['status_code'];
    var error_code:number = 0;
    var recvedlist:JSON[] = data['bbs_images_list'];
    var startpos:number = data['startpos'];
    var mergelist:ImagesListItem[] = [];  // recvedbbslist的BBSItem[]类型
    console.log("ImagesSearchResultRTCtrl::ProcessServerResponse:nseg,status_code=" + this.nseg + ',' + status_code);
    console.log("ImagesSearchResultRTCtrl::ProcessServerResponse: recvedlist length=" + recvedlist.length);
    if (status_code == 0)
    {  
      this.bhasReceivedLastData = true;
      this.startpos = startpos;
      mergelist = this.rstlist.convertJSONstoItems(recvedlist);
      if (this.nseg == 1)
      {
        let refresher = UICtrl;
        if (refresher != undefined  || refresher != null)
        {
          if (this.bhasReceivedLastData) 
          {
            console.log("refresher.complete()");
            refresher.complete();
          }
        }else console.log("refresher.complete().....");
      }
      else
      {
        let infiniteScroll = UICtrl;
        if (infiniteScroll != undefined || infiniteScroll != null)
        {
          if (this.bhasReceivedLastData) 
          {
            console.log("infiniteScroll.complete()");
            infiniteScroll.complete();
          }
        }else console.log("infiniteScroll.complete().....");
      }
      /*
      for (let i = 0; i < mergelist.length; i++)
      {
        console.log("RTCtrl_BBSLastupdatedate::mergelist[i].title=" + mergelist[i].title);
      }
      */
      //合并数据
      this.rstlist.MergeUniques_RecvedList(mergelist);
      this.rstlist.parseAddCalendarMarks();

        /*
        for (let i = 0; i < this.bbs.list.length; i++)
        {
          console.log("RTCtrl_BBSLastupdatedate::bbs[i].title=" + this.bbs.list[i].title);
        }
        */
    }
    else if (status_code < 0)
    {
          error_code = data['error_code'];

          if (status_code == -1 && error_code == 2)
          {
            //服务器没有数据返回，数据库已读完
            console.log("ImagesSearchResultRTCtrl::ProcessServerResponse:DB has been read out");
            //标记数据已经接受处理完成,没有后续数据
            this.bhasReceivedLastData = true;
            this.bhasMoreData = false;
            if (this.nseg == 1)
            {
              let refresher = UICtrl;
              if (refresher != undefined  || refresher != null)
              {
                if (this.bhasReceivedLastData) 
                  refresher.complete();
              }
            }
            else
            {
              let infiniteScroll = UICtrl;
              if (infiniteScroll != undefined || infiniteScroll != null)
              {
                if (this.bhasReceivedLastData) 
                  infiniteScroll.complete();
              }
            }
          }
          else
          {
            /*if (refresher != undefined)
              refresher.complete();*/
            alert("服务器出现异常");
          }
    }
    else
    {
      /*if (refresher != undefined)
        refresher.complete();*/
      alert("服务器出现异常");
      console.log("Unkown status code");
    }    
  }
  
  requestServerErrorProcedure(nseg:number, UICtrl:any)
  {
    if (nseg == 1)
    {
      let refresher = UICtrl;
      if (refresher != undefined)
        refresher.complete();
    }
    else
    {
      let infiniteScroll = UICtrl;
      if (infiniteScroll != undefined)
        infiniteScroll.complete();
    }
    alert("请求服务器失败!");
  }
}
