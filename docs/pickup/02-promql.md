# PromQL: prometheus query language

## 一. Concepts

### 1.1 Data model

`Prometheus` 存储所有数据作为时间序列.

#### 1.1.1 Metric names and labels

每个时间序列都由其`Metric names`和可选的键值称为`label`作为唯一识别。

- `Metric names` 满足 `[a-zA-Z_:][a-zA-Z0-9_:]*`(**NOTE**: `:`保留用于用户定义的记录规则. )
- `label`满足`[a-zA-Z0-9_]*`, 以`__`开头的标签名为内部使用

### 1.1.2 Samples

来自实际时间序列数据的示例。每个样本包括：

- 一个float64的值

- 一个毫秒的精确时间戳

### 1.1.3 Notation

给定`Metric names`和一组`label`，经常使用此识别时间序列：

```
<metric name>{<label name>=<label value>, ...}
```

### 1.2 Metric types

`Prometheus`客户端库提供四种核心度量标准类型

#### 1.2.1 Counter

`Counter`是一个累积度量标准，代表单个单调增加的计数器，其值只能增加或在重新启动时重置为零。例如，您可以使用计数器来表示已服务的请求数量，完成任务或错误.

#### 1.2.2 Gauge

`Gauge`是代表可以任意上下改变的单个数值值的度量。通常用于测量值，例如温度或当前内存使用情况，但也可以“计数”，例如同时的请求数量。

#### 1.2.3 Histogram

`Histogram`样本观察（通常是请求持续时间或响应大小的内容），并在可配置的存储桶中对其进行计数。它还提供了所有观察到的值的总和。

#### 1.2.4 Summary

类似于`Histogram`，`Summary`样本观察（通常是请求持续时间和响应大小的东西）。虽然它还提供了总检测数量和所有观察到的值的总和，但它通过滑动时间窗口计算可配置的定量

### 1.3 Jobs and instances

`Job`:  采集的工作目标

`instances`:  采集的目标实例

## 二. promQL

`Prometheus`提供了一个功能性查询语言, 这使用户可以实时选择和聚合时间序列数据。表达式的结果可以显示为图形，将其视为`Prometheus`表达式浏览器中的图形数据，也可以通过`HTTP API`被外部系统使用。

### 2.1 Expression language data types

在`Prometheus`的表达语言中，表达式或子表达包括以下四种类型之一:

- `Instant vector` - 瞬时向量集合: 一组时间序列，每个时间序列的单个样本，它们共享相同的时间戳

- `Range vector` - 区间值集合: 一组时间序列，其中每个时间序列都包含一系列数据点
- `Scalar` - 标量: 一个简单的数字浮点值
- `String` - 字符串: 简单的字符串值, 当前未使用

### 2.2 literals

#### 2.2.1 String literals

字符串可以用单引号，双引号或反引号。遵循和`go`一样的转义规则

#### 2.2.2 Float literals

标量浮点值可以以格式写入文字整数或浮点数（仅包含用于更好可读性的空格）：

```
[-+]?(
      [0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?
    | 0[xX][0-9a-fA-F]+
    | [nN][aA][nN]
    | [iI][nN][fF]
)
```

### 2.3 Time series Selectors

#### 2.3.1 Instant vector selectors

瞬时向量选择器(Instant vector selectors)允许使用简单指定`Metric names`获取在给定时间戳（瞬时）选择一组时间序列样本值. 结果包含一个时间序列的瞬时向量集合.

比如: 

```
http_requests_total
```

你可以过滤这些集合, 通过`labels`进行选择,

```
http_requests_total{job="prometheus",group="canary"}
```

以下标签匹配操作：

- `=`: Select labels that are exactly equal to the provided string.
- `!=`: Select labels that are not equal to the provided string.
- `=~`: Select labels that regex-match the provided string.
- `!~`: Select labels that do not regex-match the provided string.

***NOTE***: `Metric names`不能为关键值,如 `bool`, `on`, `ignoring`, `group_left` and `group_right`

#### 2.3.2 Range Vector Selectors

区间向量选择器(Range vector)和瞬时向量集合选择器(Instant vector selectors)一样的工作系统,它从范围内选择一系列瞬时间做为集合的元素.

```
# 表示从过云5分钟内所有http_requests_total且label键值对为job,key的值
http_requests_total{job="prometheus"}[5m]
```

##### Time Durations

- `ms` - milliseconds
- `s` - seconds
- `m` - minutes
- `h` - hours
- `d` - days - assuming a day has always 24h
- `w` - weeks - assuming a week has always 7d
- `y` - years - assuming a year has always 365d

##### Offset modifier

`offset`允许更改查询中各个瞬间和范围向量的时间偏移.

```
http_requests_total offset 5m
sum(http_requests_total{method="GET"} offset 5m)
rate(http_requests_total[5m] offset 1w)
rate(http_requests_total[5m] offset -1w)
```

##### @ modifier

`@`修改器允许更改查询中各个即时和范围向量的评估时间。提供给`@`修改器的时间是UNIX时间戳，并用浮点文字描述。

```
http_requests_total @ 1609746000
```

#### 2.3.3 Subquery

子查询允许您为给定范围和分辨率运行即时查询。子查询的结果是区间向量集合。

语法: `<instant_query> '[' <range> ':' [<resolution>] ']' [ @ <float_literal> ] [ offset <duration> ]`

- `<resolution>` 是可选的, 默认值是全局评估间隔

#### 2.3.4 Operators

`Prometheus`支持许多二元和聚合操作。

#### 2.3.5 Functions

`Prometheus`支持多个运行数据的功能.see [Functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)

#### 2.3.6 Comments

PromQL supports line comments that start with `#`

```
# This is a comment
```

#### 2.3.7 Gotchas

- Staleness
- Avoiding slow queries and overloads

### 2.4 Operators

#### 2.4.1 Binary operators 

##### Arithmetic binary operators

- `+` (addition)
- `-` (subtraction)
- `*` (multiplication)
- `/` (division)
- `%` (modulo)
- `^` (power/exponentiation)

##### Comparison binary operators

- `==` (equal)
- `!=` (not-equal)
- `>` (greater-than)
- `<` (less-than)
- `>=` (greater-or-equal)
- `<=` (less-or-equal)

##### Logical/set binary operators

- `and` (intersection)
- `or` (union)
- `unless` (complement)



#### 2.4.2 Vector matching

集合之间的操作试图在左侧的每个条目中在右侧矢量中找到匹配元素。匹配行为有两种基本类型：一对一，一对一/一对一。

#### 2.4.3 Aggregation operators

- `sum` (calculate sum over dimensions)
- `min` (select minimum over dimensions)
- `max` (select maximum over dimensions)
- `avg` (calculate the average over dimensions)
- `group` (all values in the resulting vector are 1)
- `stddev` (calculate population standard deviation over dimensions)
- `stdvar` (calculate population standard variance over dimensions)
- `count` (count number of elements in the vector)
- `count_values` (count number of elements with the same value)
- `bottomk` (smallest k elements by sample value)
- `topk` (largest k elements by sample value)
- `quantile` (calculate φ-quantile (0 ≤ φ ≤ 1) over dimensions)

#### 2.4.4 Binary operator precedence

1. `^`
2. `*`, `/`, `%`, `atan2`
3. `+`, `-`
4. `==`, `!=`, `<=`, `<`, `>=`, `>`
5. `and`, `unless`
6. `or`

### 2.5 Functions

see [Functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)

