import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/LoginPage.css';
import { HeaderBase, FooterBase } from "./HeaderFooter";

const getTotalQuantity = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((acc, item) => acc + item.quantity, 0);
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(getTotalQuantity());

  useEffect(() => {
    setTotalQuantity(getTotalQuantity());
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setSignInError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      const decodedToken = parseJwt(accessToken);
      if (decodedToken) {
        login({ username, is_admin: decodedToken.is_admin });
        navigate(decodedToken.is_admin ? '/admin' : '/profile');
      } else {
        console.error('Invalid token');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setSignInError('Echec de connexion. Veuillez réessayer');
    }
    setLoading(false);
  };

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT:', e);
      return null;
    }
  }

  return (
    <div className="wrapper">
      <HeaderBase totalQuantity={totalQuantity} currentPage="login" />
      <div className="main-content">
        <div className="login-container">
          <div className="card">
            <h1>Connection</h1>
            <div className="input-group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
              />
            </div>
            <div className="button-container">
              <button onClick={handleLogin} disabled={loading || !username || !password}>Se connecter</button>
            </div>
            {signInError && <p className="notification error">{signInError}</p>}
            <div className="sign-up-link">
              <p className="sign-up-text">
                Vous n'avez pas de compte ? <span className="sign-up-link-text" onClick={() => navigate('/register')}>Inscrivez-vous ici</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <FooterBase />
    </div>
  );
};

export default LoginPage;




