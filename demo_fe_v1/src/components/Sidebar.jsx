import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar glass ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>DemoApp</h2>
        <button className="close-btn d-md-none" onClick={toggleSidebar}>&times;</button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          Dashboard
        </NavLink>
        <NavLink to="/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          Users
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          Tasks
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
