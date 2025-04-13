import { Request } from '#utils'

export class CS extends plugin {
  constructor () {
    super({
      name: '[xxxxxx-plugin]测试',
      dsc: '[xxxxxx-plugin]测试',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?cs?$/i,
          fnc: 'cs'
        }
      ]
    })
  }

  async cs (e) {
    let data = await Request.request({
      cookie: 'auth_token=3b9fed8362a821a265218f4970bd3fce35fb56e3; ct0=1fcf51e79615e1957ec99b2bce98da7a1ab6d082e081066f78a6231ab380c266a15bf536c399fbb0ca39aa7bffb790c96da6d92520700f9e4446ac40f091c859a12bc11e36fc8dc048129a97aa11d0d7',
      url: 'https://x.com/i/api/graphql/-0XdHI-mrHWBQd8-oLo1aA/ProfileSpotlightsQuery?variables=%7B%22screen_name%22%3A%22Genshin_7%22%7D',
      headers: {
        authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': '1fcf51e79615e1957ec99b2bce98da7a1ab6d082e081066f78a6231ab380c266a15bf536c399fbb0ca39aa7bffb790c96da6d92520700f9e4446ac40f091c859a12bc11e36fc8dc048129a97aa11d0d7'
      }
    })
    e.reply(data, true)
  }
}
