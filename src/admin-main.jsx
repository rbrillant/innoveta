import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Studio from './pages/Studio.jsx'
import ThemeProvider from './components/ThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider storageKey="admin-theme">
        <Studio />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
