import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Confirm from "./components/Confirm";
import Login from "./components/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/confirmar" element={<Confirm />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
