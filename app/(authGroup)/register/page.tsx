import React from 'react'
import RegisterForm from '../_components/RegisterForm'

export default function RegisterPage() {
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
          {/* Form Generic Text */} 
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">
              Enter your information below to create your account
            </p>
          </div>
          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
