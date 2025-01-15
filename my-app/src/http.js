import axios from 'axios';

// axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// function setJwt(jwt) {
//   axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
// }

// function clearJwt() {
//   axios.defaults.headers.common['Authorization'] = '';
// }

// const http = {
//   get: axios.get,
//   post: axios.post,
//   put: axios.put,
//   patch: axios.patch,
//   delete: axios.delete,
//   setJwt,
//   clearJwt,
// };

// export default http;

import axios from 'axios';
import Swal from 'sweetalert2';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Replace with your API base URL
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        error.response.data.message === 'Token expired. Please log in again.'
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/login'; // Redirect to login page
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
