export default [
  {
    label: '基础配置',
    // 第一个分组标记开始，无需标记结束
    component: 'SOFT_GROUP_BEGIN'
  },
  {
    component: 'Divider',
    label: '代理'
  },
  {
    field: 'config.proxy',
    label: '启用代理',
    bottomHelpMessage: '启用后，会使用代理进行请求',
    component: 'Switch'
  },
  {
    field: 'config.proxyUrl',
    label: '代理地址',
    bottomHelpMessage: '支持http/socks代理,如不使用则留空',
    component: 'Input',
    componentProps: {
      placeholder: '请输入代理地址'
    }
  }
]
