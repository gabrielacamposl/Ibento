import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/accounts/Register";
import Confirm from "./components/accounts/Confirm";
import Login from "./components/accounts/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/confirmar-cuenta" element={<Confirm/>} />
        <Route path="/crear-cuenta" element={<Register/>} />
      </Routes>
    </Router>
  );
}
