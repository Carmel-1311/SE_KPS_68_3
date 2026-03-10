"use client";

import { Button, Card, Space, Table, Modal, Select, TimePicker, Popconfirm, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";



let mockApi = {
  data: [
    {
      id: 1,
      date: "Mon",
      start_time: "09:00",
      end_time: "12:00",
      is_active: true
    }
  ]
};

const getWorkSchedules = async () => mockApi;

const createWorkSchedule = async (body:any)=>{
  mockApi.data.push({
    id: Date.now(),
    ...body,
    is_active:true
  });
};

const updateWorkSchedule = async(id:number,body:any)=>{

  const index = mockApi.data.findIndex(x=>x.id===id);

  if(index!==-1){
    mockApi.data[index] = {
      ...mockApi.data[index],
      ...body
    };
  }

};

const deleteWorkSchedule = async(id:number)=>{

  mockApi.data =
    mockApi.data.filter(x=>x.id!==id);

};

/* PAGE */

export default function DentistWorkSchedulePage() {

  const [data,setData] = useState<any[]>([]);
  const [openAdd,setOpenAdd] = useState(false);
  const [openEdit,setOpenEdit] = useState(false);

  const [day,setDay] = useState("Mon");
  const [start,setStart] = useState<any>(null);
  const [end,setEnd] = useState<any>(null);

  const [editId,setEditId] = useState<number | null>(null);

  const loadData = async ()=>{

    const res = await getWorkSchedules();

    const table = res.data.map((item:any)=>({

      key:item.id,
      date:item.date,
      start:item.start_time,
      end:item.end_time

    }));

    setData(table);

  };

  useEffect(()=>{
    loadData();
  },[]);

  const handleAdd = async()=>{

    await createWorkSchedule({

      staff_id:1,
      date:day,
      start_time:start.format("HH:mm"),
      end_time:end.format("HH:mm")

    });

    message.success("เพิ่มสำเร็จ");

    setOpenAdd(false);
    loadData();

  };

  const handleEdit = async()=>{

    await updateWorkSchedule(editId!,{

      date:day,
      start_time:start.format("HH:mm"),
      end_time:end.format("HH:mm"),
      is_active:true

    });

    message.success("แก้ไขสำเร็จ");

    setEditId(null);
    setOpenEdit(false);

    loadData();

  };

  const handleDelete = async(id:number)=>{

    await deleteWorkSchedule(id);

    message.success("ลบสำเร็จ");

    loadData();

  };

  return (
    <Card title="ตารางการทำงาน">

      <Space style={{ marginBottom: 12 }}>

        <Button onClick={()=>setOpenEdit(true)}>
          แก้ไข/ยกเลิกวันเวลาการทำงาน
        </Button>

        <Button onClick={()=>setOpenAdd(true)}>
          เพิ่มวันเวลาการทำงาน
        </Button>

      </Space>

      <Table
        pagination={false}
        dataSource={data}
        columns={[
          {title:"วัน",dataIndex:"date"},
          {title:"เริ่ม",dataIndex:"start"},
          {title:"สิ้นสุด",dataIndex:"end"}
        ]}
      />

     

      <Modal
        open={openAdd}
        title="เพิ่มวันเวลาการทำงาน"
        onCancel={()=>setOpenAdd(false)}
        onOk={handleAdd}
      >

        <Space orientation="vertical" style={{width:"100%"}}>

          <Select
            value={day}
            onChange={setDay}
            options={[
              {value:"Mon",label:"Mon"},
              {value:"Tue",label:"Tue"},
              {value:"Wed",label:"Wed"},
              {value:"Thu",label:"Thu"},
              {value:"Fri",label:"Fri"},
              {value:"Sat",label:"Sat"},
              {value:"Sun",label:"Sun"}
            ]}
          />

          <TimePicker
            style={{width:"100%"}}
            onChange={setStart}
            format="HH:mm"
          />

          <TimePicker
            style={{width:"100%"}}
            onChange={setEnd}
            format="HH:mm"
          />

        </Space>

      </Modal>

      {/* EDIT */}

      <Modal
        open={openEdit}
        footer={null}
        title="แก้ไข/ลบ"
        onCancel={()=>setOpenEdit(false)}
      >

        <Table
          pagination={false}
          dataSource={data}
          columns={[
            {title:"วัน",dataIndex:"date"},
            {title:"เริ่ม",dataIndex:"start"},
            {title:"สิ้นสุด",dataIndex:"end"},
            {
              title:"จัดการ",
              render:(_,record:any)=>(
                <Space>

                  <Button
                    onClick={()=>{

                      setEditId(record.key);
                      setDay(record.date);
                      setStart(dayjs(record.start,"HH:mm"));
                      setEnd(dayjs(record.end,"HH:mm"));

                    }}
                  >
                    แก้ไข
                  </Button>

                  <Popconfirm
                    title="ลบ?"
                    onConfirm={()=>handleDelete(record.key)}
                  >
                    <Button danger>ลบ</Button>
                  </Popconfirm>

                </Space>
              )
            }
          ]}
        />

        {editId && (

          <Space orientation="vertical" style={{marginTop:20,width:"100%"}}>

            <Select
              value={day}
              onChange={setDay}
              options={[
                {value:"Mon",label:"Mon"},
                {value:"Tue",label:"Tue"},
                {value:"Wed",label:"Wed"},
                {value:"Thu",label:"Thu"},
                {value:"Fri",label:"Fri"},
                {value:"Sat",label:"Sat"},
                {value:"Sun",label:"Sun"}
              ]}
            />

            <TimePicker
              value={start}
              format="HH:mm"
              onChange={setStart}
            />

            <TimePicker
              value={end}
              format="HH:mm"
              onChange={setEnd}
            />

            <Button type="primary" onClick={handleEdit}>
              บันทึก
            </Button>

          </Space>

        )}

      </Modal>

    </Card>
  );
}