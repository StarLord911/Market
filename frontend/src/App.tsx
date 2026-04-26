import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import NewListing from './pages/NewListing';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import Users from './pages/Users';
import Favorites from './pages/Favorites';
import EditListing from './pages/EditListing';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="listings" element={<Listings />} />
          <Route path="listings/new" element={<NewListing />} />
          <Route path="listings/:id" element={<ListingDetail />} />
          <Route path="listings/:id/edit" element={<EditListing />} />
          <Route path="register" element={<Register />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserProfile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
