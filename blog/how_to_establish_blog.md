---
slug: "如何构建一个博客"
title: "如何构建一个博客"
authors:
  name: thinkgos
  title: things-go Core Team
  url: https://github.com/thinkgos
  image_url: https://github.com/thinkgos.png
tags: [工具]
---

## 前言

为什么选`hugo`[^1],而不是`hexo`,`wordpress`,其中一个主要原因应该是环境问题, 而对于一个专注于写文章的人,简单、易用、高效、易扩展、快速部署,`hugo`刚好满足条件,速度更快,而且不用依赖一大堆东西,一个二进制文件就可以搞定.

> The world’s fastest framework for building websites. Hugo is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again.

## Hugo 快速开始

`hugo`[^1]有一个显眼的按钮[Quick Start]，点击它，按步骤完成即可.

![img](http://imgur.thinkgos.cn/imgur/202111012032950.webp)

## Hugo安装

### Linux,windows

由于我是`ubuntu`的操作系统,所以我直接在[Hugo releases](https://github.com/gohugoio/hugo/releases)下载`hugo_extended_0.88.1_Linux-64bit.deb` 建议下载extended版本,它支持一些扩展特性,比如css的`sccs`等.当然系统自带的`Hugo`也是可以的,但是不是extend版本,而且版本一般比github上的旧一些

### Mac

```shell
brew install hugo
```

## 开始搭建

### 1. 创建一个新的项目

```shell
hugo new site blog
cd blog
```

### 2. 添加一个主题

我这里使用的是[LoveIt](https://github.com/dillonzq/LoveIt)主题,直接下载对于最新主题并放到`themes`目录下.

也可以直接把这个主题克隆到 `themes` 目录:

```
git clone https://github.com/dillonzq/LoveIt.git themes/LoveIt
```

建议采用下面方法,将主题仓库作为目录的子模块,这个只需执行拉取子模块就可以保持主题最新.

```shell
git init
git submodule add https://github.com/dillonzq/LoveIt.git themes/LoveIt
```

### 3. 基本配置

将`themes/LoveIt`目录下的主题基本配置拷至**config.toml**,其体可以参考**LoveIt**[^2],在构建网站时, 你可以使用 `--theme` 选项设置主题. 但是, 我建议你修改配置文件 (**config.toml**) 将本主题设置为默认主题.

### 4. 创建第一篇文章

```shell
hugo new posts/first_post.md
```

> 默认情况下, 所有文章和页面均作为草稿创建. 如果想要渲染这些页面, 请从元数据中删除属性 `draft: true`, 设置属性 `draft: false` 或者为 `hugo` 命令添加 `-D`/`--buildDrafts` 参数.

### 5. 本地启动

```bash
hugo serve
```

查看 `http://localhost:1313`.

### 6. 布署构建网站

将你的项目上传至`github`,可以使用通过 [Netlify](https://www.netlify.com/) 自动发布和托管.[通过 Netlify 进行 HUGO 自动化部署](https://www.netlify.com/blog/2015/07/30/hosting-hugo-on-netlifyinsanely-fast-deploys/)

### 7.网站构建成功后,就是做配置和写文章,优化一些特系 

## 参考

[^1]: [hugo](https://gohugo.io/)

[^2]: [LoveIt](https://hugoloveit.com/zh-cn/theme-documentation-basics/)
