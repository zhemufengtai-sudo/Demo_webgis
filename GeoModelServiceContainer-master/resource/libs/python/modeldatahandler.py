#Data : 2018-10-15
#Author : Fengyuan Zhang (Franklin)
#Email : franklinzhang@foxmail.com

import uuid

class ModelDataBody:
    def __init__(self, dtmpdir = "", dstype = "", dformat = "", dstructure = "", dcontent = "", db = ""):
        self._dstype = dstype
        self._dformat = dformat
        self._dstructure = dstructure
        self._dcontent = dcontent
        self._dtmpdir = dtmpdir
        self._dbody = db

    def getDataStoreType(self):
        return self._dstype
    

    def getByFile(self):
        if self._dstype == "File":
            return self._dbody
        elif self._dstype == "Stream":
            filename = self._dtmpdir + uuid.uuid1()
            with open(filename, 'w') as f:
                f.write(self._dbody)
                f.close()
            return filename


    def getByStream(self):
        if self._dstype == "File":
            dstream = ""
            with open(self._dstype, 'r') as f:
                dstream = f.read()
                f.close()
            return dstream
        elif self._dstype == "Stream":
            return self._dbody



class ModelDataAccess:
    def __init__(self, tmpDir = "") -> None:
        self._tmpDir = tmpDir
    
    def createDataBody(self, dstype: str = "", dformat: str = "", dstructure: str = "", dcontent: str = "", db = "") -> ModelDataBody:
        return ModelDataBody(self._tmpDir, dstype, dformat, dstructure, dcontent, db)
    
    def createDataBodyByFile(self, datafile: str = "", dformat: str = "", dstructure: str = "", dcontent: str = "") -> ModelDataBody:
        df = ModelDataBody(self._tmpDir, "File", dformat, dstructure, dcontent, datafile)
        return df
    
    def createDataBodyByStream(self, stream: str = "", dformat: str = "", dstructure: str = "", dcontent: str = "") -> ModelDataBody:
        ds = ModelDataBody(self._tmpDir, "File", dformat, dstructure, dcontent,stream)
        return ds
        
class ModelDataHandler:
    def __init__(self, context):
        self.mContext = context

        self.mExecutionPath = ''
        self.mZipExecutionPath = ''
        self.mExecutionName = ''

        self.mSavePath = ''
        self.mSaveName = ''

        self.mReturnFileFullName = ''
        
    def connectDataMappingMethod(self, execName):
        self.mExecutionName = execName
        self.mZipExecutionPath = self.mContext.getMappingLibrary()
        if self.mZipExecutionPath[ : -1] != '\\':
            self.mZipExecutionPath = self.mZipExecutionPath + '\\'
        self.mExecutionPath = self.mContext.onGetModelAssembly(execName)
        # self.mContext.onPostMessageInfo(execName)
        if self.mExecutionPath[ : -1] != '\\':
            self.mExecutionPath = self.mExecutionPath + '\\'
        
        self.mSaveName = ''
        self.mSavePath = ''
        self.mReturnFileFullName = ''

    def configureWorkingDirection(self, savePath):
        if savePath == '':
            self.mSavePath = self.mContext.getModelInstanceDirectory()
        else :
            self.mSavePath = savePath
        if self.mSavePath[ : -1] != '\\':
            self.mSavePath = self.mSavePath + '\\'

    def conductUDXMapping(self, resultSaveName):
        pass

    def conductFileMapping(self, list_rawFiles):
        pass

    def getRealResultSaveName(self):
        pass

    def doRequestEvent_MappingData(self, resultSaveName, name, value, type):
        pass
