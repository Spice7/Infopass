import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import RouterMain from './router/RouterMain.jsx'
import { BrowserRouter } from 'react-router-dom'

import LoginContextProvider from './user/LoginContextProvider';
import GlobalBackground from './pages/GlobalBackground.jsx'

// 프로덕션 환경에서 console 제거
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.table = () => {};
  console.trace = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
  console.groupCollapsed = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.count = () => {};
  console.countReset = () => {};
  console.clear = () => {};
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <GlobalBackground>
        <LoginContextProvider>
          <RouterMain />
        </LoginContextProvider>
      </GlobalBackground>
    </BrowserRouter>
  </StrictMode>
  
)
