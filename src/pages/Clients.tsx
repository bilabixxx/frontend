import React, { useState, useEffect } from "react";
import { getCustomers } from "../services/api";
import Modal from "../components/Modal";
import CustomerForm from "../components/CustomerForm";

// Definisci un'interfaccia per il cliente
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const Clients: React.FC = () => {
  // Stato per i clienti e per il caricamento
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true); // Stato per gestire il caricamento
  const [showModal, setShowModal] = useState(false);

  // Carica la lista dei clienti quando il componente è montato
  useEffect(() => {
    getCustomers()
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false)); // Nasconde lo spinner dopo il caricamento
  }, []);

  // Funzione per aggiungere un nuovo cliente alla lista
  const addCustomer = (newCustomer: Customer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clienti</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Aggiungi Cliente
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
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Nome
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Telefono
                </th>
              </tr>
            </thead>
            <tbody>
              {customers
                .slice()
                .reverse()
                .map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {customer.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {customer.phone}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per l'aggiunta di un nuovo cliente */}
      {showModal && (
        <Modal title="Aggiungi Cliente" onClose={() => setShowModal(false)}>
          <CustomerForm
            onSuccess={() => setShowModal(false)}
            addCustomer={addCustomer}
          />
        </Modal>
      )}
    </div>
  );
};

export default Clients;
