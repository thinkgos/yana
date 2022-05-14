# regexp正则

## 一. 基本正则表达式BRE集合

- 匹配字符
- 匹配次数
- 位置锚定

| 符号     | 作用                                                         |
| -------- | ------------------------------------------------------------ |
| `^`      | 用于模式的最左侧,如`^abc`, 匹配以`abc`单词开头的行           |
| `$`      | 用于模式的最右侧, 如`abc$`,匹配以`abc`单司结尾的行           |
| `^$`     | 组合符, 表示空行                                             |
| `.`      | 匹配任意且有且只有一个字符. 不能匹配空行                     |
| `\`      | 转义字符, 让特殊含义的字符,转义为原始字符.例如`\.`表示小数点 |
| `*`      | 匹配前一个字符零次或多次以上                                 |
| `.*`     | 组合符,匹配所有内容                                          |
| `^.*`    | 组合符,匹配任意多个字符开头的内容                            |
| `.*$`    | 组合符,匹配任意多个字符结尾的内容                            |
| `[abc]`  | 匹配`[]`集合内的任意一个字符                                 |
| `[^abc]` | 匹配除了^后面的任意字符.                                     |

## 二. 扩展正则表达式ERE集合

| 字符     | 作用                                          |
| -------- | --------------------------------------------- |
| `+`      | 匹配前一个字符一次或多次                      |
| `?`      | 匹配前一个字符零次或一次                      |
| `|`      | 表示或者,同时过滤多个字符串                   |
| `()`     | 子表达式, 分组过滤,被括起来的肉容表示一个整体 |
| `a{n,m}` | 匹配前一个字符最少n次,最多m次                 |
| `a{n,}`  | 匹配前一个字符最少n次                         |
| `a{n}`   | 匹配前一个字符正好n次                         |
| `a{,m}`  | 匹配前一个字符最多m次                         |

## 三. 匹配速查表

| \b   | 匹配一个连字符. <br />匹配的是一个这样的位置,这个位置位于一个能够用来构成单词的字符(与`\w`相匹配的字符)  <br />和一个不能用来构成单词的字符(与`^\w`相匹配的非字符)之间 |
| ---- | :----------------------------------------------------------- |
| \B   | 不匹配一个前后都不是单词边界的连词符                         |
| \d   | 等价于`[0-9]`                                                |
| \D   | 等价于`[^0-9]`                                               |
| \w   | 等价于`[a-zA-Z0-9_]`                                         |
| \W   | 等价于`[^a-zA-Z0-9_]`                                        |
| \s   | 等价于`[\f\n\r\t\v]`                                         |
| \S   | 等价于`[^\f\n\r\t\v]`                                        |

## 四. 元字符

使用元字符,需转义

| `\.`            | 点                                |
| --------------- | :-------------------------------- |
| `\[`   和  `\]` |                                   |
| `\{`   和  `\}` |                                   |
| `[\b]`          | 回退(并删除)一个字符(Backspace键) |
| `\f`            | 换页符                            |
| `\n`            | 换行符                            |
| `\r`            | 回车符                            |
| `\t`            | 制表符(Tab键)                     |
| `\v`            | 垂直制表符                        |
| `\^`            | 非匹配                            |
| `\+`            | 加号                              |



| 贪婪型元字符 | 懒惰型元字符 |
| ------------ | ------------ |
| `*`          | `*?`         |
| `+`          | `+?`         |
| `{n,}`       | `{n,}?`      |

## 五. 其它

- 回溯引用,`\n` 代表模式里的第n个子表达式(用`()`括起来的子表达式).
- 前后查找
  - 向前查找: 采用以`?=`的子表达式,需要区配的文本跟在`?=`后面.
  - 向前查找: 采用以`?<=`的子表达式,需要区配的文本跟在`?<=`后面.

| (?=)  | 正向前查找 |
| ----- | ---------- |
| (?!)  | 负向前查找 |
| (?<=) | 正向后查找 |
| (?<!) | 负向后查找 |

- 嵌入条件 see 应知应会正则表达式