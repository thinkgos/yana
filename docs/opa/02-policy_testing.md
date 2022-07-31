# Policy Testing

`OPA`为您提供一种高级声明语言（[Rego](https://www.openpolicyagent.org/docs/latest/policy-language)）, 以编写系统中的重要需求的细粒度策略。

为了帮助您验证您的策略的正确性, `OPA`还为您提供了一个框架, 您可以用来编写策略测试。通过编写策略的测试, 您可以加快新规则的开发过程, 但需要优化时可减少修改规则所需的时间

- [example](https://github.com/thinkgos/open-policy-agent-rego-example)

## Getting Started

让我们使用一个例子来开始。下面的文件实现了一个简单的策略, 允许创建新用户和用户访问自己的简介。

```
package authz

allow {
    input.path == ["users"]
    input.method == "POST"
}

allow {
    some profile_id
    input.path = ["users", profile_id]
    input.method == "GET"
    profile_id == input.user_id
}
```

要测试此策略, 我们将创建一个包含测试用例的单独的`rego`文件。

```
package authz

test_post_allowed {
    allow with input as {"path": ["users"], "method": "POST"}
}

test_get_anonymous_denied {
    not allow with input as {"path": ["users"], "method": "GET"}
}

test_get_user_allowed {
    allow with input as {"path": ["users", "bob"], "method": "GET", "user_id": "bob"}
}

test_get_another_user_denied {
    not allow with input as {"path": ["users", "bob"], "method": "GET", "user_id": "alice"}
}
```

这两个文件都保存在同一目录中。

```shell
$ ls
example.rego      example_test.rego
```

要运行测试策略, 请在包含文件的目录中运行`OPA`测试命令。

```shell
$ opa test . -v
data.authz.test_post_allowed: PASS (1.417µs)
data.authz.test_get_anonymous_denied: PASS (426ns)
data.authz.test_get_user_allowed: PASS (367ns)
data.authz.test_get_another_user_denied: PASS (320ns)
--------------------------------------------------------------------------------
PASS: 4/4
```

`opa test`输出表示通过的所有测试。

尝试通过删除**example.rego**第一个规则来逐步运行测试.

```shell
$ opa test . -v
FAILURES
--------------------------------------------------------------------------------
data.authz.test_post_allowed: FAIL (277.306µs)

  query:1                 Enter data.authz.test_post_allowed = _
  example_test.rego:3     | Enter data.authz.test_post_allowed
  example_test.rego:4     | | Fail data.authz.allow with input as {"method": "POST", "path": ["users"]}
  query:1                 | Fail data.authz.test_post_allowed = _

SUMMARY
--------------------------------------------------------------------------------
data.authz.test_post_allowed: FAIL (277.306µs)
data.authz.test_get_anonymous_denied: PASS (124.287µs)
data.authz.test_get_user_allowed: PASS (242.2µs)
data.authz.test_get_another_user_denied: PASS (131.964µs)
--------------------------------------------------------------------------------
PASS: 3/4
FAIL: 1/4
```

## Test Format

测试表达式也是标准的`Rego`规则, 使用规则名称以`test_`为前缀。

```
package mypackage

test_some_descriptive_name {
    # test logic
}
```

## Test Discovery

`opa test`子命令运行在命令行传递的`Rego`文件中所有找到的测试用例（即, 以`test_`为前缀的规则）。如果目录作为命令行的参数, 则`opa test`将递归加载其文件内容。

## Specifying Tests to Run

`opa test`子命令支持`--run`/`-r`进一步指定正则选项以评估那些对应的测试. 选项支持 [re2 syntax](https://github.com/google/re2/wiki/Syntax)

## Test Results

如果测试规则结果为`undefined`或非`true`, 则会报告测试结果作为`FAIL`.

如果测试遇到运行时错误（例如, 除以零）, 则测试结果标记为`ERROR`。

如果测试用例以`todo_`为前缀则`SKIPPED`。

否则, 测试结果标记为`PASS`

```
package example

# This test will pass.
test_ok {
    true
}

# This test will fail.
test_failure {
    1 == 2
}

# This test will error.
test_error {
    1 / 0
}

# This test will be skipped.
todo_test_missing_implementation {
    allow with data.roles as ["not", "implemented"]
}
```

默认情况下, `opa test`报告所有测试执行的测试数量并显示失败或错误。

```shell
$  opa test example.rego pass_fail_error_test.rego 
data.example.test_failure: FAIL (253ns)
data.example.test_error: ERROR (289ns)
  pass_fail_error_test.rego:15: eval_builtin_error: div: divide by zero
--------------------------------------------------------------------------------
PASS: 1/3
FAIL: 1/3
ERROR: 1/3
```

默认情况下, `OPA`以人类可读格式打印测试结果。如果您需要以编程方式使用测试结果, 请使用`JSON`输出格式。

```shell
$ opa test --format=json example.rego pass_fail_error_test.rego 

[
  {
    "location": {
      "file": "pass_fail_error_test.rego",
      "row": 4,
      "col": 1
    },
    "package": "data.example",
    "name": "test_ok",
    "duration": 618515
  },
  {
    "location": {
      "file": "pass_fail_error_test.rego",
      "row": 9,
      "col": 1
    },
    "package": "data.example",
    "name": "test_failure",
    "fail": true,
    "duration": 322177
  },
  {
    "location": {
      "file": "pass_fail_error_test.rego",
      "row": 14,
      "col": 1
    },
    "package": "data.example",
    "name": "test_error",
    "error": {
      "code": "eval_internal_error",
      "message": "div: divide by zero",
      "location": {
        "file": "pass_fail_error_test.rego",
        "row": 15,
        "col": 5
      }
    },
    "duration": 345148
  }
]
```

## Data Mocking

`OPA`的`with`关键字可用于替换数据文档。基础和虚拟文档都支持替换。下面是一个依赖于数据文档的简单策略。

**authz.rego**:

```
package authz

allow {
    x := data.policies[_]
    x.name == "test_policy"
    matches_role(input.role)
}

matches_role(my_role) {
    data.roles[my_role][_] == input.user
}
```

下面是测试上述策略的`Rego`文件

**authz_test.rego**:

```
package authz

policies = [{"name": "test_policy"}]
roles = {"admin": ["alice"]}

test_allow_with_data {
    allow with input as {"user": "alice", "role": "admin"}  with data.policies as policies  with data.roles as roles
}
```

运行策略测试, 请运行`opa test`命令

```shell
$ opa test -v authz.rego authz_test.rego
data.authz.test_allow_with_data: PASS (697ns)
--------------------------------------------------------------------------------
PASS: 1/1
```

下面是替换没有参数的规则的示例

**authz_no_argements.rego**:

```
package authz_no_arguments

allow1 {
    allow2
}

allow2 {
    2 == 1
}
```

**authz_no_argements_test.rego**:

```
package authz_no_arguments

test_replace_rule {
    allow1 with allow2 as true
}
```

结果: 

```shell
$ opa test -v authz_no_arguments.rego authz_no_arguments_test.rego
data.authz.test_replace_rule: PASS (328ns)
--------------------------------------------------------------------------------
PASS: 1/1
```

函数不能使用`with`关键字替换。例如, 在下面的策略中, `cannot_replace`函数无法被替换。

**authz_function_cannot_repleace.rego**

```
package authz_function_cannot_repleace

invalid_replace {
    cannot_replace(input.label)
}

cannot_replace(label) {
    label == "test_label"
}
```

结果:

```shell
$ opa test -v authz_function_cannot_repleace.rego authz_function_cannot_repleace_test.rego 
1 error occurred: authz_function_cannot_repleace_test.rego:4: rego_compile_error: with keyword cannot replace functions

```

## Coverage

除了报告测试通过,失败和错误结果, `opa test`还可以报告被测策略的覆盖.

覆盖报告包括评估的所有行, 并在命令行上提供的`rego`文件中进行评估。当没有覆盖那一行时, 它表示两件事之一：

- 如果这行指的是规则的头部, 则规则体永远不会是真的。
- 如果这行指的是规则中的表达式, 则不评估表达式。

如果我们在原始`example.rego`文件上运行覆盖报告, `examply_test.rego`没`test_get_user_allowed`这条规则时进行运行, 报告将指示未涵盖第8行。

```shell
$ opa test --coverage --format=json example.rego example_test.rego
{
  "files": {
    "example.rego": {
      "covered": [
        {
          "start": {
            "row": 3
          },
          "end": {
            "row": 5
          }
        },
        {
          "start": {
            "row": 9
          },
          "end": {
            "row": 11
          }
        }
      ],
      "not_covered": [
        {
          "start": {
            "row": 8
          },
          "end": {
            "row": 8
          }
        }
      ]
    },
    "example_test.rego": {
      "covered": [
        {
          "start": {
            "row": 3
          },
          "end": {
            "row": 4
          }
        },
        {
          "start": {
            "row": 7
          },
          "end": {
            "row": 8
          }
        },
        {
          "start": {
            "row": 11
          },
          "end": {
            "row": 12
          }
        }
      ]
    }
  }
}
```