(() => {
  'use strict';
  const config = window.CampusConfig;
  async function request(base, path, method = 'GET', body, credentials = 'omit') {
    if (!base || !path) throw Error('Chức năng này cần kết nối máy chủ. Vui lòng quay lại sau.');
    const url = new URL(path, base.endsWith('/') ? base : base + '/');
    if (!['http:', 'https:'].includes(url.protocol)) throw Error('Địa chỉ API không hợp lệ.');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {method, credentials, signal:controller.signal,
        headers: body instanceof FormData ? {} : {'Content-Type':'application/json'},
        body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body)});
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {const error = Error(data?.message || 'Yêu cầu thất bại. Hãy thử lại.'); error.status=response.status; error.retryAt=data?.retryAt; error.challenge=data?.challenge; throw error;}
      return data;
    } catch (error) {if(error.name==='AbortError')throw Error('Kết nối quá thời gian. Hãy thử lại.');throw error;}
    finally {clearTimeout(timer);}
  }
  window.CampusAPI = {
    configured: key => Boolean(config.restBaseUrl && config.endpoints[key]),
    rest: (key, method, body) => request(config.restBaseUrl, config.endpoints[key], method, body),
    authConfigured: key => Boolean(config.authBaseUrl && config.auth[key]),
    auth: (key, body, method = 'POST') => request(config.authBaseUrl, config.auth[key], method, body, 'include'),
    ai: body => request(location.origin, config.aiProxy, 'POST', body, 'include')
  };
})();
