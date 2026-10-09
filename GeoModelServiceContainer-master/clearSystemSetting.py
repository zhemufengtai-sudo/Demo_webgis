from pymongo import MongoClient
import os

# delete MongoDB - GeoModelContainerDB - SystemSetting
client = MongoClient('mongodb://localhost:27017/')  # 请根据你的MongoDB连接URI进行修改
db = client['GeoModelContainerDB']
result = db['SystemSetting'].drop()
if result is None:
    print("SystemSetting表已成功删除")
else:
    print("SystemSetting表删除失败")
client.close()

# delete NeDB - GeoModelContainerDB - SystemSetting
mscdbPath = None
current_directory = os.path.dirname(os.path.abspath(__file__))
if(os.path.exists(current_directory + "/mscdb")):
    mscdbPath = current_directory + "/mscdb/"
elif(os.path.exists(current_directory + "/GeoModelServiceContainer/mscdb")):
    mscdbPath = current_directory + "/GeoModelServiceContainer/mscdb/"
else:
    print("SystemSetting表删除失败: 找不到相关路径")
    exit()
os.remove(mscdbPath + "systemsetting")
print("SystemSetting表已成功删除")