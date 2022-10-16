const config = {
  httpUrl: "https://hsdyjc.newhealth.com.cn",
  feedbackUrl: 'https://hsdyjc.newhealth.com.cn',
  // #ifdef H5
  feedbackUrl: '/ilhapi' // 开发环境
  // #endif
}

export const request = (url, params = {}, headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
}) => {
  return new Promise((resove, reject) => {
    uni.request({
      url: config.feedbackUrl + url,
      method: 'POST',
      data: params,
      header: { ...headers },
      success: (res) => {
        resove(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    });
  })
}