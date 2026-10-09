#Data : 2024-3-11
#Author : 7bin, Fengyuan Zhang (Franklin)
#Email : franklinzhang@foxmail.com
#Description: Model service package encapsulation development kit (lite)


import os
import socket
# from sys import exit
import sys
import threading
import time
import uuid
from enum import Enum
from typing import Optional

# from .IModelServiceContext import IModelServiceContext, ExecExtension
from modelservicecontext import ModelServiceContext, ERequestResponseDataMIME, ERequestResponseDataFlag, EModelContextStatus
from modeldatahandler import ModelDataBody, ModelDataAccess

# Static global parameters
DEFAULT_STATE_NAME = "RUNSTATE"
DEFAULT_EVENT_NAME = "RUNEVENT"
# socket message size
SOCKET_MESSAGE_SIZE = 1024
# socket message max size 1024 / 3
SOCKET_MESSAGE_CHAR_SIZE = 300


class ModelServiceContextLite:
    def __init__(self, debug: bool = False):
        self._msc = ModelServiceContext(debug)
        self._modeldataaccess = ModelDataAccess(self._msc.getModelInstanceDirectory())
        
    def onInitialize(self, host: str = "127.0.0.1", port: int = 6001, instanceID: str = None) -> None:
        # read init parameter by length
        if len(sys.argv) == 2:
            host = sys.argv[1]
            instanceID = str(uuid.uuid4())
        elif len(sys.argv) == 3:
            host = sys.argv[1]
            port = int(sys.argv[2])
            instanceID = str(uuid.uuid4())
        elif len(sys.argv) == 4:
            host = sys.argv[1]
            port = int(sys.argv[2])
            instanceID = sys.argv[3]
        else:
            instanceID = str(uuid.uuid4())

        self._msc.onInitialize(host, port, instanceID)

    def getRequestData(self, stateName = "", eventName = "") -> ModelDataBody:
        if(self._msc.getCurrentRunningState() != stateName):
            self._msc.onLeaveState()
            self._msc.onEnterState(stateName)
        self._msc.onFireEvent(eventName)
        self._msc.onRequestData()
        if(self._msc.getRequestDataFlag() == ERequestResponseDataFlag.ERDF_OK):
            if(self._msc.getRequestDataMIME() == ERequestResponseDataMIME.ERDM_RAW_FILE):
                db = self._msc.getRequestDataBody()
                return self._modeldataaccess.createDataBody(dstype="File", db=db)
            elif(self._msc.getRequestDataMIME() == ERequestResponseDataMIME.ERDM_RAW_STREAM):
                db = self._msc.getRequestDataBody()
                return self._modeldataaccess.createDataBody(dstype="Stream", db=db)
        else:
            return None
        # self._msc._resetRequestDataInfo()
        
    def setResponseData(self, stateName = "", eventName = "", dataBody : ModelDataBody = None) -> int:
        if(dataBody == None):
            return -1
        if(self._msc.getCurrentRunningState() != stateName):
            self._msc.onLeaveState()
            self._msc.onEnterState(stateName)
        self._msc.onFireEvent(eventName)
        self._msc.setResponseDataFlag(ERequestResponseDataFlag.ERDF_OK)
        if(dataBody.getDataStoreType() == "File"):
            self._msc.setResponseDataMIME(ERequestResponseDataMIME.ERDM_RAW_FILE)
            self._msc.setResponseDataBody(dataBody.getByFile())
        elif(dataBody.getDataStoreType() == "Stream"):
            self._msc.setResponseDataMIME(ERequestResponseDataMIME.ERDM_RAW_STREAM)
            self._msc.setResponseDataBody(dataBody.getByStream())
        elif(dataBody.getDataStoreType() == "Url"):
            self._msc.setResponseDataMIME(ERequestResponseDataMIME.ERDM_URL)
            self._msc.setResponseDataBody(dataBody.getByFile())
        self._msc.onResponseData()
        # self._msc._resetResponseDataInfo()
        return 1

    def setResponseDataByFile(self, stateName = "", eventName = "", datafile = "") -> int:
        if(datafile == ""):
            return -1
        df = self._modeldataaccess.createDataBodyByFile(datafile = datafile)
        return self.setResponseData(stateName, eventName, df)
        
    def setResponseDataByStream(self, stateName = "", eventName = "", datastream = "") -> int:
        if(datastream == ""):
            return -1
        ds = self._modeldataaccess.createDataBodyByStream(stream = datastream)
        return self.setResponseData(stateName, eventName, ds)

    def onPostErrorInfo(self, errInfo: str) -> None:
        self._msc.onPostErrorInfo(errInfo)

    def onPostWarningInfo(self, warningInfo: str) -> None:
        self._msc.onPostWarningInfo(warningInfo)

    def onPostMessageInfo(self, messageInfo: str) -> None:
        self._msc.onPostMessageInfo(messageInfo)

    def onEnterState(self, stateId: str) -> None:
        self._msc.onEnterState(stateId)

    def onFireEvent(self, eventName: str) -> None:
        self._msc.onFireEvent(eventName)

    def onLeaveState(self) -> None:
        self._msc.onLeaveState()

    def onFinalize(self) -> None:
        self._msc.onFinalize()

    def onGetModelAssembly(self, methodName: str) -> str:
        return self._msc.onGetModelAssembly(methodName)

    def getMappingLibraryDirectory(self) -> str:
        return self._msc.mMappingLibDir

    def getModelInstanceDirectory(self) -> str:
        return self._msc.mInstanceDir
    
    def getCurrentDataDirectory(self, createDir: bool = True) -> str:
        return self._msc.getCurrentDataDirectory(createDir)
    
    def getSlash(self) -> str:
        return self._msc._getSlash()

    @staticmethod
    def createModelServiceContext(argvs):
        if len(argvs) < 4:
            return None
        ms = None
        if (len(sys.argv) > 4 and sys.argv[4] == "debug"):
            ms = ModelServiceContextLite(True)
        else:
            ms = ModelServiceContextLite(False)
        return ms
