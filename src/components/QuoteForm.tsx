import React, { useState, useEffect } from "react";
import { useFormik, FormikProps, FormikErrors } from "formik";
import * as Yup from "yup";
import {
  getCustomers,
  getProducts,
  createQuote,
  updateQuote,
} from "../services/api";

interface Product {
  product: string;
  name: string;
  price: number;
  quantity: number;
  iva: number; // IVA associata al prodotto
}

interface QuoteFormValues {
  customer: string;
  products: Product[];
  totalPrice: number;
  vat22: number;
  vat10: number;
  vat4: number;
  discount: number;
  discountType: "percent" | "euro";
}

interface Props {
  onSuccess: () => void;
  addQuote: (newQuote: any) => void;
  updateQuoteInList: (updatedQuote: any) => void; // Aggiungi questa prop
  initialData?: any; // Dati iniziali per la modifica del preventivo
}

const QuoteForm: React.FC<Props> = ({
  onSuccess,
  addQuote,
  updateQuoteInList,
  initialData,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    initialData?.products
      ? initialData.products.map((product: any) => ({
          product: product.product._id,
          name: product.product.name,
          price: product.product.price,
          quantity: product.quantity,
          iva: product.product.iva,
        }))
      : [{ product: "", name: "", price: 0, quantity: 1, iva: 0 }]
  );

  useEffect(() => {
    getCustomers().then((response) => {
      setCustomers(response.data);
      if (initialData && initialData.customer) {
        formik.setFieldValue("customer", initialData.customer._id);
      }
    });

    getProducts().then((response) => {
      setProducts(response.data);
    });
  }, [initialData]);

  const validationSchema = Yup.object({
    customer: Yup.string().required("Il cliente è obbligatorio"),
    discount: Yup.number()
      .min(0, "Lo sconto non può essere negativo")
      .when("discountType", {
        is: "percent",
        then: (schema) =>
          schema.max(100, "Lo sconto non può superare il 100%"),
        otherwise: (schema) =>
          schema.test({
            name: "max-discount",
            test: function (value) {
              return value === undefined || value <= this.parent.totalPrice;
            },
            message: "Lo sconto non può superare il totale",
          }),
      }),
    products: Yup.array().of(
      Yup.object({
        product: Yup.string().required("Il prodotto è obbligatorio"),
        name: Yup.string().required("Il nome del prodotto è obbligatorio"),
        price: Yup.number()
          .required("Il prezzo del prodotto è obbligatorio")
          .min(0, "Il prezzo deve essere positivo"),
        quantity: Yup.number()
          .min(1, "La quantità deve essere almeno 1")
          .required("La quantità è obbligatoria"),
        iva: Yup.number().required("L'IVA è obbligatoria"),
      })
    ),
  });

  const formik: FormikProps<QuoteFormValues> = useFormik<QuoteFormValues>({
    initialValues: {
      customer: initialData?.customer._id || "",
      products: selectedProducts,
      totalPrice: initialData?.totalPrice || 0,
      vat22: initialData?.vat22 || 0,
      vat10: initialData?.vat10 || 0,
      vat4: initialData?.vat4 || 0,
      discount: initialData?.discount || 0,
      discountType: initialData?.discountType || "percent",
    },
    validationSchema,
    enableReinitialize: true, // Importante per re-inizializzare il form quando initialData cambia
    onSubmit: async (values) => {
      try {
        if (initialData) {
          // Aggiorna il preventivo esistente
          await updateQuote(initialData._id, values);

          // Costruisci il preventivo aggiornato combinando initialData e values
          const updatedQuote = {
            ...initialData,
            ...values,
            customer: customers.find((c) => c._id === values.customer),
            products: values.products.map((p) => {
              const productData = products.find(
                (prod) => prod._id === p.product
              );
              return {
                ...p,
                product: productData,
              };
            }),
          };

          updateQuoteInList(updatedQuote); // Aggiorna il preventivo nella lista
        } else {
          const response = await createQuote(values);
          addQuote(response.data); // Aggiungi il nuovo preventivo
        }
        onSuccess();
      } catch (error) {
        console.error("Errore durante la gestione del preventivo", error);
      }
    },
  });

  useEffect(() => {
    calculateTotals(selectedProducts);
  }, [selectedProducts, formik.values.discount, formik.values.discountType]);

  // Funzione per calcolare il totale, la quantità e l'IVA
  const calculateTotals = (updatedProducts: Product[]) => {
    let totalPrice = 0;
    let vat22Total = 0;
    let vat10Total = 0;
    let vat4Total = 0;

    updatedProducts.forEach((sp) => {
      const productTotal = sp.price * sp.quantity;
      totalPrice += productTotal;
    });

    let discountValue = formik.values.discount;
    if (formik.values.discountType === "percent") {
      discountValue = (totalPrice * discountValue) / 100;
    }

    const discountedTotal = totalPrice - discountValue;

    updatedProducts.forEach((sp) => {
      const productTotal = sp.price * sp.quantity;
      if (sp.iva === 22) {
        vat22Total += productTotal * 0.22 * (1 - discountValue / totalPrice);
      } else if (sp.iva === 10) {
        vat10Total += productTotal * 0.1 * (1 - discountValue / totalPrice);
      } else if (sp.iva === 4) {
        vat4Total += productTotal * 0.04 * (1 - discountValue / totalPrice);
      }
    });

    const finalTotal = discountedTotal + vat22Total + vat10Total + vat4Total;

    formik.setFieldValue("totalPrice", finalTotal);
    formik.setFieldValue("vat22", vat22Total);
    formik.setFieldValue("vat10", vat10Total);
    formik.setFieldValue("vat4", vat4Total);
  };

  const handleProductChange = (index: number, productId: string) => {
    const updatedProducts = [...selectedProducts];
    const selectedProduct = products.find((p) => p._id === productId);

    if (selectedProduct) {
      updatedProducts[index] = {
        product: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: updatedProducts[index].quantity, // Mantiene la quantità selezionata
        iva: selectedProduct.iva,
      };

      formik.setFieldValue(`products[${index}]`, updatedProducts[index]);
    }

    setSelectedProducts(updatedProducts);
    calculateTotals(updatedProducts);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: quantity,
    };
    setSelectedProducts(updatedProducts);
    formik.setFieldValue(`products[${index}].quantity`, quantity);
    calculateTotals(updatedProducts);
  };

  const handleAddProduct = () => {
    const newProduct = {
      product: "",
      name: "",
      price: 0,
      quantity: 1,
      iva: 0,
    };
    setSelectedProducts([...selectedProducts, newProduct]);
    formik.setFieldValue("products", [...formik.values.products, newProduct]);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    formik.setFieldValue(
      "products",
      formik.values.products.filter((_, i) => i !== index)
    );
    calculateTotals(updatedProducts);
  };

  const availableProducts = products.filter(
    (product) => !selectedProducts.some((sp) => sp.product === product._id)
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Selezione cliente */}
      <div className="mb-4">
        <label className="block text-gray-700">Cliente</label>
        <select
          name="customer"
          onChange={formik.handleChange}
          value={formik.values.customer}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {/* Se non c'è un cliente già selezionato, mostra "Seleziona un cliente" */}
          {!formik.values.customer && (
            <option value="">Seleziona un cliente</option>
          )}
          {customers.map((customer: any) => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </select>

        {formik.errors.customer && formik.touched.customer && (
          <p className="text-red-500 text-sm">{formik.errors.customer}</p>
        )}
      </div>

      {/* Selezione prodotti */}
      {selectedProducts.map((sp, index) => (
        <div key={index} className="flex space-x-4 mb-4">
          <div className="w-1/3">
            <label className="block text-gray-700">Prodotto</label>
            <select
              value={sp.product}
              onChange={(e) => handleProductChange(index, e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona un prodotto</option>
              {[...products, { _id: sp.product, name: sp.name }] // Aggiunge il prodotto selezionato anche se non è nella lista dei prodotti disponibili
                .filter(
                  (value, idx, self) =>
                    self.findIndex((p) => p._id === value._id) === idx
                )
                .map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
            </select>
            {formik.errors.products &&
              formik.errors.products[index] &&
              formik.touched.products &&
              formik.touched.products[index] && (
                <p className="text-red-500 text-sm">
                  {
                    (formik.errors.products[index] as FormikErrors<Product>)
                      .product
                  }
                </p>
              )}
          </div>

          {/* Campo prezzo */}
          <div className="w-1/6">
            <label className="block text-gray-700">Prezzo (€)</label>
            <input
              type="number"
              value={sp.price.toFixed(2)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Campo IVA */}
          <div className="w-1/6">
            <label className="block text-gray-700">IVA (%)</label>
            <input
              type="number"
              value={sp.iva}
              readOnly
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Campo quantità */}
          <div className="w-1/6">
            <label className="block text-gray-700">Quantità</label>
            <input
              type="number"
              min="1"
              value={sp.quantity}
              onChange={(e) =>
                handleQuantityChange(index, parseInt(e.target.value, 10))
              }
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formik.errors.products &&
              formik.errors.products[index] &&
              formik.touched.products &&
              formik.touched.products[index] && (
                <p className="text-red-500 text-sm">
                  {
                    (formik.errors.products[index] as FormikErrors<Product>)
                      .quantity
                  }
                </p>
              )}
          </div>

          {selectedProducts.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveProduct(index)}
              className="bg-red-500 text-white px-4 self-end rounded-md hover:bg-red-600"
              style={{ height: "42px" }}
            >
              Elimina
            </button>
          )}
        </div>
      ))}

      {/* Aggiungi prodotto */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Aggiungi Prodotto
        </button>
      </div>

      {/* Sezione sconto */}
      <div className="mb-4">
        <label className="block text-gray-700">Sconto</label>
        <div className="flex space-x-4">
          <input
            type="number"
            name="discount"
            min="0"
            value={formik.values.discount}
            onChange={formik.handleChange}
            className="mt-1 block w-1/2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            name="discountType"
            value={formik.values.discountType}
            onChange={formik.handleChange}
            className="mt-1 block w-1/2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="percent">Percentuale (%)</option>
            <option value="euro">Euro (€)</option>
          </select>
        </div>
        {formik.errors.discount && formik.touched.discount && (
          <p className="text-red-500 text-sm">{formik.errors.discount}</p>
        )}
      </div>

      {/* Prezzo totale */}
      <div className="mb-4">
        <label className="block text-gray-700">Prezzo Totale</label>
        <input
          type="number"
          name="totalPrice"
          value={formik.values.totalPrice.toFixed(2)}
          readOnly
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 focus:outline-none"
        />
      </div>

      {/* Dettagli IVA */}
      <div className="mb-4">
        <p className="text-gray-700">Dettaglio IVA:</p>
        {formik.values.vat22 > 0 && (
          <p>IVA al 22%: €{formik.values.vat22.toFixed(2)}</p>
        )}
        {formik.values.vat10 > 0 && (
          <p>IVA al 10%: €{formik.values.vat10.toFixed(2)}</p>
        )}
        {formik.values.vat4 > 0 && (
          <p>IVA al 4%: €{formik.values.vat4.toFixed(2)}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {initialData ? "Modifica Preventivo" : "Crea Preventivo"}
      </button>
    </form>
  );
};

export default QuoteForm;
