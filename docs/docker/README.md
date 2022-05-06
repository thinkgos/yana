---
title: "docker"
tags: ["docker"]
---

## 1. cgroup资源限制

### 1.1 CPU配额

参数: 

`--cpus decial`: CPU的个数

`-c,--cpu-shares int` 配置CPU配额

CPU shares(relative weight)在创建容器时指定容器所使用的CPU份额值, cpu-shares的值不能保证可以获得1个vcpu或者多少GHz的CPU资源, 仅仅只是一个弹性加权值.

**默认每个docker容器的CPU份额值都是1024**, 在同一个CPU核心上, 同时运行多个容器时, 容器的CPU加权的效果才能体现出来.

cgroups只在多个容器同时争抢同一个CPU资源时, CPU配额才会生效,  因紫, 无法单纯的根据某个容器的CPU份额来确定有多少CPU资源分配给它, 资源分配结果取决于同时运行的其它容器的CPU分配和容器中进程运行的情况.

### 1.2 CPU core核心控制

参数: `--cpuset` 可以绑定CPU

对于多核CPU的服务器, docker还可以控制容器运行限定使用哪些CPU内核和内存节点, 即使用 `--cpuset-cpus`和`--cpuset-mems`参数, **对具有NUMA拓扑(具有多CPU, 多内存节点)的服务器尤其有用**, 可以对需要高性能计算的容器进行性能最优的配置. 如果服务器只有一个内存节点, 则`--cpuset-mems`的配置基本上不会有明显的效果. 

> SMP: 对称多处理器结构(SMP Symmetric Multi-Processor), 例: x86服务器,双路服务器, 主板上有两个物理CPU
>
> NUMA: 非一致存储访问结构(NUMA: Non-Uniform Memory Access), 例 IBM小型机pSeries 690
>
> MPP: 海量并行处理结构(MPP: Massive ParallelProcessing). 例: 大型机 Z14

### 1.3 CPU周期控制

参数: 

`--cpu-period`(周期): 用来指定容器对CPU的使用,要在多长时间内做一次重新分配. 指定周期

`--cpu-quota`(配额): 用来指定在这个周期内, 最多可以有多少时间片用来跑这个容器, 指定在这个周期中使用多少时间片.

> 跟`--cpu-shares`不同`--cpu-period`和`--cpu-quota`是指定一个绝对值,而且没有弹性在里面, 容器对CPU资源的使用绝对不会超过配置的值.
>
> `--cpu-period`和`--cpu-quota`的单位为微秒(us),
>
> `--cpu-period`最小值为1000us, 最大值为10^6us, 默认值为0.1秒(100000 us)
>
> `--cpu-quota`的值默认为-1,表示不做控制.

### 1.4 内存配额

参数: 

`-m,--memory=` 限制容器的内存使用量.

### 1.5 限制IO 

参数: 

`--device-write-bps value`: 限制此设备上写速度(bytes/s), 单位可以是kb,mb或者gb

`--device-read-bps value`: 限制此设备上的讯速度(bytes/s),单位可以是kb,mb或者gb

`--device`: 将主机设备添加到容器

### 2.6 PID配额

参数: 

`--pids-limit value`: 限制容器最多只能创建多少个PID







