import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ProtectedRoute } from '../components/ProtectedRoute';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      path: '/orders'
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: '/wishlist'
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
      path: '/addresses'
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      icon: CreditCard,
      path: '/payments'
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
          <div className="container-custom">
            {/* User Info Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-organic-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-organic-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Link key={item.id} to={item.path}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-organic-primary/10">
                            <item.icon className="h-6 w-6 text-organic-primary" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="mt-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile; 