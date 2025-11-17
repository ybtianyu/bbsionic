export class AllCheckBoxItem
{
    ischecked:boolean;
    constructor() {}
}

export class AllCheckBoxCtrl
{
    checkingitems:AllCheckBoxItem[];
    public bAllChecked:boolean;   //全部选择或取消全部选择的功能开关
    constructor(checkingItems:AllCheckBoxItem[])
    {
        this.checkingitems = checkingItems;  //使checkingitems指向实际的选择对象列表
        this.bAllChecked = true;
        for (let i = 0; i < this.checkingitems.length; i++)
        {
            if (this.checkingitems[i].ischecked == false)
            {
                this.bAllChecked = false;
                break;
            }
        }
    }

    checkAllItems()
    {
        this.bAllChecked = true;
        for (let i = 0; i < this.checkingitems.length; i++)
        {
          this.checkingitems[i].ischecked = true;
        }
    }

    uncheckAllItems()
    {
        this.bAllChecked = false;
        for (let i = 0; i < this.checkingitems.length; i++)
        {
          this.checkingitems[i].ischecked = false;
        }
    }

    public onSwitchCtrlforAll(ischecked)
    {
        if (ischecked)
        {
            this.checkAllItems();
        }
        else
        {
            this.uncheckAllItems();
        }
    }

}