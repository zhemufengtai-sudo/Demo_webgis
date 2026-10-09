项目
本demo较为简陋，望见谅。
---
# **概述**
## 后端：
使用 OpenGMS 的GeoModelServiceContainer，将平台下载的 SCS 降雨—径流模型部署到本地。通过 Python 的 requests 库调用模型服务，完成输入数据上传、模型运行、状态查询和结果获取，并使用 FastAPI 接收前端参数、向前端返回计算结果。
## 前端：
1.模型调用与分析模块： 用户设置P（降雨量） 和S(流域当时的最大可能滞留量），调用 SCS 模型计算径流量。支持固定其中一个参数、改变另一个参数，进行多情景对比，并基于Chart库通过图表，展示参数变化与径流结果之间的关系。<br>
2.地图可视化模块： 基于 Leaflet，加载西安市行政区划和公园的 GeoJSON 数据。支持鼠标悬停查看行政区划属性、点击公园要素查看名称。公园数据内置模拟不同降雨量的对应径流量数据，可通过点击查看，并自动将公园区块的S传给S的参数框内，可后续设置不同P进行径流-降雨分析。<br>
3.待完善部分： 已部署 SAGA-LST 模型包，但当前缺少配套解压工具等运行依赖，尚未完成计算验证。<br>
4.访问地址：https://www.webgis2333.xin/(已购买域名，通过阿里云）<br>
5.网站目前通过 Cloudflare 网站，设置Tunnel 连接本地端口，需要**本地电脑保持运行**。<br>

## 使用库情况：
1.node.js --version 10.19.0(利用uv管理node版本)<br>
2.Chart.js --https://chart.js.cn/docs/latest/<br>
3.Leaflet.js -- https://leafletjs.com/<br>
4.GeoModelServiceContainer -- Zhang, F., Chen, M., Ames, D. P., Shen, C., Yue, S., Wen, Y., & Lü, G. (2019). Design and development of a service-oriented wrapper system for sharing and reusing distributed geoanalysis models on the web. Environmental modelling & software, 111, 498-509.<br>


# **如何打开项目？**
1. 在GeoModelServiceContainer当中，利用npm 先安装对应package；然后基于 node .\bin\www 或者编写lauch.json进行调式（vscode）<br>
2. 打开python底下的app.py 通过 "uv run fastAPI dev app.py"打开端口;（**可以自己设定端口 默认为8000**）<br>
3. SCS 以及 LST 文件夹为部署到本地的模型。进入到模型容器当中，根据教学 (https://gitee.com/geomodeling/GeoModelServiceContainer#introduction) 可以自行部署
