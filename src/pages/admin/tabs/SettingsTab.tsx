import React from 'react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { StoreSettings } from '../../../types/index.ts';

interface SettingsTabProps {
  settingsForm: StoreSettings;
  setSettingsForm: (settings: StoreSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settingsForm, setSettingsForm }) => {
  const { setStoreSettings, showToast } = useStore();

  return (
    <AdminPanel
      className="max-w-3xl"
      title="Website Settings"
      description="Store details, announcement banner, and bank transfer information."
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-tab-field-1" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              id="settings-tab-field-1"
              type="text"
              value={settingsForm.storeName}
              onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="settings-tab-field-2" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Tagline
            </label>
            <input
              id="settings-tab-field-2"
              type="text"
              value={settingsForm.storeTagline}
              onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-tab-field-3" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Contact Email
            </label>
            <input
              id="settings-tab-field-3"
              type="email"
              value={settingsForm.contactEmail}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="settings-tab-field-4" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Contact Phone
            </label>
            <input
              id="settings-tab-field-4"
              type="tel"
              value={settingsForm.contactPhone}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label htmlFor="settings-tab-field-12" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Store Address
          </label>
          <input
            id="settings-tab-field-12"
            type="text"
            value={settingsForm.address}
            onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="settings-tab-field-5" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Announcement Banner
          </label>
          <input
            id="settings-tab-field-5"
            type="text"
            value={settingsForm.announcementText}
            onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
          />
          <label className="flex items-center gap-2 mt-2 text-neutral-800">
            <input
              type="checkbox"
              checked={settingsForm.isAnnouncementActive}
              onChange={(e) => setSettingsForm({ ...settingsForm, isAnnouncementActive: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span>Show the announcement banner on the storefront</span>
          </label>
          <p className="text-xs text-neutral-500 mt-1">
            Use {'{freeShipping}'} to show the free shipping threshold.
          </p>
        </div>

        {/* Bank Wire Details */}
        <div className="pt-4 border-t border-neutral-200 space-y-3">
          <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-xs">
            Bank Transfer Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-tab-field-6" className="block font-semibold text-neutral-600 mb-1">Bank Name</label>
              <input
                id="settings-tab-field-6"
                type="text"
                value={settingsForm.bankDetails.bankName}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bankDetails: { ...settingsForm.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="settings-tab-field-7" className="block font-semibold text-neutral-600 mb-1">Account Title</label>
              <input
                id="settings-tab-field-7"
                type="text"
                value={settingsForm.bankDetails.accountTitle}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bankDetails: { ...settingsForm.bankDetails, accountTitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="settings-tab-field-10" className="block font-semibold text-neutral-600 mb-1">Account Number</label>
              <input
                id="settings-tab-field-10"
                type="text"
                value={settingsForm.bankDetails.accountNumber}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bankDetails: { ...settingsForm.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label htmlFor="settings-tab-field-8" className="block font-semibold text-neutral-600 mb-1">IBAN</label>
              <input
                id="settings-tab-field-8"
                type="text"
                value={settingsForm.bankDetails.iban}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bankDetails: { ...settingsForm.bankDetails, iban: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label htmlFor="settings-tab-field-9" className="block font-semibold text-neutral-600 mb-1">SWIFT / BIC Code</label>
              <input
                id="settings-tab-field-9"
                type="text"
                value={settingsForm.bankDetails.swiftCode}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bankDetails: { ...settingsForm.bankDetails, swiftCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
          </div>
          <div>
            <label htmlFor="settings-tab-field-11" className="block font-semibold text-neutral-600 mb-1">
              Transfer Instructions
            </label>
            <textarea
              id="settings-tab-field-11"
              rows={3}
              value={settingsForm.bankDetails.instructions}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  bankDetails: { ...settingsForm.bankDetails, instructions: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setStoreSettings(settingsForm);
              showToast('success', 'Store settings updated successfully.');
            }}
            className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </AdminPanel>
  );
};
