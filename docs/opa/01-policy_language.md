
# Policy Language

## What is Rego?

`Rego`的灵感来自 [Datalog](https://en.wikipedia.org/wiki/Datalog) ，这是一个数十年的旧查询语言。`Rego`扩展了Datalog以支持诸如`JSON`之类的结构化文档模型。

`Rego`查询是对存储在OPA中的数据进行断言. 这些查询可用于定义枚举违反系统预期状态的数据实例的策略

## Why use Rego?

使用`Rego`定义的策略非常易于阅读和书写

`Rego`侧重于对引用嵌套文档强大的支持并确保查询是正确的和清晰的。

`Rego`是声明性的，因此策略作者可以专注于应返回的查询，而不是如何执行查询。这些查询比命令语言更简单，更简洁。

与支持声明性查询语言的其他应用程序一样，OPA能够优化查询以提高性能。

## The Basices

本节介绍了`Rego`的主要方面.

最简单的规则是单个表达式

使用标量([Scalar Value](https://www.openpolicyagent.org/docs/latest/policy-language/#scalar-values))定义规则：

> ```
> pi := 3.14159
> ```

规则定义文档的内容。我们可以查询`pi`文档的内容

> ```
> pi
> ```
>
> ---
>
> ```
> 3.14159
> ```

使用复合值([Composite Values](https://www.openpolicyagent.org/docs/latest/policy-language/#composite-values))定义规则：

```
rect := {"width": 2, "height": 4}
```

查询`rect`结构

> ```
> rect
> ```
>
> ---
>
> ```
> {
> "height": 4,
> "width": 2
> }
> ```

您可以比较两个标量或复合值，此时,您正在检查两个值是否具有相同的JSON值.

> ```
> rect == {"height": 4, "width": 2}
> ```
>
> ---
>
> ```
> true
> ```

您可以使用规则定义一个新概念。例如，如果表达式为`true`，则`v`为`true`.

> ```
> v { "hello" == "world" }
> ```

当我们评估`v`，结果是`undefined`，因为规则的正文永远不会评估为`true`。因此，规则生成的文档是未定义的。

> ```
> v
> ```
>
> ---
>
> ```
> undefined
> ```

引用未定义值的表达式也是未定义的。这包括诸如`!=`的比较。

> ```
> v == true
> ```
>
> ---
>
> ```
> undefined
> ```
>
> ---
>
> ```
> v != true
> ```
>
> ---
>
> ```
> undefined
> ```

我们也可以使用变量([Variables](https://www.openpolicyagent.org/docs/latest/policy-language/#variables))定义规则：

> ```
> t { x := 42; y := 41; x > y }
> ```

正式语法使用分号字符`;`分开表达式。规则体可以将表达式用新行分开并省略分号:

>```
>t2 {
>	x := 42
>	y := 41
>	x > y
>}
>```

在评估规则体时，OPA 会搜索使所有表达式都为真的变量绑定。可能有多组绑定使规则主体为真. 

可以将规则体直观地理解为：

> expression-1 AND expression-2 AND ... AND expression-N

规则本身可以直观地理解为：

> rule-name IS value IF body

如果`value`省略，它默认为`true`。

当我们查询`t`的值时，我们看到明显的结果：`true`

规则中表达的顺序并不会影响文档的内容.

> ```
> s {
> x > y
> y = 41
> x = 42
> }
> ```

查询的结果依然一样: `true`

但是有一个例外：如果使用赋值`:=`编译器将检查您分配的变量是否尚未使用。

> ```
> z {
>  y := 41
>  y := 42
>  43 > y
> }
> ```
>
> ---
>
> `1 error occurred: module.rego:5: rego_compile_error: var y assigned above`

Rego参考资料( [References](https://www.openpolicyagent.org/docs/latest/policy-language/#references))可帮助您查阅嵌套文档(nested documents)。例如：

> ```
> sites = [{"name": "prod"}, {"name": "smoke1"}, {"name": "dev"}]
> ```
>
> ---
>
> ```
> r { sites[_].name == "prod" }
> ```
>
> ---
>
> ```
> r
> ```
>
> ---
>
> ```
> true
> ```

上面规则`r`断言,在`sites`文档中至少存在一个`name`属性值等于`prod`.

我们可以归纳上面的示例，规则可以定义了一个`set`文档而不是`boolean`文档: 

此时`q`的值是个一组名称

> ```
> q[name] { name := sites[_].name }
> ```
>
> ---
>
> ```
> [
> "dev",
> "prod",
> "smoke1"
> ]
> ```

我们可以使用`q`重写上面的`r`规则. 我们叫它新规则`p`

> ```
> p { q["prod"] }
> ```
>
> ---
>
> ```
> p
> ```
>
> ---
>
> ```
> true
> ```

如您所见，可以使用输入值查询具有参数的规则：

> ```
> q["smoke2"]
> ```
>
> ---
>
> `undefined`

本节介绍了Rego的主要方面。其余的文档更详细地浏览了语言的每个部分.

有关简明的参考，请参阅 [Policy Reference](https://www.openpolicyagent.org/docs/latest/policy-reference) 文档。

## Scalar Values

`scalar values`(标量)是`Rego`中最简单的术语。`scalar values`可以是[`string`](#Strings])，`numbers`，`booleans`或`null`。

文档可以单独定义`scalar values`。这对于定义在多个位置的常量来说是非常有用的。例如：

> ```
> greeting   := "Hello"
> max_height := 42
> pi         := 3.14159
> allowed    := true
> location   := null
> ```

这些文档像其它一样可以查询:

> ```
> [greeting, max_height, pi, allowed, location]
> ```
>
> ---
>
> ```
> [
>     "Hello",
>     42,
>     3.14159,
>     true,
>     null
> ]
> ```

## Strings

`Rego`支持两种不同类型的语法来声明`string`(字符串)。

- 由双引号`"`包围。在这种`string`中，必须转义某些字符以显示在字符串中，例如双引号本身，反斜杠等。请参阅[Policy Reference](https://www.openpolicyagent.org/docs/latest/policy-reference/#grammar)。

- 由反向点(***\`***) 包围的字符组成`string`, 声明是一个原始字符串，但原始字符串不包含反向点本身. 常用于正则表达式.

## Composite Values

`composite values`定义集合。在简单的情况下，可以将`composite values`像[Scalar Values](#Scalar Values)一样视为常量

> ```
> cube := {"width": 3, "height": 4, "depth": 5}
> ```
>
> ---
>
> ```
> cube.width
> ```
>
> ---
>
> ```
> 3
> ```

`composite values`也可以使用[Variables](#Variables)或[References](#References)定义, 例如:

> a := 42
> b := false
> c := null
> d := {"a": a, "x": [b, c]}

通过[Variables](#Variables)或[References](#References)定义`composite values`，`rule`可以通过原始数据和其他`rule`进行抽象。

### Objects

`object`是无序的键值集合。在`Rego`中，任何值类型都可以用作`object`的键。

例如，以下分配将端口号映射到IP地址列表.

> ```
> ips_by_port := {
>     80: ["1.1.1.1", "1.1.1.2"],
>     443: ["2.2.2.1"],
> }
> ```
>
> ---
>
> ```
> ips_by_port[80]
> ```
>
> ---
>
> ```
> [
>   "1.1.1.1",
>   "1.1.1.2"
> ]
> ```
>
> ---
>
> ```
> some port; ips_by_port[port][_] == "2.2.2.1"
> ```
>
> ---
>
> +------+  
> | port |  
> +------+  
> | 443  |  
> +------+  

当`rego`值转换为JSON时，非字符串的`object`键将被编码为字符串（因为`JSON`不支持非字符串对象键）

> ```
> ips_by_port
> ```
>
> ---
>
> ```
> {
>   "443": [
>     "2.2.2.1"
>   ],
>   "80": [
>     "1.1.1.1",
>     "1.1.1.2"
>   ]
> }
> ```

### Sets

除了`array`和`object`之外，Rego还支持`set`。`set`是无序的唯一值集合。就像其他`composite values`一样，可以在`scalar Values`，`variable`，`references`和其他`composite values`定义`set`。例如：

> ```
> s := {cube.width, cube.height, cube.depth}
> ```

比较`set`时，元素的顺序无关紧要：

> ```
> {1,2,3} == {3,1,2}
> ```
>
> ---
>
> ```
> true
> ```

因为`set`是无序的，所以`set`外的变量必须已确定。如果变量在`set`外没有定义，则`OPA`将报错：

> ```
> {1,2,3} == {3,x,2}
> ```
>
> ---
>
> `1 error occurred: 1:1: rego_unsafe_var_error: var x is unsafe`

因为`set`与`object`共享`Crly-Brace`语法，并且使用`{}`定义空对象，必须使用不同的语法构建空对象`set()`：

> ```
> set()
> ```
>
> ---
>
> ```
> count(set())
> ```
>
> ---
>
> ```
> 0
> ```

## Variables

`variables`是`rego`的另一种术语。它们同时出现在`rule`的头部和主体中

`variables`出现在`rule`的头部可以作为`rule`的输入和输出,.

与许多编程语言不同, 变量是输入或输出,在rego中,变量同时是输入和输出.

-  如果查询为`variables`提供值, 这个`variables`是个输入, 
-  如果查询没有为`variables`提供值，则该`variables`是输出。

举例: 

> ```
> sites := [
>     {"name": "prod"},
>     {"name": "smoke1"},
>     {"name": "dev"}
> ]
> 
> q[name] { name := sites[_].name }
> ```

这个例子中, 我们使用变量`name`(未绑定一个值)评估`q`, 结果,查询返回`name`的所有值和`q[name]`的所有值. 这始终相同，因为`q`是一个集合。

> ```
> q[name]
> ```
>
> ---
>
> +----------+----------+  
> |    x     |   q[x]   |  
> +----------+----------+  
> | "dev"    | "dev"    |  
> | "prod"   | "prod"   |  
> | "smoke1" | "smoke1" |  
> +----------+----------+  

另一方面，如果我们评估`name`的输入值，我们可以确定`q`由`q`定义的文档中是否存在名称：

> ```
> q["dev"]
> ```
>
> ---
>
> ```
> "dev"
> ```

出现在`rule`的头部的`variables`也必须出现在同一`rule`中的非否定平等表达式中。

此属性可确保如果评估`rule`并且所有表达式为某些`variables`绑定评估为`true`，则`rule`的头部中的`variables`将被定义.

## References

`references`(引用)用于访问嵌套文档。

本节中的示例使用 [Examples](https://www.openpolicyagent.org/docs/latest/policy-language/#example-data) 部分中定义的数据

最简单的`references`不包含`variables`。例如，以下引用从我们的示例数据中返回第一个站点文档中第二服务器的主机名：

> ```
> sites[0].servers[1].hostname
> ```
>
> ---
>
> ```
> "helium"
> ```

引用通常使用“点访问”风格。规范使用`.`。也可以像Python等语言使用类似于字典查找：

> ```
> sites[0]["servers"][1]["hostname"]
> ```
>
> ---
>
> ```
> "helium"
> ```

这两种形式都有效，但是点访问通常更具可读性。请注意, 必须使用括号的四种情况:

- 字符串键包含字符`[a-z]`, `[A-Z]`, `[0-9]`, 或 `_` (下划线)以外的字符

- 非字符串键，如数字，布尔值和null。

- 稍后描述的可变键

- 稍后描述的复合键

引用的前缀标识该引用的根文档。在上面的例子中，是`sites`。根文档可能是:

- 规则内的局部变量
- 同一包内的规则
- 存储在OPA中的文档
- 作为传输的一部分，临时提供给OPA的文档。
- 数组，对象或集合，比如: `[1, 2, 3][0]`
- 函数调用, 比如: `split("a.b.c", ".")[1]`
- 一个 [comprehension](https://www.openpolicyagent.org/docs/latest/policy-language/#comprehensions).

### Variable Keys

可以使用`variable`作为`references`的键. 以这种方式写入的引用从集合中的每个元素中选择一个值.

以下引用将在我们的示例数据中选择所有服务器的主机名：

> ```
> sites[i].servers[j].hostname
> ```
>
> ---
>
> +---+---+------------------------------+  
> | i | j | sites[i].servers[j].hostname |  
> +---+---+------------------------------+  
> | 0 | 0 | "hydrogen"                   |  
> | 0 | 1 | "helium"                     |  
> | 0 | 2 | "lithium"                    |  
> | 1 | 0 | "beryllium"                  |  
> | 1 | 1 | "boron"                      |  
> | 1 | 2 | "carbon"                     |  
> | 2 | 0 | "nitrogen"                   |  
> | 2 | 1 | "oxygen"                     |  
> +---+---+------------------------------+  

从概念上讲，这与下面的命令式(Python)代码相同

```python
def hostnames(sites):
    result = []
    for site in sites:
        for server in site.servers:
            result.append(server.hostname)
    return result
```

在上面的`references`中，我们使用`i`和`j`变量来迭代集合。如果`variable`在`references`外没有使用，可以使用下划线（`_`）字符替换它们。上面的参考可以重写为

> ```
> sites[_].servers[_].hostname
> ```
>
> ---
>
> +------------------------------+
> | sites[_].servers[_].hostname |
> +------------------------------+
> | "hydrogen"                   |
> | "helium"                     |
> | "lithium"                    |
> | "beryllium"                  |
> | "boron"                      |
> | "carbon"                     |
> | "nitrogen"                   |
> | "oxygen"                     |
> +------------------------------+

下划线是特殊的，因为`rule`的其他部分无法提及它. 下划线可以被认为是特殊的迭代器。

每次指定下划线时，都会实例化一个新的迭代器.

> 在引擎里，OPA将`_`字符转换为唯一的变量名称，不会与范围中的变量和规则冲突.

### Composite Keys

如果键被使用于`set`中,可以使用[Composite Values](#Composite Values)作为引用的键,  `composite keys`不可用于基础数据文档的中，它们仅适用于对虚拟文档的引用。

这对于检查在`set`中的`composite values`存在，或者在匹配某些模式匹配的集合中提取所有值的有用。例如：

> ```
> s := {[1, 2], [1, 4], [2, 6]}
> ```
>
> ---
>
> ```
> s[[1, 2]]
> ```
>
> ---
>
> ```
> [1,2]
> ```
>
> ---
>
> ```
> s[[1, x]]
> ```
>
> ---
>
> +---+-----------+  
> | x | s[[1, x]] |  
> +---+-----------+  
> | 2 | [1,2]     |  
> | 4 | [1,4]     |  
> +---+-----------+

### Multiple Expressions

规则通常以包含对文档引用的多个表达式编写的。在以下示例中，规则定义了一组`array`的`set`，其中每个数组包含应用程序名称和部署应用程序的服务器的主机名

> apps_and_hostnames[[name, hostname]] {
>     some i, j, k
>     name := apps[i].name
>     server := apps[i].servers[_]
>     sites[j].servers[k].name == server
>     hostname := sites[j].servers[k].hostname
> }

不要担心现在在此示例中了解所有内容。只有两个重要观点:

1.  在其中有几个变量似乎不止一次。当在多个位置使用变量时，OPA将仅生成规则的文档，其中变量在所有表达式中绑定到相同的值.
2. 该规则正在隐含地加入`apps`和`sites`文档。在Rego（以及基于Datalog的其他语言），加入是隐式的。

### Self-Joins

在相同的阵列上使用不同的键或对象提供等效的SQL中的自行连接。例如，以下规则定义包含部署在与`MySQL`的同一`site`上的`app`：

> ```
> same_site[apps[k].name] {
>  some i, j, k
>  apps[i].name == "mysql"
>  server := apps[i].servers[_]
>  server == sites[j].servers[_].name
>  other_server := sites[j].servers[_].name
>  server != other_server
>  other_server == apps[k].servers[_]
> }
> ```
>
> ---
>
> same_site[x]
>
> ---
>
> +-------+--------------+
> |   x   | same_site[x] |
> +-------+--------------+
> | "web" | "web"        |
> +-------+--------------+

## Comprehensions

`comprehensions(推导)`提供从子查询构建 [Composite Values](https://www.openpolicyagent.org/docs/latest/policy-language/#composite-values) 的简明方法

像Rule一样，`comprehensions`包括头部和主体。`comprehensions`的主体与`Rule`的主体完全相同的方式，即，一个或多个表达式必须是真的，以便主体是真的。当主体评估为真时，则`comprehensions`的头部被评估以产生结果的元素。

`comprehensions`能够使用主体中外部定义的变量。例如：

> ```
> region := "west"
> names := [name | sites[i].region == region; name := sites[i].name]
> ```
>
> ---
>
> +----------------------+----------+  
> |      names           |  region  |  
> +----------------------+----------+  
> | ["smoke","dev"]   |  "west" |  
> +----------------------+----------+  

上面查询中,第二个表达式包含[Array Comprehension](https://www.openpolicyagent.org/docs/latest/policy-language/#array-comprehensions),它使用了`region`变量,`region`变量将在外部主体中绑定.

`comprehensions`类似于与Python这样的其他语言中的相同构建体。例如，我们可以在`Python`中写下上述理解，如下所示：

```python
# Python equivalent of Rego comprehension shown above.
names = [site.name for site in sites if site.region == "west"]
```

通过某个键，`Comprehensions`用于对元素分组。用于`comprehensions`的常见用例是计算聚合值.(例如: 计算主机上的容器数量)

### Array Comprehensions

`Array Comprehensions(数组推导)`在子查询中构建数组. `Array Comprehensions`有下面格式:

```[ <term> | <body> ]```

举个例子,以下规则定义了一个对象，其中键是应用程序名称，值是部署应用程序的服务器的主机名。服务器的主机名称组成一个数组.

> ```python
> app_to_hostnames[app_name] = hostnames {
>  app := apps[_]
>  app_name := app.name
>  hostnames := [hostname | name := app.servers[_]
>                          s := sites[_].servers[_]
>                          s.name == name
>                          hostname := s.hostname]
> }
> ```
>
> ---
>
> ```python
> app_to_hostnames[app]
> ```
>
> ---
>
> +----------------+--------------------------------------------------------------------+  
> |    app          |                    app_to_hostnames[app]                          |  
> +---------------+----------------------------------------------------------------------+  
> | "mongodb" |     ["oxygen"]                                                                 |  
> | "mysql"       |     ["lithium","carbon"]                                                    |  
> | "web"          |    ["hydrogen","helium","beryllium","boron","nitrogen"] |  
> +------------ --+------------------------------------------------------------------------+  

### Object Comprehensions

`Object Comprehensions(对象推导)`在子查询中构建对象值. `Object Comprehensions`有下面格式:

```{ <key>: <term> | <body> }```

我们可以使用`Object Comprehensions`来将规则从上面重写, 结构是一样的:

>```
>app_to_hostnames := {app.name: hostnames |
>    app := apps[_]
>    hostnames := [hostname |
>                    name := app.servers[_]
>                    s := sites[_].servers[_]
>                    s.name == name
>                    hostname := s.hostname]
>}
>```
>
>---
>
>```
>app_to_hostnames[app]
>```
>
>---
>
>+-----------+------------------------------------------------------+  
>|    app    |                app_to_hostnames[app]                 |  
>+-----------+------------------------------------------------------+  
>| "mongodb" | ["oxygen"]                                           |  
>| "mysql"   | ["lithium","carbon"]                                 |  
>| "web"     | ["hydrogen","helium","beryllium","boron","nitrogen"] |  
>+-----------+------------------------------------------------------+  

**注意**, `Object Comprehensions`不允许具有冲突的项，类似于规则：

> ```
> {"foo": y | z := [1, 2, 3]; y := z[_] }
> ```
>
> ---
>
> `1 error occurred: "foo": eval_conflict_error: object keys must be unique`

### Set Comprehensions

`Set Comprehensions`在子查询中构建`set`.`Set Comprehensions`有下面格式:

```{ <term> | <body> }```

例如，要从`array`构造一个`set`：

> ```
> a := [1, 2, 3, 4, 3, 4, 3, 4, 5]
> b := {x | x = a[_]}
> ```
>
> ---
>
> +--------------------------+--------------+  
> |               a               |         b         |  
> +--------------------------+---------------+  
> |  [1,2,3,4,3,4,3,4,5]  |  [1,2,3,4,5]  |  
> +--------------------------+---------------+  

## Rules

`rule`定义`OPA`中虚拟文档([Virtual Documents](https://www.openpolicyagent.org/docs/latest/philosophy#how-does-opa-work) )的内容。当`OPA`评估`rule`时，`OPA`会生成由规则定义的文档的内容。

本节中的示例代码利用 [Examples](https://www.openpolicyagent.org/docs/latest/policy-language/#example-data)中定义的数据。

### Generating Sets

以下规则定义一个 `set`包含所有服务的`hostnames`.

当查询`hostnames`的内容时,我们看到和使用`sites[_].servers[_].hostname`同样的内容.

> ```
> hostnames[name] { name := sites[_].servers[_].hostname }
> ```
>
> ---
>
> hostnames[name]
>
> ---
>
> +-------------+-----------------+    
>
> |    name     | hostnames[name] |  
> +-------------+-----------------+  
> | "beryllium" | "beryllium"     |  
> | "boron"     | "boron"         |  
> | "carbon"    | "carbon"        |  
> | "helium"    | "helium"        |  
> | "hydrogen"  | "hydrogen"      |  
> | "lithium"   | "lithium"       |  
> | "nitrogen"  | "nitrogen"      |  
> | "oxygen"    | "oxygen"        |  
> +-------------+-----------------+     

此示例介绍了`Rego`的一些重要方面。

首先，`rule`定义了一个 `set`文档，其中内容由变量名`name`定义. 我们知道此规则定义了一个`set`文档，因为该头部仅包括**key**。

所有规则都有以下形式（其中**key**，**value**和**body**都是可选的）：

```<name> <key>? <value>? <body>?```

对于规则语法的更多的定义,请参看 [Policy Reference](https://www.openpolicyagent.org/docs/latest/policy-reference/#grammar)

其次,`sites[_].servers[_].hostname`从`servers`的所有对象中选择`hostname`属性, 从这个单独的片段,我们无法判断片段指的是数组还是对象.我们只知道它是值的集合.

最后, `name := sites[_].servers[_].hostname`表达式绑定了`hostname`的值到变量`name`,同时这个变量也在规则头部声明了

### Generating Objects

定义`object`的规则与定义***set*** 的规则非常相似.

以下规则定义了将`hostname`映射到`app name` 的对象。

与定义 ***set*** 的规则的主要区别在于文档的规则头部：除了声明**key**之外，还声明**value**。

结果

> ```
> apps_by_hostname[hostname] = app {
>     some i
>     server := sites[_].servers[_]
>     hostname := server.hostname
>     apps[i].servers[_] == server.name
>     app := apps[i].name
> }
> ```
>
> ---
>
> ```
> apps_by_hostname["helium"]
> ```
>
> ---
>
> ```
> "web"
> ```

### Incremental Definitions

一个`rule`可以使用相同名称定义多次, 当以这种方式定义规则时，我们将规则定义称为***Incremental Definitions***，因为每个定义都是追加的。

由***Incremental Definitions***定义规则产生的文档是每个规则产生的文件的联合, 可以直观地理解为`<rule-1> OR <rule-2> OR ... OR <rule-N>`

例如，我们可以编写一条规则，将通过我们的`servers`和`containers`数据作为`instances`：

> ```
> instances[instance] {
> server := sites[_].servers[_]
> instance := {"address": server.hostname, "name": server.name}
> }
> 
> instances[instance] {
> container := containers[_]
> instance := {"address": container.ipaddress, "name": container.name}
> }
> ```
>
> 如果规则的头部是相同的，我们可以将多个规则体链接在一起以获得相同的结果。我们不再建议使用此方式了。
>
>
> ```
> instances[instance] {
> server := sites[_].servers[_]
> instance := {"address": server.hostname, "name": server.name}
> } {
> container := containers[_]
> instance := {"address": container.ipaddress, "name": container.name}
> }
> ```
>
> 结果: 
>
> instances[x]
>
> ---
>
> +-----------------------------------------------+-----------------------------------------------+  
>
> |                       x                       |                 instances[x]                  |  
> +-----------------------------------------------+-----------------------------------------------+  
> | {"address":"10.0.0.1","name":"big_stallman"}  | {"address":"10.0.0.1","name":"big_stallman"}  |  
> | {"address":"10.0.0.2","name":"cranky_euclid"} | {"address":"10.0.0.2","name":"cranky_euclid"} |  
> | {"address":"beryllium","name":"web-1000"}     | {"address":"beryllium","name":"web-1000"}     |  
> | {"address":"boron","name":"web-1001"}         | {"address":"boron","name":"web-1001"}         |  
> | {"address":"carbon","name":"db-1000"}         | {"address":"carbon","name":"db-1000"}         |  
> | {"address":"helium","name":"web-1"}           | {"address":"helium","name":"web-1"}           |  
> | {"address":"hydrogen","name":"web-0"}         | {"address":"hydrogen","name":"web-0"}         |  
> | {"address":"lithium","name":"db-0"}           | {"address":"lithium","name":"db-0"}           |  
> | {"address":"nitrogen","name":"web-dev"}       | {"address":"nitrogen","name":"web-dev"}       |  
> | {"address":"oxygen","name":"db-dev"}          | {"address":"oxygen","name":"db-dev"}          |  
> +-----------------------------------------------+-----------------------------------------------+  

### Complete Definitions

除了部分定义***set***和***object***的规则外，Rego还支持任何类型文档的所谓***Complete Definitions***.规则通过省略头部的键来提供***Complete Definitions***。***Complete Definitions***通常用于常量：

```
pi := 3.14159
```

> Rego允许作者省略规则体。如果省略了规则体，则默认为true

具有完整定义的规则产生的文档同时只能输出一个值。如果评估为同一文档输出产生多个值，则将返回错误。

> ```
> # Define user "bob" for test input.
> user := "bob"
> 
> # Define two sets of users: power users and restricted users. Accidentally
> # include "bob" in both.
> power_users := {"alice", "bob", "fred"}
> restricted_users := {"bob", "kim"}
> 
> # Power users get 32GB memory.
> max_memory = 32 { power_users[user] }
> 
> # Restricted users get 4GB memory.
> max_memory = 4 { restricted_users[user] }
> ```
>
> ---
>
> `1 error occurred: module.rego:15: eval_conflict_error: complete rules must not produce multiple outputs`

OPA返回错误,因为规则定义发生冲突了, `max_memory`同时不能同时是32又是64.

由具有完整定义的规则生成的文档仍然可以是`undefined`：

> ```
> max_memory with user as "johnson"
> ```
>
> ---
>
> `undefined decision`

在某些情况下，不希望得到文档的未定义的结果。在这些情况下，策略可以使用[Default Keyword](https://www.openpolicyagent.org/docs/latest/policy-language/#default-keyword)关键字提供回退。

与规则中声明的变量一样，每个包最多可以使用 `:=` 运算符声明一个完整的定义名称。。编译器检查`complete definitions`的是否使用 `:=` 运算符重新声明：：

> ```
> package example
> 
> pi := 3.14
> 
> # some other rules...
> 
> pi := 3.14156   # Redeclaration error because 'pi' already declared above.
> ```
>
> ---
>
> `1 error occurred: module.rego:3: rego_type_error: rule named pi redeclared at module.rego:7`

### 个人总结

定义规则时:

- 每条规则会有返回值
  - 不声明返回值时,则只返回`true`或`false`或`undefined`.
  - 声明返回值`<value>`则返回其值.
    - 格式1: `< Name > { ... }`
    - 格式2: `< Name > = < Value > { ... }`
- 规则体内每条描述会逐条`And`运算，全部成立才会返回值. 否则为`undefined`.
- 多条**同名**规则相互之间是`Or`运算，满足其一即可.

## Negation

为了生成 [Virtual Document](https://www.openpolicyagent.org/docs/latest/philosophy#how-does-opa-work)的内容，`OPA`尝试在规则体中绑定变量，使得规则中的所有表达式的值都为`true.`

当表达式表示关于存储在 `OPA` 中的数据中应该存在哪些状态的断言时，这会生成正确的结果。 在某些情况下，您想要表示某些状态不应该存在于存储在 OPA 中的数据中。 在这些情况下，必须使用否定。

`not`否定产生相应的值有下面情况.

- `undefined` --> `true`
- `false` -->  `true`
- `everything` --> `undefined`

为了安全起见，出现在否定表达式中的变量也必须出现在规则中的另一个非否定相等表达式中。

> OPA 将对表达式重新排序，以确保在其他具有相同变量的非否定表达式之后计算否定表达式。 OPA 将拒绝包含不符合上述安全标准的否定表达式的规则。

`Negation`的最简单用法仅涉及标量值或变量，相当于对运算符进行补充：

> ```
> t {
>     greeting := "hello"
>     not greeting == "goodbye"
> }
> ```
>
> ---
>
> ```
> t
> ```
>
> ---
>
> ```
> true
> ```

如果要检查集合中是否存在某个值，则需要使用`Negation`, 

也就是说，在诸如 `p[_] == "foo"` 会产生 `p[_] != "foo"`这样的表达式中对运算符进行补充。 但是，这不等于 `not p["foo"]`。

> ```
> prod_servers[name] {
>     site := sites[_]
>     site.name == "prod"
>     name := site.servers[_].name
> }
> 
> apps_in_prod[name] {
>     app := apps[_]
>     server := app.servers[_]
>     prod_servers[server]
>     name := app.name
> }
> 
> apps_not_in_prod[name] {
>     name := apps[_].name
>     not apps_in_prod[name]
> }
> ```
>
> ---
>
> ```
> apps_not_in_prod[name]
> ```
>
> ---
>
> +-----------+------------------------+  
> |   name    | apps_not_in_prod[name] |  
> +-----------+------------------------+  
> | "mongodb" | "mongodb"              |  
> +-----------+------------------------+  

## Universal Quantification (FOR ALL)

与SQL一样，Rego没有直接的方式来表示`universal quantification (“FOR ALL”)`。然而，像SQL一样，你可以使用其他语言原语(例如，`Negation`)来表达`FOR ALL`, 例如，假设你想表达一个政策，它说(用英语)

> ```
> There must be no apps named "bitcoin-miner".
> ```

一个常见的错误是尝试用一个名为`no_bitcoin_miners`的规则来编码该策略, 比如:

> ```
> no_bitcoin_miners {
>     app := apps[_]
>     app.name != "bitcoin-miner"  # THIS IS NOT CORRECT.
> }
> ```

当您使用 some 关键字时，很明显这是不正确的，因为只要有一些不是`bitcoin-miner`的应用程序，这个规则是`true`.

> ```
> no_bitcoin_miners {
>     some i
>     app := apps[i]
>     app.name != "bitcoin-miner"
> }
> ```

您可以通过查询规则来确认:

> ```
> no_bitcoin_miners with apps as [{"name": "bitcoin-miner"}, {"name": "web"}]
> ```
>
> ---
>
> ```
> true
> ```

The reason the rule is incorrect is that variables in Rego are *existentially quantified*. This means that rule bodies and queries express FOR ANY and not FOR ALL. To express FOR ALL in Rego complement the logic in the rule body (e.g., `!=` becomes `==`) and then complement the check using negation (e.g., `no_bitcoin_miners` becomes `not any_bitcoin_miners`).

For this policy, you define a rule that finds if there exists a bitcoin-mining app (which is easy using the `some` keyword). And then you use negation to check that there is NO bitcoin-mining app. Technically, you’re using 2 negations and an existential quantifier, which is logically the same as a universal quantifier.

举个例子:

>```
>no_bitcoin_miners_using_negation {
>    not any_bitcoin_miners
>}
>
>any_bitcoin_miners {
>    some i
>    app := apps[i]
>    app.name == "bitcoin-miner"
>}
>```
>
>---
>
>```
>no_bitcoin_miners_using_negation with apps as [{"name": "web"}]
>```
>
>---
>
>```
>true
>```
>
>---
>
>```
>no_bitcoin_miners_using_negation with apps as [{"name": "bitcoin-miner"}, {"name": "web"}]
>```
>
>---
>
>`undefined decision`

或者，我们可以使用 [Comprehensions](#Comprehensions)在单个规则中实现相同类型的逻辑.

> ```
> no_bitcoin_miners_using_comprehension {
>     bitcoin_miners := {app | app := apps[_]; app.name == "bitcoin-miner"}
>     count(bitcoin_miners) == 0
> }
> ```

## Module

在 Rego 中，策略是在模块内定义的。 模块包括：

- 只有一个`Package`声明
- 零或多个`Import`语句。
- 零或多个`Rule`语句。

模块通常以Unicode文本表示，并以UTF-8编码。

### Comments

注释以`#`字符开始，并一直持续到行尾。

### Packages

**Packages**将一个或多个模块中定义的规则分组到一个特定的名称空间中。因为规则是有名称空间的，所以它们可以在项目之间安全地共享。

提供给相同包的模块不必位于相同的目录中

模块中定义的规则会自动导出。 也就是说，只要提供了适当的包，就可以在 OPA 的 [Data API](https://www.openpolicyagent.org/docs/latest/rest-api#data-api)  下查询它们。 例如，给定以下模块：

>package opa.examples
>
>pi := 3.14159

`pi`文档可以通过Data API查询: `GET https://example.com/v1/data/opa/examples/pi HTTP/1.1`

有效的包名是只包含字符串操作数的变量或引用。例如，这些都是有效的包名:

> package foo
> package foo.bar
> package foo.bar.baz
> package foo["bar.baz"].qux

这些是无效的包名:

> package 1foo        # not a variable
> package foo[1].bar  # contains non-string operand

更多详情查看[Language Grammar](https://www.openpolicyagent.org/docs/latest/policy-reference/#grammar)

### Imports

`Import`语句声明模块在包外定义的文档上的依赖项。通过导入文档，该文档导出的标识符可以在当前模块中被引用。

所有模块都包含隐式语句，用于导入`data`和`input`文档。

模块使用相同的语法来声明对 [Base and Virtual Documents](https://www.openpolicyagent.org/docs/latest/philosophy#how-does-opa-work).的依赖关系。

```
package opa.examples

import data.servers

http_servers[server] {
    server := servers[_]
    server.protocols[_] == "http"
}
```

类似地，模块可以通过指定以`input`开头的导入路径来声明对查询参数的依赖关系。

```
package opa.examples

import input.user
import input.method

# allow alice to perform any operation.
allow { user == "alice" }

# allow bob to perform read-only operations.
allow {
    user == "bob"
    method == "GET"
}

# allows users assigned a "dev" role to perform read-only operations.
allow {
    method == "GET"
    data.roles["dev"][_] == input.user
}
```

导入可以包含一个可选的as关键字来处理命名空间问题

```
package opa.examples

import data.servers as my_servers

http_servers[server] {
    server := my_servers[_]
    server.protocols[_] == "http"
}
```

## Keyword

### 1. `some`

`some`关键字允许查询显式声明本地变量,如果这些语句中包含的变量未使用 `:=` 声明，则在包含统一语句或带有变量操作数的引用的规则中使用 some 关键字。

例如，以下规则定义了一个对象，其中键是应用程序名称，并且该值是部署应用程序的服务器的主机名

| Statement                        | Example                          | Variables   |
| -------------------------------- | -------------------------------- | ----------- |
| Unification                      | `input.a = [["b", x], [y, "c"]]` | `x` and `y` |
| Reference with variable operands | `data.foo[i].bar[j]`             | `i` and `j` |

例如，下面的规则为`west`的`region`名称中包含`db`的服务器生成数组索引元组。

>```
>tuples[[i, j]] {
>    sites[i].region == "west"
>    server := sites[i].servers[j]    # note: 'server' is local because it's declared with :=
>    contains(server.name, "db")
>}
>```
>
>---
>
>```
>[
>  [
>    1,
>    2
>  ],
>  [
>    2,
>    1
>  ]
>]
>```

因为我们已经将`i`、`j`和`server`声明为本地的，所以我们可以在同一个包中引入规则而不影响上面的结果.

> Define a rule called 'i'
>
> i := 1

如果我们没有使用`some`关键字声明`i`，引入上述`i`规则将改变元组的结果，因为主体中的`i`符号将捕获全局值。试着删除一些`i` `j`，看看会发生什么.

`some`关键字不是必需的，但建议使用可以避免像上面这样的情况，即在包中引入一个规则可能会改变其他规则的行为。

用于在迭代中使用`some`关键字, 查看 [the documentation of the `in` operator](https://www.openpolicyagent.org/docs/latest/policy-language/#membership-and-iteration-in).

### 2. `with`

`with` 关键字允许以编程方式查询指定嵌套在[input Document](https://www.openpolicyagent.org/docs/latest/##the-input-document) 和 [data Document](https://www.openpolicyagent.org/docs/latest/#the-data-document)的值。

举个例子: 给定 [Imports](https://www.openpolicyagent.org/docs/latest/policy-language/#imports) 部分中的简单授权策略，我们可以编写一个查询来检查是否允许特定的请求.

>```
>allow with input as {"user": "alice", "method": "POST"}
>```
>
>---
>
>```
>true
>```
>
>
>
>```
>allow with input as {"user": "bob", "method": "GET"}
>```
>
>---
>
>```
>true
>```
>
>
>
>```
>not allow with input as {"user": "bob", "method": "DELETE"}
>```
>
>---
>
>```
>true
>```
>
>
>
>```
>allow with input as {"user": "charlie", "method": "GET"} with data.roles as {"dev": ["charlie"]}
>```
>
>---
>
>```
>true
>```
>
>
>
>```
>not allow with input as {"user": "charlie", "method": "GET"} with data.roles as {"dev": ["bob"]}
>```
>
>---
>
>```
>true
>```

`with`关键字充当表达式的修饰符.一个表达式允许有零个或多个带`with`修饰符的表达式。`with`关键字的语法如下:

`<expr> with <target-1> as <value-1> [with <target-2> as <value-2> [...]]`

`<target>`必须是对*input document*(或*the input document itself*)或*data document*中的值的引用。

`with`关键字只影响附着的表达式。后续表达式将看到未修改的值。

此规则的例外情况是，当多个`with`关键字在作用内时，如下所示:

> inner := [x, y] {
>     x := input.foo
>     y := input.bar
> }
>
> middle := [a, b] {
>     a := inner with input.foo as 100
>     b := input
> }
>
> outer := result {
>     result := middle with input as {"foo": 200, "bar": 300}
> }

### 3. `Default`

`default`关键字允许策略为文档生成定义默认值.当所有共享相同名称的规则未定义时，使用该默认值。

使用默认关键字时，规则语法约束为：

```
default <name> = <term>
```

`term`术语可以是任何标量，复合值或推导值，但它不能是变量或引用。如果该值是复合值，则它不能包含变量或引用。

当相同名称的所有规则未定义时，使用默认值. 如果没有默认定义,则将得到`undefined`.

例如:

> default allow = false
>
> allow {
>     input.user == "bob"
>     input.method == "GET"
> }
>
> allow {
>     input.user == "alice"
> }

查询`allow`文档时，返回值将是`true`或`false`。

> {
>     "user": "bob",
>     "method": "POST"
> }
>
> ---
>
> false

如果没有默认定义，则`allow`文档对于相同的输入输得到`undefined`。

### 4. `else`

`else`关键字是一个基本控制流，可让您控制规则评估顺序.

> authorize = "allow" {
>     input.user == "superuser"           # allow 'superuser' to perform any operation.
> } else = "deny" {
>     input.path[0] == "admin"            # disallow 'admin' operations...
>     input.source_network == "external"  # from external networks.
> } # ... more rules

在下面的示例中,即使输入也匹配第二规则,但在评估第一个规则通过后将立即停止.

> {
>   "path": [
>     "admin",
>     "exec_shell"
>   ],
>   "source_network": "external",
>   "user": "superuser"
> }
>
> ---
>
> "allow"

下面例子中,输入匹配第二个规则,但不匹配第一个规则,所以将持续匹配第二个.

>{
>  "path": [
>    "admin",
>    "exec_shell"
>  ],
>  "source_network": "external",
>  "user": "alice"
>}
>
>---
>
>"deny"

## Operators

### a. Membership and iteration: `in`

> 为了确保向后兼容性，新的关键字(比如`in`)会慢慢引入的. 在第一阶段，用户可以选择通过特殊导入来使用新关键字:`import future.keywords`引入所有未来关键字,而`import future.keywords.in`引入`in`关键字.
>
> 在未来的某个时刻，这些关键字将成为标准，旧引入将成为一个空操作并且可以安全的删除。这将给所有用户提供充足的时间来更新其策略，以便新关键字不会导致具有现有变量名的冲突

成员操作符`in`检测元素是否为集合(`array`,`set`或`object`)的一部份,它总是评估为`true`或`false`

> ```
> import future.keywords.in
> 
> p = [x, y, z] {
>  x := 3 in [1, 2, 3]            # array
>  y := 3 in {1, 2, 3}            # set
>  z := 3 in {"foo": 1, "bar": 3} # object
> }
> ```
>
> ---
>
> ```
> {
>   "p": [
>     true,
>     true,
>     true
>   ]
> }
> ```

当`in`操作符的右侧是`object`或`array`时,我们在左边可以提供了两个参数,第一个参数分别为key(`object`)或索引(`array`).

> ```
> import future.keywords.in
> 
> p := [ x, y ] {
>  x := "foo", "bar" in {"foo": "bar"}    # key, val with object
>  y := 2, "baz" in ["foo", "bar", "baz"] # key, val with array
> }
> ```
>
> ---
>
> ```
> {
>   "p": [
>     true,
>     true
>   ]
> }
> ```

***注意***，在列表上下文中，比如`set`或`array`定义和函数参数，使用带有两个左侧参数的形式时，需要使用括号 - 比较:

> ```
> import future.keywords.in
> 
> p := x {
>     x := { 0, 2 in [2] }  # 相当于两个表达式
> }
> q := x {
>     x := { (0, 2 in [2]) } # 一个表达式
> }
> w := x {
>     x := g((0, 2 in [2])) # 一个表达式
> }
> z := x {
>     x := f(0, 2 in [2]) # 相当于两个表达式
> }
> 
> f(x, y) = sprintf("two function arguments: %v, %v", [x, y])
> g(x) = sprintf("one function argument: %v", [x])
> ```
>
> ---
>
> ```
> {
>   "p": [
>     true,
>     0
>   ],
>   "q": [
>     true
>   ],
>   "w": "one function argument: true",
>   "z": "two function arguments: 0, true"
> }
> ```

结合 `not` ，当断言一个元素不是`array`的成员时，操作是非常方便:

> ```
> import future.keywords.in
> 
> deny {
>     not "admin" in input.user.roles
> }
> 
> test_deny {
>     deny with input.user.roles as ["operator", "user"]
> }
> ```
>
> ---
>
> ```
> {
>   "test_deny": true
> }
> ```

***注意***，使用`in`操作符的表达式总是返回`true`或`false`，即使在非集合参数中调用.

> ```
> import future.keywords.in
> 
> q = x {
>     x := 3 in "three"
> }
> ```
>
> ---
>
> ```
> {
>   "q": false
> }
> ```

使用`some`变量，它可以用于引入基于集合项的新变量.

> ```
> import future.keywords.in
> 
> p[x] {
>     some x in ["a", "r", "r", "a", "y"]
> }
> 
> q[x] {
>     some x in {"s", "e", "t"}
> }
> 
> r[x] {
>     some x in {"foo": "bar", "baz": "quz"}
> }
> ```
>
> ---
>
> ```
> {
>   "p": [
>     "a",
>     "r",
>     "y"
>   ],
>   "q": [
>     "e",
>     "s",
>     "t"
>   ],
>   "r": [
>     "bar",
>     "quz"
>   ]
> }
> ```

此外，传递第二个参数允许您处理`object`键和`array`索引.

>```
>import future.keywords.in
>
>p[x] {
>    some x, "r" in ["a", "r", "r", "a", "y"] # key variable, value constant
>}
>
>q[x] = y {
>     some x, y in ["a", "r", "r", "a", "y"] # both variables
>}
>
>r[y] = x {
>    some x, y in {"foo": "bar", "baz": "quz"}
>}
>```
>
>---
>
>```
>{
>  "p": [
>    1,
>    2
>  ],
>  "q": {
>    "0": "a",
>    "1": "r",
>    "2": "r",
>    "3": "a",
>    "4": "y"
>  },
>  "r": {
>    "bar": "foo",
>    "quz": "baz"
>  }
>}
>```

`some`的任何参数可以是一个复合的、非本地值

>```
>import future.keywords.in
>
>p[x] = y {
>    some x, {"foo": y} in [{"foo": 100}, {"bar": 200}]
>}
>p[x] = y {
>    some {"bar": x}, {"foo": y} in {{"bar": "b"}: {"foo": "f"}}
>}
>```
>
>---
>
>```
>{
>  "p": {
>    "0": 100,
>    "b": "f"
>  }
>}
>```

### b. Equality: Assignment, Comparison, and Unification:

Rego支持三种等式: assignment (`:=`), comparison (`==`), and unification `=`. 我们建议使用assignment (`:=`), comparison (`==`),它们更容易读写

#### assignment `:=`

`:=`操作符用于分配一个值给变量,变量在规则的作用域内将隐藏全局变量

> x := 100
>
> p {
>     x := 1     # 定义一个作用域变量 'x' 并分配的值 1
>     x != 100   # true 因为 'x' 对应的是作用域变量x
> }

变量在未定义前不可使用.

> p {
>     x != 100
>     x := 1     # error because x appears earlier in the query.
> }
>
> q {
>     x := 1
>     x := 2     # error because x is assigned twice.
> }

一个简单的方式可以从数组解构值分配给变量

> address := ["3 Abbey Road", "NW8 9AY", "London", "England"]
>
> in_london {
>     [_, _, city, country] := address
>     city == "London"
>     country == "England"
> }

#### Comparison `==`

比较检查规则中两个值是否相等。如果左侧或右侧包含尚未分配值的变量，则编译器抛出错误。

> p {
>  x := 100
>  x == 100   # true because x refers to the local variable
> }
>
> ---
>
> {
> "p": true
> }
>
> ---
>
> y := 100
> q {
> y == 100   # true because y refers to the global variable
> }
>
> ---
>
> {
> "q": true,
> "y": 100
> }
>
> ---
>
> r {
>  z == 100   # compiler error because z has not been assigned a value
> }
>
> ---
>
> `1 error occurred: module.rego:4: rego_unsafe_var_error: var z is unsafe`

#### Unification`=`

**Unification**(`=`)结合了**assignment**和**comparison**. Rego将为变量分配值，并使比较为`true`。**Unification**允许您询问变量的值，使表达式为`true`.

`:=`局部变量赋值，`==`比较，是`=`的语法糖，为了实现局部变量赋值和比较，和编译错误更容易区分

> Find values for x and y that make the equality true
>
> [x, "world"] = ["hello", y]
>
> ---
>
> +---------+---------+  
> |    x    |    y    |  
> +---------+---------+  
> | "hello" | "world" |  
> +---------+---------+  

**Equality**的最佳经验:

| Equality | Applicable | Compiler Errors           | Use Case        |
| -------- | ---------- | ------------------------- | --------------- |
| `:=`     | Everywhere | Var already assigned      | Assign variable |
| `==`     | Everywhere | Var not assigned          | Compare values  |
| `=`      | Everywhere | Values cannot be computed | Express query   |

最佳经验是尽量使用`:=`和`==`,附加编译器检查有助于避免在编写策略时犯错.也使阅读策略时意图更清晰.

### c. Comparison Operators

下面的比较都是支持的:

> a  ==  b  #  `a` is equal to `b`.
> a  !=  b  #  `a` is not equal to `b`.
> a  <   b  #  `a` is less than `b`.
> a  <=  b  #  `a` is less than or equal to `b`.
> a  >   b  #  `a` is greater than `b`.
> a  >=  b  #  `a` is greater than or equal to `b`.

这些操作符都不会绑定表达式中包含的变量.

## Built-in Functions

在某些情况下，规则必须执行简单的算术、聚合等。Rego提供了许多内置函数来执行这些任务.

内置组件的语法很容易识别。所有内置组件都有以下形式:

`<name>(<arg-1>, <arg-2>, ..., <arg-n>)`

内置组件通常接受一个或多个输入值并产生一个输出值。除非另有说明，所有内置参数都接受值或变量作为输出参数。

如果用一个变量作为输入调用一个内置函数，这个变量必须是安全的，也就是说，它必须在查询的其他地方赋值。

内置函数名称可以包括`.`字符。这允许它们被命名空间。如果你正在向OPA中添加自定义内置组件，请考虑为它们设置命名空间以避免命名冲突，例如:`org.example.special_func`

有关每个内置函数的详细信息，请参阅[Policy Reference](https://www.openpolicyagent.org/docs/latest/policy-reference#built-in-functions)文档.

### Errors

默认情况下，遇到运行时错误的内置函数调用将计算为undefined(通常可以被视为`false`)，并且不会停止策略计算。这确保内置函数可以用无效输入调用，而不会导致整个策略停止计算。

在大多数情况下，策略不必实现任何类型的错误处理逻辑。如果需要进行错误处理，可以对内置函数调用进行否定，以测试是否为`undefined`。例如

```
allow {
    io.jwt.verify_hs256(input.token, "secret")
    [_, payload, _] := io.jwt.decode(input.token)
    payload.role == "admin"
}

reason["invalid JWT supplied as input"] {
    not io.jwt.decode(input.token)
}
```

> {
>     "token": "a poorly formatted token"
> }
>
> ---
>
> {
>   "reason": [
>     "invalid JWT supplied as input"
>   ]
> }

如果您希望禁用此行为，而将内置函数调用错误作为异常处理，从而暂停策略评估，则可以在调用者中启用严格的内置错误.

| API                   | Flag                                    |
| --------------------- | --------------------------------------- |
| `POST v1/data` (HTTP) | `strict-builtin-errors` query parameter |
| `GET v1/data` (HTTP)  | `strict-builtin-errors` query parameter |
| `opa eval` (CLI)      | `--strict-builtin-errors`               |
| `opa run` (REPL)      | `> strict-builtin-errors`               |
| `rego` Go module      | `rego.StrictBuiltinErrors(true)` option |
| Wasm                  | Not Available                           |

