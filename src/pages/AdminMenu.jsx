import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminMenu() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // =========================
  // EDITAR PRODUCTO
  // =========================

  const [editingProduct, setEditingProduct] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editAllergens, setEditAllergens] = useState('')

  // =========================
  // NUEVO PRODUCTO
  // =========================

  const [showNewProduct, setShowNewProduct] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newAllergens, setNewAllergens] = useState('')
  const [newAvailable, setNewAvailable] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // =========================
  // CARGAR DATOS
  // =========================

  async function loadData() {
    setLoading(true)
    setError('')

    const [
      { data: productsData, error: productsError },
      { data: categoriesData, error: categoriesError }
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true }),

      supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true })
    ])

    if (productsError || categoriesError) {
      console.error(productsError || categoriesError)
      setError('No se han podido cargar los datos.')
      setLoading(false)
      return
    }

    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setLoading(false)
  }

  // =========================
  // SUBIR IMAGEN
  // =========================

  async function uploadProductImage(file) {
    if (!file) {
      return null
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 5 MB.')
    }

    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // =========================
  // DISPONIBILIDAD
  // =========================

  async function toggleAvailability(product) {
    const newAvailability = !product.available

    const { error } = await supabase
      .from('products')
      .update({
        available: newAvailability
      })
      .eq('id', product.id)

    if (error) {
      console.error(error)
      alert('No se pudo cambiar la disponibilidad del producto.')
      return
    }

    setProducts(currentProducts =>
      currentProducts.map(item =>
        item.id === product.id
          ? {
              ...item,
              available: newAvailability
            }
          : item
      )
    )
  }

  // =========================
  // ELIMINAR PRODUCTO
  // =========================

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      console.error(error)
      alert('No se pudo eliminar el producto.')
      return
    }

    setProducts(currentProducts =>
      currentProducts.filter(
        item => item.id !== product.id
      )
    )
  }

  // =========================
  // ABRIR EDITAR
  // =========================

  function openEdit(product) {
    setEditingProduct(product)
    setEditCategory(product.category_id || '')
    setEditName(product.name || '')
    setEditDescription(product.description || '')
    setEditPrice(product.price || '')
    setEditImageUrl(product.image_url || '')
    setEditImageFile(null)

    setEditAllergens(
      Array.isArray(product.allergens)
        ? product.allergens.join(', ')
        : ''
    )
  }

  function closeEdit() {
    setEditingProduct(null)
    setEditCategory('')
    setEditName('')
    setEditDescription('')
    setEditPrice('')
    setEditImageUrl('')
    setEditImageFile(null)
    setEditAllergens('')
  }

  // =========================
  // GUARDAR PRODUCTO EDITADO
  // =========================

  async function saveProduct(event) {
    event.preventDefault()

    const priceNumber = Number(editPrice)

    if (!editCategory) {
      alert('Selecciona una categoría.')
      return
    }

    if (!editName.trim()) {
      alert('El nombre del producto es obligatorio.')
      return
    }

    if (
      !editPrice ||
      Number.isNaN(priceNumber) ||
      priceNumber <= 0
    ) {
      alert('Introduce un precio válido.')
      return
    }

    setSaving(true)

    try {
      let finalImageUrl = editImageUrl || null

      // Si se ha seleccionado una foto nueva,
      // la subimos y sustituimos la URL anterior
      if (editImageFile) {
        finalImageUrl =
          await uploadProductImage(editImageFile)
      }

      const allergensArray = editAllergens.trim()
        ? editAllergens
            .split(',')
            .map(allergen => allergen.trim())
            .filter(Boolean)
        : []

      const updatedProduct = {
        category_id: Number(editCategory),
        name: editName.trim(),
        description: editDescription.trim(),
        price: priceNumber,
        image_url: finalImageUrl,
        allergens: allergensArray
      }

      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', editingProduct.id)

      if (error) {
        throw error
      }

      setProducts(currentProducts =>
        currentProducts.map(product =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...updatedProduct
              }
            : product
        )
      )

      closeEdit()

    } catch (error) {
      console.error(error)

      alert(
        error.message ||
        'No se pudo guardar el producto.'
      )

    } finally {
      setSaving(false)
    }
  }

  // =========================
  // NUEVO PRODUCTO
  // =========================

  function openNewProduct() {
    setNewCategory(categories[0]?.id || '')
    setNewName('')
    setNewDescription('')
    setNewPrice('')
    setNewImageUrl('')
    setNewImageFile(null)
    setNewAllergens('')
    setNewAvailable(true)
    setShowNewProduct(true)
  }

  function closeNewProduct() {
    setShowNewProduct(false)
    setNewImageFile(null)
    setNewImageUrl('')
  }

  // =========================
  // CREAR PRODUCTO
  // =========================

  async function createProduct(event) {
    event.preventDefault()

    const priceNumber = Number(newPrice)

    if (!newCategory) {
      alert('Selecciona una categoría.')
      return
    }

    if (!newName.trim()) {
      alert('El nombre del producto es obligatorio.')
      return
    }

    if (
      !newPrice ||
      Number.isNaN(priceNumber) ||
      priceNumber <= 0
    ) {
      alert('Introduce un precio válido.')
      return
    }

    setSaving(true)

    try {
      let imageUrl = null

      if (newImageFile) {
        imageUrl =
          await uploadProductImage(newImageFile)
      }

      const allergensArray = newAllergens.trim()
        ? newAllergens
            .split(',')
            .map(allergen => allergen.trim())
            .filter(Boolean)
        : []

      const { data, error } = await supabase
        .from('products')
        .insert({
          category_id: Number(newCategory),
          name: newName.trim(),
          description: newDescription.trim(),
          price: priceNumber,
          image_url: imageUrl,
          available: newAvailable,
          allergens: allergensArray
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setProducts(currentProducts => [
        ...currentProducts,
        data
      ])

      closeNewProduct()

    } catch (error) {
      console.error(error)

      alert(
        error.message ||
        'No se pudo crear el producto.'
      )

    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ========================= */}
      {/* CABECERA */}
      {/* ========================= */}

      <header className="bg-gray-950 text-white">
        <div
          className="
            max-w-7xl mx-auto
            px-6 py-6
            flex justify-between items-center
          "
        >
          <div>
            <p className="text-orange-500 font-bold text-sm">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl font-bold">
              Gestión de carta
            </h1>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="
              border border-gray-600
              px-4 py-2
              rounded-xl
              hover:bg-gray-800
              cursor-pointer
            "
          >
            ← Volver
          </button>
        </div>
      </header>

      {/* ========================= */}
      {/* CONTENIDO */}
      {/* ========================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div
          className="
            flex
            justify-between
            items-center
            mb-7
          "
        >
          <div>
            <h2 className="text-2xl font-bold">
              Productos
            </h2>

            <p className="text-gray-500 mt-1">
              Gestiona los productos disponibles en la carta
            </p>
          </div>

          <button
            onClick={openNewProduct}
            className="
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-bold
              px-5 py-3
              rounded-xl
              cursor-pointer
            "
          >
            + Nuevo producto
          </button>
        </div>

        {/* CARGANDO */}

        {loading && (
          <div className="bg-white rounded-2xl p-8 text-center">
            Cargando productos...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className="
              bg-red-100
              text-red-700
              rounded-2xl
              p-5
            "
          >
            {error}
          </div>
        )}

        {/* LISTADO */}

        {!loading && !error && products.length > 0 && (

          <div
            className="
              bg-white
              rounded-2xl
              shadow-sm
              overflow-hidden
            "
          >

            {/* CABECERA TABLA */}

            <div
              className="
                grid
                grid-cols-12
                gap-4
                px-6 py-4
                bg-gray-50
                border-b
                border-gray-200
                font-bold
                text-gray-500
                text-sm
              "
            >
              <div className="col-span-5">
                Producto
              </div>

              <div className="col-span-2">
                Precio
              </div>

              <div className="col-span-2">
                Estado
              </div>

              <div className="col-span-3 text-right">
                Acciones
              </div>
            </div>

            {/* PRODUCTOS */}

            {products.map(product => (

              <div
                key={product.id}
                className="
                  grid
                  grid-cols-12
                  gap-4
                  px-6 py-5
                  items-center
                  border-b
                  border-gray-100
                  last:border-b-0
                "
              >

                {/* PRODUCTO */}

                <div className="col-span-5 flex items-center gap-4">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="
                        w-16
                        h-16
                        rounded-xl
                        object-cover
                        flex-shrink-0
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-16
                        h-16
                        rounded-xl
                        bg-gray-100
                        flex
                        items-center
                        justify-center
                        text-2xl
                        flex-shrink-0
                      "
                    >
                      🍽️
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-lg">
                      {product.name}
                    </p>

                    {product.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>

                </div>

                {/* PRECIO */}

                <div className="col-span-2 font-bold">
                  {Number(product.price).toFixed(2)} €
                </div>

                {/* ESTADO */}

                <div className="col-span-2">

                  {product.available ? (

                    <span
                      className="
                        bg-green-100
                        text-green-700
                        px-3 py-1
                        rounded-full
                        text-sm
                        font-bold
                      "
                    >
                      Disponible
                    </span>

                  ) : (

                    <span
                      className="
                        bg-red-100
                        text-red-700
                        px-3 py-1
                        rounded-full
                        text-sm
                        font-bold
                      "
                    >
                      No disponible
                    </span>

                  )}

                </div>

                {/* ACCIONES */}

                <div
                  className="
                    col-span-3
                    flex
                    justify-end
                    gap-2
                  "
                >

                  <button
                    onClick={() => openEdit(product)}
                    className="
                      border
                      border-gray-300
                      px-3 py-2
                      rounded-lg
                      hover:bg-gray-100
                      cursor-pointer
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      toggleAvailability(product)
                    }
                    className={`
                      border
                      px-3 py-2
                      rounded-lg
                      cursor-pointer
                      font-medium
                      ${
                        product.available
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }
                    `}
                  >
                    {product.available
                      ? 'Desactivar'
                      : 'Activar'}
                  </button>

                  <button
                    onClick={() => deleteProduct(product)}
                    className="
                      border
                      border-red-300
                      text-red-700
                      px-3 py-2
                      rounded-lg
                      hover:bg-red-100
                      cursor-pointer
                      font-medium
                    "
                  >
                    Eliminar
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div
              className="
                bg-white
                rounded-2xl
                p-10
                text-center
              "
            >
              <p className="font-bold text-xl">
                No hay productos
              </p>

              <p className="text-gray-500 mt-2">
                Añade el primer producto a la carta.
              </p>
            </div>

          )}

      </main>

      {/* ================================================= */}
      {/* EDITAR PRODUCTO */}
      {/* ================================================= */}

      {editingProduct && (

        <div
          className="
            fixed inset-0
            bg-black/50
            flex items-center justify-center
            p-4
            z-50
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-xl
              w-full
              max-w-xl
              p-7
              max-h-[90vh]
              overflow-y-auto
            "
          >

            <div className="mb-6">
              <p className="text-orange-500 font-bold text-sm">
                EDITAR PRODUCTO
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {editingProduct.name}
              </h2>
            </div>

            <form onSubmit={saveProduct}>

              {/* CATEGORÍA */}

              <div className="mb-5">
                <label className="block font-bold mb-2">
                  Categoría
                </label>

                <select
                  value={editCategory}
                  onChange={event =>
                    setEditCategory(event.target.value)
                  }
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    bg-white
                    outline-none
                    focus:border-orange-500
                  "
                >
                  {categories.map(category => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NOMBRE */}

              <div className="mb-5">
                <label className="block font-bold mb-2">
                  Nombre
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={event =>
                    setEditName(event.target.value)
                  }
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div className="mb-5">
                <label className="block font-bold mb-2">
                  Descripción
                </label>

                <textarea
                  value={editDescription}
                  onChange={event =>
                    setEditDescription(event.target.value)
                  }
                  rows="3"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                    resize-none
                  "
                />
              </div>

              {/* PRECIO */}

              <div className="mb-5">
                <label className="block font-bold mb-2">
                  Precio (€)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editPrice}
                  onChange={event =>
                    setEditPrice(event.target.value)
                  }
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />
              </div>

              {/* IMAGEN */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Imagen del producto
                </label>

                {/* FOTO ACTUAL / VISTA PREVIA */}

                {editImageUrl && (

                  <div className="mb-4">

                    <p className="text-sm text-gray-500 mb-2">
                      {editImageFile
                        ? 'Nueva imagen'
                        : 'Imagen actual'}
                    </p>

                    <img
                      src={editImageUrl}
                      alt={editName || 'Producto'}
                      className="
                        w-full
                        h-52
                        object-cover
                        rounded-xl
                        border
                        border-gray-200
                      "
                    />

                  </div>

                )}

                {/* SELECCIONAR IMAGEN */}

                <label
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    border-2
                    border-dashed
                    border-gray-300
                    rounded-xl
                    px-4 py-5
                    cursor-pointer
                    hover:border-orange-500
                    hover:bg-orange-50
                    transition
                  "
                >

                  <span className="text-2xl">
                    📷
                  </span>

                  <span className="font-medium">
                    {editImageUrl
                      ? 'Cambiar imagen'
                      : 'Seleccionar imagen'}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => {
                      const file =
                        event.target.files?.[0]

                      if (!file) {
                        return
                      }

                      if (!file.type.startsWith('image/')) {
                        alert(
                          'Selecciona un archivo de imagen.'
                        )
                        return
                      }

                      if (
                        file.size >
                        5 * 1024 * 1024
                      ) {
                        alert(
                          'La imagen no puede superar los 5 MB.'
                        )
                        return
                      }

                      setEditImageFile(file)

                      setEditImageUrl(
                        URL.createObjectURL(file)
                      )
                    }}
                  />

                </label>

                <p className="text-gray-400 text-sm mt-2">
                  JPG, PNG, WEBP... Máximo 5 MB.
                </p>

              </div>

              {/* ALÉRGENOS */}

              <div className="mb-7">

                <label className="block font-bold mb-2">
                  Alérgenos
                </label>

                <input
                  type="text"
                  value={editAllergens}
                  onChange={event =>
                    setEditAllergens(event.target.value)
                  }
                  placeholder="Ej. gluten, leche, huevo"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />

                <p className="text-gray-400 text-sm mt-1">
                  Separa los alérgenos con comas.
                </p>

              </div>

              {/* BOTONES */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="
                    border border-gray-300
                    px-5 py-3
                    rounded-xl
                    hover:bg-gray-100
                    cursor-pointer
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    bg-orange-500
                    hover:bg-orange-600
                    disabled:bg-orange-300
                    text-white
                    font-bold
                    px-5 py-3
                    rounded-xl
                    cursor-pointer
                  "
                >
                  {saving
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* NUEVO PRODUCTO */}
      {/* ================================================= */}

      {showNewProduct && (

        <div
          className="
            fixed inset-0
            bg-black/50
            flex items-center justify-center
            p-4
            z-50
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-xl
              w-full
              max-w-xl
              p-7
              max-h-[90vh]
              overflow-y-auto
            "
          >

            <div className="mb-6">

              <p className="text-orange-500 font-bold text-sm">
                NUEVO PRODUCTO
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Añadir a la carta
              </h2>

            </div>

            <form onSubmit={createProduct}>

              {/* CATEGORÍA */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Categoría
                </label>

                <select
                  value={newCategory}
                  onChange={event =>
                    setNewCategory(event.target.value)
                  }
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    bg-white
                    outline-none
                    focus:border-orange-500
                  "
                >

                  {categories.length === 0 && (
                    <option value="">
                      No hay categorías
                    </option>
                  )}

                  {categories.map(category => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* NOMBRE */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Nombre
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={event =>
                    setNewName(event.target.value)
                  }
                  placeholder="Ej. Tarta de queso"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />

              </div>

              {/* DESCRIPCIÓN */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Descripción
                </label>

                <textarea
                  value={newDescription}
                  onChange={event =>
                    setNewDescription(event.target.value)
                  }
                  placeholder="Descripción del plato"
                  rows="3"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                    resize-none
                  "
                />

              </div>

              {/* PRECIO */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Precio (€)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newPrice}
                  onChange={event =>
                    setNewPrice(event.target.value)
                  }
                  placeholder="0.00"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />

              </div>

              {/* IMAGEN */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Imagen del producto
                </label>

                <label
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    border-2
                    border-dashed
                    border-gray-300
                    rounded-xl
                    px-4 py-5
                    cursor-pointer
                    hover:border-orange-500
                    hover:bg-orange-50
                    transition
                  "
                >

                  <span className="text-2xl">
                    📷
                  </span>

                  <span className="font-medium">
                    {newImageFile
                      ? 'Cambiar imagen'
                      : 'Seleccionar imagen'}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => {
                      const file =
                        event.target.files?.[0]

                      if (!file) {
                        return
                      }

                      if (!file.type.startsWith('image/')) {
                        alert(
                          'Selecciona un archivo de imagen.'
                        )
                        return
                      }

                      if (
                        file.size >
                        5 * 1024 * 1024
                      ) {
                        alert(
                          'La imagen no puede superar los 5 MB.'
                        )
                        return
                      }

                      setNewImageFile(file)

                      setNewImageUrl(
                        URL.createObjectURL(file)
                      )
                    }}
                  />

                </label>

                <p className="text-gray-400 text-sm mt-2">
                  JPG, PNG, WEBP... Máximo 5 MB.
                </p>

                {/* VISTA PREVIA */}

                {newImageUrl && (

                  <div className="mt-4">

                    <p className="font-bold text-sm mb-2">
                      Vista previa
                    </p>

                    <img
                      src={newImageUrl}
                      alt="Vista previa"
                      className="
                        w-full
                        h-52
                        object-cover
                        rounded-xl
                        border
                        border-gray-200
                      "
                    />

                  </div>

                )}

              </div>

              {/* ALÉRGENOS */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Alérgenos
                </label>

                <input
                  type="text"
                  value={newAllergens}
                  onChange={event =>
                    setNewAllergens(event.target.value)
                  }
                  placeholder="Ej. gluten, leche, huevo"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                  "
                />

                <p className="text-gray-400 text-sm mt-1">
                  Puedes dejarlo vacío.
                </p>

              </div>

              {/* DISPONIBILIDAD */}

              <label
                className="
                  flex items-center gap-3
                  bg-gray-50
                  rounded-xl
                  p-4
                  mb-7
                  cursor-pointer
                "
              >

                <input
                  type="checkbox"
                  checked={newAvailable}
                  onChange={event =>
                    setNewAvailable(
                      event.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

                <div>

                  <p className="font-bold">
                    Producto disponible
                  </p>

                  <p className="text-gray-500 text-sm">
                    Si está marcado, aparecerá en la carta del cliente.
                  </p>

                </div>

              </label>

              {/* BOTONES */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeNewProduct}
                  disabled={saving}
                  className="
                    border border-gray-300
                    px-5 py-3
                    rounded-xl
                    hover:bg-gray-100
                    cursor-pointer
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    bg-orange-500
                    hover:bg-orange-600
                    disabled:bg-orange-300
                    text-white
                    font-bold
                    px-5 py-3
                    rounded-xl
                    cursor-pointer
                  "
                >
                  {saving
                    ? 'Creando...'
                    : 'Crear producto'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminMenu