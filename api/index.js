const config = {
  httpUrl: "https://szwj.borycloud.com",
  feedbackUrl: 'https://szwj.borycloud.com',
  // #ifdef H5
  feedbackUrl: '' // 开发环境
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