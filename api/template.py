import json


class Templates(object):
    @property
    def pod_template(self):
        with open('./templates/template-minepod-managed.json') as pod_json:
            data = json.load(pod_json)

        return data

    @property
    def svc_template(self):
        with open('./templates/template-mineservice-managed.json') as svc_json:
            data = json.load(svc_json)

        return data
