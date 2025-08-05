import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import RouterMain from './router/RouterMain'
import { BrowserRouter } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <RouterMain />
    </BrowserRouter>
=======
import App from './App.jsx'
import RouterMain from './router/RouterMain.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RouterMain />
    </BrowserRouter>
  </StrictMode>,
>>>>>>> be78e4b23dba9ebd0552f07c3e3e8ddfde1f4e77
)
