export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-8">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
        Volver al inicio
      </a>
      <div className="mt-8">
        <img src="/404-illustration.svg" alt="Ilustración 404" className="w-64 mx-auto opacity-80"/>
      </div>
    </div>
  );
}
