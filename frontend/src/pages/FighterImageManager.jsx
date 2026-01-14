import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FighterImage from '../components/FighterImage';

const FighterImageManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadFighters();
  }, [user, navigate]);

  const loadFighters = async (searchTerm = '') => {
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await api.get(`/fighters${params}`);
      setFighters(res.data.data);
    } catch (error) {
      console.error('Error loading fighters:', error);
      setMessage({ type: 'error', text: 'Error al cargar peleadores' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadFighters(search);
  };

  const handleImageUpload = async (fighterId, file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'La imagen no debe superar 5MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Solo se permiten imágenes JPEG, PNG o WebP' });
      return;
    }

    setUploading(fighterId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.post(`/fighters/${fighterId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Imagen subida exitosamente' });
      loadFighters(search);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al subir imagen' });
    } finally {
      setUploading(null);
    }
  };

  const handleImageDelete = async (fighterId) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      await api.delete(`/fighters/${fighterId}/image`);
      setMessage({ type: 'success', text: 'Imagen eliminada exitosamente' });
      loadFighters(search);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar imagen' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">📸 Gestión de Imágenes</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Buscar Peleador</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre del peleador..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700"
            >
              Buscar
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  loadFighters('');
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">Peleadores ({fighters.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">Cargando peleadores...</div>
          ) : fighters.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No se encontraron peleadores</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {fighters.map((fighter) => (
                <div key={fighter.fighter_id} className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-purple-500 transition">
                  <div className="flex flex-col items-center">
                    <FighterImage
                      imagePath={fighter.image_path}
                      fighterName={fighter.fighter_name}
                      size="xl"
                    />
                    <h3 className="mt-4 text-xl font-bold text-gray-800 text-center">
                      {fighter.fighter_name}
                    </h3>
                    {fighter.nickname && (
                      <p className="text-sm text-gray-600 italic">"{fighter.nickname}"</p>
                    )}
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      <p>{fighter.country_name || 'País desconocido'}</p>
                      <p className="font-semibold">
                        {fighter.total_wins}-{fighter.total_losses}-{fighter.total_draws}
                      </p>
                    </div>

                    <div className="mt-4 w-full space-y-2">
                      <label className="block">
                        <span className="sr-only">Subir imagen</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(fighter.fighter_id, file);
                            e.target.value = '';
                          }}
                          disabled={uploading === fighter.fighter_id}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-purple-50 file:text-purple-700
                            hover:file:bg-purple-100
                            disabled:opacity-50"
                        />
                      </label>

                      {fighter.image_path && (
                        <button
                          onClick={() => handleImageDelete(fighter.fighter_id)}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                        >
                          Eliminar Imagen
                        </button>
                      )}

                      {uploading === fighter.fighter_id && (
                        <div className="text-center text-sm text-gray-600">
                          Subiendo...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FighterImageManager;
