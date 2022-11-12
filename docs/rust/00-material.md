# 资料

## 0. book

- [Rust book](https://doc.rust-lang.org/book/) 官方
- [Rust 死灵书](https://doc.rust-lang.org/nomicon/) 官方Rust死灵书,主要是如何何撰写和使用 **unsafe Rust**
- [Rust标准库](https://doc.rust-lang.org/stable/std/)
- [Rustlings](https://github.com/rust-lang/rustlings) 小练习, 用来夯实对知识和概念的理解
- [This week in Rust](https://github.com/rust-lang/this-week-in-rust)
- [Rust 语言开源杂志](https://github.com/RustMagazine/rust_magazine_2021) 每月一期，囊括了大量优秀的 Rust 文章
- [Beginner’s Series to: Rust](https://www.youtube.com/playlist?list=PLlrxD0HtieHjbTjrchBwOVks_sr8EVW1x) 微软推出的一系列Rust培训
- [Jon Gjengset](https://www.youtube.com/channel/UC_iD0xppBwwsrM9DegC5cQQ) 大佬youtube, 他的视频面向中高级 Rust 用户，适合学习完本课程后再去观看
- [cheat rs](https://cheats.rs/) Rust Language Cheat Sheet

## 1. tool

- [cargo-watch](https://crates.io/crates/cargo-watch) 即时编译
- [cargo-tarpaulin](https://crates.io/crates/cargo-tarpaulin) 代码覆盖率
- [clippy](https://github.com/rust-lang/rust-clippy#clippy) 代码检查
- [cargo-audit](https://crates.io/crates/cargo-audit) `Cargo.lock`安全审核
- cargo-flamegraph 在跟踪代码中的性能热点时给了我们巨大的帮助。
- cargo-geiger 帮助我们快速评估外部依赖，以解决可能的安全性（或正确性）问题。
- cargo tree（最近集成进了 cargo）显示了一个依赖树，它在许多方面都很有用，但主要用于找出最小化依赖项的途径
- [cargo-udeps](https://crates.io/crates/cargo-udeps) 无用依赖检查, 可以识别未使用的依赖项，并尽可能减少我们的构建时间。
- [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) 检查依赖
- 调试工具
  - [rust-gdb](https://github.com/rust-lang/rust/blob/master/src/etc/rust-gdb)
  - [rust-lldb](https://github.com/rust-lang/rust/blob/master/src/etc/rust-lldb)


## 2. crate

- [`mini-sized-rust`](https://github.com/johnthagen/min-sized-rust) How to minimize Rust binary size 
- [`password-hashed`](https://github.com/RustCrypto/password-hashes) Password hashing functions / KDFs
- [`tracing`](https://github.com/tokio-rs/tracing)  Application level tracing for Rust.
- [`pest `](https://github.com/pest-parser/pest) The Elegant Parser
- [`nom`](https://github.com/Geal/nom) Rust parser combinator framework
- [`polars`](https://github.com/pola-rs/polars)  Fast multi-threaded, hybrid-streaming DataFrame library in Rust | Python | Node.js

- [`r2d2`](https://github.com/sfackler/r2d2)  A generic connection pool for Rust

##  3. 建议

### 3.1 密码建议

- 如果 `Argon2id` 可用，那么使用 `Argon2id`（需要目标机器至少有 15MB 内存）。
- 如果 `Argon2id` 不可用，那么使用 `bcrypt`（算法至少迭代 10 次）。
- 最后再考虑 `scrypt` / `PBKDF2`。

