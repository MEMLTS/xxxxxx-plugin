export default [
  {
    label: 'Cookie配置',
    component: 'SOFT_GROUP_BEGIN'
  },
  {
    field: 'cookie.x_auth_token',
    label: 'X auth_token',
    bottomHelpMessage: 'X auth_token',
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入X auth_token'
    }
  },
  {
    field: 'cookie.x_ct0',
    label: 'X ct0',
    bottomHelpMessage: 'X ct0，一般不需要手动填写',
    component: 'InputPassword'
  },
  {
    field: 'cookie.pixiv_PHPSESSID',
    label: 'Pixiv',
    bottomHelpMessage: 'Pixiv PHPSESSID',
    component: 'InputPassword'
  },
  {
    field: 'cookie.jm_cookie',
    label: 'JM',
    bottomHelpMessage: 'JM Cookie',
    component: 'InputPassword'
  },
  {
    field: 'cookie.ehentai_cookie',
    label: 'Ehentai',
    bottomHelpMessage: 'Ehentai Cookie',
    component: 'InputPassword'
  },
  {
    field: 'cookie.jinjiang_cookie',
    label: '晋江文学城',
    bottomHelpMessage: '晋江文学城 Cookie',
    component: 'InputPassword'
  },
  {
    field: 'cookie.a12306_cookie',
    label: '12306',
    bottomHelpMessage: '12306 Cookie 无任何用处',
    component: 'InputPassword'
  }
]
