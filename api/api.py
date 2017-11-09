from __future__ import print_function

from flask import Flask
from flask_cors import CORS
from flask_restful import reqparse, abort, Api, Resource
import operator
import pykube
import os
import shutil

import template
import uuid


app = Flask(__name__)
CORS(app)
api = Api(app)
parser = reqparse.RequestParser()


######################################################################
# Helpers
######################################################################
def instance_object(name, endpoint_minecraft, endpoint_rcon):
    return {
        "name": name,
        "endpoints": {
            "minecraft": endpoint_minecraft,
            "rcon": endpoint_rcon
        }
    }

def generate_templates():
    templates = template.Templates()

    pod_uuid = str(uuid.uuid4())
    pod_name = 'pod-' + pod_uuid
    svc_name = 'svc-' + pod_uuid

    pod_template = templates.pod_template
    svc_template = templates.svc_template

    pod_template['metadata']['name'] = pod_name
    pod_template['metadata']['labels']['serverName'] = pod_name
    pod_template['spec']['containers'][0]['volumeMounts'][0]['subPath'] = pod_name

    svc_template['metadata']['name'] = svc_name
    svc_template['spec']['selector']['serverName'] = pod_name

    return pod_name, pod_template, svc_template

def get_service(name):
    print("getting services")
    # need to produce external IP
    api = get_api()
    query = pykube.Service.objects(api).filter(namespace="mine")
    services = list(map(lambda service: service.obj, query))

    service = list(filter(lambda service: service.get('spec').get('selector').get('serverName') == name, services))

    if not service:
        return None

    return service[0]

def external_ip(name, cluster_ip):
    service = get_service(name)

    if not service:
        return cluster_ip

    status = service.get('status')

    if not status:
        return cluster_ip

    load_balancer = status.get('loadBalancer')

    if not load_balancer:
        return cluster_ip

    ingress = load_balancer.get('ingress')

    if not ingress:
        return cluster_ip

    address = ingress[0]

    if not address:
        return cluster_ip

    external_ip = address.get('ip')

    return external_ip

def abort_if_instance_doesnt_exist(instance_id):
    abort(404, message=" {} doesn't exist".format(instance_id))


def get_api():
    print("getting api")
    api = pykube.HTTPClient(pykube.KubeConfig.from_file("./kubekraft"))
    print("got the api")
    return api


def get_pods():
    api = get_api()
    pods = pykube.Pod.objects(api).filter(namespace="mine")
    return list(map(lambda pod: pod.obj, pods))


def get_ready_pods():
    api = get_api()
    pods = pykube.Pod.objects(api).filter(namespace="mine")
    ready_pods = filter(operator.attrgetter("ready"), pods)
    return list(map(lambda pod: pod.obj, ready_pods))


################################################################################
# API Resources
################################################################################

# Instance
class Instance(Resource):
    def get(self, instance_id):
        pods = get_pods()
        matching_pods = list(filter(lambda pod: pod.get('metadata').get('name') == instance_id, pods))
        return matching_pods[0] if matching_pods else abort_if_instance_doesnt_exist(instance_id)

    def delete(self, instance_id):
        api = get_api()
        pod = pykube.Pod.objects(api).filter(namespace="mine").get(name=instance_id)
        # Didn't see how to get service from pod instance, so doing some string concat 
        # to get service name to delete since they have same guid
        service_name = "svc-" + pod.name[4:len(pod.name)]
        service = pykube.Service.objects(api).filter(namespace="mine").get(name=service_name)
        service.delete()
        pod.delete()
        # Capture ObjectDoesNotExist and handle gracefully
        # abort_if_instance_doesnt_exist(instance_id)
        return True

# Instances
class Instances(Resource):
    def get(self):
        print("getting instances")
        ready_pods = filter(lambda pod: pod.get('metadata').get('labels').get('app') == 'minecraft-pod',
                            get_ready_pods())

        return list(map(
            lambda pod: instance_object(pod.get('metadata').get('name'),
                                        external_ip(pod.get('metadata').get('name'), pod.get('status').get('podIP')) + ":25565",
                                        external_ip(pod.get('metadata').get('name'), pod.get('status').get('podIP')) + ":25575"), ready_pods))

    def post(self):
        args = parser.parse_args()
        instance = {}

        # get api
        api = get_api()

        # populate templates
        pod_name, pod_template, svc_template = generate_templates()

        # creates the /data/pod-some-random-uuid/plugins directory
        destination = '/data/' + pod_name + '/plugins'
        os.makedirs(destination)

        # copy the prometheus exporter
        shutil.copy("./prometheus.jar", destination)

        # create pod, service.
        pykube.Pod(api, pod_template).create()
        pykube.Service(api, svc_template).create()

        return instance


################################################################################
# Actually setup the Api resource routing here
################################################################################
api.add_resource(Instances, '/instances')
api.add_resource(Instance, '/instances/<instance_id>')

if __name__ == '__main__':
    app.run(debug=False , host='0.0.0.0')
