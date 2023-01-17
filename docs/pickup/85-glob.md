# glob 匹配规则

- [glob](https://en.wikipedia.org/wiki/Glob_(programming)#cite_note-5) wiki

## 1. 语法

最常用的通配符是`*`, `?`,和`[...]`

| Wildcard |        Description         |    Example    |                     Matches                     |          Does not match           |
| :------: | :------------------------: | :-----------: | :---------------------------------------------: | :-------------------------------: |
|   `*`    | 匹配任意数量的字符, 包括空 |    `Law*`     |           `Law`, `Laws`, or `Lawyer`            |     `GrokLaw`, `La`, or `aw`      |
|          |                            |    `*Law*`    |         `Law`, `GrokLaw`, or `Lawyer`.          |           `La`, or `aw`           |
|   `?`    |        匹配单个字符        |     `?at`     |          `Cat`, `cat`, `Bat` or `bat`           |               `at`                |
| `[abc]`  |      匹配括号内的字符      |   `[CB]at`    |                 `Cat` or `Bat`                  |      `cat`, `bat` or `CBat`       |
| `[a-z]`  |   匹配括号内给的字符范围   | `Letter[0-9]` | `Letter0`, `Letter1`, `Letter2` up to `Letter9` | `Letters`, `Letter` or `Letter10` |

一般情况下, 路径分隔符(Linux/Unix, MacOS上的`/`或Windows的`\`)是从不匹配的,但是一些shell,比如Bash是允许用户规避此问题. 

**Unix-like**

在 [Unix-like](https://en.wikipedia.org/wiki/Unix-like) 系统, 在`[...]`上有两个附加含义.

| Wildcard |        Description         |    Example     |                           Matches                            |                Does not match                 |
| :------: | :------------------------: | :------------: | :----------------------------------------------------------: | :-------------------------------------------: |
| `[!abc]` |    匹配不在括号内的字符    |    `[!C]at`    |                    `Bat`, `bat`, or `cat`                    |                     `Cat`                     |
| `[!a-z]` | 匹配不在括号内给的字符范围 | `Letter[!3-5]` | `Letter1`, `Letter2`, `Letter6` up to `Letter9` and `Letterx` etc. | `Letter3`, `Letter4`, `Letter5` or `Letterxx` |

`Bash`支持以下扩展:

- `**`: 递归匹配