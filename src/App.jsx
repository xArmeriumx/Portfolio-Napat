import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/nav/Navbar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ProjectList from './pages/ProjectList.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Footer from "./components/layout/Footer";



import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="app">
      <div className="gridBg" />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </main>
    </div>
  )
}
