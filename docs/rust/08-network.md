# 网络开发

`rust`标准库提供了`std::net`,为整个`TCP/IP` 协议栈的使用提供了封装。然而 `std::net` 是同步的，所以，如果你要构建一个高性能的异步网络，可以使用 `tokio`, `tokio::net` 提供了和 `std::net` 几乎一致的封装.

![image-20221107090254419](http://imgur.thinkgos.cn/imgur/202211070902552.png)

