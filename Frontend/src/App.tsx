import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Prevent the browser from restoring the previous route's scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Temporarily disable CSS smooth scrolling so the jump is instant
    // (otherwise it conflicts with React Router's scroll restoration)
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevBehavior;
    });
  }, [pathname]);
  return null;
}
import Home from './pages/Home';
import Events from './pages/Events';
import Members from './pages/Members';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Ministries from './pages/Ministries';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/members" element={<Members />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
