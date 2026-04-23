import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegistrationForms from './pages/RegistrationForms.jsx'
import Pricing from './pages/Pricing.jsx'
import Product from './pages/Product.jsx'
import Features from './pages/Features.jsx'
import Services from './pages/Services.jsx'
import Resources from './pages/Resources.jsx'
import Integrations from './pages/Integrations.jsx'
import UserPage from './pages/UserPage.jsx'

function getCurrentPath() {
  const path = window.location.pathname || '/'
  return path === '' ? '/' : path
}

export default function App() {
  const [activePath, setActivePath] = useState(getCurrentPath)

  useEffect(() => {
    const handlePopState = () => {
      setActivePath(getCurrentPath())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateTo(path) {
    if (path === activePath) {
      return
    }

    window.history.pushState({}, '', path)
    setActivePath(path)
  }

  if (activePath === '/') {
    return (
      <LandingPage
        activePath={activePath}
        onNavigate={navigateTo}
      />
    )
  }

  if (activePath === '/login') {
    return (
      <LoginPage
        activePath={activePath}
        onNavigate={navigateTo}
      />
    )
  }

  if (activePath === '/pricing') {
    return (
      <Pricing
        activePath={activePath}
        onNavigate={navigateTo}
      />
    )
  }

  if (activePath === '/product') {
    return <Product activePath={activePath} onNavigate={navigateTo} />
  }

  if (activePath === '/features') {
    return <Features activePath={activePath} onNavigate={navigateTo} />
  }

  if (activePath === '/services') {
    return <Services activePath={activePath} onNavigate={navigateTo} />
  }

  if (activePath === '/resources') {
    return <Resources activePath={activePath} onNavigate={navigateTo} />
  }

  if (activePath === '/integrations') {
    return <Integrations activePath={activePath} onNavigate={navigateTo} />
  }

  if (activePath === '/dashboard') {
    return <UserPage activePath={activePath} onNavigate={navigateTo} />
  }

  return (
    <RegistrationForms
      activePath={activePath}
      onNavigate={navigateTo}
    />
  )
}
