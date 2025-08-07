import axios from 'axios'

// axios 객체 생성
const api = axios.create({
    baseURL: 'http://localhost:9000',
});



export default api