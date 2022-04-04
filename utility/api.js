import axios from "axios";
// import { createMessage } from "../components/box/message";

const http = axios.create({
  baseURL: "/api/",
  timeout: 150000, // 请求超时时间
});

// request 请求拦截器
http.interceptors.request.use(
  (config) => {
    //设置header
    config.headers["Content-Type"] = "application/json;charset=UTF-8";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// respone 响应拦截器
http.interceptors.response.use(
  (res) => {
    if (res.status == 200) {
      const { data } = res;
      if (data.code == 0) {
        return Promise.resolve(data.data);
      } else {
        return Promise.reject(data.msg);
      }
    } else {
      return Promise.reject(res.statusText);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  /**
   * get方法，对应get请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      http.get(url, { params })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  /**
   * post方法，对应post请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  post: (url, params) => {
    return new Promise((resolve, reject) => {
      http.post(url, params)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
