import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";

import Home from "./pages/Home";
 
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoicePreview from "./components/InvoicePreview";
import Invoices from "./pages/Invoices";
import BusinessProfile from "./pages/BusinessProfile";
import Notfound from "./pages/Notfound";
 

 

const ClerkProtected = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

const App = () => {
  console.log('App component is rendering!');
  
  return (
  <div className="min-h-screen max-w-full overflow-x-hidden bg-gray-50">
     
    <Routes>
    <Route path='/' element={<Home/>} />
    <Route path='/app' element={<ClerkProtected><AppShell/></ClerkProtected>} 
   >
    <Route index element={<Dashboard />} />
    <Route path='dashboard' element={<Dashboard />} />
    <Route path="invoices" element={<Invoices />} />
    <Route path="invoices/new"  element={<CreateInvoice />} />
     <Route path="invoices/:id" element={<InvoicePreview />} />
    <Route path="invoices/:id/preview" element={<InvoicePreview />} />
    <Route path="invoices/:id/edit" element={<CreateInvoice />} />

    <Route path="create-invoice" element={<CreateInvoice/>} />
     <Route path="business" element={<BusinessProfile />} />
     <Route path="*" element={<Notfound />} />
 
    </Route>
     </Routes>


    </div>
  );
};

export default App;

