import { Outlet } from "react-router-dom";
import Footer from "../components/footer";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import useIsWebVersion from "../hooks/useIsWebVersion";

function MainLayout() {
    const isWebVersion = useIsWebVersion();

    if (isWebVersion) {
      // Web version layout with header and footer
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 w-full">
            <Outlet />
          </main>
          <Footer />
        </div>
      );
    }

    // Mobile version layout with bottom navigation
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