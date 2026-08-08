import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // reads ~/.kube/config, same as kubectl

export const batchApi = kc.makeApiClient(k8s.BatchV1Api);
export const coreApi = kc.makeApiClient(k8s.CoreV1Api);

export const NAMESPACE = "default";