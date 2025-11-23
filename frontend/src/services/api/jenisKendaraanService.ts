import { http } from "./http"

export const getJenisKendaraan = async () => {
    const res = await http.get('/api/v1/jenis-kendaraan');
    return res;
}