import axios from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "http://168.107.42.66/:5000", // 기본 URL
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  },
});

// request 인터셉터: 토큰 추가 + FormData(파일 업로드) 처리
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      config.headers.accessToken = accessToken;
      config.headers.refreshToken = refreshToken;
    }

    // ⚠️ FormData(이미지 업로드)일 때는 기본 JSON Content-Type 를 "제거"해야 합니다.
    // axios 는 Content-Type 이 이미 세팅돼 있으면 multipart 로 바꾸지 않기 때문에,
    // 이 헤더를 지워야 브라우저가 multipart/form-data; boundary=... 를 직접 붙입니다.
    // (이게 없으면 application/json 으로 나가 백엔드 multer 가 본문/파일을 못 읽어
    //  req.body 가 비고 categoryId 등이 undefined 가 됩니다.)
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData) {
      if (config.headers && typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type"); // axios v1 (AxiosHeaders)
      } else if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
