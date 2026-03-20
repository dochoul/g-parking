import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import MyApplications from './pages/MyApplications';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/my" element={<MyApplications />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
