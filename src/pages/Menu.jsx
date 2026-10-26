import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

function Menu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [addedProduct, setAddedProduct] = useState(null)

  const {
    addToCart,
    totalItems,
    totalPrice
  } = useCart()

  const navigate = useNavigate()

  useEffect(() => {
    getProducts()
  }, [])

  async function getProducts() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('available', true)
      .order('id')

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      setProducts(data || [])
    }

    setLoading(false)
  }

  // =========================
  // CATEGORÍAS
  // =========================

  const categories = Array.from(
    new Map(
      products
        .filter(product => product.categories)
        .map(product => [
          product.categories.id,
          product.categories
        ])
    ).values()
  )

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          product =>
            String(product.categories?.id) ===
            String(selectedCategory)
        )

  // =========================
  // AÑADIR AL CARRITO
  // =========================

  function handleAddToCart(product) {
    addToCart(product)

    setAddedProduct(product.id)

    setTimeout(() => {
      setAddedProduct(null)
    }, 800)
  }

  // =========================
  // CARGANDO
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            🍽️
          </div>

          <p className="text-xl font-bold">
            Preparando la carta...
          </p>

          <p className="text-gray-500 mt-2">
            Un momento, por favor
          </p>

        </div>

      </div>
    )
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

        <div className="bg-white shadow-sm p-7 rounded-2xl max-w-md w-full text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h2 className="font-bold text-xl">
            No hemos podido cargar la carta
          </h2>

          <p className="mt-2 text-gray-500">
            Inténtalo de nuevo en unos segundos.
          </p>

          <button
            onClick={getProducts}
            className="
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-bold
              px-5
              py-3
              rounded-xl
              mt-5
              cursor-pointer
              transition
            "
          >
            Volver a intentar
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      {/* =========================
          CABECERA
      ========================= */}

      <header className="bg-gray-950 text-white">

        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">

          <div className="flex items-center gap-2">

            <span className="text-2xl">
              🍽️
            </span>

            <p className="text-orange-500 font-bold text-sm tracking-wide">
              RESTAURANTE PRO
            </p>

          </div>

          <h1 className="text-4xl md:text-5xl font-bold mt-4">
            Nuestra carta
          </h1>

          <p className="text-gray-400 mt-3 text-lg max-w-xl">
            Elige tus platos favoritos y prepara tu pedido.
          </p>

        </div>

      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">

        {/* TÍTULO */}

        <div className="flex justify-between items-end gap-4 mb-6">

          <div>

            <p className="text-orange-500 font-bold text-sm">
              NUESTRA SELECCIÓN
            </p>

            <h2 className="text-3xl font-bold mt-1">
              Menú
            </h2>

          </div>

          <span className="text-gray-500 text-sm">
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1
              ? 'producto'
              : 'productos'}
          </span>

        </div>

        {/* =========================
            FILTROS DE CATEGORÍAS
        ========================= */}

        <div
  className="mb-8 overflow-x-auto"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  }}
>

          <div className="flex gap-2 min-w-max pb-1">

            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-5
                py-2.5
                rounded-full
                font-semibold
                transition
                cursor-pointer
                ${
                  selectedCategory === 'all'
                    ? 'bg-gray-950 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Todos
            </button>

            {categories.map(category => (

              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(category.id)
                }
                className={`
                  px-5
                  py-2.5
                  rounded-full
                  font-semibold
                  transition
                  cursor-pointer
                  ${
                    String(selectedCategory) ===
                    String(category.id)
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {category.name}
              </button>

            ))}

          </div>

        </div>

        {/* =========================
            PRODUCTOS
        ========================= */}

        {filteredProducts.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">

            <p className="text-5xl">
              🍽️
            </p>

            <h3 className="text-xl font-bold mt-4">
              No hay productos
            </h3>

            <p className="text-gray-500 mt-2">
              No hay platos disponibles en esta categoría.
            </p>

          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >

            {filteredProducts.map(product => (

              <article
                key={product.id}
                className="
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  shadow-sm
                  hover:shadow-xl
                  transition
                  duration-300
                  flex
                  flex-col
                  group
                "
              >

                {/* IMAGEN */}

                <div className="relative overflow-hidden">

                  {product.image_url ? (

                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="
                        w-full
                        h-56
                        object-cover
                        group-hover:scale-105
                        transition
                        duration-500
                      "
                    />

                  ) : (

                    <div
  className="
    h-40
    sm:h-56
    bg-gray-200
    flex
    flex-col
    items-center
    justify-center
    text-gray-400
  "
>

                      <span className="text-4xl">
                        🍽️
                      </span>

                      <span className="text-sm font-semibold mt-2">
                        Imagen no disponible
                      </span>

                    </div>

                  )}

                  {/* CATEGORÍA SOBRE FOTO */}

                  {product.categories?.name && (

                    <span
                      className="
                        absolute
                        top-4
                        left-4
                        bg-white/95
                        backdrop-blur
                        text-gray-900
                        text-xs
                        font-bold
                        px-3
                        py-1.5
                        rounded-full
                        shadow-sm
                      "
                    >
                      {product.categories.name}
                    </span>

                  )}

                </div>

                {/* INFORMACIÓN */}

                <div className="p-5 flex flex-col flex-1">

                  <h3 className="text-xl font-bold">
                    {product.name}
                  </h3>

                  <p className="text-gray-500 mt-2 leading-relaxed flex-1">
                    {product.description ||
                      'Descubre uno de nuestros platos.'}
                  </p>

                  {/* ALÉRGENOS */}

                  {product.allergens?.length > 0 && (

                    <div className="mt-4">

                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        ALÉRGENOS
                      </p>

                      <div className="flex flex-wrap gap-1.5">

                        {product.allergens.map(
                          (allergen, index) => (

                            <span
                              key={`${allergen}-${index}`}
                              className="
                                bg-gray-100
                                text-gray-600
                                text-xs
                                px-2.5
                                py-1
                                rounded-full
                              "
                            >
                              {allergen}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* PRECIO Y BOTÓN */}

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">

                    <div>

                      <p className="text-xs text-gray-400">
                        Precio
                      </p>

                      <span className="text-2xl font-bold">
                        {Number(product.price).toFixed(2)} €
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        handleAddToCart(product)
                      }
                      className={`
                        h-12
                        rounded-xl
                        px-4
                        text-white
                        font-bold
                        transition
                        cursor-pointer
                        flex
                        items-center
                        gap-2
                        ${
                          addedProduct === product.id
                            ? 'bg-green-600'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }
                      `}
                    >

                      {addedProduct === product.id ? (
                        <>
                          <span>✓</span>
                          <span>Añadido</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">
                            +
                          </span>

                          <span>
                            Añadir
                          </span>
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

        {/* =========================
            CARRITO FLOTANTE
        ========================= */}

        {totalItems > 0 && (

          <div
            className="
              fixed
              bottom-4
              left-1/2
              -translate-x-1/2
              w-[calc(100%-1.5rem)]
              max-w-2xl
              bg-gray-950
              text-white
              rounded-2xl
              shadow-2xl
              p-3
              sm:p-4
              flex
              justify-between
              items-center
              gap-3
              z-50
            "
          >

            <div className="flex items-center gap-3 min-w-0">

              <div
                className="
                  bg-orange-500
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-xl
                  flex-shrink-0
                "
              >
                🛒
              </div>

              <div className="min-w-0">

                <p className="font-bold">
                  {totalItems}{' '}
                  {totalItems === 1
                    ? 'producto'
                    : 'productos'}
                </p>

                <p className="text-gray-400 text-sm">
                  {totalPrice.toFixed(2)} €
                </p>

              </div>

            </div>

            <button
              onClick={() => navigate('/pedido')}
              className="
                bg-orange-500
                hover:bg-orange-600
                px-4
                sm:px-6
                py-3
                rounded-xl
                font-bold
                cursor-pointer
                whitespace-nowrap
                transition
              "
            >
              Ver pedido →
            </button>

          </div>

        )}

      </main>

    </div>
  )
}

export default Menu