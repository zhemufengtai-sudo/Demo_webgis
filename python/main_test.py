import json
import math
import time
import requests
from pathlib import Path
import xml.etree.ElementTree as ET




def SCS_Dataset_xml(p,s):
    # 生成xml文件
    root = ET.Element("dataset")
    for name,value in (("P",p),("S",s)):
        # XDO是UDX标准交换方式；kernelType 是用于声明输入数据的类型(real 代表float；int代表int....)
        ET.SubElement(root,"XDO",name=name,kernelType="real",value=str(value))
    SCS_xml = ET.tostring(root, encoding="unicode")
    return SCS_xml

def SCS_Upload(main_url,SCS_xml):
    # 处理SCS数据，进行upload操作
    request_upload = main_url +"/geodata?type=stream"
    #需要查看 geoDataMid里面对于stream(xml 文本)的限制
    upload_result = requests.post(
        url=request_upload,
        json={"gd_tag": "SCS_input",
              "data": SCS_xml},
        timeout=50,
    )

    result = upload_result.json()
    if result.get("result") !='suc':
        raise RuntimeError(f"接口返回错误: {result}")
    # print(upload_result.json())
    data = result.get("data")
    print(data) # 获取对应的data相关id
    return data # 只需要对应的data-id即可


def raster_Upload(main_url,raster, CONTROL= None):
    path = Path(raster)
    # if path.suffix.lower() not in {".tif", ".tiff"}:
    #     raise ValueError("输入文件必须是 .tif 或 .tiff")
    # if not path.is_file():
    #     raise FileNotFoundError(f"文件不存在：{path}")
    file = path.open("rb") # rb--read binary 是进行二进制读取 原先是传入path。必须为二进制
    url = main_url +"/geodata?type=file"
    upload_result = requests.post(
        url=url,
        data={"gd_tag": path.name},
        files={"myfile": (path.name, file, "application/octet-stream")},
        timeout=50,
        )
    file.close()    # 防止文件占用（不过这里可以用 with path.open("rb") as file)
    upload_result.raise_for_status()
    result = upload_result.json()
    if result.get("result") != "suc":
        raise RuntimeError(f"上传失败：{result}")
    data_id = result.get("data")
    if not isinstance(data_id, str) or not data_id.startswith("gd_"):
        raise RuntimeError(f"上传返回的数据编号异常：{result}")
    print(result)
    return data_id


def invoke_SCS_Model(main_url, data):
    # 调用模型操作
    SCS_model_msid = "6abe695f908157061dbee334"
    # Test
    # request_url = main_url + "/modelser/json/"+SCS_model_msid
    # r = requests.get(request_url)
    # print(r.json())
    URL = main_url + "/modelser/"+SCS_model_msid+"?ac=run"
    files = {
        'inputdata':[
        {
                "StateId": "04fcb904-270c-4dba-8505-016004fe5d02",
                "StateName": "LOADDATA",
                "Event": "inputdata",
                "DataId": data,
                "Destroyed": False,
        }
        ],
        'outputdata':[
            # {
            #     "StateId": "84da3376-366f-45cf-b6d4-78a5d1ce7dd6",
            #     "StateName": "RETURNDATA",
            #     "Event": "Output",
            #     "Destroyed": False,
            # }
        ],
        'cp':{},
    }

    invoke_In_SCS = requests.post(
        url=URL,
        json=files, timeout=15)
    invoke_In_SCS.raise_for_status()
    result = invoke_In_SCS.json()
    if result.get("result") !='suc':
        raise RuntimeError(f"接口返回错误: {result}")
    print(result["data"])
    return result["data"]

def invoke_LST_Model(main_url, data):
    LST_model_msid = "6ac0fd50bb0d409b2dce6fe1"
    URL = main_url + "/modelser/" + LST_model_msid + "?ac=run"
    files = [
        {
        "StateId": "D1FF1716-DF20-406d-AC5E-C36326468031",
        "StateName": "RUNSTATE",
        "Event": "DEM",
        "DataId": data[0],
        "Destroyed": False,},
        {
        "StateId": "D1FF1716-DF20-406d-AC5E-C36326468031",
        "StateName": "RUNSTATE",
        "Event": "SWR",
        "DataId": data[1],
        "Destroyed": False, },
        {
        "StateId": "D1FF1716-DF20-406d-AC5E-C36326468031",
        "StateName": "RUNSTATE",
        "Event": "LAI",
        "DataId": data[2],
        "Destroyed": False, }]

    invoke_IN_lst =requests.post(
        url =URL,
        json = {
            "inputdata":files,
            "outputdata":[],
            "cp":{}},
        timeout=50,
    )
    result = invoke_IN_lst.json()
    if result.get("result") != 'suc':
        raise RuntimeError(f"接口返回错误: {result}")
    print(result["data"]) #按照正常 应该是打印出三个event的 data-id
    return result["data"]


def query_SCS(main_url, run_SCS):
    # 之前未添加等待时间 导致查询过早 模型还未处理完全
    url = main_url + "/modelserrun/json/" + run_SCS
    deadline = time.time() + 50

    response = requests.get(url, timeout=15)
    response.raise_for_status()
    body = response.json()
    if body.get("result") != "suc":
        raise RuntimeError(f"查询失败: {body}")
    record = body["data"]
    status = record.get("msr_status")
    if status == 1: # 1代表suc 0代表false
        for i in record.get("msr_output"):
            if i.get("Event") == "Output" and i.get("DataId"):
                data_id = i["DataId"]
                if not isinstance(data_id, str):
                    raise RuntimeError("DataId 格式异常")
                return data_id
        raise RuntimeError()
    if status != 0:
        raise RuntimeError(f"False")
    if time.time() >= deadline:
        raise TimeoutError(f"等待超时")



def query_LST(main_url, run_SCS):
    # 之前未添加等待时间 导致查询过早 模型还未处理完全
    url = main_url + "/modelserrun/json/" + run_SCS
    deadline = time.time() + 50

    response = requests.get(url, timeout=15)
    response.raise_for_status()
    body = response.json()
    if body.get("result") != "suc":
        raise RuntimeError(f"查询失败: {body}")
    record = body["data"]
    print("step6")
    print(record)
    status = record.get("msr_status")
    if status == 1: # 1代表suc 0代表false
        for i in record.get("msr_output"):
            if i.get("Event") == "LST" and i.get("DataId"):
                data_id = i["DataId"]
                if not isinstance(data_id, str):
                    raise RuntimeError("DataId 格式异常")
                return data_id
        raise RuntimeError()
    if status != 0:
        raise RuntimeError(f"False")
    if time.time() >= deadline:
        raise TimeoutError(f"等待超时")


def get_output(main_url, query,output_path):
    response = requests.get(main_url + "/geodata/" + query, timeout=15)

    response.raise_for_status()
    # 因为需要发包 所以不能固定路径 __file__代表正在运行 resolve代表获取真实绝对路径 .parent获取脚本所在的上一级文件夹
    # folder = Path(__file__).resolve().parent / "scs_output" / run_SCS
    # folder.mkdir(parents=True, exist_ok=True)
    folder = Path(output_path)
    folder.mkdir(parents=True, exist_ok=True)
    output_file = folder / f"{query}.xml"
    output_file.write_bytes(response.content)

    root = ET.fromstring(response.content)
    print("step 5")
    print(ET.tostring(root, encoding="unicode"))
    values = [node.get("value") for node in root.iter("XDO")
              if node.get("kernelType")=="real"]
    value = float(values[0])
    if not math.isfinite(value):
        raise RuntimeError(f"值有问题")
    return value


def get_output_LST(main_url, query,output_path):
    response = requests.get(main_url + "/geodata/" + query, timeout=50)

    response.raise_for_status()
    output= response.json()
    print(output)
    print(output.get("Content-Type"))
    # folder = Path(output_path)
    # folder.mkdir(parents=True, exist_ok=True)
    # output_file = folder / f"{query}.xml"
    # output_file.write_bytes(response.content)

    # root = ET.fromstring(response.content)
    # print("step 5")
    # # print(ET.tostring(root, encoding="unicode"))
    # values = [node.get("value") for node in root.iter("XDO")
    #           if node.get("kernelType")=="real"]
    # value = float(values[0])
    # if not math.isfinite(value):
    #     raise RuntimeError(f"值有问题")
    # return value



def main(p,s):
    main_url = "http://127.0.0.1:8060"
    output_path_SCS = r"E:\WEB_TEST\temp\SCS"
    output_path_LST = r"E:\WEB_TEST\temp\LST"
    DEM = Path(r"E:\WEB_TEST\XIAN_DEM_30.zip")
    SWR = Path(r"E:\WEB_TEST\XIAN_SWR_30.zip")
    LAI = Path(r"E:\WEB_TEST\XIAN_LAI_30.zip")
    tags =[DEM,SWR,LAI]
    LST_upload = {}
    scs_xml = SCS_Dataset_xml(p,s)
    print(scs_xml)
    SCS_upload_data = SCS_Upload(main_url,scs_xml)
    run_SCS = invoke_SCS_Model(main_url,SCS_upload_data)
    query = query_SCS(main_url,run_SCS)
    result = get_output(main_url,query,output_path_SCS)
    return result
    #利用key 和value
    LST_result = [raster_Upload(main_url,tag) for tag in tags]
    print(LST_result)
    # LST_upload = raster_Upload(main_url,DEM)
    result_LST = invoke_LST_Model(main_url, LST_result)
    output_id = query_LST(main_url, result_LST)
    print("输出数据编号：", output_id)
    output_LST = [get_output_LST(main_url,i, output_path_LST) for i in result_LST]


if __name__ == "__main__":
    main(50.0,60.0)
