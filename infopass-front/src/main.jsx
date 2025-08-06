import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import RouterMain from './router/RouterMain.jsx'
import { BrowserRouter } from 'react-router-dom'

import LoginContextProvider from './user/LoginContextProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LoginContextProvider>
        <RouterMain />
      </LoginContextProvider>
    </BrowserRouter>
  </StrictMode>
  
)
