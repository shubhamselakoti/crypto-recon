import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';
import Report from './pages/Report.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/report/:runId" element={<Report />} />
      </Routes>
    </Layout>
  );
}
