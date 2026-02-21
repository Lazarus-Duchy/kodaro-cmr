import { Route, Routes } from "react-router-dom";
import ErrorScreen from "../Modals/ErrorScreen/ErrorScreen";
import Contacts from "../Sections/Contacts/Contacts";
import Home from "../Sections/Home/Home";
import Reports from "../Sections/Reports/Reports";
import Marketing from "../Sections/Marketing/Marketing";
import Clients from "../Sections/Clients/Clients";
import ProtectedRoute from "../Auth/ProtectedRoute";

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
      <Route path="/marketing" element={
        <ProtectedRoute><Marketing /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><Reports /></ProtectedRoute>
      } />
    </Routes>
  );
};

export default RouterSwitcher;