import { DatesUtils } from "../../providers/dates/dates";
import { UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { List } from "../bbs/list";
import { CalendarBBSlist } from "../bbs/rtctrl-customized-singlegroup";
import { ImagesListItem } from "./imageslist-item";
import { Image } from "./image";

export class CalendarImagesList extends CalendarBBSlist
{
  constructor(public user_groups:UserGroupsProvider, public datesUtils:DatesUtils)
  {
    super(user_groups, datesUtils);
  }

  public convertJSONstoItems(jsons:JSON[]):any[]  //ImagesListItem[]
  {
    var items:ImagesListItem[] = [];
    //console.log("CalendarImagesList::convertJSONtoItems: jsons.length=" + jsons.length);
      //修改item在CalendarImagesList对象中的index索引属性值
    let index = 0;
    let preListlength = this.getlist().length;
    if ( preListlength > 0)
      index = this.getlist()[preListlength-1].itemid + 1;
    for (let i:number = 0; i < jsons.length; i++, index++)
    {
      //console.log("CalendarImagesList::convertJSONtoItems:index=" + index);
      try
      {
      let images:Image[] = Image.convertJSONstoItems(jsons[i]['imgs']);
      //console.log("images length=" + images.length);
      var item:ImagesListItem = new ImagesListItem(index, jsons[i]['bbsid'], jsons[i]['title'], jsons[i]['date'], 
                              jsons[i]['groupid'], images);
      items.push(item);
      }
      catch (e)
      {
        console.log("Exception CalendarImagesList::convertJSONstoItems");
      }
    }
    return items;
  }

    public getItemCalendardate(i:number):string
    {
        let item:ImagesListItem = this.getItem(i);
        console.log("list len=" + this.getlist().length);
        console.log(item.date);
        return item.date;
    }
}