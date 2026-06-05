import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import AdminSidebar from '@/components/admin/admin-sidebar'
import Topbar from '@/components/shared/topbar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isSuperAdmin(user.email)) redirect('/dashboard')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      <AdminSidebar email={user.email!} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar nome={user.email} isAdmin />
        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}
