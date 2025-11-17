import { GroupInfo } from "../../providers/user-groups/user-groups";
import { AdvancedBbsSearchPage } from "../advanced-bbs-search/advanced-bbs-search";

export class SearchOpt
{
    constructor(sopts:string)
    {

    }

    setGroups(groups:GroupInfo[])    {
    }
  
    public getgroups():GroupInfo[]  { return []; }

    public getOptValbyname(name:string):string
    {
      return "";
    }
    public updateAdvancedSearchOptions(sopt:string)    {
    }
}

export class ImageSearchOpt extends SearchOpt
{
    //groupids:string;
    sopts:string;
    //postdatebegin_key;
    //postdateend_key;

    /**
     * 
     * @param sopt json string
     */
    constructor(sopt:string)
    {
        super(sopt);
        this.sopts = sopt;
        //let jopt = JSON.parse(sopt);
        //this.postdatebegin_key = (jopt['postdatebegin_key'] == undefined ? "" : jopt['postdatebegin_key']);
        //this.postdateend_key = (jopt['postdateend_key'] == undefined ? "" : jopt['postdateend_key']);
        //let grps:GroupInfo[] = (jopt['groups'] == undefined ? "" : jopt['postdateend_key']);
    }

    setGroups(groups:GroupInfo[])
    {
      let groupids = AdvancedBbsSearchPage.getgroupids(groups);
      let jopt = JSON.parse(this.sopts);
      jopt['groupids'] = groupids;
      this.sopts = JSON.stringify(jopt);
    }

    public updateAdvancedSearchOptions(sopt:string)
    {
        this.sopts = sopt;
        console.log(sopt);
    }

    public getOptValbyname(name:string):any
    {
      let jopt = JSON.parse(this.sopts);
      let val = (jopt[name] == undefined ? "" : jopt[name]);
      return val;
    }

}