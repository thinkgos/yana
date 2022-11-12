# 围绕 trait 进行设计系统

## 1. 泛型参数和幽灵数据（PhantomData）提供额外类型

```rust

use std::marker::PhantomData;

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Identifier<T> {
    inner: u64,
    _tag: PhantomData<T>,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct User {
    id: Identifier<Self>,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Product {
    id: Identifier<Self>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn id_should_not_be_the_same() {
        let user = User::default();
        let product = Product::default();

        // 两个 id 不能比较，因为他们属于不同的类型
        // assert_ne!(user.id, product.id);

        assert_eq!(user.id.inner, product.id.inner);
    }
}
```

**在定义数据结构时，对于额外的、暂时不需要的泛型参数，用 `PhantomData` 来“拥有”它们，这样可以规避编译器的报错**.

`PhantomData` 正如其名，它实际上长度为零，是个 `ZST（Zero-Sized Type）`.