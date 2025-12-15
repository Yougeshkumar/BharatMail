import React, { useState } from 'react';
import { User } from '../types';

interface OnboardingProps {
  onSignUp: (user: User) => void;
  onLogin: (email: string) => void;
  error: string | null;
  defaultToLogin?: boolean;
  onClearError: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSignUp, onLogin, error, defaultToLogin, onClearError }) => {
  const [isLoginMode, setIsLoginMode] = useState(defaultToLogin || false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // For sign-up username
  const [email, setEmail] = useState(''); // For login full email

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (email.trim()) {
        onLogin(email.trim());
      }
    } else {
      if (name.trim() && username.trim()) {
        const fullEmail = `${username.trim().toLowerCase()}@bharatmail.in`;
        const newUser: User = {
          name: name.trim(),
          email: fullEmail,
          avatarUrl: `https://picsum.photos/seed/${username.trim().toLowerCase()}/100/100`
        };
        onSignUp(newUser);
      }
    }
  };
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setName('');
    setUsername('');
    setEmail('');
    onClearError();
  };

  return (
    <div className="h-screen w-screen bg-light-gray dark:bg-navy font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-bharat-orange" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <polyline points="3 7 12 13 21 7" />
            </svg>
            <span className="text-3xl font-semibold text-navy dark:text-light-gray ml-2">Bharat Mail</span>
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-light-gray">{isLoginMode ? 'Log In' : 'Welcome!'}</h1>
          <p className="text-dark-gray dark:text-gray-400 mt-2">{isLoginMode ? 'Log in to access your account.' : 'Create your account to get started.'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-dark-gray dark:text-gray-300 mb-1">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ananya Sharma"
                className="w-full h-12 bg-light-gray dark:bg-gray-700 rounded-lg px-4 text-dark-gray dark:text-light-gray border border-medium-gray dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-bharat-blue"
                required
                autoFocus
              />
            </div>
          )}
           <div className="mb-4">
            <label htmlFor={isLoginMode ? 'email' : 'username'} className="block text-sm font-medium text-dark-gray dark:text-gray-300 mb-1">Email Address</label>
            {isLoginMode ? (
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., ananya.sharma@bharatmail.in"
                className="w-full h-12 bg-light-gray dark:bg-gray-700 rounded-lg px-4 text-dark-gray dark:text-light-gray border border-medium-gray dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-bharat-blue"
                required
                autoFocus
              />
            ) : (
              <div className="flex items-center w-full h-12 bg-light-gray dark:bg-gray-700 rounded-lg border border-medium-gray dark:border-gray-600 focus-within:ring-2 focus-within:ring-bharat-blue">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="flex-grow h-full bg-transparent rounded-l-lg px-4 text-dark-gray dark:text-light-gray outline-none"
                  required
                />
                <span className="px-4 text-dark-gray dark:text-gray-400 bg-medium-gray/50 dark:bg-gray-800 h-full flex items-center rounded-r-lg border-l border-medium-gray dark:border-gray-600">@bharatmail.in</span>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          
          <button type="submit" className="w-full bg-bharat-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg">
            {isLoginMode ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-gray dark:text-gray-400 mt-6">
          {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleMode} className="font-semibold text-bharat-blue hover:underline ml-1">
            {isLoginMode ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;