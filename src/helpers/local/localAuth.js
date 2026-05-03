const encodeBase64Url = (value) => {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  return window
    .btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

export const createLocalAccessToken = (payload) => {
  const header = { alg: 'none', typ: 'JWT' };
  return `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.`;
};
