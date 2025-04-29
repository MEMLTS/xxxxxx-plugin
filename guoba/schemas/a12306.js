export default [
  {
    label: '12306配置',
    component: 'SOFT_GROUP_BEGIN'
  },
  {
    component: 'Divider',
    label: '样式'
  },
  {
    field: 'a12306.QueryTrainType',
    label: '查询列车图片模板',
    component: 'Select',
    componentProps: {
      options: [
        { label: '怪怪的风格', value: 1 },
        { label: '简介明了', value: 2 }
      ]
    }
  }
]
