# coding=UTF-8
from impact.api import *
import impact.datatypesbase
import impact.datatypes

class CsvList(t.List):
    class _datatype(t.List._datatype):
        db = "MEDIUMTEXT"
        nullable = True

    def __init__(self, valueType, **kwargs):
        if not issubclass(t.Key, valueType) and not issubclass(t.String, valueType) and not issubclass(t.Int, valueType):
            raise Exception("Unsupported value type of CsvList. Only Key, Int and String are supported.")
        self._valueType = valueType
        t.List.__init__(self, valueType, **kwargs)


    def fromDb(self, inValue):
        return []

    def fromDbValue(self, inValue):
        if not inValue:
            return []
        else:
            return  map(self._valueType, inValue.split(","))

    def toDb (self, inValue):
        if not inValue:
            inValue = []
        inValue = ",".join(map(str, inValue))
        return impact.datatypes.String._toStringValue(inValue).encode("UTF-8")


class PagedList(TransportModel):
    items = []
    count = t.Int()
    offset = t.Int()
    amount = t.Int()
    numTotal = t.Int()
    