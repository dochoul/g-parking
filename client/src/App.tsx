import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import MyApplications from './pages/MyApplications';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav-bar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">Gabia @ 주차권</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">신청</Link>
            <Link to="/my" className="nav-link">내 신청</Link>
            <Link to="/admin" className="nav-link">관리자</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/my" element={<MyApplications />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
