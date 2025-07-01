import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, Store, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/ui/use-toast';

const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-200'}`;

  const handleStoreNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    const hasUnsavedChanges = false; // You can implement a state management to track changes

    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }

    navigate('/');
    toast({
      title: "Leaving Admin Area",
      description: "You've been redirected to the main store.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You've been logged out of the admin panel.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-primary">Uttanjali Admin</h2>
      </div>
      
      {/* User Info Section */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link 
          to="/" 
          onClick={handleStoreNavigation}
          className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Store className="mr-3 h-5 w-5" />
          Back to Store
        </Link>
        
        <div className="my-2 border-b border-gray-200"></div>
        
        <NavLink to="/admin" end className={navLinkClasses}>
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink to="/admin/orders" className={navLinkClasses}>
          <ShoppingCart className="mr-3 h-5 w-5" />
          Orders
        </NavLink>
        <NavLink to="/admin/products" className={navLinkClasses}>
          <Package className="mr-3 h-5 w-5" />
          Products
        </NavLink>
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 