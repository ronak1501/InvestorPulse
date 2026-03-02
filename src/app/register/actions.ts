'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function register(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
    }

    if (data.password !== formData.get('confirmPassword')) {
        redirect('/register?error=Passwords do not match')
    }

    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                name: data.name,
                role: data.role,
            }
        }
    })

    if (error) {
        if (error.message.toLowerCase().includes('error sending confirmation email')) {
            redirect(`/register?error=${encodeURIComponent('Please turn OFF "Confirm email" in your Supabase Dashboard (under Authentication > Providers > Email).')}`)
        }
        redirect(`/register?error=${encodeURIComponent(error.message)}`)
    }

    if (authData.user) {
        await supabase.from('users').upsert({
            id: authData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
        })
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
