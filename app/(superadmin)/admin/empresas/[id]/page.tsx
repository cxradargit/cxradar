import AdminEmpresaDetail from '@/components/admin/admin-empresa-detail'

export default async function AdminEmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminEmpresaDetail empresaId={id} />
}
