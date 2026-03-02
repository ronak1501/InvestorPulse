import Link from 'next/link'
import { register } from './actions'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="w-full max-w-md rounded-2xl bg-[#f9fafb] p-8 shadow-sm border border-gray-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
                    <p className="mt-2 text-sm text-gray-500">Join the VRM Dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        {error as string}
                    </div>
                )}

                <form className="space-y-5" action={register}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
                        >
                            <option value="VRM">VRM</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    )
}
