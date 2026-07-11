import { AuditViewer } from '@/modules/audit/components/AuditViewer';
import {
  exportAdminAuditLogs,
  fetchAdminAuditDetail,
  fetchAdminAuditLogs,
  fetchAdminAuditMeta,
} from '@/modules/superAdmin/auditApi';

export function SuperAdminAuditPage() {
  return (
    <AuditViewer
      showOrganizationFilter
      title="Auditoría de plataforma"
      subtitle="Todos los eventos del SaaS · filtrable por organización"
      fetchLogs={fetchAdminAuditLogs}
      fetchDetail={fetchAdminAuditDetail}
      fetchMeta={fetchAdminAuditMeta}
      exportLogs={exportAdminAuditLogs}
    />
  );
}
