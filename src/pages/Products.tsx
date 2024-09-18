import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';

// Definisci un'interfaccia per il prodotto
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  iva: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Stato per il caricamento
  const [showModal, setShowModal] = useState(false);

  // Carica la lista dei prodotti quando il componente è montato
  useEffect(() => {
    getProducts()
      .then((response) => setProducts(response.data))
      .finally(() => setLoading(false)); // Nasconde lo spinner dopo il caricamento
  }, []);

  // Funzione per aggiungere un nuovo prodotto alla lista
  const addProduct = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Prodotti</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Aggiungi Prodotto
        </button>
      </div>

      {/* Spinner di caricamento */}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border border-gray-200 shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Descrizione</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prezzo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">IVA</th>
              </tr>
            </thead>
            <tbody>
              {products.slice().reverse().map((product) => (
                <tr key={product._id} className="border-b border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{product.description}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{product.price}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{product.iva}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per l'aggiunta di un nuovo prodotto */}
      {showModal && (
        <Modal title="Aggiungi Prodotto" onClose={() => setShowModal(false)}>
          <ProductForm
            onSuccess={() => setShowModal(false)}
            addProduct={addProduct} // Passa la funzione addProduct
          />
        </Modal>
      )}
    </div>
  );
};

export default Products;
