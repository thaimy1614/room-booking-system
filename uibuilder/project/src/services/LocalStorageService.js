export const KEY_TOKEN = "token";
export const KEY_USER_INFO = "user";

export const setToken = async (token) => {
  localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = async () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const setUserInfo = async (userInfo) => {
  localStorage.setItem(KEY_USER_INFO, userInfo);
};

export const getUserInfo = async () => {
  return localStorage.getItem(KEY_USER_INFO);
};

export const removeToken = async () => {
  return localStorage.removeItem(KEY_TOKEN);
};
export const removeUserInfo = async () => {
  return localStorage.removeItem(KEY_USER_INFO);
};