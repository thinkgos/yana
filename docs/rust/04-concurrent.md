# 无畏并发

- `Concurrent`: 程序的不同部分之间独立的运行
- `Parallel`: 程序的不同部分同时运行



## `Sync`和`Send` trait

Rust中`std::marker::Sync`和`std::marker::Send`并发概念

- `Send`: 允许线程间***转移所有权***, `Rc<T>`没有实现`Send`,它只用于单线程的情景.
  - 任何完全由`Send`类型组成的类型也被标记为`Send`
  - 除了原始指针之外,几乎所有的基础类型都是实现了`Send`
- `Sync`: 允许从***多线程访问***.
  - 实现了`Sync`的类型可以安全的被多个线程引用
  - 如果`T`是`Sync`,那`&T`就是`Send`, 引用可以被安全的送往另一个线程
  - 基本类型都是`Sync`.
    - 但 `Rc<T>`不是`Sync`
    - `RefCell<T>`和`Cell<T>`家族也不是`Sync`的
    - 而`Mutex<T>`是`Sync`的
- 手动来实现`Send`和`Sync`是很难保证安全的,需要很谨慎的使用`unsafe`代码.