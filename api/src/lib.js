export function getInstances() {
  return fetch("http://localhost:5000/instances");
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
