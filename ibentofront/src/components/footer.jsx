function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "1.0.0"; // You can import this from package.json if needed

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and description */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="font-semibold text-gray-800">Ibento</span>
            </div>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Conectando personas a través de eventos
            </p>
          </div>

          {/* System info */}
          <div className="flex flex-col items-center md:items-end space-y-1 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Versión {version}</span>
              <span>•</span>
              <span>© {currentYear} Ibento</span>
            </div>
            <p className="text-xs">
              Desarrollado con ❤️ para la comunidad
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;