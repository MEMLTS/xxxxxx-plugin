export default [
  {
    label: '基础配置',
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
  },
  {
    field: 'config.common',
    label: '通用反代',
    bottomHelpMessage: '启用后，会使用代理进行请求图片和视频',
    component: 'Switch'
  },
  {
    field: 'config.commonUrl',
    label: '通用反代地址',
    component: 'Input',
    componentProps: {
      placeholder: '请输入通用反代地址'
    }
  }
]
