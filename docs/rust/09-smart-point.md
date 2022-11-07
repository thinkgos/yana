# 智能指针

**指针**是一个持有内存地址的值, 可以通过解引用来访问它指向的内存地址, 理论上可以解引用到任意数据类型；

**引用**是一个特殊的指针, 它的解引用访问是受限的, 只能解引用到它引用数据的类型, 不能用作它用. 

**智能指针**是一个表现行为很像指针的数据结构, 但除了指向数据的指针外, 它还有元数据以提供额外的处理能力.

**在 `Rust` 中, 凡是需要做资源回收的数据结构, 且实现了 `Deref`/`DerefMut`/`Drop`, 都是智能指针.**

比如用于在堆上分配内存的 `Box<T>` 和`Vec<T>`、用于引用计数的 `Rc<T>` 和 `Arc<T>` . 很多其他数据结构, 如 `PathBuf`、`Cow<'a, B>`、`MutexGuard`<T>``RwLockReadGuard<T>` 和 `RwLockWriteGuard<T>` 等也是智能指针

```rust
impl ops::Deref for String {
    type Target = str;

    fn deref(&self) -> &str {
        unsafe { str::from_utf8_unchecked(&self.vec) }
    }
}

impl ops::DerefMut for String {
    fn deref_mut(&mut self) -> &mut str {
        unsafe { str::from_utf8_unchecked_mut(&mut *self.vec) }
    }
}

unsafe impl<#[may_dangle] T, A: Allocator> Drop for Vec<T, A> {
    fn drop(&mut self) {
        unsafe {
            // use drop for [T]
            // use a raw slice to refer to the elements of the vector as weakest necessary type;
            // could avoid questions of validity in certain cases
            ptr::drop_in_place(ptr::slice_from_raw_parts_mut(self.as_mut_ptr(), self.len))
        }
        // RawVec handles deallocation
    }
}
```

## 1. Box<T>

`Box` 的定义里, 内部就是一个 [Unique](https://doc.rust-lang.org/src/core/ptr/unique.rs.html#36-44) 用于致敬 C++, `Unique` 是一个私有的数据结构, 我们不能直接使用, 它包裹了一个 `*const T` 指针, 并唯一拥有这个指针. 

```rust
pub struct Unique<T: ?Sized> {
    pointer: *const T,
    // NOTE: this marker has no consequences for variance, but is necessary
    // for dropck to understand that we logically own a `T`.
    //
    // For details, see:
    // https://github.com/rust-lang/rfcs/blob/master/text/0769-sound-generic-drop.md#phantom-data
    _marker: PhantomData<T>,
}
```

```rust
pub struct Box<T: ?Sized,A: Allocator = Global>(Unique<T>, A)

// rust编译器会自动插入 deallocate 的代码
#[stable(feature = "rust1", since = "1.0.0")]
unsafe impl<#[may_dangle] T: ?Sized, A: Allocator> Drop for Box<T, A> {
    fn drop(&mut self) {
        // FIXME: Do nothing, drop is currently performed by compiler.
    }
}
```



## 2. Cow<'a, B'>

`Cow` 是 `Rust` 下用于提供写时克隆(**Clone-on-Write**)的一个智能指针, 它跟虚拟内存管理的写时复制(**Copy-on-write**)有异曲同工之妙: 包裹一个只读借用, 但如果调用者需要所有权或者需要修改内容, 那么它会 `clone` 借用的数据. 

```rust
pub enum Cow<'a, B: ?Sized + 'a> where B: ToOwned,
{
    // 借用的数据
    Borrowed(&'a B),
    // 拥有的数据
    Owned(<B as ToOwned>::Owned),
}
```

> `Cow`（**Clone-on-Write**）是 `Rust` 中一个很有意思且很重要的数据结构. 它就像 `Option` 一样.
>
> 是一个 `enum`, 可以包含一个对类型 `B` 的只读引用, 或者包含对类型 `B` 的拥有所有权的数据
>
> 约束:
>
> -  生命周期约束. 这里 `B` 的生命周期是 `'a`, 所以 `B` 需要满足 `'a`
>
> - `B` 还有两个约束: `?Sized` 和 `where B: ToOwned`. 
>   - `?Size`代表用可变大小的类型
>   - 符合`ToOwned trait`
>
> `Cow` 这个 `enum` 里 **`<B as ToOwned>::Owned` 的含义: 它对 `B` 做了一个强制类型转换, 转成 `ToOwned trait`, 然后访问 `ToOwned trait` 内部的 `Owned` 类型**

理解下 `ToOwned`和 `Borrow` 两个 `trait`

```rust
pub trait ToOwned {
    type Owned: Borrow<Self>;
    #[must_use = "cloning is often expensive and is not expected to have side effects"]
    fn to_owned(&self) -> Self::Owned;

    fn clone_into(&self, target: &mut Self::Owned) { ... }
}

pub trait Borrow<Borrowed> where Borrowed: ?Sized {
    fn borrow(&self) -> &Borrowed;
}
```

> 首先 `type Owned: Borrow<Self>` 是一个带有关联类型的 `trait` 这里的 `Owned` 的关联类型, 需要使用者定义, 这里的`Owned`不能是任意类型, 它必须满足`Borrow<T> trait`. 
>
> 可以看下[`str 对 ToOwned trait 的实现`](https://doc.rust-lang.org/src/alloc/str.rs.html#215-227)
>
> ```rust
> impl ToOwned for str {
>     type Owned = String;
>     #[inline]
>     fn to_owned(&self) -> String {
>         unsafe { String::from_utf8_unchecked(self.as_bytes().to_owned()) }
>     }
> 
>     fn clone_into(&self, target: &mut String) {
>         let mut b = mem::take(target).into_bytes();
>         self.as_bytes().clone_into(&mut b);
>         *target = unsafe { String::from_utf8_unchecked(b) }
>     }
> }
> ```
>
> 关联类型 `Owned` 被定义为 `String`, 而根据要求, `String` 必须定义 `Borrow<T>`, 那这里 `Borrow<T>` 里的泛型变量 `T` 是谁呢？
>
> `ToOwned` 要求是 `Borrow`, 而此刻实现 `ToOwned` 的主体是 `str`, 所以 `Borrow<Self>` 是 `Borrow<str>`, 也就是说 `String` 要实现 `Borrow<str>`. [它的确实现了这个`trait`](https://doc.rust-lang.org/src/alloc/str.rs.html#198-203)
>
> ```rust
> impl Borrow<str> for String {
>     #[inline]
>     fn borrow(&self) -> &str {
>         &self[..]
>     }
> }
> ```
>
> ![image-20221107224703563](http://imgur.thinkgos.cn/imgur/202211072247675.png)
>
> 

`Cow`是智能指针,那么它肯定实现了`Deref trait`

```rust
impl<B: ?Sized + ToOwned> Deref for Cow<'_, B> {
    type Target = B;

    fn deref(&self) -> &B {
        match *self {
            Borrowed(borrowed) => borrowed,
            Owned(ref owned) => owned.borrow(),
        }
    }
}
```

实现的原理很简单, 根据 `self` 是 `Borrowed` 还是 `Owned`, 我们分别取其内容, 生成引用: 

- 对于 `Borrowed`, 直接就是引用；
- 对于 `Owned`, 调用其 `borrow() `方法, 获得引用. 

这样就得到统一的体验, 比如 `Cow<str>`, 使用的感觉和 `&str` / `String`基本一致

注意: **这种根据 enum 的不同状态来进行统一分发的方法是第三种分发手段**

## 3. MutexGuard<T>

`String`、`Box<T>`、`Cow<'a, B>` 等智能指针, 都是通过 `Deref` 来提供良好的用户体验, 那么 `MutexGuard<T>` 是另外一类很有意思的智能指针: 它不但通过 `Deref` 提供良好的用户体验, 还通过 `Drop trait` 来确保, 使用到的内存以外的资源在退出时进行释放. 



```rust
// 通过Mutex::lock时生成的
pub fn lock(&self) -> LockResult<MutexGuard<'_, T>> {
    unsafe {
        self.inner.raw_lock();
        MutexGuard::new(self)
    }
}

// 这里用 must_use, 当你得到了却不使用 MutexGuard 时会报警
#[must_use = "if unused the Mutex will immediately unlock"]
pub struct MutexGuard<'a, T: ?Sized + 'a> {
    lock: &'a Mutex<T>,
    poison: poison::Guard,
}

impl<T: ?Sized> Deref for MutexGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &T {
        unsafe { &*self.lock.data.get() }
    }
}

impl<T: ?Sized> DerefMut for MutexGuard<'_, T> {
    fn deref_mut(&mut self) -> &mut T {
        unsafe { &mut *self.lock.data.get() }
    }
}

impl<T: ?Sized> Drop for MutexGuard<'_, T> {
    #[inline]
    fn drop(&mut self) {
        unsafe {
            self.lock.poison.done(&self.poison);
            self.lock.inner.raw_unlock();
        }
    }
}
```

