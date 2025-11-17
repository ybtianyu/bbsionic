import { List } from "../bbs/list";
import { SearchOpt } from "./search-opt";

export class SearchResultRTCtrl
{
  searchOpts:SearchOpt;
  rstlist:any; // List;
  bhasReceivedLastData: boolean;
  bhasMoreData: boolean;
  nseg: number;

  constructor(searchOpts:SearchOpt)
  {
    this.rstlist = null;
    this.searchOpts = searchOpts;
    this.setnseg(1);
    this.bhasReceivedLastData = false;
    this.bhasMoreData = true;
  }
  protected createRSTList(): void 
  {

  }
  public getRSTList():any //List
  {
    return this.rstlist;
  }

  protected setnseg(nseg:number)
  {
    //console.log("RTCtrl_BBSLastupdatedate::setnseg:groupid=" + groupid + ",nseg=" + nseg);
    this.nseg = nseg;
  }

  protected incnseg()
  {
    this.nseg += 1;
  }

  public reset()
  {
    this.rstlist.clear(); 
    this.nseg = 1;
    this.bhasMoreData = true;
    this.bhasReceivedLastData = false;
  }

  public updateAdvancedSearchOptions(sopt:string)
  {
    //先清除搜索选项
      this.searchOpts.updateAdvancedSearchOptions(sopt);
  }
 
  public Refresh(refresher:any=undefined)
  {
    this.reset();
    this.sendReadSegRequest(refresher);
  }

  protected sendReadSegRequest(UICtrl:any = undefined)
  {
    
  }

  protected  requestNextSeg(infiniteScroll:any)
  {
    this.bhasReceivedLastData = false;
  }

  protected ProcessServerResponse(data, UICtrl:any)
  {

  }

  protected requestServerErrorProcedure(nseg:number, UICtrl:any)
  {

  }
}