from flask import Flask
from flask_cors import CORS
from flask_restful import reqparse, abort, Api, Resource
import operator
import pykube

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


# Get instance data using  pykube
def get_instance(instance_id):
    # IMPLEMENT PYKUBE
    return instance_object('foo', 'bar', 'baz')


def abort_if_instance_doesnt_exist(instance_id):
    abort(404, message=" {} doesn't exist".format(instance_id))


def get_api():
    api = pykube.HTTPClient(pykube.KubeConfig.from_file("./kubekraft"))
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
        # abort_if_instance_doesnt_exist(instance_id)
        # instance = get_instance(instance_id)
        api = get_api()
        return pykube.Pod.objects(api).filter(namespace="mine").get(name=instance_id).delete()

# Instances
class Instances(Resource):
    def get(self):
        ready_pods = filter(lambda pod: pod.get('metadata').get('labels').get('app') == 'minecraft-pod',
                            get_ready_pods())
        return list(map(
            lambda pod: instance_object(pod.get('metadata').get('name'),
                                        pod.get('status').get('podIP') + ":25565",
                                        pod.get('status').get('podIP') + ":25575"), ready_pods))

    def post(self):
        args = parser.parse_args()
        instance = {}
        # CREATE INSTANCE
        return instance


################################################################################
# Actually setup the Api resource routing here
################################################################################
api.add_resource(Instances, '/instances')
api.add_resource(Instance, '/instances/<instance_id>')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
