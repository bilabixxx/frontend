import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createProduct } from "../services/api";

// Definire i Props per il componente ProductForm
interface Props {
  onSuccess: () => void;
  addProduct: (newProduct: any) => void;
}

const ProductForm: React.FC<Props> = ({ onSuccess, addProduct }) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      price: "",
      iva: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Il nome del prodotto è obbligatorio"),
      description: Yup.string()
        .min(10, "La descrizione deve contenere almeno 10 caratteri")
        .required("La descrizione del prodotto è obbligatoria"),
      price: Yup.string()
        .required("Il prezzo è obbligatorio")
        .test("is-decimal", "Il prezzo deve essere un numero valido", (value) => {
          return /^\d+([,.]\d{1,2})?$/.test(value || "");
        }),
      iva: Yup.string()
        .required("L'IVA è obbligatoria")
        .test("is-decimal", "L'IVA deve essere un numero valido", (value) => {
          return /^\d+([,.]\d{1,2})?$/.test(value || "");
        }),
    }),
    onSubmit: async (values) => {
      try {
        // Sostituisci la virgola con il punto per il formato corretto del numero
        const formattedValues = {
          ...values,
          price: values.price.replace(",", "."),
          iva: values.iva.replace(",", "."),
        };
        const response = await createProduct(formattedValues);
        addProduct(response.data); // Aggiungi il nuovo prodotto
        onSuccess(); // Esegui la funzione onSuccess dopo l'aggiunta del prodotto
      } catch (error) {
        console.error("Errore durante la creazione del prodotto", error);
      }
    },
    validateOnChange: false, // Disabilita la validazione durante il change
    validateOnBlur: false, // Disabilita la validazione durante il blur
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Campo Nome del prodotto */}
      <div className="mb-4">
        <label className="block text-gray-700">Nome del prodotto</label>
        <input
          type="text"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formik.errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {formik.errors.name && formik.touched.name && (
          <p className="text-red-500 text-sm">{formik.errors.name}</p>
        )}
      </div>

      {/* Campo Descrizione */}
      <div className="mb-4">
        <label className="block text-gray-700">Descrizione del prodotto</label>
        <textarea
          name="description"
          onChange={formik.handleChange}
          value={formik.values.description}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formik.errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {formik.errors.description && formik.touched.description && (
          <p className="text-red-500 text-sm">{formik.errors.description}</p>
        )}
      </div>

      {/* Campo Prezzo */}
      <div className="mb-4">
        <label className="block text-gray-700">Prezzo</label>
        <input
          type="text" // Cambiato da "number" a "text" per permettere l'inserimento della virgola
          name="price"
          onChange={formik.handleChange}
          value={formik.values.price}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formik.errors.price ? "border-red-500" : "border-gray-300"
          }`}
        />
        {formik.errors.price && formik.touched.price && (
          <p className="text-red-500 text-sm">{formik.errors.price}</p>
        )}
      </div>

      {/* Campo IVA */}
      <div className="mb-4">
        <label className="block text-gray-700">IVA</label>
        <input
          type="text" // Cambiato da "number" a "text" per permettere l'inserimento della virgola
          name="iva"
          onChange={formik.handleChange}
          value={formik.values.iva}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formik.errors.iva ? "border-red-500" : "border-gray-300"
          }`}
        />
        {formik.errors.iva && formik.touched.iva && (
          <p className="text-red-500 text-sm">{formik.errors.iva}</p>
        )}
      </div>

      {/* Bottone di submit */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Aggiungi Prodotto
      </button>
    </form>
  );
};

export default ProductForm;
