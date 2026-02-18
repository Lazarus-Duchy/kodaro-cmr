import { Route, Routes } from "react-router-dom";
import ErrorScreen from "../Modals/ErrorScreen/ErrorScreen";
import Contacts from "../Sections/Contacts/Contacts";
import Home from "../Sections/Home/Home";
import Reports from "../Sections/Reports/Reports";
import Marketing from "../Sections/Marketing/Marketing";
import Clients from "../Sections/Clients/Clients";

export const RouterSwitcher = () => {
  return (
    <Routes>
        <Route path="*" element={<ErrorScreen errorCode={404} errorName={"Not Found"} errorMessage={"The page you're looking for doesn't exist."} />} />
        <Route path="" element={<Home />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/reports" element={<Reports />} />
    </Routes>
  )
}
export default RouterSwitcher;