import { HttpClient, HttpParams } from "@angular/common/http";
import { AdvancedBbsSearchOptProvider } from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { GroupInfo, UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { BBSItem, BBSlist } from "./bbslist";

export class BbsPageSearchResultRTCtrl// extends RTCtrl_BBSLastupdatedate
{
  customize_code:number;
  author_key:string;
  postdatebegin_key;
  postdateend_key;
  search_key:string;
  bbs:BBSlist;
  groups:GroupInfo[];
  nseg:number;
  bhasReceivedLastData: boolean;
  bhasMoreData: boolean;

  constructor(public bbspage:any, public http:HttpClient, public advancedSearchOpts:AdvancedBbsSearchOptProvider, 
              public user_groups:UserGroupsProvider, public globals:GlobalsProvider, public datesUtils:DatesUtils)
  {
    this.groups = [];
    this.bbs = null;
    this.nseg = 0;
    this.bhasReceivedLastData = false;
    this.bhasMoreData = true;

  }

  public createbbslist(): void 
  {
    this.bbs = new BBSlist(this.user_groups, this.datesUtils);
  }

  public reset()
  {
    this.bbs.clear(); 
    this.bhasMoreData = true;
    this.bhasReceivedLastData = false;
    this.setnseg(1);
  }
  

  public setGroups(groups:GroupInfo[])
  {
    while (this.groups.length > 0)   this.groups.pop();
    for (let i = 0; i < groups.length; i++)
      this.groups.push(groups[i]);
  }

  public getgroups():GroupInfo[]  { return this.groups; }

  public setnseg(nseg:number)
  {
    //console.log("RTCtrl_BBSLastupdatedate::setnseg:groupid=" + groupid + ",nseg=" + nseg);
    this.nseg = nseg;
  }

  public updateAdvancedSearchOptions()
  {
    //先清除搜索选项
      this.customize_code = 0;
      this.author_key = "";
      this.postdatebegin_key = "";
      this.postdateend_key = "";
      this.search_key = "";
      //使用搜索选项里的设置
      let sopt:string = this.advancedSearchOpts.getAdvancedSearchOpt();
      let jopt = JSON.parse(sopt);
      this.customize_code = jopt['customize_code'];
      this.author_key = (jopt['author_key'] == undefined ? "" : jopt['author_key']);
      this.postdatebegin_key = (jopt['postdatebegin_key'] == undefined ? "" : jopt['postdatebegin_key']);
      this.postdateend_key = (jopt['postdateend_key'] == undefined ? "" : jopt['postdateend_key']);
      this.search_key = (jopt['search_key'] == undefined ? "" : jopt['search_key']);
      console.log(sopt);
      console.log(this.search_key + '#' + this.author_key);
  }

  public Refresh(refresher:any)
  {
    this.reset();
    this.sendReadSegRequest(refresher);
  }

  sendReadSegRequest(UICtrl:any = undefined)
  {
    console.log("...............................");
    console.log(this.search_key + '#' + this.author_key);
    this.bhasReceivedLastData = false;
    var nseg:number = this.nseg;
    console.log("BbsPageSearchResultRTCtrl::sendReadSegRequest of nseg " + nseg);
    let groupstr = "";
    for (let i = 0; i < this.getgroups().length; i++)
    {
      let groupid = this.getgroups()[i].groupid;
      groupstr += groupid.toString();
      groupstr += '#';
    }
    groupstr = groupstr.substring(0, groupstr.length - 1); //去除末尾的‘#’
    const params = new HttpParams()
    .set('groups',groupstr)
    .set('customize_code', this.customize_code.toString())
    .set('author_key', this.author_key)
    .set('postdatebegin_key', this.postdatebegin_key)
    .set('postdateend_key', this.postdateend_key)
    .set('search_key', this.search_key)
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.globals.server + 'bbs/getbbsAdvancedSearchSegDB/'+ nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, UICtrl),
      err => this.requestServerErrorProcedure(nseg, UICtrl)//console.log(JSON.stringify(err))
    );
  }

  public requestNextSeg(infiniteScroll:any)
  {
    if (this.bhasReceivedLastData == true && this.bhasMoreData)
    {
      this.nseg += 1;
      console.log("BbsPageSearchResultRTCtrl::requestNextSeg: "+ this.nseg.toString());
      this.sendReadSegRequest(infiniteScroll);
    }
    else if (this.bhasMoreData == false)
    {
      console.log("BbsPageSearchResultRTCtrl::requestNextSeg: skip request, because the requested search has no more data.");
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
    else
    {
      console.log("BbsPageSearchResultRTCtrl::requestNextSeg: skip request, because the previous request has not received data");
      console.log("BbsPageSearchResultRTCtrl::requestNextSeg: skiped sequence " +  this.nseg.toString());
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
  }

  protected ProcessServerResponse(data, UICtrl:any)
  {
    console.log("BbsPageSearchResultRTCtrl::ProcessServerResponse");
    var status_code:number = data['status_code'];
    var nseg:number = data['nseg'];
    var error_code:number = 0;
    var recvedbbslist:JSON[] = data['bbslist'];
    var mergelist:BBSItem[] = [];  // recvedbbslist的BBSItem[]类型
    console.log("BbsPageSearchResultRTCtrl::ProcessServerResponse:nseg,status_code=" + nseg + ',' + status_code);
    console.log("BbsPageSearchResultRTCtrl::ProcessServerResponse: bbslist length=" + data['bbslist'].length);
    if (status_code == 0)
    {  
      this.bhasReceivedLastData = true;
      mergelist = this.bbs.convertJSONstoItems(recvedbbslist);
      if (nseg == 1)
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
      this.bbs.MergeUniques_RecvedList(mergelist);

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
            console.log("bbs::ProcessServerResponse:DB has been read out");
            //标记数据已经接受处理完成,没有后续数据
            this.bhasReceivedLastData = true;
            this.bhasMoreData = false;
            if (nseg == 1)
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
