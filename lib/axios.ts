import axios from 'axios';

// Configure axios to send cookies with requests
const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
