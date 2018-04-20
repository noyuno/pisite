import tornado.ioloop
import tornado.web
import tornado.websocket
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import json
import xml.etree.ElementTree as etree
import os
import glob
import logging
import time
import threading

logging.basicConfig(
    filename="/var/log/jmaws.log",
    level=logging.INFO,
    format='%(asctime)s %(message)s', 
    datefmt='%Y%m%d-%H%M%S')

port = 8000
domain = "http://noyuno.space"
datadir = "/var/www/html/jma/data"
extension = "xml"
clients = []
namespaces = {'jmx': 'http://xml.kishou.go.jp/jmaxml1/',
    'jmx_ib': 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/',
    'jmx_mete': 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
    'jmx_seis': 'http://xml.kishou.go.jp/jmaxml1/body/seismology1/',
    'jmx_eb': 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/' }
watcher_restart = 60

class Cache():
    def __init__(self):
        self.cachelength = 500
        self.list = []

    def load(self):
        f = glob.glob(datadir + "/*.xml")
        f.sort(key=os.path.getctime)
        if len(f) > self.cachelength:
            f = f[-self.cachelength:]
        for i in f:
            d = createdata(i)
            if d is not None:
                self.list.append(d)
        logging.info("cached " + str(len(self.list)) + " data")

    def appenddata(self, data):
        while len(self.list) - 1 > self.cachelength:
            self.list.pop(0)
        self.list.append(data)

cache = Cache()

class ChatHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in clients:
            logging.info("new client")
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
            logging.info("closed client")
            clients.remove(self)

def createdata(s):
    d = None
    try:
        tree = etree.parse(s)

        d = {
            "id": s.replace("/var/www/html/jma/data/", "").replace(".xml", ""), 
            "link": s.replace("/var/www/html", domain),
            "infokind": str(tree.find("./jmx_ib:Head/jmx_ib:InfoKind", namespaces).text), 
            "title": str(tree.find("./jmx_ib:Head/jmx_ib:Title", namespaces).text), 
            "target-datetime": str(tree.find("./jmx_ib:Head/jmx_ib:TargetDateTime", namespaces).text), 
            "text": str(tree.find("./jmx_ib:Head/jmx_ib:Headline/jmx_ib:Text", namespaces).text)
        }
    except:
        pass
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
    if d is not None:
        logging.info(d["link"])
        cache.appenddata(d)
        j = createout(s, [ d ], e)
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

class WatchThread(threading.Thread):
    def __init__(self):
        super(WatchThread, self).__init__()

    def run(self):
        logging.info("starting file watcher")
        logging.info("watcher is going to restart every " + str(watcher_restart) + " seconds")
        while True:
            observer = Observer()
            observer.schedule(WatchdogXMLHandler(), datadir, recursive=True)
            observer.start()
            time.sleep(watcher_restart)
            observer.stop()

def endpoint():
    application = tornado.web.Application([
        (r"/", ChatHandler),
    ])
    logging.info("starting tornado web endpoint")
    application.listen(port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    cache.load()
    watch = WatchThread()
    watch.start()
    endpoint()

