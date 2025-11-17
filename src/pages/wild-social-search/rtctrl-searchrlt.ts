import { HttpClient, HttpParams } from "@angular/common/http";
import { List } from "../bbs/list";

export class SearchResultRTCtrl
{
  searchrlts:List;
  nseg:number;
  bhasReceivedLastData: boolean;
  bhasMoreData: boolean;

  constructor(public http:HttpClient)
  {
    this.searchrlts = null;
    this.nseg = 0;
    this.bhasReceivedLastData = false;
    this.bhasMoreData = true;

  }

  getsearchrlts():List
  {
    return this.searchrlts;
  }

  public create_searchrlt()
  {
    this.searchrlts = new List();
  }

  public reset()
  {
    this.searchrlts.clear(); 
    this.bhasMoreData = true;
    this.bhasReceivedLastData = false;
    this.setnseg(1);
  }

  public setnseg(nseg:number)
  {
    //console.log("RTCtrl_BBSLastupdatedate::setnseg:groupid=" + groupid + ",nseg=" + nseg);
    this.nseg = nseg;
  }

  public Refresh()
  {
    this.reset();
    this.sendReadSegRequest();
  }

  sendReadSegRequest(UICtrl:any = undefined)
  {
    // implement in derived class
    this.bhasReceivedLastData = false;
  }

  public requestNextSeg(infiniteScroll:any)
  {
    if (this.bhasReceivedLastData == true && this.bhasMoreData)
    {
      this.nseg += 1;
      console.log("SearchResultRTCtrl::requestNextSeg: "+ this.nseg.toString());
      this.sendReadSegRequest(infiniteScroll);
    }
    else if (this.bhasMoreData == false)
    {
      console.log("SearchResultRTCtrl::requestNextSeg: skip request, because the requested search has no more data.");
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
    else
    {
      console.log("SearchResultRTCtrl::requestNextSeg: skip request, because the previous request has not received data");
      console.log("SearchResultRTCtrl::requestNextSeg: skiped sequence " +  this.nseg.toString());
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    }
  }

  protected ProcessServerResponse(data, UICtrl:any)
  {
    console.log("SearchResultRTCtrl::ProcessServerResponse");
    var status_code:number = data['status_code'];
    var nseg:number = data['nseg'];
    var error_code:number = 0;
    var recvedlist:JSON[] = data['data'];
    var mergelist:any[] = [];  // recvedbbslist的BBSItem[]类型
    console.log("SearchResultRTCtrl::ProcessServerResponse:nseg,status_code=" + nseg + ',' + status_code);
    console.log("SearchResultRTCtrl::ProcessServerResponse: recvedlist length=" + recvedlist.length);
    if (status_code == 0)
    {  
      this.bhasReceivedLastData = true;
      //mergelist = this.searchrlts.convertJSONstoItems(recvedlist);
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
      mergelist = recvedlist;
      this.searchrlts.MergeUniques_RecvedList(mergelist);

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
  
  protected requestServerErrorProcedure(nseg:number, UICtrl:any = undefined)
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

export class RTCtrl_DBSearchGroupsTag extends SearchResultRTCtrl
{
  server:string;
  constructor(public listpage:any, public http:HttpClient, server:string)
  {
    super(http);
    this.server = server;
  }

  public setSearchGroupName(groupname:string)
  {

  }

  public sendReadSegRequest(UICtrl:any = undefined)
  {
    super.sendReadSegRequest(UICtrl);
    const params = new HttpParams().set("tagname", this.listpage.searchgroupTag)
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.server + 'group/searchallgroupbytag/'+ this.nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, UICtrl),
      err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    );
  }
}
export class RTCtrl_DBSearchGroupsName extends SearchResultRTCtrl
{
  searchgroupName:string;
  server:string;

  constructor(public listpage:any, public http:HttpClient, server:string)
  {
    super(http);
    this.searchgroupName = "";
    this.server = server;
  }

  public setSearchGroupName(groupname:string)
  {
    this.searchgroupName = groupname;
  }

  public sendReadSegRequest(UICtrl:any = undefined)
  {
    super.sendReadSegRequest(UICtrl);
    const params = new HttpParams().set("name", this.searchgroupName)
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.server + 'group/searchallgroupbyname/'+ this.nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, UICtrl),
      err => this.requestServerErrorProcedure(this.nseg, UICtrl)//console.log(JSON.stringify(err))
    );
  }

  protected requestServerErrorProcedure(nseg:number, UICtrl:any)
  {
    super.requestServerErrorProcedure(nseg, UICtrl);
  }
}
