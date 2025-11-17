import { HttpClient, HttpParams } from "@angular/common/http";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { BbsPage } from "./bbs";
import { BBSItem, BBSlist } from "./bbslist";
import { BbsPageRTCtrl } from "./rtctrl-lastupdate";

export class BbsPageMultiGroupsRTCtrl extends BbsPageRTCtrl
{
  constructor(public bbspage:BbsPage, public http:HttpClient, public user_groups:UserGroupsProvider, 
              public globals:GlobalsProvider, public datesUtils:DatesUtils)
  {
    super(bbspage, http, user_groups, globals, datesUtils);
  }

  public reset()
  {
    super.reset();
  }

  protected sendSingleGroupReadSegRequest(groupid:number, refresher:any)
  {
    let group = groupid.toString();
    this.hasReceivedLastData_groups[group] = false;
    var nseg:number = this.nseg_groups[group];
    console.log("Lastupdatedate_DBRTCtrl::sendReadSegRequest for groupid " + groupid + "of nseg " + nseg);
    //console.log("RTCtrl_BBSLastupdatedate::sendReadSegRequest: lastupdatedate=" + this.lastupdatedate_earliest_groups[group]);
    const params = new HttpParams()
    .set('groupid',groupid.toString())
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.globals.server + 'bbs/getlatestbbs/'+ nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, refresher),
      err => this.requestServerErrorProcedure(nseg, refresher)//console.log(JSON.stringify(err))
    );
  }
  
  protected ProcessServerResponse(data:any, UICtrl:any)
  {
    if (this.globals.bbspage != undefined)
      this.globals.bbspage.clearPrompt_ServerUnavailable();
    super.ProcessServerResponse(data, UICtrl);
  }

  public requestNextSeg(infiniteScroll:any = undefined)
  {
    //do nothing;
    infiniteScroll.complete();
  }
  
}