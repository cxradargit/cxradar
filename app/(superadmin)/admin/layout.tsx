import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isSuperAdmin(user.email)) redirect('/dashboard')

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--cx-bg)' }}>
      <AdminSidebar email={user.email!} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
