import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LogIn, Mail, Lock, AlertCircle, Info, Play, Globe, Shield } from 'lucide-react'
import { isDemoMode } from '../../lib/supabase'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithMockAuth, error } = useAuth()

  // Auto-login in demo mode
  useEffect(() => {
    if (isDemoMode) {
      // Auto-login as agent in demo mode
      setTimeout(() => {
        loginWithMockAuth('mohamed.hasanen@company.com')
      }, 1000)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (err) {
      // Error is handled by useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleMockLogin = (userEmail: string) => {
    setIsLoading(true)
    try {
      loginWithMockAuth(userEmail)
    } catch (err) {
      console.error('Mock login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
  }

  if (isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">ServiceDesk Pro</h2>
            <p className="mt-2 text-sm text-gray-600">Loading demo environment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">ServiceDesk Pro</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Globe className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Demo Mode Active
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Supabase environment variables not configured. Running in demo mode with sample data.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleMockLogin('admin@company.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-purple-600 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Demo Admin Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockLogin('mohamed.hasanen@company.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Demo Agent Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockLogin('mary.bisch@customer.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-green-600 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Demo Customer Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Access - Only show if not in demo mode */}
          {!isDemoMode && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Quick Demo Access
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Try the app instantly with demo data, or use Supabase Auth for full functionality.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleMockLogin('admin@company.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-purple-600 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Demo Admin Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockLogin('mohamed.hasanen@company.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Demo Agent Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockLogin('mary.bisch@customer.com')}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm bg-green-600 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Demo Customer Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDemoMode && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                      {error.includes('Demo user not found') && (
                        <div className="mt-3 space-y-2">
                          <button
                            type="button"
                            onClick={() => handleMockLogin('admin@company.com')}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-purple-600 text-sm font-medium text-white hover:bg-purple-700"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Use Demo Mode (Admin)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMockLogin('mohamed.hasanen@company.com')}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Use Demo Mode (Agent)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMockLogin('mary.bisch@customer.com')}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-green-600 text-sm font-medium text-white hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Use Demo Mode (Customer)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in with Supabase Auth
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}

          {!isDemoMode && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or fill credentials for Supabase Auth</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('admin@company.com', 'password123')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Fill Admin Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('mohamed.hasanen@company.com', 'password123')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fill Agent Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('mary.bisch@customer.com', 'password123')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fill Customer Credentials
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need to create Supabase Auth users? Check the{' '}
                  <a 
                    href="/SETUP_INSTRUCTIONS.md" 
                    target="_blank" 
                    className="text-blue-600 hover:text-blue-500"
                  >
                    setup instructions
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}