# 类型系统

## 1. 概述

- 类型大小, 类型在内存中对⻬、布局
- 类型推导
- 泛型
- Trait
- 类型转换

Rust是一⻔**显式静态强类型的类型安全语言**

- 显式: 是因为它的类型推导在某些时候需要显示指定
- 静态: 表明它在编译期进行类型检查
- 强类型: 表明它不允许类型自动隐式转换,不同类型无法进行计算
- 类型安全: 表明它保证运行时的内存安全

## 2 类型大小

### 2.1 可确定大小类型

``` rust
use std::mem;

fn main() {
    println!("{}", mem::size_of::<bool>());
    println!("{}", mem::size_of::<u8>());
    println!("{}", mem::size_of::<i8>());
    println!("{}", mem::size_of::<u16>());
    println!("{}", mem::size_of::<i16>());
    println!("{}", mem::size_of::<u32>());
    println!("{}", mem::size_of::<i32>());
    println!("{}", mem::size_of::<f32>());
    println!("{}", mem::size_of::<f64>());
    println!("{}", mem::size_of::<char>());
    println!("{}", mem::size_of::<()>());
}
```

### 2.2 动态大小类型

```rust
fn main() {
    let str = "hello world";
    let prt = str.as_ptr();
    let len = str.len();

    println!("{:p}", prt);
    println!("{:?}", len);
}

```

### 2.3 零值类型

零值类型: 类型的特别是可以提高性能或实现某些`trait`而不关心其数据

```rust
use std::mem;

// 零大小类型, 不分配内存空间.
enum Void {}  // 空枚举
struct Foo;   // 单元结构体
struct Bar {
    foo: Foo,
    qux: (), 		// 单元类型
    bax: [u8; 0],   // 空数组
}

fn main() {
    println!("{}", mem::size_of::<()>());
    println!("{}", mem::size_of::<Void>());
    println!("{}", mem::size_of::<Foo>());
    println!("{}", mem::size_of::<Bar>());
    println!("{}", mem::size_of::<[(); 10]>());
}

```

## 3. 类型推导

### 3.1 自动推导

```rust
// Rust大部份情况下可以推导类型
fn main() {
    let a = 1; // 没有标注类型. 
    let b = 2; // 没有标注类型.
    sum(a, b); // Rust 自动推导了a和b的类型.
    let elem = 5u8;
    let mut vec = Vec::new();
    vec.push(elem);
}

fn sum(a: u32, b: i32) -> u32 {
    a + (b as u32)
}
```

### 3.2 手动标注

```rust
// 引入 turbofish 操作符 ::<>
fn main() {
    let x = "1";
    println!("{:?}", x.parse::<u32>().unwrap());
}

```

## 4. 泛型

单态化 零成本抽象的一种实现

## 5. Trait 

Rust的`trait`提供了零成本抽象能力.

## 6. 类型转换

无歧义完全限定语法

```rust
trait A {
    fn test(&self, i: i32) {
        println!("from trait A: {:?}", i)
    }
}

trait B {
    fn test(&self, i: i32) {
        println!("from trait B: {:?}", i)
    }
}

struct S(i32);

impl A for S {}
impl B for S {}

fn main() {
    let s = S(1);
    A::test(&s, 2);
    <S as A>::test(&s, 2);
    B::test(&s, 2);
    <S as B>::test(&s, 2);
}

```

