from pathlib import Path
import logging
import math

import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from main import main as run_scs_model


app = FastAPI()

class SCSInput(BaseModel):
    p: float = Field(ge=0, allow_inf_nan=False)
    s: float = Field(gt=0, allow_inf_nan=False)

BASE_DIR = Path(r"E:\WEB_TEST\python")
app.mount(
    "/leaflet",   # 浏览器访问的 URL 前缀
    StaticFiles(directory=BASE_DIR / "node_modules" / "leaflet" / "dist"),
    name="leaflet"  # 给这个挂载起名字，方便程序引用
)

@app.get("/")
def read_root():
    return FileResponse(BASE_DIR / "index.html",
                        media_type="text/html")

@app.get("/index.css")
def read_css():
    return FileResponse(BASE_DIR / "index.css",
                        media_type="text/css")
@app.get("/xian.js")
def read_xian_js():
    return FileResponse(BASE_DIR / "xian.js",
                        media_type="application/javascript")

@app.get("/park.js")
def read_park_js():
    return FileResponse(BASE_DIR / "park.js",
                        media_type="application/javascript")

@app.get("/chart.js")
def read_chart_js():
    return FileResponse(BASE_DIR / "chart.js",
                        media_type="application/javascript")

@app.get("/node_modules/chart.js/dist/chart.umd.min.js")
def read_chart_js_dist():
    return FileResponse(BASE_DIR / "node_modules" / "chart.js" / "dist" / "chart.umd.min.js",
                        media_type="application/javascript")

@app.post("/api/scs")   # 在index里面是fetch("/api/scs")
def calculate_scs(params: SCSInput):
    # 同步函数中的 requests 和等待操作由 FastAPI 在线程池中执行。
    result1 = float(run_scs_model(params.p, params.s))
    return {
        "p": params.p,
        "s": params.s,
        "result1": result1,
    }


