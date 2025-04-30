export default [
  {
    label: 'pixiv配置',
    component: 'SOFT_GROUP_BEGIN'
  },
  {
    field: 'pixiv.enable',
    label: 'pixiv解析',
    bottomHelpMessage: '是否启用pixiv解析',
    component: 'Switch'
  },
  {
    field: 'pixiv.enableTranslation',
    label: '小说翻译',
    bottomHelpMessage: '是否启用pixiv小说翻译',
    component: 'Switch'
  }
]
