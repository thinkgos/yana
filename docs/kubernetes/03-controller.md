# 控制器

## 1. Deployment

![image-20211104230412552](http://imgur.thinkgos.cn/imgur/202111042304794.png)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```

## 2. DaemonSet

`DaemonSet` 开始运行的时机, 很多时候比整个 Kubernetes 集群出现的时机都要早,.

让你在 Kubernetes 集群里, 运行一个 `Daemon Pod`, 所以, 这个 Pod 有如下三个特征：

- 这个 Pod 运行在 Kubernetes 集群里的每一个节点（Node）上；每个节点上只有一个这样的 Pod 实例；
- 当有新的节点加入 Kubernetes 集群后, 该 Pod 会自动地在新节点上被创建出来；
- 而当旧节点被删除后, 它上面的 Pod 也相应地会被回收掉.

应用场景:

- 各种网络插件的 Agent 组件, 都必须运行在每一个节点上, 用来处理这个节点上的容器网络；
- 各种存储插件的 Agent 组件, 也必须运行在每一个节点上, 用来在这个节点上挂载远程存储目录, 操作容器的`Volume`目录；
- 各种监控组件和日志组件, 也必须运行在每一个节点上, 负责这个节点上的监控信息和日志搜集,

这个 DaemonSet, 管理的是一个 `fluentd-elasticsearch` 镜像的 Pod,. 这个镜像的功能非常实用：通过 fluentd 将 Docker 容器里的日志转发到 ElasticSearch 中,
需要注意的是, Docker 容器里应用的日志, 默认会保存在宿主机的`/var/lib/docker/containers/{{容器ID}}/{{容器ID}}-json.log`文件里, 所以这个目录正是 fluentd 的搜集目标,
Master节点默认携带了一个叫作`node-role.kubernetes.io/master`的"污点,为了能在 Master 节点上部署 `DaemonSet` 的 Pod, 我就必须让这个Pod"容忍”这个"污点”.



```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master  # 容忍污点,使的master也能布署DaemonSet
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: k8s.gcr.io/fluentd-elasticsearch:1.20
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

在 Kubernetes 项目里, `nodeSelector` 其实已经是一个将要被废弃的字段了,. 因为, 现在有了一个新的、功能更完善的字段可以代替它, 即`nodeAffinity`,. 我来举个例子：

```yaml

apiVersion: v1
kind: Pod
metadata:
  name: with-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: metadata.name
            operator: In   # 部分匹配, Equal 完全匹配
            values:
            - node-geektime
```

## 3. Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      parallelism: 2  # 最大并行数2,默认1
      completions: 4 # 最小完成数,默认1
      containers:
      - name: pi
        image: resouer/ubuntu-bc 
        command: ["sh", "-c", "echo 'scale=10000; 4*a(1)' | bc -l "]
      restartPolicy: Never  # 必须
  backoffLimit: 4  # 重试次数限制,默认值为6
  activeDeadlineSeconds: 100 # 最长运行最间,单位s
```

## 4. CronJob

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
```

`spec.concurrencyPolicy` 字段来定义具体的处理策略,. 比如：

- `oncurrencyPolicy=Allow`, 这也是默认情况, 这意味着这些 Job 可以同时存在.
- `concurrencyPolicy=Forbid`, 这意味着不会创建新的 Pod, 该创建周期被跳过.
- `concurrencyPolicy=Replace`, 这意味着新产生的 Job 会替换旧的、没有执行完的Job, 而如果某一