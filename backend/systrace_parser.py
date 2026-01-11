#
class TraceTag(object):

    """Docstring for TraceTag. """

    def __init__(self):
        """TODO: to be defined. """
        self.traceStartTime=None
        self.traceThread=None
        self.subTagOverView=None
        self.traceEndTime=None
        self.curTagParseDepth=None
        #TODO check one tag contains multiple core or not.
        self.cpuCore=None
        self.cpuFrequencyList=[]
        self.cpuPolicyList=[]
        
