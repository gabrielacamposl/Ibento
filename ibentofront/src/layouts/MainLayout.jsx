import { Outlet } from "react-router-dom";
import Footer from "../components/footer";
import BottomNav from "../components/BottomNav";


function MainLayout() {
    return (
      <div className="layout">
        <main className="w-full lg:flex lg:items-center lg:justify-center lg:flex-col lg:min-h-screen">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    );
  }
  
  export default MainLayout;