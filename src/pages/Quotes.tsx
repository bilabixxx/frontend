import React, { useState, useEffect } from "react";
import { getQuotes, deleteQuote } from "../services/api";
import Modal from "../components/Modal";
import QuoteForm from "../components/QuoteForm";
import { jsPDF } from "jspdf";

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);

  // Funzione per ordinare i preventivi in base all'_id
  const sortQuotes = (quotesArray: any[]) => {
    return quotesArray.sort((a: any, b: any) => b._id.localeCompare(a._id));
  };

  useEffect(() => {
    getQuotes()
      .then((response) => {
        const sortedQuotes = sortQuotes(response.data);
        setQuotes(sortedQuotes);
      })
      .finally(() => setLoading(false));
  }, []);

  // Funzione per aggiungere un nuovo preventivo alla lista
  const addQuote = (newQuote: any) => {
    setQuotes((prevQuotes) => {
      const updatedQuotes = [newQuote, ...prevQuotes];
      return sortQuotes(updatedQuotes);
    });
  };

  // Funzione per aggiornare un preventivo nella lista
  const updateQuoteInList = (updatedQuote: any) => {
    setQuotes((prevQuotes) => {
      const updatedQuotes = prevQuotes.map((quote) =>
        quote._id === updatedQuote._id ? updatedQuote : quote
      );
      return sortQuotes(updatedQuotes);
    });
  };

  // Funzione per gestire la conferma di eliminazione
  const confirmDeleteQuote = async () => {
    if (quoteToDelete) {
      await deleteQuote(quoteToDelete._id);
      setQuotes((prevQuotes) =>
        prevQuotes.filter((quote) => quote._id !== quoteToDelete._id)
      );
      setShowDeleteConfirm(false);
    }
  };

  // Funzione per generare il PDF
  const generatePDF = (quote: any) => {
    const doc = new jsPDF();
    const customer = quote.customer;

    doc.setFontSize(16);
    doc.text("Dettagli Preventivo", 10, 10);
    doc.setFontSize(12);
    doc.text(`Cliente: ${customer.name}`, 10, 20);
    doc.text(`Email: ${customer.email}`, 10, 30);
    doc.text(`Telefono: ${customer.phone}`, 10, 40);
    doc.text("Indirizzo di Fatturazione:", 10, 50);
    doc.text(`Via: ${customer.billingAddress.street}`, 10, 60);
    doc.text(`Città: ${customer.billingAddress.city}`, 10, 70);
    doc.text(`Codice Postale: ${customer.billingAddress.postalCode}`, 10, 80);
    doc.text(`Paese: ${customer.billingAddress.country}`, 10, 90);

    if (customer.taxCode) {
      doc.text(`Codice Fiscale: ${customer.taxCode}`, 10, 100);
    }
    if (customer.vatNumber) {
      doc.text(`Partita IVA: ${customer.vatNumber}`, 10, 110);
    }
    if (customer.companyName) {
      doc.text(`Ragione Sociale: ${customer.companyName}`, 10, 120);
    }

    let startY = 130;
    doc.text("Prodotti:", 10, startY);
    let vat22 = 0,
      vat10 = 0,
      vat4 = 0,
      totalIVA = 0,
      subtotal = 0;

    quote.products.forEach((product: any, index: number) => {
      startY += 10;
      let productTotal = product.price * product.quantity;
      let discountAmount = 0;
      if (quote.discount > 0) {
        if (quote.discountType === "percent") {
          discountAmount = (productTotal * quote.discount) / 100;
        } else {
          discountAmount = quote.discount / quote.products.length;
        }
        productTotal -= discountAmount;
      }

      const ivaAmount = (productTotal * product.iva) / 100;

      if (product.iva === 22) vat22 += ivaAmount;
      else if (product.iva === 10) vat10 += ivaAmount;
      else if (product.iva === 4) vat4 += ivaAmount;

      let productLine = `${index + 1}. ${product.name} - Quantità: ${
        product.quantity
      } - Prezzo: €${product.price.toFixed(2)} - Totale: €${(
        product.price * product.quantity
      ).toFixed(2)}`;

      if (quote.discount > 0 && quote.discountType === "percent") {
        productLine += ` - Sconto: ${
          quote.discount
        }% (€${discountAmount.toFixed(2)})`;
      } else if (quote.discount > 0 && quote.discountType === "euro") {
        productLine += ` - Sconto: €${discountAmount.toFixed(2)}`;
      }

      productLine += ` - IVA: ${product.iva}% (€${ivaAmount.toFixed(2)})`;
      doc.text(productLine, 10, startY);

      subtotal += productTotal;
    });

    totalIVA = vat22 + vat10 + vat4;
    startY += 20;
    if (quote.discount > 0) {
      const discountValue =
        quote.discountType === "percent"
          ? `${quote.discount}%`
          : `€${quote.discount.toFixed(2)}`;
      doc.text(`Sconto totale applicato: ${discountValue}`, 10, startY);
      startY += 10;
    }

    if (vat22 > 0) {
      doc.text(`IVA al 22%: €${vat22.toFixed(2)}`, 10, startY);
      startY += 10;
    }
    if (vat10 > 0) {
      doc.text(`IVA al 10%: €${vat10.toFixed(2)}`, 10, startY);
      startY += 10;
    }
    if (vat4 > 0) {
      doc.text(`IVA al 4%: €${vat4.toFixed(2)}`, 10, startY);
      startY += 10;
    }
    doc.text(`IVA Totale Dovuta: €${totalIVA.toFixed(2)}`, 10, startY + 10);

    const totalWithIVA = subtotal + totalIVA;
    doc.text(
      `Prezzo Totale (IVA inclusa): €${totalWithIVA.toFixed(2)}`,
      10,
      startY + 20
    );

    doc.save(`preventivo_${quote._id}.pdf`);
  };

  // Funzione per gestire il click sul bottone "Modifica"
  const handleEditClick = (quote: any) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  // Funzione per gestire il click sul bottone "Elimina"
  const handleDeleteClick = (quote: any) => {
    setQuoteToDelete(quote);
    setShowDeleteConfirm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Preventivi</h2>
        <button
          onClick={() => {
            setSelectedQuote(null);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Crea Preventivo
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
                  Cliente
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Prezzo Totale
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Prodotti
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote: any) => (
                <tr key={quote._id} className="border-b border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {quote.customer.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    €{quote.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {quote.products.length}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 flex space-x-2">
                    <button
                      onClick={() => handleDeleteClick(quote)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Elimina
                    </button>
                    <button
                      onClick={() => handleEditClick(quote)}
                      className="bg-orange-500 text-white px-2 py-1 rounded"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => generatePDF(quote)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per l'aggiunta o modifica di un preventivo */}
      {showModal && (
        <Modal
          title={selectedQuote ? "Modifica Preventivo" : "Crea Preventivo"}
          onClose={() => setShowModal(false)}
        >
          <QuoteForm
            onSuccess={() => setShowModal(false)}
            addQuote={addQuote}
            updateQuoteInList={updateQuoteInList}
            initialData={selectedQuote}
          />
        </Modal>
      )}

      {/* Popup di conferma eliminazione */}
      {showDeleteConfirm && (
        <Modal
          title="Conferma Eliminazione"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <p>Sei sicuro di voler eliminare questo preventivo?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Annulla
            </button>
            <button
              onClick={confirmDeleteQuote}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Elimina
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Quotes;
