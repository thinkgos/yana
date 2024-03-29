# kubernetes

## 1. 启动minikube

```shell
minikube start --driver=docker --image-mirror-country='cn' --image-repository='registry.cn-hangzhou.aliyuncs.com/google_containers' --registry-mirror='https://registry.docker-cn.com' --base-image="kicbase/stable:v0.0.28" --kubernetes-version=v1.22.3
```

## 2. 管理K8s核心资源的三种基本方法

- 陈述式管理
- 声明式管理
- GUI式管理

1. 陈述式管理

```shell
# describe 获取详细描述
kubectl	describe [deploy/svc] nginx-dp -n default # 详细描述

# namespace 
kubectl get ns
kubectl create ns app
kuebectl delete ns app

# 命名空间下的资源
kubectl get all [-n default] # 获得命名空间下的所有资源

#  deployment
kubectl create deployment nginx-dp --image=nginx -n default 
kubectl get deploy -n default [-o wide] 
kubectl delete deploy nginx-dp -n default 
kubectl scale deployment nginx-deployment --replicas 10 # 扩容
kubectl autoscale deployment nginx-deployment --min=10 --max=15 --cpu-percent=80 # HPD(horizontal pod autoscaling) 扩容
# rs
kubectl get rs 

# 滚动升级
kubectl set image deployment/nginx-deployment nginx=nginx:1.9.1 # 滚动更新镜像
kubectl rollout history deployment/nginx-deployment # 查看更新历史
kubectl rollout undo deployment/nginx-deployment # 回滚
kubectl rollout undo deployment/nginx-deployment --to-revision=2# 回滚,使用--revision参数指定某个历史版本
kubectl rollout status deployment/nginx-deployment # 回滚状态
kubectl rollout pause deployment/nginx-deployment # 暂停状态,随意更改
kubectl rollout resume deploy/nginx-deployment # 回复暂停,对前面的所有修改,触发滚动更新.

# pod
kubectl get pods -n default -o wide # 获取pod
kubectl delete pods  nginx-dp-6f9d9677fd-gf6jx -n  default # 删除pod(其实是重启一个,以保证预期目标pod数)
kubectl exec nginx-dp-6f9d9677fd-gf6jx -it bash -n default #进入pod

# service
kubectl expose deployment nginx-dp --port=8000 -n default
kubectl get svc -n default
kubectl delete svc nginx-dp -n default
kubectl scale deploy nginx-dp --replicas=2 -n default

# job 

```

2. 声明式管理

```shell
# 配置清单
kubectl get pods pod-name -o yaml -n default

#  解释配置
kubectl explain xx.xx.xx
# --record参数可以记录命令,我们可以很方便的查看每次 revision 的变化
kubectl [create|delete|apply] -f path/to/xxx.[yaml|json] --record
```

##  3 Headless Service

它所代理的所有 Pod 的 IP 地址, 都会被绑定一个这样格式的 DNS 记录.

`<pod-name>.<svc-name>.<namespace>.svc.cluster.local`这个DNS记录, 正是 Kubernetes 项目为 Pod 分配的唯一的“可解析身份”（Resolvable Identity）。

