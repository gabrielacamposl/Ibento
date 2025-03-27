const Layout = ({ children }) => {
  return (
    <div>
      <header>Mi Encabezado</header>
      <main>{children}</main>
      <footer>Mi Pie de Página</footer>
    </div>
  );
};

export default Layout;