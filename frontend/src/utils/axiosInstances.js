import axios from 'axios';

const hostname = window.location.host;
const isDevelopment = hostname.startsWith('localhost')
const baseURL = isDevelopment ? 'http://localhost:3649/api/shipment' : '/api/shipment';

const tmsMdmAxiosInstance = axios.create({ baseURL, timeout: 1800000 });

export default tmsMdmAxiosInstance;