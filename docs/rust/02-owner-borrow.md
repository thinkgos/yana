# 所有权机制-借用规则

## Copy语义和Move语义

是否实现 `Copy Trait` 区分 Copy语义和Move语义

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

### Struct, Enum

#### 成员均实现Copy trait

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

#### 显式实现Copy trait

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

#### 成员含有未实现Copy trait

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

### Tuple, Option, Array

***语言默认的,成员实现则其实现Copy  trait***

#### Tuple

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

#### Arrary

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

## 借用规则

- 借⽤的⽣命周期不能⻓于出借⽅.         --> 防⽌出现悬垂指针.
- 可变借⽤不能有别名.                           --> 独占，可变借⽤不能共享, 只能独占, 只能有⼀个.
- 不可变借⽤可以多个共享.                    --> 共享不可变
- 不可变借用和可变借用不可同时存在(作用域内).

## 解引用操作会获取所有权