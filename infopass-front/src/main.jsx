import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RouterMain from './router/RouterMain'
import { BrowserRouter } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <RouterMain />
    </BrowserRouter>
)
