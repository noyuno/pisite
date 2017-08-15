import tornado.ioloop
import tornado.web
import tornado.websocket
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import json

clients = []

class ChatHandler(tornado.websocket.WebSocketHandler):

    def open(self):
        if self not in clients:
            print("new client")
            clients.append(self)

    #def on_message(self, message):
    #    for c in clients:
    #        c.write_message(message)

    def on_close(self):
        if self in clients:
            print("closed client")
            clients.remove(self)

def send(d):
    j = json.dumps(d, indent=4,
        sort_keys=True, ensure_ascii=False, separators=(",", ": "))
    print(j)
    for c in clients:
        c.write_message(j)

class WatchdogXMLHandler(PatternMatchingEventHandler):
    def __init__(self):
        super(WatchdogXMLHandler, self).__init__(patterns=["*.xml"])

    def on_created(self, event):
        d = { "event": "created", "url": event.src_path.replace("/var/www/html", "") }
        send(d)

    def on_modified(self, event):
        d = { "event": "modified", "url": event.src_path.replace("/var/www/html", "") }
        send(d)

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

