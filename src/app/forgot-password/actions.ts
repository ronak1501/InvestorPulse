'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPasswordRequest(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
        redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/forgot-password?message=' + encodeURIComponent('Check your email for the reset link'))
}
