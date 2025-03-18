'use client';

import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">CoolTyper</h1>
          <p className="text-gray-600 mt-2">Test and improve your typing speed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                isLogin
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                !isLogin
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Create Account
            </button>
          </div>

          {isLogin ? <LoginForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
} 