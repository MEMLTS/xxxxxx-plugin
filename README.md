# xxxxxx-plugin 🚀

<div align="center">

_✨ 一个强大的多平台解析插件，为Yunzai-Bot提供丰富的内容解析功能 ✨_

</div>

## 📖 项目介绍

这是一个为Yunzai-Bot开发的多平台解析插件，支持多个平台的内容解析和展示功能。主要功能包括12306列车查询、Pixiv小说解析等。

## ✨ 功能特性

<details>
<summary>🚂 12306列车查询</summary>

- 🔍 车次信息查询
- ⏰ 列车时刻表查询
</details>

<details>
<summary>📚 Pixiv小说解析</summary>

- 📖 小说内容获取
- 🎨 格式化展示
</details>

<details>
<summary>🛠️ 通用功能</summary>

- 🌐 支持HTTP/SOCKS代理
- 🔄 灵活的反向代理配置
</details>

## 📦 安装方法

<details open>
<summary>👉 详细步骤</summary>

1. 在Yunzai根目录下执行
```bash
git clone --depth=1 https://github.com/MEMLTS/xxxxxx-plugin.git ./plugins/xxxxxx-plugin/
```

2. 安装插件依赖
```bash
pnpm install --filter=xxxxxx-plugin
```

3. 重启Yunzai-Bot
</details>

## ⚙️ 配置说明

配置文件位于 `config/config.yaml`，支持以下配置项：

<details>
<summary>🔧 基础配置</summary>

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| renderScale | 页面渲染精度，数值越大精度越高 | 100 |
</details>

<details>
<summary>🌐 代理设置</summary>

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| proxy | 是否启用代理 | false |
| proxyUrl | 代理服务器地址，支持http/socks代理 | 空 |
</details>

<details>
<summary>🔄 通用反代</summary>

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| common | 是否启用通用反代 | false |
| commonUrl | 通用反代服务器地址 | 空 |
</details>

## 🎮 使用说明

插件支持通过锅巴面板进行可视化配置，可在面板中轻松设置各项参数。

## 📄 许可证

本项目采用 [GNU GENERAL PUBLIC LICENSE](./LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目的贡献：

- [Yunzai-Bot](https://github.com/Le-niao/Yunzai-Bot) - 原版Yunzai-Bot项目
- [puppeteer](https://github.com/puppeteer/puppeteer) - 强大的浏览器自动化工具

---

<div align="center">

**如果这个项目对你有帮助，请考虑给它一个 ⭐ Star！**

</div>
