import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../common/Toast';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toast />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
