import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NuevaPasswordDialog } from './components/NuevaPasswordDialog';
import { AuthProvider } from './context/AuthContext';
import { CarreraPage } from './pages/Carrera';
import { CarrerasPage } from './pages/Carreras';
import { IngresarPage } from './pages/Ingresar';
import { InicioPage } from './pages/Inicio';
import { PerfilPage } from './pages/Perfil';
import { PerfilPublicoPage } from './pages/PerfilPublico';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route element={<Layout />}>
            <Route path="/carreras" element={<CarrerasPage />} />
            <Route path="/carreras/:id" element={<CarreraPage />} />
            <Route path="/ingresar" element={<IngresarPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/u/:id" element={<PerfilPublicoPage />} />
            <Route path="*" element={<CarrerasPage />} />
          </Route>
        </Routes>
        <NuevaPasswordDialog />
      </HashRouter>
    </AuthProvider>
  );
}
