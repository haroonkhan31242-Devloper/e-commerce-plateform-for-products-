import React, { useState } from 'react';
import { Edit2, KeyRound, Plus, Power, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { StaffFormModal, StaffFormMode } from '../../../components/admin/StaffFormModal.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';
import { EmptyState } from '../../../components/common/EmptyState.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { useAdminAuth } from '../../../context/AdminAuthContext.tsx';
import { STAFF_SECTIONS } from '../../../utils/permissions.ts';
import { StaffAccount } from '../../../types/index.ts';

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';

const sectionLabel = (tab: string) => STAFF_SECTIONS.find((s) => s.tab === tab)?.label ?? tab;

// Main Admin only: the dashboard never renders this tab for staff, and every action in
// AdminAuthContext re-checks the role as well
export const StaffTab: React.FC = () => {
  const { staffAccounts, setStaffActive, deleteStaff } = useAdminAuth();
  const { confirm, dialog } = useConfirmDialog();

  // The form keeps its last mode and account while closing so the exit animation keeps its content
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState<{ mode: StaffFormMode; staff: StaffAccount | null }>({ mode: 'create', staff: null });

  const openModal = (mode: StaffFormMode, staff: StaffAccount | null) => {
    setModal({ mode, staff });
    setIsModalOpen(true);
  };

  const activeCount = staffAccounts.filter((s) => s.isActive).length;

  return (
    <AdminPanel
      title="Staff Management"
      description="Create staff accounts and choose which Admin Panel sections each person can use."
      actions={
        <button
          onClick={() => openModal('create', null)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add Staff</span>
        </button>
      }
    >
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>
            <strong>Main Admin</strong> always has full access, including this page.
          </span>
        </div>
        <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700">
          {staffAccounts.length} staff · {activeCount} active
        </div>
      </div>

      {staffAccounts.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-7 h-7" aria-hidden="true" />}
          title="No staff accounts yet"
          description="Add a staff member to give them access to selected sections, such as Orders or Inventory."
          action={
            <button
              onClick={() => openModal('create', null)}
              className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
            >
              Add Staff Member
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5">Staff member</th>
                <th className="py-2.5">Sections</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Last sign-in</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staffAccounts.map((staff) => (
                <tr key={staff.id} className="align-top hover:bg-neutral-50/70 transition-colors">
                  <td data-label="" className="py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className="w-9 h-9 rounded-xl bg-neutral-900 text-amber-400 font-serif font-bold flex items-center justify-center shrink-0"
                      >
                        {staff.fullName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{staff.fullName}</p>
                        <p className="text-[11px] text-neutral-500 font-mono truncate">@{staff.username}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Sections" className="py-3">
                    <div className="flex flex-wrap gap-1 md:max-w-sm justify-end md:justify-start">
                      {staff.sections.length === STAFF_SECTIONS.length ? (
                        <span className="px-2 py-0.5 bg-neutral-900 text-white text-[11px] rounded font-semibold">
                          All sections
                        </span>
                      ) : (
                        staff.sections.map((tab) => (
                          <span
                            key={tab}
                            className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-700 text-[11px] rounded"
                          >
                            {sectionLabel(tab)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td data-label="Status" className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${
                        staff.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
                      {staff.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td data-label="Last sign-in" className="py-3 text-neutral-600 whitespace-nowrap">
                    {formatDate(staff.lastLoginAt)}
                  </td>
                  <td data-label="" className="py-3 text-right">
                    <div className="inline-flex items-center gap-1 md:-mt-1.5">
                      <button
                        onClick={() => openModal('edit', staff)}
                        aria-label={`Edit ${staff.fullName}`}
                        title="Edit staff member"
                        className="inline-flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <ActionMenu
                        label={`More actions for ${staff.fullName}`}
                        items={[
                          {
                            label: 'Change password',
                            icon: <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />,
                            onSelect: () => openModal('password', staff),
                          },
                          {
                            label: staff.isActive ? 'Disable account' : 'Enable account',
                            icon: <Power className="w-3.5 h-3.5" aria-hidden="true" />,
                            onSelect: () =>
                              staff.isActive
                                ? confirm({
                                    title: 'Disable this account?',
                                    message: `${staff.fullName} will be signed out and won’t be able to sign in until you enable the account again.`,
                                    confirmLabel: 'Disable Account',
                                    onConfirm: () => setStaffActive(staff.id, false),
                                  })
                                : setStaffActive(staff.id, true),
                          },
                          {
                            label: 'Delete account',
                            icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
                            destructive: true,
                            onSelect: () =>
                              confirm({
                                title: 'Delete this staff account?',
                                message: `${staff.fullName} (@${staff.username}) will lose access permanently. This can’t be undone.`,
                                confirmLabel: 'Delete Account',
                                onConfirm: () => deleteStaff(staff.id),
                              }),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-neutral-500 border-t border-neutral-100 pt-4">
        Prototype notice: staff accounts are stored in this browser with hashed passwords. Access rules here shape the
        interface only; secure, server-side authorization is required before going live.
      </p>

      <StaffFormModal
        isOpen={isModalOpen}
        mode={modal.mode}
        staff={modal.staff}
        onClose={() => setIsModalOpen(false)}
      />
      {dialog}
    </AdminPanel>
  );
};
