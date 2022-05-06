
` Open Policy Agent` (`OPA`, 发音 “oh-pa”) 是一个开源, 通用策略引擎,它统一了整个架构的策略实施. `OPA`提供了高层次声明式语言,可以可以将策略指定为代码和简单的API，从而将策略决策从软件中分离出来。您可以在微服务、Kubernetes、CI/CD 、API 网关等使用 `OPA` 作策略。

阅读此页面以了解 `OPA `策略语言 (`Rego`) 中的核心概念，以及如何下载、运行和集成 OPA。

## Overview

`OPA`将策略决策与策略执行分离开来。当你的软件需要做出决策时，它会查询`OPA`并提供结构化数据(例如JSON)作为输入。`OPA`接受任意结构化数据作为输入。

![img](https://d33wubrfki0l68.cloudfront.net/b394f524e15a67457b85fdfeed02ff3f2764eb9e/6ac2b/docs/latest/images/opa-service.svg)

`OPA` 通过根据策略和数据评估查询输入来生成策略决策。 OPA 和 Rego 是领域无关的，所以你可以在你的策略中描述几乎任何类型的不变量。 例如：

- 哪些用户可以访问哪些资源。
- 允许哪些子网出口流量。
- 必须将工作负载部署到哪些集群。
- 可以从哪些注册表二进制文件下载
- 容器可以执行哪些操作系统功能。
- 一天中的哪些时间可以访问系统。

政策决定不限于简单的`yes/no`或`allow/deny`回应。 与查询输入一样，您的策略可以生成任意结构化数据作为输出.

让我们看一个例子。

## Example

想象一下，您为具有以下系统的组织工作：

![img](https://d33wubrfki0l68.cloudfront.net/ccaa16878b16f07b8f03403662cb483decb11389/37b9e/docs/latest/images/system.svg)

系统中包含三种组件:

- 服务器公开零个或多个协议(`https`,`ssh`)
- 网络连接服务器，可以是公共的或私有的。 公共网络连接到 Internet。
- 端口将服务器连接到网络

所有服务器、网络和端口均由脚本提供。 该脚本接收系统的 JSON 表示形式作为输入：

```json
{
    "servers": [
        {"id": "app", "protocols": ["https", "ssh"], "ports": ["p1", "p2", "p3"]},
        {"id": "db", "protocols": ["mysql"], "ports": ["p3"]},
        {"id": "cache", "protocols": ["memcache"], "ports": ["p3"]},
        {"id": "ci", "protocols": ["http"], "ports": ["p1", "p2"]},
        {"id": "busybox", "protocols": ["telnet"], "ports": ["p1"]}
    ],
    "networks": [
        {"id": "net1", "public": false},
        {"id": "net2", "public": false},
        {"id": "net3", "public": true},
        {"id": "net4", "public": true}
    ],
    "ports": [
        {"id": "p1", "network": "net1"},
        {"id": "p2", "network": "net3"},
        {"id": "p3", "network": "net2"}
    ]
}
```

当天早些时候，您的老板告诉您必须实施一项新的安全策略：

>1. Servers reachable from the Internet must not expose the insecure 'http' protocol.
>2. Servers are not allowed to expose the 'telnet' protocol.

当提供服务器、网络和端口并且合规团队希望定期审核系统以查找违反策略的服务器时，需要强制执行该策略。

您的老板要求您确定 OPA 是否适合实施该政策。





















