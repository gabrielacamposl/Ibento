import { Outlet } from "react-router-dom";
import Footer from "../components/footer";
import BottomNav from "../components/BottomNav";
import WebNavigation from "../components/WebNavigation";


function MainLayout() {
    return (
      <div className="layout min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-indigo-50/30">
        {/* Navegación Web - Solo visible en pantallas grandes */}
        <WebNavigation />
        
        {/* Contenido principal */}
        <main className="w-full lg:flex lg:items-start lg:justify-center lg:flex-col min-h-screen pb-16 lg:pb-0">
          <div className="w-full max-w-7xl mx-auto px-4 lg:mt-20 lg:px-6 xl:px-8">
            <Outlet />
          </div>
        </main>
        
        {/* Navegación Móvil - Solo visible en pantallas pequeñas */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }
  
  export default MainLayout;