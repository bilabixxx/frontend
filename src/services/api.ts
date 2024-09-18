import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Assicurati che l'URL base sia corretto
  headers: {
    "Content-Type": "application/json",
  },
});

// Rotte per la gestione dei clienti
export const getCustomers = () => api.get("/customers");
export const getCustomerById = (id: string) => api.get(`/customers/${id}`);
export const createCustomer = (data: any) => api.post("/customers", data);
export const updateCustomer = (id: string, data: any) =>
  api.put(`/customers/${id}`, data);
export const deleteCustomer = (id: string) => api.delete(`/customers/${id}`);

// Rotte per la gestione dei prodotti
export const getProducts = () => api.get("/products");
export const createProduct = (data: any) => api.post("/products", data);
export const updateProduct = (id: string, data: any) =>
  api.put(`/products/${id}`, data);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);

// Rotte per la gestione dei preventivi
export const getQuotes = () => api.get("/quotes");
export const getQuoteById = (id: string) => {
  return axios.get(`/api/quotes/${id}`);
};
export const createQuote = (data: any) => api.post("/quotes", data);
export const updateQuote = (id: string, data: any) =>
  api.put(`/quotes/${id}`, data);
export const deleteQuote = (id: string) => api.delete(`/quotes/${id}`);

export default api;
