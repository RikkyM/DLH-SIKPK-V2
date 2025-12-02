import { http } from "@/services/api/http"

export const getDashboardData = async () => {
    const res = await http.get('/api/v1/dashboard');
    return res.data;
}