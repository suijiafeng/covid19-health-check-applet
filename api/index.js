import { config } from './config';
import { mockApi, USE_MOCK_DATA } from './mockData';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

const responseInterceptor = (response) => {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data;
  }
  throw new Error(`HTTP error! status: ${response.statusCode}`);
};

const errorHandler = (error) => {
  console.error('Request failed:', error);
  uni.showToast({
    title: '请求失败，请稍后重试',
    icon: 'none'
  });
  throw error;
};

export const request = (url, params = {}, headers = {}) => {
  if (USE_MOCK_DATA) {
    uni.showToast({
      title: '当前使用模拟数据',
      icon: 'none',
      duration: 2000
    });
    return mockApi(url, params);
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${config.feedbackUrl}${url}`,
      method: 'POST',
      data: params,
      header: { ...DEFAULT_HEADERS, ...headers },
      success: (res) => resolve(responseInterceptor(res)),
      fail: (err) => reject(errorHandler(err))
    });
  });
};

export const get = (url, params = {}, headers = {}) => {
  return request(url, params, { ...headers, method: 'GET' });
};

export const createCancelableRequest = () => {
  let abortController;

  const cancelableRequest = (url, params = {}, headers = {}) => {
    abortController = new AbortController();
    return request(url, params, { 
      ...headers, 
      signal: abortController.signal 
    });
  };

  const cancel = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return { request: cancelableRequest, cancel };
};