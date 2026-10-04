import axios from 'axios';
export const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5001/api';
export const SOCKET_URL=import.meta.env.VITE_SOCKET_URL||'http://localhost:5001';
const api=axios.create({baseURL:API_URL,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(c=>{const t=localStorage.getItem('fd_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
export const unwrap=r=>r.data?.data;
export default api;
