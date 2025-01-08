import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

function setJwt(jwt) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
}

function clearJwt() {
  axios.defaults.headers.common['Authorization'] = '';
}

const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
  setJwt,
  clearJwt,
};

export default http;
