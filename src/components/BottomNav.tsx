import { Map, MapPin, Bell, Compass } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { path: '/', icon: Map, label: 'Track' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/places', icon: MapPin, label: 'Places' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border pb-safe z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
