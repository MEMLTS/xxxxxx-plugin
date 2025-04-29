# xxxxxx-plugin

[![](https://img.shields.io/badge/Yunzai-Bot-blue)](https://github.com/Le-niao/Yunzai-Bot) [![](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 项目介绍

这是一个为Yunzai-Bot开发的多平台解析插件，支持多个平台的内容解析和展示功能。主要功能包括12306列车查询、Pixiv小说解析等。

## 功能特性

- **12306列车查询**
  - 车次信息查询
  - 列车时刻表查询

- **Pixiv小说解析**
  - 小说内容获取
  - 格式化展示

- **通用功能**
  - 支持HTTP/SOCKS代理
  - 灵活的反向代理配置

## 安装方法

1. 在Yunzai根目录下执行
```bash
git clone https://github.com/your-username/xxxxxx-plugin.git ./plugins/xxxxxx-plugin/
```

2. 安装插件依赖
```bash
pnpm install --prefer-offline
```

3. 重启Yunzai-Bot

## 配置说明

配置文件位于 `config/config.yaml`，支持以下配置项：

### 基础配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| renderScale | 页面渲染精度，数值越大精度越高 | 100 |

### 代理设置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| proxy | 是否启用代理 | false |
| proxyUrl | 代理服务器地址，支持http/socks代理 | 空 |

### 通用反代

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| common | 是否启用通用反代 | false |
| commonUrl | 通用反代服务器地址 | 空 |

## 使用说明

插件支持通过锅巴面板进行可视化配置，可在面板中轻松设置各项参数。

## 许可证

本项目采用 [GNU GENERAL PUBLIC LICENSE](./LICENSE) 许可证。

## 致谢

感谢以下开源项目：
- [Yunzai-Bot](https://github.com/Le-niao/Yunzai-Bot)
- [puppeteer](https://github.com/puppeteer/puppeteer)
