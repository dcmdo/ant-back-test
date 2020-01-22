/*
<Table
    columns={[
        [
            {
                props:{children:"国籍",rowSpan:2},
                tdPropsHandle:(data)=>{
                    if(data.国籍){
                        return {children:data.国籍,rowSpan:10};
                    }
                    return null;
                },
                renderIndex:0
            },
            {
                props:{rowSpan:2},
                checkType:0,
                checkPropsHandle:(data)=>{//data===undefined 时表示表头列
                    if(data){
                        return {
                            props:{},
                            canCheck:data.age>19,
                            isChecked:true,
                            canCancel:false,
                            onCheck:(a,b)=>{
                                console.log(a,b);
                            }
                        }
                    }
                    return {};
                },
                renderIndex:1
            },
            {
                props:{children:"name",colSpan:2}
            },
            {
                props:{children:"age",rowSpan:2},
                tdPropsHandle:(data)=>{
                    return {children:data.age};
                },
                renderIndex:4
            },
            {
                props:{children:"sex",rowSpan:2},
                tdPropsHandle:(data)=>{
                    return {children:data.sex};
                },
                renderIndex:5
            }
        ],
        [
            {
                props:{children:"firstName"},
                tdPropsHandle:(data)=>{
                    return {children:data.firstName};
                },
                renderIndex:2
            },
            {
                props:{children:"lastName"},
                tdPropsHandle:(data)=>{
                    return {children:data.lastName};
                },
                renderIndex:3
            }
        ]
    ]}
    datas={[
        {
            国籍:"中国",
            firstName:"li",
            lastName:"san",
            age:20,
            sex:"男"
        },
        {
            firstName:"li",
            lastName:"san",
            age:18,
            sex:"男"
        },
        {
            firstName:"li",
            lastName:"san",
            age:21,
            sex:"男"
        }
    ]}
    ref={"table"}
/>
<Button onClick={()=>{
    let datas = UIComponent.fns.ObjectFns.clone(this.refs.table.datas);
    datas.splice(1,0,{
        firstName:"zhang",
        lastName:"san",
        age:21,
        sex:"男"
    });
    this.refs.table.datas = datas;
}}>添加</Button>
 */