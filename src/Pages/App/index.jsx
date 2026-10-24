import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { RecepcionRoutes } from "./routes/RecepcionRoutes"
import { CocinaRoutes } from "./routes/CocinaRoutes"
import { GeneralRoutes } from './routes/GeneralRoutes';
import { LoginRoutes } from './routes/LoginRoutes';
import { AdminRoutes } from './routes/AdminRoutes';
import { HomeRoutes } from './routes/HomeRoutes';
import { DomiciliarioRoutes } from './routes/DomiciliarioRoutes';
import { PreferencesProvider } from '../../Context/PreferencesContext';
import { UserRoutes } from './routes/UserRoutes';
import { AuthProvider } from '../../Context/AuthContext';
import { CacheProvider } from '../../Context/CacheContext';
import DeprecationBanner from '../../components/DeprecationBanner/DeprecationBanner';

const AppRoutes = () => {
  return (
    <>
      <PreferencesProvider>
        <AuthProvider>
          <CacheProvider>
            <Routes>
              {LoginRoutes()}
              {HomeRoutes()}
              {AdminRoutes()}
              {RecepcionRoutes()}
              {DomiciliarioRoutes()}
              {CocinaRoutes()}
              {UserRoutes()}
              {GeneralRoutes()}
            </Routes>
          </CacheProvider>
        </AuthProvider>
      </PreferencesProvider>
    </>
  );
}

const App = () => {
  return (
    <Router>
      <DeprecationBanner />
      <AppRoutes />
    </Router>
  )
}

export default App