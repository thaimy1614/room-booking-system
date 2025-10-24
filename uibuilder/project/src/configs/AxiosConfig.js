import axios from "axios";
import {
  removeToken,
  removeUserInfo,
} from "../services/LocalStorageService";
import { toast } from "react-toastify";

axios.defaults.baseURL = process.env.API_PREFIX || "http://localhost:1880/api";
axios.defaults.withCredentials = false;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Axios error interceptor:", error);

    if (error.response && ( error.response.status === 401 || error.response.status === 403 ) && !error.config.url.includes('/login')) {
      toast.error("Session expired or unauthorized. Redirecting to login...");
      // removeToken();
      // removeUserInfo();
      // setTimeout(() => {
      //   window.location.href = '/project/login';
      // }, 2000);
    }

    if (error.response && error.response.status === 500) {
      toast.error("Server error. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default axios;