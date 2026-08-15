import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import authAPI from '@/services/authAPI';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(response.message || 'Password reset link sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-organic-primary hover:bg-organic-dark"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-organic-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
