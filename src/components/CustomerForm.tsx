import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createCustomer } from "../services/api";

// Definire i Props per il componente CustomerForm
interface Props {
  onSuccess: () => void;
  addCustomer: (newCustomer: any) => void;
}

const CustomerForm: React.FC<Props> = ({ onSuccess, addCustomer }) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
      taxCode: "",
      vatNumber: "",
      companyName: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Il nome è obbligatorio"),
      email: Yup.string()
        .email("Email non valida")
        .required("L'email è obbligatoria"),
      phone: Yup.number()
        .typeError("Devi inserire solo numeri interi")
        .required("Il telefono è obbligatorio")
        .integer("Il numero di telefono deve essere un intero"),
      street: Yup.string().required("La via è obbligatoria"),
      city: Yup.string().required("La città è obbligatoria"),
      postalCode: Yup.number()
        .typeError("Devi inserire solo numeri interi")
        .required("Il codice postale è obbligatorio")
        .integer("Il codice postale deve essere un intero"),
      country: Yup.string().required("Il paese è obbligatorio"),
      vatNumber: Yup.string(),
      taxCode: Yup.string().test(
        "taxCodeOrVatNumber",
        "Devi inserire o il Codice Fiscale o la Partita IVA",
        function () {
          const { taxCode, vatNumber } = this.parent;
          return taxCode || vatNumber;
        }
      ),
      companyName: Yup.string(),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        const response = await createCustomer({
          name: values.name,
          email: values.email,
          phone: values.phone,
          billingAddress: {
            street: values.street,
            city: values.city,
            postalCode: values.postalCode,
            country: values.country,
          },
          taxCode: values.taxCode,
          vatNumber: values.vatNumber,
          companyName: values.companyName,
        });

        // Aggiungi il nuovo cliente alla lista
        addCustomer(response.data);
        onSuccess();
      } catch (error) {
        console.error("Errore durante la creazione del cliente", error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Nome e Email */}
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.name && formik.touched.name
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.name && formik.touched.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.email && formik.touched.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.email && formik.touched.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
        </div>
      </div>

      {/* Telefono e Via */}
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Telefono</label>
          <input
            type="number"
            name="phone"
            onChange={formik.handleChange}
            value={formik.values.phone}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.phone && formik.touched.phone
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.phone && formik.touched.phone && (
            <p className="text-red-500 text-sm">{formik.errors.phone}</p>
          )}
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700">Via</label>
          <input
            type="text"
            name="street"
            onChange={formik.handleChange}
            value={formik.values.street}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.street && formik.touched.street
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.street && formik.touched.street && (
            <p className="text-red-500 text-sm">{formik.errors.street}</p>
          )}
        </div>
      </div>

      {/* Città e Codice Postale */}
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Città</label>
          <input
            type="text"
            name="city"
            onChange={formik.handleChange}
            value={formik.values.city}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.city && formik.touched.city
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.city && formik.touched.city && (
            <p className="text-red-500 text-sm">{formik.errors.city}</p>
          )}
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700">Codice Postale</label>
          <input
            type="number"
            name="postalCode"
            onChange={formik.handleChange}
            value={formik.values.postalCode}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.postalCode && formik.touched.postalCode
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.postalCode && formik.touched.postalCode && (
            <p className="text-red-500 text-sm">{formik.errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Paese e Codice Fiscale */}
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Paese</label>
          <input
            type="text"
            name="country"
            onChange={formik.handleChange}
            value={formik.values.country}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.country && formik.touched.country
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.errors.country && formik.touched.country && (
            <p className="text-red-500 text-sm">{formik.errors.country}</p>
          )}
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700">Codice Fiscale</label>
          <input
            type="text"
            name="taxCode"
            onChange={formik.handleChange}
            value={formik.values.taxCode}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>
      </div>

      {/* Partita IVA e Ragione Sociale */}
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <label className="block text-gray-700">Partita IVA</label>
          <input
            type="text"
            name="vatNumber"
            onChange={formik.handleChange}
            value={formik.values.vatNumber}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formik.errors.vatNumber && formik.touched.vatNumber
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {(formik.errors.taxCode || formik.errors.vatNumber) && (
            <p className="text-red-500 text-sm">
              {formik.errors.taxCode || formik.errors.vatNumber}
            </p>
          )}
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700">Ragione Sociale</label>
          <input
            type="text"
            name="companyName"
            onChange={formik.handleChange}
            value={formik.values.companyName}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bottone di submit */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Aggiungi Cliente
      </button>
    </form>
  );
};

export default CustomerForm;
