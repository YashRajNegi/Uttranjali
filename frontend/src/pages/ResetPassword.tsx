import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import authAPI from '@/services/authAPI';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, password);
      setSuccess(response.message || 'Password has been reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
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
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your new password below
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
                <br />
                Redirecting to login...
              </div>
            )}

            {!token && !error && (
              <div className="bg-yellow-50 text-yellow-600 p-3 rounded-md text-sm mb-4">
                No reset token provided. Please use the link sent to your email.
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <PasswordInput
                  id="password"
                  name="password"
                  label="New Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-organic-primary hover:bg-organic-dark"
              disabled={loading || !token || !!success}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
