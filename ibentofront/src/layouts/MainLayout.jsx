import { Outlet } from "react-router-dom";
import Footer from "../components/footer";
import BottomNav from "../components/BottomNav";


function MainLayout() {
    return (
      <div className="layout">
        <main>
          <Outlet />
        </main>
        <BottomNav />
        <Footer />
      </div>
    );
  }
  
  export default MainLayout;