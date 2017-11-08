export function getInstances() {
  return fetch("http://localhost:5000/instances").then(resp => resp.json());
}

export function getInstance(podName) {
  return fetch(`http://localhost:5000/instances/${podName}`).then(resp => resp.json());
}

export function createPod() {
  return fetch("http://localhost:5000/instances", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function deletePod(podName) {
  return fetch(`http://localhost:5000/instances/${podName}`, {
    method: "DELETE",
  });
}
