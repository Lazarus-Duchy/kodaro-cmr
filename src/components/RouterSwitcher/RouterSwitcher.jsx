import { Route, Routes } from "react-router-dom";
import ErrorScreen from "../Modals/ErrorScreen/ErrorScreen";
import Contacts from "../Sections/Contacts/Contacts";
import Home from "../Sections/Home/Home";
import Sales from "../Sections/Sales/Sales";
import Reports from "../Sections/Reports/Reports";
import Clients from "../Sections/Clients/Clients";
import ProtectedRoute from "../Auth/ProtectedRoute";
import Campaigns from "../Sections/Campaigns/Campaigns";

export const RouterSwitcher = () => {
  return (
    <Routes>
      <Route path="*" element={<ErrorScreen errorCode={404} errorName={"Not Found"} errorMessage={"The page you're looking for doesn't exist."} />} />
      
      {/* Public route */}
      <Route path="" element={<Home />} />

      {/* Protected routes - require login */}
      <Route path="/contacts" element={
        <ProtectedRoute><Contacts /></ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute><Clients /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><Reports /></ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute><Sales /></ProtectedRoute>
      } />
      <Route path="/campaigns" element={
        <ProtectedRoute><Campaigns /></ProtectedRoute>
      } />
    </Routes>
  );
};

export default RouterSwitcher;