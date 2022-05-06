# LogQL: Log query language

## 一. Overview

`LogQL` 是 Grafana Loki 的受 `promql` 启发的查询语言。查询的行为就好像它们是聚合日志源的分布式 grep。`LogQL` 使用标签和运算符进行过滤。

有两种类型的 LogQL 查询:

- [Log queries](#二. Log queries  ) 返回日志行的内容.
- [Metric queries](#三. Metric queries) 基于扩展日志查询结果来计算值

### 二元操作符

#### 算术操作符

- `+` (addition)
- `-` (subtraction)
- `*` (multiplication)
- `/` (division)
- `%` (modulo)
- `^` (power/exponentiation)

#### 逻辑和集合运算符

- `and` (intersection)
- `or` (union)
- `unless` (complement)

#### 比较运算符

- `==` (equality)
- `!=` (inequality)
- `>` (greater than)
- `>=` (greater than or equal to)
- `<` (less than)
- `<=` (less than or equal to)

#### 关键字 on 和 ignoring

### 注释

使用 `#` 注释

## 二. Log queries

```
        _  optional log pipeline   _
          /       \
        filter operator 
         |=    \
         !=               |  line filter
         |~     |  expression
         !~    /
 
 { stream selector }             =    \
            !=     |
            =~      \  label filter
            !~      /  expression
            >   >=    |
            <   <=   /
            
            parser expression
            line format expressin 
            label format expression
 
```

### 日志流选择器(Log stream selector)

流选择器确定要在查询结果中包含哪些日志流。日志流是日志内容的唯一来源，例如文件.

日志流选择器由一个或多个**逗号**分隔的键值对指定, 大括号(`{` and `}`)分隔流选择器。

支持以下标签匹配运算符:

- `=`: exactly equal
- `!=`: not equal
- `=~`: regex matches
- `!~`: regex does not match

### 日志管道(Log pipeline)

日志管道可以附加到日志流选择器以进一步处理和过滤日志流。它是由一组表达式组成的。对于每个日志行，每个表达式按从左到右的顺序执行。如果表达式过滤掉一条日志行，则管道将停止处理当前日志行，并开始处理下一条日志行。

日志管道表达式可分为三类:

- 过滤表达式: [行过滤](#行过滤(Line filter expression))和[标签过滤](#标签过滤(Label filter expressions))
- 解析表达式
- 格式化表达式: [line format expressions](##) and [label format expressions](##)

#### 行过滤(Line filter expression)

行过滤表达式支持以下匹配运算符:

- `|=`: Log line contains string
- `!=`: Log line does not contain string
- `|~`: Log line contains a match to the regular expression
- `!~`: Log line does not contain a match to the regular expression

#### 标签过滤(Label filter expressions)

标签过滤器表达式允许使用原始和提取的标签过滤日志行,它可以包含多个谓词.

谓词包含一个标签标识符、一个操作和一个要进行比较的标签值。

我们支持从查询输入自动推断的多个值类型

- **String**是用双引号或反引号
- **[Duration](https://golang.org/pkg/time/#ParseDuration)** 有效的时间单位: “ns”, “us” (or “µs”), “ms”, “s”, “m”, “h”.
- **Number**
- **Bytes**有效的字节单位: “b”, “kib”, “kb”, “mib”, “mb”, “gib”, “gb”, “tib”, “tb”, “pib”, “pb”, “eib”, “eb”.

**String**类型与Prometheus的标签选择器一致, 可以使用相同的操作(`=`,`!=`,`=~`,`!~`)

> The string type is the only one that can filter out a log line with a label `__error__`.

使用 **Duration**，**Number** 和 **Bytes** 将在比较之前转换标签值，并支持以下比较器:

- `==` or `=` for equality.
- `!=` for inequality.
- `>` and `>=` for greater than and greater than or equal.
- `<` and `<=` for lesser than and lesser than or equal.

#### 解析器

解析器表达式可以从日志内容中解析和提取标签。然后可以使用提取的标签来使用标签筛选器表达式进，或者用于度量聚合。

Loki 支持 [JSON](https://grafana.com/docs/loki/latest/logql/log_queries/#json), [logfmt](https://grafana.com/docs/loki/latest/logql/log_queries/#logfmt), [pattern](https://grafana.com/docs/loki/latest/logql/log_queries/#pattern), [regexp](https://grafana.com/docs/loki/latest/logql/log_queries/#regular-expression) and [unpack](https://grafana.com/docs/loki/latest/logql/log_queries/#unpack) parsers.

##### JSON

JSON解析器支持两种模式

1. 无参数

如果日志行是有效的 json 文档，那么向管道添加` | json `将提取所有 json 属性作为标签

> NOTE: 数组将被忽略

2. 有参数

如果日志行是有效的 json 文档，那么向管道添加` | json label="expression1", another="expression2" `将提取指 json 属性作为标签.

##### logfmt

可以使用`| logfmt` 添加 logfmt 解析器，并从 logfmt 格式化的日志行中提取所有键和值。

##### Pattern

模式分析器通过定义模式表达式(`| pattern”< pattern-expression >”`) ，允许从日志行显式提取字段。表达式匹配日志行的结构。

> 考虑该NGINX的日志行
>
> ```log
> 0.191.12.2 - - [10/Jun/2021:09:14:29 +0000] "GET /api/plugins/versioncheck HTTP/1.1" 200 2 "-" "Go-http-client/2.0" "13.76.247.102, 34.120.177.193" "TLSv1.2" "US" ""
> ```
>
> `<ip> - - <_> "<method> <uri> <_>" <status> <size> <_> "<agent>" <_>`
>
> 上面模式表达式将提取这些字段：
>
> ```kv
> "ip" => "0.191.12.2"
> "method" => "GET"
> "uri" => "/api/plugins/versioncheck"
> "status" => "200"
> "size" => "2"
> "agent" => "Go-http-client/2.0"
> ```

模式表达式由捕获和文本组成。

捕获是由 `<` 和 `>` 字符分隔的字段名。一位匿名的捕获显示为`<_>`。

##### Regular expression

与 logfmt 和 json (隐式地提取所有值并且不带参数)不同，regexp 解析器采用单个参数 `| regexp“ < re >”`

##### unpack

解析器解析 JSON 日志行，解压打包阶段中的所有嵌入标签。还将使用一个特殊属性 **`_entry`**来替换原始日志行。

#### 行格式表达式(Line format expression)

行格式表达式可以使用 [text/template](https://golang.org/pkg/text/template/)格式重写日志行内容, 它只接受一个字符串参数`| line_format "{{.label_name}}"`,所有标签都是注入到模板中的变量，可以使用{{ . label _ name }}符号。

#### 标签格式表达式(Labels format expression)

`| label _ format` 表达式可以重命名、修改或添加标签。它接受一个逗号分隔的等式操作列表作为参数，以便一次执行多个操作。

当两端都是标签标识符(例如 dst = src)时，操作将把 src 标签重命名为 dst。

左边也可以是模板字符串(双引号或反勾号) ，例如 `dst = “{{.status}} {{.query}}”`，在这种情况下，dst 标签值被文本/模板计算的结果替换。这是与` | line _ format `表达式相同的模板引擎，这意味着标签可以作为变量使用，您可以使用相同的函数列表。

在这两种情况下，如果目标标签不存在，则创建一个新的目标标签。

重命名表单 dst = src 将在重新映射到 dst 标签后删除 src 标签。但是，模板将保留引用的标签，例如 `dst="{{.src}}"`,结果在 dst 和 src 具有相同的值

## 三. Metric queries

## 四. Template function

## 五. Matching IP addresses

## 六. Query Example
