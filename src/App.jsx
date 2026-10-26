import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminMenu from './pages/AdminMenu'
import AdminCategories from './pages/AdminCategories'
import AdminStats from './pages/AdminStats'
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* CLIENTE */}
        <Route path="/" element={<Menu />} />
        <Route path="/pedido" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/pedido-confirmado/:id"
          element={<OrderSuccess />}
        />

        {/* LOGIN ADMINISTRACIÓN */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* PANEL DE COCINA */}
        <Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/admin/cocina"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin/carta"
  element={
    <ProtectedRoute>
      <AdminMenu />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/categorias"
  element={
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/estadisticas"
  element={
    <ProtectedRoute>
      <AdminStats />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  )
}

export default App