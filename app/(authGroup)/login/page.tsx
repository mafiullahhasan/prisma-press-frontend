import React from 'react'
import { LoginForm } from '../_components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
        {/* Form Generic Text */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-500">
            Enter your email below to login to your account
          </p>
        </div>
        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  )
}
