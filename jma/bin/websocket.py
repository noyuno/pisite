import tornado.ioloop
import tornado.web
import tornado.websocket
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import json
import xml.etree.ElementTree as etree

domain = "http://noyuno.mydns.jp"
clients = []
namespaces = {'jmx': 'http://xml.kishou.go.jp/jmaxml1/',
    'jmx_ib': 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/',
    'jmx_mete': 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
    'jmx_seis': 'http://xml.kishou.go.jp/jmaxml1/body/seismology1/',
    'jmx_eb': 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/' }
cache = []
cachelen = 100

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
            for d in cache:
                if d == cache[-1]:
                    d["cache_end"] = True
                j = json.dumps(d, indent=4,
                    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
                self.write_message(j)
                wrote = True
            if not wrote:
                d = { "status": False }
                j = json.dumps(d, indent=4,
                    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
                self.write_message(j)
        else:
            self.write_message("unknown command")

    def on_close(self):
        if self in clients:
            print("closed client")
            clients.remove(self)

def send(e, s):
    tree = etree.parse(s)

    d = {
        "status": True,
        "event": e,
        "link": s.replace("/var/www/html", domain),
        "infokind": str(tree.find("./jmx_ib:Head/jmx_ib:InfoKind", namespaces).text), 
        "title": str(tree.find("./jmx_ib:Head/jmx_ib:Title", namespaces).text), 
        "target-datetime": str(tree.find("./jmx_ib:Head/jmx_ib:TargetDateTime", namespaces).text), 
        "text": str(tree.find("./jmx_ib:Head/jmx_ib:Headline/jmx_ib:Text", namespaces).text), 
        
    }

    j = json.dumps(d, indent=4,
        sort_keys=True, ensure_ascii=False, separators=(",", ": "))
    cache.append(d)
    if len(cache) > cachelen:
        del cache[0]
    print(j)
    for c in clients:
        c.write_message(j)

class WatchdogXMLHandler(PatternMatchingEventHandler):
    def __init__(self):
        super(WatchdogXMLHandler, self).__init__(patterns=["*.xml"])

    def on_created(self, event):
        send("created", event.src_path)

    def on_modified(self, event):
        send("modified", event.src_path)

def watch(path, extension):
    observer = Observer()
    observer.schedule(WatchdogXMLHandler(), path, recursive=True)
    observer.start()

if __name__ == "__main__":
    watch("/var/www/html/jma/data", "xml")

    application = tornado.web.Application([
        (r"/", ChatHandler),
    ])
    application.listen(8000)
    tornado.ioloop.IOLoop.current().start()

