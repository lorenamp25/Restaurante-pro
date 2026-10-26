import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { supabase } from '../lib/supabase'

function AdminStats() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('No se pudieron cargar las estadísticas.')
      setLoading(false)
      return
    }

    setOrders(data || [])
    setLoading(false)
  }

  // =========================
  // FECHAS
  // =========================

  function startOfDay(date) {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  function endOfDay(date) {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  function getCurrentRange() {
    const now = new Date()

    if (period === 'today') {
      return {
        start: startOfDay(now),
        end: endOfDay(now)
      }
    }

    if (period === '7days') {
      const start = startOfDay(now)
      start.setDate(start.getDate() - 6)

      return {
        start,
        end: endOfDay(now)
      }
    }

    if (period === '30days') {
      const start = startOfDay(now)
      start.setDate(start.getDate() - 29)

      return {
        start,
        end: endOfDay(now)
      }
    }

    return null
  }

  function getPreviousRange() {
    const currentRange = getCurrentRange()

    if (!currentRange) {
      return null
    }

    const start = new Date(currentRange.start)
    const end = new Date(currentRange.end)

    if (period === 'today') {
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)

      return { start, end }
    }

    if (period === '7days') {
      start.setDate(start.getDate() - 7)
      end.setDate(end.getDate() - 7)

      return { start, end }
    }

    if (period === '30days') {
      start.setDate(start.getDate() - 30)
      end.setDate(end.getDate() - 30)

      return { start, end }
    }

    return null
  }

  function ordersInsideRange(range) {
    if (!range) {
      return orders
    }

    return orders.filter(order => {
      const date = new Date(order.created_at)

      return (
        date >= range.start &&
        date <= range.end
      )
    })
  }

  const currentRange = getCurrentRange()
  const previousRange = getPreviousRange()

  const filteredOrders =
    ordersInsideRange(currentRange)

  const previousOrders =
    previousRange
      ? ordersInsideRange(previousRange)
      : []

  // =========================
  // FUNCIONES DE CÁLCULO
  // =========================

  function calculateSales(orderList) {
    return orderList.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    )
  }

  function calculateProducts(orderList) {
    return orderList.reduce(
      (total, order) =>
        total +
        (order.order_items || []).reduce(
          (sum, item) =>
            sum + Number(item.quantity || 0),
          0
        ),
      0
    )
  }

  function calculateAverage(orderList) {
    if (orderList.length === 0) {
      return 0
    }

    return (
      calculateSales(orderList) /
      orderList.length
    )
  }

  // =========================
  // DATOS ACTUALES
  // =========================

  const totalOrders = filteredOrders.length
  const totalSales = calculateSales(filteredOrders)
  const averageTicket =
    calculateAverage(filteredOrders)
  const totalProducts =
    calculateProducts(filteredOrders)

  // =========================
  // DATOS PERIODO ANTERIOR
  // =========================

  const previousTotalOrders =
    previousOrders.length

  const previousTotalSales =
    calculateSales(previousOrders)

  const previousAverageTicket =
    calculateAverage(previousOrders)

  const previousTotalProducts =
    calculateProducts(previousOrders)

  // =========================
  // PORCENTAJES DE CAMBIO
  // =========================

  function calculateChange(current, previous) {
    if (previous === 0) {
      if (current === 0) {
        return 0
      }

      return null
    }

    return (
      ((current - previous) / previous) *
      100
    )
  }

  const salesChange =
    calculateChange(
      totalSales,
      previousTotalSales
    )

  const ordersChange =
    calculateChange(
      totalOrders,
      previousTotalOrders
    )

  const ticketChange =
    calculateChange(
      averageTicket,
      previousAverageTicket
    )

  const productsChange =
    calculateChange(
      totalProducts,
      previousTotalProducts
    )

  // =========================
  // TEXTO COMPARACIÓN
  // =========================

  function getComparisonText() {
    if (period === 'today') {
      return 'vs. ayer'
    }

    if (period === '7days') {
      return 'vs. 7 días anteriores'
    }

    if (period === '30days') {
      return 'vs. 30 días anteriores'
    }

    return ''
  }

  // =========================
  // COMPONENTE COMPARACIÓN
  // =========================

  function Comparison({ value }) {
    if (period === 'all') {
      return null
    }

    if (value === null) {
      return (
        <p className="text-blue-600 text-sm font-semibold mt-2">
          Nuevo · {getComparisonText()}
        </p>
      )
    }

    if (value > 0) {
      return (
        <p className="text-green-600 text-sm font-semibold mt-2">
          ↑ {Math.abs(value).toFixed(1)}% {getComparisonText()}
        </p>
      )
    }

    if (value < 0) {
      return (
        <p className="text-red-600 text-sm font-semibold mt-2">
          ↓ {Math.abs(value).toFixed(1)}% {getComparisonText()}
        </p>
      )
    }

    return (
      <p className="text-gray-400 text-sm font-semibold mt-2">
        = 0% {getComparisonText()}
      </p>
    )
  }

  // =========================
  // PRODUCTOS
  // =========================

  const productSales = {}

  filteredOrders.forEach(order => {
    ;(order.order_items || []).forEach(item => {
      const name =
        item.product_name ||
        `Producto ${item.product_id || ''}`

      if (!productSales[name]) {
        productSales[name] = {
          name,
          quantity: 0,
          revenue: 0
        }
      }

      productSales[name].quantity +=
        Number(item.quantity || 0)

      productSales[name].revenue +=
        Number(item.subtotal || 0)
    })
  })

  // =========================
  // TOP PRODUCTOS
  // =========================

  const topProducts =
    Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

  // =========================
  // PRODUCTO QUE MÁS FACTURA
  // =========================

  const topRevenueProduct =
    Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)[0] || null

  // =========================
  // MEJOR DÍA DE LA SEMANA
  // =========================

  const daysOfWeek = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  const salesByWeekday = {}

  filteredOrders.forEach(order => {
    const date = new Date(order.created_at)
    const dayName =
      daysOfWeek[date.getDay()]

    if (!salesByWeekday[dayName]) {
      salesByWeekday[dayName] = {
        name: dayName,
        sales: 0,
        orders: 0
      }
    }

    salesByWeekday[dayName].sales +=
      Number(order.total || 0)

    salesByWeekday[dayName].orders += 1
  })

  const bestWeekday =
    Object.values(salesByWeekday)
      .sort((a, b) => b.sales - a.sales)[0] || null

  // =========================
  // HORA PUNTA
  // =========================

  const ordersByHour = {}

  filteredOrders.forEach(order => {
    const date = new Date(order.created_at)
    const hour = date.getHours()

    if (!ordersByHour[hour]) {
      ordersByHour[hour] = {
        hour,
        orders: 0,
        sales: 0
      }
    }

    ordersByHour[hour].orders += 1

    ordersByHour[hour].sales +=
      Number(order.total || 0)
  })

  const peakHour =
    Object.values(ordersByHour)
      .sort((a, b) => {
        if (b.orders !== a.orders) {
          return b.orders - a.orders
        }

        return b.sales - a.sales
      })[0] || null

  function formatHourRange(hour) {
    const nextHour = (hour + 1) % 24

    return `${String(hour).padStart(2, '0')}:00–${String(
      nextHour
    ).padStart(2, '0')}:00`
  }

  // =========================
  // ESTADOS
  // =========================

  const pending = filteredOrders.filter(
    order => order.status === 'pending'
  ).length

  const preparing = filteredOrders.filter(
    order => order.status === 'preparing'
  ).length

  const ready = filteredOrders.filter(
    order => order.status === 'ready'
  ).length

  const delivered = filteredOrders.filter(
    order => order.status === 'delivered'
  ).length

  // =========================
  // GRÁFICA
  // =========================

  const salesByDay = {}

  filteredOrders.forEach(order => {
    const date = new Date(order.created_at)

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    if (!salesByDay[dateKey]) {
      salesByDay[dateKey] = {
        dateKey,
        sales: 0,
        orders: 0
      }
    }

    salesByDay[dateKey].sales +=
      Number(order.total || 0)

    salesByDay[dateKey].orders += 1
  })

  const salesChartData =
    Object.values(salesByDay)
      .sort((a, b) =>
        a.dateKey.localeCompare(b.dateKey)
      )
      .map(item => {
        const [, month, day] =
          item.dateKey.split('-')

        return {
          ...item,
          date: `${day}/${month}`,
          sales: Number(
            item.sales.toFixed(2)
          )
        }
      })

  // =========================
  // TEXTOS
  // =========================

  function getPeriodText() {
    if (period === 'today') {
      return 'Hoy'
    }

    if (period === '7days') {
      return 'Últimos 7 días'
    }

    if (period === '30days') {
      return 'Últimos 30 días'
    }

    return 'Todo el histórico'
  }

  // =========================
  // TOOLTIP
  // =========================

  function CustomTooltip({
    active,
    payload,
    label
  }) {
    if (
      active &&
      payload &&
      payload.length
    ) {
      const data = payload[0].payload

      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-3">

          <p className="font-bold">
            {label}
          </p>

          <p className="text-orange-600 font-bold mt-1">
            {Number(data.sales).toFixed(2)} €
          </p>

          <p className="text-gray-500 text-sm">
            {data.orders}{' '}
            {data.orders === 1
              ? 'pedido'
              : 'pedidos'}
          </p>

        </div>
      )
    }

    return null
  }

  // =========================
  // CARGANDO
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">
          Cargando estadísticas...
        </p>
      </div>
    )
  }

  // =========================
  // PÁGINA
  // =========================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* CABECERA */}

      <header className="bg-gray-950 text-white">

        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">

          <div>
            <p className="text-orange-500 font-bold text-sm">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl font-bold">
              Estadísticas
            </h1>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="border border-gray-600 px-4 py-2 rounded-xl hover:bg-gray-800 cursor-pointer"
          >
            ← Volver
          </button>

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* FILTROS */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

          <div>
            <h2 className="text-2xl font-bold">
              Resumen de ventas
            </h2>

            <p className="text-gray-500 mt-1">
              {getPeriodText()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-1 shadow-sm flex flex-wrap gap-1">

            {[
              ['today', 'Hoy'],
              ['7days', '7 días'],
              ['30days', '30 días'],
              ['all', 'Todo']
            ].map(([value, label]) => (

              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`
                  px-4 py-2
                  rounded-lg
                  font-medium
                  cursor-pointer
                  transition
                  ${
                    period === value
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {label}
              </button>

            ))}

          </div>

        </div>

        {/* TARJETAS PRINCIPALES */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500">
              Ventas
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalSales.toFixed(2)} €
            </p>

            <Comparison value={salesChange} />

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500">
              Pedidos
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalOrders}
            </p>

            <Comparison value={ordersChange} />

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500">
              Ticket medio
            </p>

            <p className="text-3xl font-bold mt-2">
              {averageTicket.toFixed(2)} €
            </p>

            <Comparison value={ticketChange} />

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500">
              Productos vendidos
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalProducts}
            </p>

            <Comparison value={productsChange} />

          </div>

        </div>

        {/* ESTADÍSTICAS RESTAURANTE */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* PRODUCTO QUE MÁS FACTURA */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-gray-500 font-medium">
                Producto que más factura
              </p>

              <span className="text-3xl">
                💰
              </span>

            </div>

            {topRevenueProduct ? (
              <>
                <p className="text-2xl font-bold mt-4">
                  {topRevenueProduct.name}
                </p>

                <p className="text-orange-600 font-bold mt-2">
                  {topRevenueProduct.revenue.toFixed(2)} €
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  {topRevenueProduct.quantity} uds. vendidas
                </p>
              </>
            ) : (
              <p className="text-gray-400 mt-4">
                Sin datos
              </p>
            )}

          </div>

          {/* MEJOR DÍA */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-gray-500 font-medium">
                Mejor día de la semana
              </p>

              <span className="text-3xl">
                📅
              </span>

            </div>

            {bestWeekday ? (
              <>
                <p className="text-2xl font-bold mt-4">
                  {bestWeekday.name}
                </p>

                <p className="text-orange-600 font-bold mt-2">
                  {bestWeekday.sales.toFixed(2)} €
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  {bestWeekday.orders}{' '}
                  {bestWeekday.orders === 1
                    ? 'pedido'
                    : 'pedidos'}
                </p>
              </>
            ) : (
              <p className="text-gray-400 mt-4">
                Sin datos
              </p>
            )}

          </div>

          {/* HORA PUNTA */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <p className="text-gray-500 font-medium">
                Hora punta
              </p>

              <span className="text-3xl">
                🕐
              </span>

            </div>

            {peakHour ? (
              <>
                <p className="text-2xl font-bold mt-4">
                  {formatHourRange(peakHour.hour)}
                </p>

                <p className="text-orange-600 font-bold mt-2">
                  {peakHour.orders}{' '}
                  {peakHour.orders === 1
                    ? 'pedido'
                    : 'pedidos'}
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  {peakHour.sales.toFixed(2)} € facturados
                </p>
              </>
            ) : (
              <p className="text-gray-400 mt-4">
                Sin datos
              </p>
            )}

          </div>

        </div>

        {/* GRÁFICA */}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">

          <div className="mb-6">

            <h2 className="text-xl font-bold">
              📈 Evolución de ventas
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Facturación diaria · {getPeriodText()}
            </p>

          </div>

          {salesChartData.length === 0 ? (

            <div className="h-72 flex items-center justify-center">

              <div className="text-center">

                <p className="text-4xl">
                  📊
                </p>

                <p className="font-bold mt-3">
                  No hay datos
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  No existen ventas en este periodo.
                </p>

              </div>

            </div>

          ) : (

            <div className="w-full h-80">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={salesChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 5,
                    bottom: 5
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value =>
                      `${value} €`
                    }
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#f97316'
                    }}
                    activeDot={{
                      r: 7
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* PARTE INFERIOR */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PRODUCTOS MÁS VENDIDOS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-bold mb-5">
              🏆 Productos más vendidos
            </h2>

            {topProducts.length === 0 ? (

              <div className="py-10 text-center">

                <p className="text-4xl mb-3">
                  📊
                </p>

                <p className="font-bold">
                  No hay ventas
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  No hay pedidos en este periodo.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {topProducts.map(
                  (product, index) => (

                    <div
                      key={product.name}
                      className="flex justify-between items-center border-b border-gray-100 pb-3"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-bold">
                            {product.name}
                          </p>

                          <p className="text-gray-400 text-sm">
                            {product.revenue.toFixed(2)} €
                          </p>

                        </div>

                      </div>

                      <div className="font-bold">
                        {product.quantity} uds.
                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* ESTADO DE PEDIDOS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-bold mb-5">
              📦 Estado de los pedidos
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between items-center bg-yellow-50 rounded-xl p-4">

                <span className="font-bold">
                  🟡 Pendientes
                </span>

                <span className="text-2xl font-bold">
                  {pending}
                </span>

              </div>

              <div className="flex justify-between items-center bg-blue-50 rounded-xl p-4">

                <span className="font-bold">
                  🔵 Preparando
                </span>

                <span className="text-2xl font-bold">
                  {preparing}
                </span>

              </div>

              <div className="flex justify-between items-center bg-green-50 rounded-xl p-4">

                <span className="font-bold">
                  🟢 Listos
                </span>

                <span className="text-2xl font-bold">
                  {ready}
                </span>

              </div>

              <div className="flex justify-between items-center bg-gray-100 rounded-xl p-4">

                <span className="font-bold">
                  ⚫ Entregados
                </span>

                <span className="text-2xl font-bold">
                  {delivered}
                </span>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default AdminStats