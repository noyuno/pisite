import tornado.ioloop
import tornado.web
import tornado.websocket
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import json
import xml.etree.ElementTree as etree
import os
import glob

domain = "http://noyuno.mydns.jp"
datadir = "/var/www/html/jma/data"
clients = []
namespaces = {'jmx': 'http://xml.kishou.go.jp/jmaxml1/',
    'jmx_ib': 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/',
    'jmx_mete': 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
    'jmx_seis': 'http://xml.kishou.go.jp/jmaxml1/body/seismology1/',
    'jmx_eb': 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/' }

class Cache():
    def __init__(self):
        self.cachelength = 100
        self.list = []

    def load(self):
        f = glob.glob(datadir + "/*.xml")
        f.sort(key=os.path.getctime)
        if len(f) > self.cachelength:
            f = f[-self.cachelength:]
        for i in f:
            self.list.append(createdata(i))
        print("cached " + str(len(self.list)) + " data")

    def appenddata(self, data):
        while len(self.list) > self.cachelength:
            self.list.pop(0)
        self.list.append(data)

cache = Cache()

class ChatHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in clients:
            print("new client")
            clients.append(self)

    def on_message(self, message):
        if message == "cache":
            wrote = False
            out = {
                "status": True, 
                "count": len(cache.list), 
                "data": cache.list,
                "event": "cache"
            }
            j = json.dumps(out, indent=4,
                sort_keys=True, ensure_ascii=False, separators=(",", ": "))
            j = createout(True, cache.list, "cache")
            self.write_message(j)
        else:
            self.write_message("unknown command")

    def on_close(self):
        if self in clients:
            print("closed client")
            clients.remove(self)

def createdata(s):
    tree = etree.parse(s)

    d = {
        "link": s.replace("/var/www/html", domain),
        "infokind": str(tree.find("./jmx_ib:Head/jmx_ib:InfoKind", namespaces).text), 
        "title": str(tree.find("./jmx_ib:Head/jmx_ib:Title", namespaces).text), 
        "target-datetime": str(tree.find("./jmx_ib:Head/jmx_ib:TargetDateTime", namespaces).text), 
        "text": str(tree.find("./jmx_ib:Head/jmx_ib:Headline/jmx_ib:Text", namespaces).text)
    }
    return d

def createout(status, data, event):
    out = {
        "status": status, 
        "count": len(data), 
        "data": data, 
        "event": event
    }
    return json.dumps(out, indent=4,
        sort_keys=True, ensure_ascii=False, separators=(",", ": "))

def send(e, s):
    d = createdata(s)
    cache.appenddata(d)
    j = createout(s, [ d ], e)
    print(j)
    for c in clients:
        c.write_message(j)

class WatchdogXMLHandler(PatternMatchingEventHandler):
    def __init__(self):
        super(WatchdogXMLHandler, self).__init__(patterns=["*.xml"])

    def on_created(self, event):
        send("created", event.src_path)

    # debug
    #def on_modified(self, event):
    #    send("modified", event.src_path)

def watch(path, extension):
    observer = Observer()
    observer.schedule(WatchdogXMLHandler(), path, recursive=True)
    observer.start()
    print("started file watcher")

def endpoint():
    application = tornado.web.Application([
        (r"/", ChatHandler),
    ])
    application.listen(8000)
    print("starting tornado web endpoint")
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    cache.load()
    watch("/var/www/html/jma/data", "xml")
    endpoint()

