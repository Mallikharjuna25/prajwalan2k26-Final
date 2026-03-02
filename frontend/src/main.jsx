import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Toast from './components/common/Toast'

// Configure future flags to silence console warnings
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter {...routerOptions}>
      <AuthProvider>
        <App />
        <Toast />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
