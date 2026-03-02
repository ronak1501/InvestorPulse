'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match'))
    }

    const { error } = await supabase.auth.updateUser({
        password,
    })

    if (error) {
        redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?message=' + encodeURIComponent('Password updated successfully. You can now log in.'))
}
