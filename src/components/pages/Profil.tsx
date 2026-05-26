import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const Profil = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    localisation: user?.localisation || '',
    telephone: user?.telephone || '',
    bio: user?.bio || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.localisation.trim()) newErrors.localisation = 'La localisation est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api('/auth/profile', 'PUT', formData);
      if (response.success) {
        showToast('Profil mis à jour avec succès');
        setIsEditing(false);
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('agrinova_user', JSON.stringify(updatedUser));
      } else {
        showToast('Erreur lors de la mise à jour');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      email: user?.email || '',
      localisation: user?.localisation || '',
      telephone: user?.telephone || '',
      bio: user?.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  const userStats = [
    { label: 'Membre depuis', value: '2024', icon: '📅' },
    { label: 'Produits publiés', value: '12', icon: '🌾' },
    { label: 'Transactions', value: '48', icon: '💰' },
    { label: 'Note moyenne', value: '4.8', icon: '⭐' },
  ];

  const menuItems = [
    { icon: '📦', label: 'Mes commandes', action: () => navigate('mes-commandes') },
    { icon: '💬', label: 'Messages', action: () => navigate('chat') },
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '⚙️', label: 'Paramètres', action: () => {} },
    { icon: '❓', label: 'Aide', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('marketplace')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="←" size={20} />
            </button>
            <h1 className="font-bold text-xl text-gray-800">Mon Profil</h1>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon="✏️">
              Modifier
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {formData.nom.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                <Icon name="📷" size={14} />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input label="Nom complet" value={formData.nom} onChange={(e) => handleInputChange('nom', e.target.value)} error={errors.nom} />
                  <Input label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" error={errors.email} />
                  <Input label="Téléphone" value={formData.telephone} onChange={(e) => handleInputChange('telephone', e.target.value)} placeholder="+221 77 123 45 67" />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{formData.nom}</h2>
                  <p className="text-gray-600 mb-2">{formData.email}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon name="📍" size={14} />
                      {formData.localisation}
                    </span>
                    {formData.telephone && (
                      <span className="flex items-center gap-1">
                        <Icon name="📞" size={14} />
                        {formData.telephone}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Parlez-nous de vous et de votre activité..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none transition-colors resize-none"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-gray-800 mb-2">À propos</h3>
                <p className="text-gray-600">
                  {formData.bio || "Pas de bio disponible. Ajoutez une description pour présenter votre activité."}
                </p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>Annuler</Button>
              <Button variant="primary" onClick={handleSave} loading={loading} icon="💾">Sauvegarder</Button>
            </div>
          )}
        </section>

        {!isEditing && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="📍" size={18} />
              Localisation
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">{formData.localisation}</p>
              <p className="text-sm text-gray-500 mt-1">Zone de livraison principale</p>
            </div>
          </section>
        )}

        {!isEditing && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Statistiques</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userStats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Icon name={stat.icon} size={24} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isEditing && (
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-800">{item.label}</span>
                </div>
                <Icon name="→" size={16} className="text-gray-400" />
              </button>
            ))}
          </section>
        )}

        {!isEditing && (
          <section>
            <Button variant="ghost" onClick={handleLogout} className="w-full text-red-500 hover:bg-red-50" icon="🚪">
              Se déconnecter
            </Button>
          </section>
        )}

        {isEditing && (
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <Icon name="ℹ️" size={20} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Informations de profil</h4>
                <p className="text-sm text-blue-600">
                  Vos informations sont visibles par les autres utilisateurs.
                  Seules les informations essentielles sont requises.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export { Profil };
