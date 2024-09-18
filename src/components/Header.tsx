import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Preventivatore</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/clients" className="hover:underline">
                Clienti
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:underline">
                Prodotti
              </Link>
            </li>
            <li>
              <Link to="/quotes" className="hover:underline">
                Preventivi
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
