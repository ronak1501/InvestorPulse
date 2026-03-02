'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'
import { ShieldCheck, ArrowRight, BarChart3, PieChart } from 'lucide-react'

const initialState = {
    error: null as string | null,
    message: null as string | null
}

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(loginAction, initialState)

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Brand / Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
                <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

                <div className="relative z-10 flex flex-col justify-center p-16 text-white h-full w-full">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                            <BarChart3 className="w-8 h-8 text-cyan-300" />
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight">VRM<span className="text-cyan-300 font-light">Pro</span></span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight mb-8 tracking-tight">
                        Intelligent Wealth <br /> Management
                    </h1>
                    <p className="text-lg text-indigo-200 mb-12 max-w-md leading-relaxed font-medium">
                        Access real-time analytics, investor insights, and predictive panic risk models all in one unified dashboard.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-indigo-50 border border-indigo-800/60 bg-indigo-800/30 p-4 rounded-2xl backdrop-blur-sm max-w-sm border-l-4 border-l-cyan-400">
                            <div className="bg-indigo-900/50 p-2.5 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="font-semibold tracking-wide">Bank-Grade Security</span>
                        </div>
                        <div className="flex items-center gap-4 text-indigo-50 border border-indigo-800/60 bg-indigo-800/30 p-4 rounded-2xl backdrop-blur-sm max-w-sm border-l-4 border-l-purple-400">
                            <div className="bg-indigo-900/50 p-2.5 rounded-xl">
                                <PieChart className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="font-semibold tracking-wide">Advanced Portfolio Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative xl:p-24">
                {/* Mobile brand header */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2 text-indigo-900">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight">VRM<span className="text-indigo-600">Pro</span></span>
                </div>

                <div className="w-full max-w-[420px]">
                    <div className="mb-10 lg:mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome back</h2>
                        <p className="text-gray-500 font-medium">Please enter your credentials to access your account.</p>
                    </div>

                    {state.error && (
                        <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-start shadow-sm">
                            <div className="flex-shrink-0 mr-3">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-medium pt-0.5">{state.error}</span>
                        </div>
                    )}

                    {state.message && (
                        <div className="mb-8 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 flex items-start shadow-sm">
                            <div className="flex-shrink-0 mr-3">
                                <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-medium pt-0.5">{state.message}</span>
                        </div>
                    )}

                    <form className="space-y-6" action={formAction}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center pt-2">
                            <div className="flex h-5 items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-colors cursor-pointer"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="remember-me" className="font-medium text-gray-600 cursor-pointer">
                                    Remember me for 30 days
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            className="group mt-2 flex w-full justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {pending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <>
                                    Sign in to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-sm font-medium text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Request access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
