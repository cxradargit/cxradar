import AdminEmpresaDetail from '@/components/admin/admin-empresa-detail'

export default function AdminEmpresaDetailPage({ params }: { params: { id: string } }) {
  return <AdminEmpresaDetail empresaId={params.id} />
}
