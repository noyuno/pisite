import json
import xml.etree.ElementTree as etree

namespaces = {'jmx': 'http://xml.kishou.go.jp/jmaxml1/',
    'jmx_ib': 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/',
    'jmx_mete': 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
    'jmx_seis': 'http://xml.kishou.go.jp/jmaxml1/body/seismology1/',
    'jmx_eb': 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/' }

s = "/var/www/html/jma/data/e0102cfa-6a48-3e40-9f11-51753b5ecaba.xml"
e = "test"
domain = "http://noyuno.mydns.jp"

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
#for i in tree.findall(".", namespaces):
#    d["title"].append(str(i.find("./jmx_ib:Head/jmx_ib:InfoKind", namespaces).text))

j = json.dumps(d, indent=4,
    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
print(j)


