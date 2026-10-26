import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminCategories() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error(error)
      setError('No se pudieron cargar las categorías.')
      setLoading(false)
      return
    }

    setCategories(data || [])
    setLoading(false)
  }

  async function createCategory(event) {
    event.preventDefault()

    if (!newName.trim()) {
      alert('Escribe el nombre de la categoría.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: newName.trim()
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert('No se pudo crear la categoría.')
      setSaving(false)
      return
    }

    setCategories(current => [...current, data])
    setNewName('')
    setSaving(false)
  }

  function openEdit(category) {
    setEditingCategory(category)
    setEditName(category.name)
  }

  function closeEdit() {
    setEditingCategory(null)
    setEditName('')
  }

  async function saveCategory(event) {
    event.preventDefault()

    if (!editName.trim()) {
      alert('El nombre de la categoría es obligatorio.')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('categories')
      .update({
        name: editName.trim()
      })
      .eq('id', editingCategory.id)

    if (error) {
      console.error(error)
      alert('No se pudo modificar la categoría.')
      setSaving(false)
      return
    }

    setCategories(current =>
      current.map(category =>
        category.id === editingCategory.id
          ? { ...category, name: editName.trim() }
          : category
      )
    )

    setSaving(false)
    closeEdit()
  }

  async function deleteCategory(category) {
    // Primero comprobamos si tiene productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', category.id)
      .limit(1)

    if (productsError) {
      console.error(productsError)
      alert('No se pudo comprobar la categoría.')
      return
    }

    if (products && products.length > 0) {
      alert(
        `No puedes eliminar "${category.name}" porque todavía tiene productos asociados.`
      )
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.error(error)
      alert('No se pudo eliminar la categoría.')
      return
    }

    setCategories(current =>
      current.filter(item => item.id !== category.id)
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* CABECERA */}
      <header className="bg-gray-950 text-white">
        <div className="
          max-w-5xl mx-auto
          px-6 py-6
          flex justify-between items-center
        ">
          <div>
            <p className="text-orange-500 font-bold text-sm">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl font-bold">
              Gestión de categorías
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

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* NUEVA CATEGORÍA */}
        <div className="
          bg-white
          rounded-2xl
          shadow-sm
          p-6
          mb-8
        ">
          <h2 className="text-xl font-bold mb-1">
            Nueva categoría
          </h2>

          <p className="text-gray-500 mb-5">
            Añade una nueva sección a la carta.
          </p>

          <form
            onSubmit={createCategory}
            className="flex gap-3"
          >
            <input
              type="text"
              value={newName}
              onChange={event =>
                setNewName(event.target.value)
              }
              placeholder="Ej. Bebidas"
              className="
                flex-1
                border border-gray-300
                rounded-xl
                px-4 py-3
                outline-none
                focus:border-orange-500
              "
            />

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
              {saving ? 'Creando...' : '+ Crear'}
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="
          bg-white
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          <div className="
            px-6 py-5
            border-b border-gray-200
          ">
            <h2 className="text-xl font-bold">
              Categorías
            </h2>

            <p className="text-gray-500 mt-1">
              {categories.length} categorías creadas
            </p>
          </div>

          {loading && (
            <div className="p-8 text-center">
              Cargando categorías...
            </div>
          )}

          {error && (
            <div className="p-6 text-red-600">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            categories.map(category => (
              <div
                key={category.id}
                className="
                  px-6 py-5
                  border-b border-gray-100
                  last:border-b-0
                  flex
                  justify-between
                  items-center
                "
              >
                <div>
                  <p className="font-bold text-lg">
                    {category.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    ID: {category.id}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(category)}
                    className="
                      border border-gray-300
                      px-4 py-2
                      rounded-lg
                      hover:bg-gray-100
                      cursor-pointer
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      deleteCategory(category)
                    }
                    className="
                      border border-red-300
                      text-red-700
                      px-4 py-2
                      rounded-lg
                      hover:bg-red-100
                      cursor-pointer
                    "
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="p-10 text-center">
                <p className="font-bold text-xl">
                  No hay categorías
                </p>

                <p className="text-gray-500 mt-2">
                  Crea la primera categoría.
                </p>
              </div>
            )}
        </div>
      </main>

      {/* VENTANA EDITAR */}
      {editingCategory && (
        <div className="
          fixed inset-0
          bg-black/50
          flex items-center justify-center
          p-4 z-50
        ">
          <div className="
            bg-white
            rounded-2xl
            shadow-xl
            w-full
            max-w-md
            p-7
          ">
            <p className="text-orange-500 font-bold text-sm">
              EDITAR CATEGORÍA
            </p>

            <h2 className="text-2xl font-bold mt-1 mb-6">
              {editingCategory.name}
            </h2>

            <form onSubmit={saveCategory}>
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
                  mb-7
                "
              />

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

    </div>
  )
}

export default AdminCategories