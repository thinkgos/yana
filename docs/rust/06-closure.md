# closure闭包

## 1. 闭包的定义

闭包是将函数, 或者说代码和其环境一起存储的一种数据结构. 闭包引用的上下文中的自由变量, 会被捕获到闭包的结构中, 成为闭包类型的一部分.

## 2. 闭包的本质

在官方的 Rust reference 中, 有这样的[定义](https://doc.rust-lang.org/reference/types/closure.html)

> A closure expression produces a closure value with a unique, anonymous type that cannot be written out. A closure type is approximately equivalent to a struct which contains the captured variables.

闭包的大小跟参数、局部变量都无关, 只跟捕获的变量有关.

## 3. Rust的闭包类型

### 3.1 [FnOnce](https://doc.rust-lang.org/std/ops/trait.FnOnce.html) 



```rust
pub trait FnOnce<Args> {
    type Output;
    extern "rust-call" fn call_once(self, args: Args) -> Self::Output;
}
```

> `FnOnce` 有一个关联类型 `Output`, 显然, 它是闭包返回值的类型；还有一个方法 `call_once`, 要注意的是 `call_once` 第一个参数是 `self`, 它会转移 `self` 的所有权到 `call_once` 函数中
>
> 这也是为什么 `FnOnce` 被称作 `Once` ：**它只能被调用一次**. 再次调用, 编译器就会报变量已经被 `move`这样的常见所有权错误了. 

### 3.2 [FnMut](https://doc.rust-lang.org/std/ops/trait.FnMut.html)

```rust
pub trait FnMut<Args>: FnOnce<Args> {
    extern "rust-call" fn call_mut(
        &mut self, 
        args: Args
    ) -> Self::Output;
}
```

> `FnMut` “继承”了 `FnOnce`, 或者说 `FnOnce` 是 `FnMut` 的 `super trait`. 
>
> 所以 `FnMut` 也拥有 `Output` 这个关联类型和 `call_once` 这个方法. 此外, 它还有一个 `call_mut()` 方法. 
>
> 注意 `call_mut()` 传入 `&mut self`, 它不移动 `self`, 所以` FnMut` 可以被多次调用. 

### 3.3 [Fn](https://doc.rust-lang.org/std/ops/trait.Fn.html)

```rust
pub trait Fn<Args>: FnMut<Args> {
    extern "rust-call" fn call(&self, args: Args) -> Self::Output;
}
```

> `Fn` “继承”了 `FnMut`, 或者说 `FnMut` 是 `Fn` 的 `super trait`. 这也就意味着任何需要 `FnOnce` 或者 `FnMut` 的场合, 都可以传入满足 `Fn` 的闭包

### 3.4 特殊的闭包

闭包还有一种并不少见, 但可能不太容易理解的用法：`为它实现某个 trait`, 使其也能表现出其他行为, 而不仅仅是作为函数被调用. 比如说有些接口既可以传入一个**结构体**, 又可以传入一个**函数**或者**闭包**.

我们看一个 [tonic](https://github.com/hyperium/tonic)（Rust 下的 gRPC 库）的[例子](https://docs.rs/tonic/0.5.2/src/tonic/service/interceptor.rs.html#41-53): 

```rust
pub trait Interceptor {
    /// Intercept a request before it is sent, optionally cancelling it.
    fn call(&mut self, request: crate::Request<()>) -> Result<crate::Request<()>, Status>;
}

// 为符合接口的闭包实现相应的 trait
impl<F> Interceptor for F
where
    F: FnMut(crate::Request<()>) -> Result<crate::Request<()>, Status>,
{
    fn call(&mut self, request: crate::Request<()>) -> Result<crate::Request<()>, Status> {
        self(request)
    }
}
```

> 在这个例子里, `Interceptor` 有一个 `call` 方法, 它可以让 gRPC Request 被发送出去之前被修改, 一般是添加各种头, 比如 `Authorization` 头. 
>
> 
>
> 我们可以创建一个结构体, 为它实现 `Interceptor`, 不过大部分时候 `Interceptor` 可以直接通过一个闭包函数完成. 
>
> 为了让传入的闭包也能通过 `Interceptor::call()` 来统一调用, 可以为**符合某个接口的闭包**实现 `Interceptor trait`. 掌握了这种用法, 我们就可以通过某些 `trait` 把特定的结构体和闭包统一起来调用.

## 4. 总结

`Rust` 闭包的效率非常高. 首先闭包捕获的变量, 都储存在栈上, 没有堆内存分配. 其次因为闭包在创建时会隐式地创建自己的类型, 每个闭包都是一个新的类型. 通过闭包自己唯一的类型, `Rust` 不需要额外的函数指针来运行闭包, 所以闭包的调用效率和函数调用几乎一致. 

![image-20221105162134886](http://imgur.thinkgos.cn/imgur/202211051621413.png)
