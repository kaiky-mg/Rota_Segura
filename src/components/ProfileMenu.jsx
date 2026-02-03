import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from '../authConfig';

const ProfileMenu = ({ isOpen, onClose }) => {
  const { instance, accounts } = useMsal();
  const usuarioLogado = accounts[0] || {};
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    if (!isOpen || !usuarioLogado.username || profilePhoto) return;

    const fetchProfilePhoto = async () => {
      try {
        const tokenResponse = await instance.acquireTokenSilent({ ...loginRequest, account: usuarioLogado });
        const photoResponse = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
          headers: { 'Authorization': `Bearer ${tokenResponse.accessToken}` }
        });
        if (photoResponse.ok) {
          setProfilePhoto(URL.createObjectURL(await photoResponse.blob()));
        }
      } catch (error) {
        console.error("Não foi possível buscar a foto de perfil:", error);
      }
    };
    fetchProfilePhoto();
  }, [instance, usuarioLogado, isOpen, profilePhoto]);

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', // Adicionado para posicionar o botão de fechar
          background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          width: '90%', maxWidth: 320, padding: '20px', textAlign: 'center'
        }}
      >
        {/* Botão de Fechar (X) */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#888',
            lineHeight: 1,
            padding: 5
          }}
        >
          &times;
        </button>

        <img 
          src={profilePhoto || 'https://via.placeholder.com/96'} 
          alt="Perfil" 
          style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 15px auto', border: '3px solid #eee' }} 
        />
        <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: 20 }}>{usuarioLogado.name}</h3>
        <p style={{ margin: '5px 0 20px 0', fontSize: '14px', color: '#666' }}>{usuarioLogado.username}</p>
        
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 16 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;