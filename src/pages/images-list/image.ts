export class Image
{
    imgid:number;
    path:string;
    //personsid:number[];

    constructor(imgid:number, url:string)
    {
        this.imgid = imgid;
        this.path = url;
        /*for (let i = 0; i < personsid.length; i++)
            this.personsid.push(personsid[i]);
        */
    }

    public static convertJSONstoItems(jss:JSON[]):Image[]
    {
        let ret = [];
        for (let i = 0; i < jss.length; i++)
        {
            let js = jss[i];
            ret.push(new Image(js['imgid'], js['path']));
        }
        return ret;
    }
}