import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from './BackToTop';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
