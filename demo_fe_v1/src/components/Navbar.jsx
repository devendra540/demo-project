import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  return (
    <header className="navbar glass">
      <div className="navbar-left">
        <button className="hamburger" onClick={toggleSidebar}>
          &#9776;
        </button>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
