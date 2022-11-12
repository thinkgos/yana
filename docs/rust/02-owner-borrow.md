# 所有权机制

- **一个值只能被一个变量所拥有, 这个变量被称为所有者**(Each value in Rust has a variable that’s called its owner). 
- **一个值同一时刻只能有一个所有者**(There can only be one owner at a time), 也就是说不能有两个变量拥有相同的值. 所以对应刚才说的变量赋值、参数传递、函数返回等行为, 旧的所有者会把值的所有权转移给新的所有者, 以便保证单一所有者的约束. 
- **当所有者离开作用域**, 其拥有的值被丢弃(When the owner goes out of scope, the value will be dropped), 内存得到释放. 

## 1. Copy trait

- 原生类型, 包括函数、不可变引用和裸指针实现了 Copy；
- 数组和元组, 如果其内部的数据结构实现了 Copy, 那么它们也实现了 Copy；
- 可变引用没有实现 Copy；
- 非固定大小的数据结构, 没有实现 Copy

## 2. Copy语义和Move语义

是否实现 `Copy Trait` 区分 `Copy`语义和 `Move` 语义

- `Copy`语义按位复制
- `Copy`语义对应值类型
- `Move`语义对应引⽤类型.

所有权机制:  保证内存安全和性能
所有权转移.  每个值都有⼀个所有者.

```rust
fn main() {
    // Box没有实现copy trait
    let a = Box::new(5);
    let b = a;
    println!("{:?}", a); // a move to b, compile error
}
```

### 2.1 Struct, Enum

#### Struct成员均实现Copy trait, 但rust并不会默认为struct实现copy

```rust
#[derive(Debug)]
struct A {
    // 成员虽然是copy语义, 但rust并不会默认为struct实现copy
	a: i32,
	b: i32
}

// 显示指定struct实现copy trait
#[derive(Debug, Copy, Clone)]
struct B {
	a: i32,
	b: i32
}

fn main() {
    let a = A{a: 1, b: 2};
    let b = a;
    println!("{:?}", a); // a move to b, compile error
}
```

#### Struct需要显式实现Copy trait,使用Copy宏.

```rust
// 显式指定struct实现copy trait
#[derive(Debug, Copy, Clone)]
struct A {
	a: i32,
	b: i32
}

fn main() {
    let a = A{a: 1, b: 2};
    let b = a;
    println!("{:?}", a); // a copy to b
}
```

#### Struct成员含有未实现Copy trait, 那么Copy宏显式指定将导致编译失败

```rust
#[derive(Debug, Copy, Clone)]
struct A {
	a: i32,
    // 当成员有未实现Copy trait的成员,即使手动指定也会编译失败
	b: Box<i32>
}

fn  main() {
    let a = A{a: 1, b: Box::new(5)};
    let b = a;
    println!("{:?}", a); // a move to b, compile error
}
```

### 2.2 Tuple, Option, Array

***语言默认的,成员实现则其实现Copy  trait***

#### 2.2.1 Tuple

```rust
fn  main() {
    let a =  (String::from("a"), String::from("b"))
    let b = a;
    println!("{:?}", a); // a move to b, compile error
    
    let c =  (1, 2, 3)
    let d = c;
    println!("{:?}", c); // c copy to d
}
```

#### 2.2.2 Arrary

```rust
fn main() {
    let v = [1, 2, 3];
    foo(v); // copy
    assert_eq!([1, 2, 3], v)
}

fn foo(mut v: [i32; 3]) -> [i32; 3] {
    v[0] = 3;
    assert_eq!([3, 2, 3], v);
    v
}

```

```rust
fn main() {
    let mut v = [1, 2, 3];
    foo(&mut v); // borrow
    assert_eq!([3, 2, 3], v)
}

fn foo(v: &mut [i32; 3]) {
    v[0] = 3;
}

```

## 3. 借用规则

- 借⽤的⽣命周期不能⻓于出借⽅.         --> 防⽌出现悬垂指针.
- 可变借⽤不能有别名.                           --> 独占, 可变借⽤不能共享, 只能独占, 只能有⼀个.
- 不可变借⽤可以多个共享.                    --> 共享不可变
- 不可变借用和可变借用不可同时存在(作用域内).

## 4. 解引用操作会获取所有权