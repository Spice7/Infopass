import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:9000"
});

export async function getSingleQuestion(questionId) {
    const response = await api.get(`/block/data/${questionId}`);
    return response.data;
}