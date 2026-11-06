import React from 'react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { StoreSettings } from '../../../types/index.ts';

interface ShippingTabProps {
  settingsForm: StoreSettings;
  setSettingsForm: (settings: StoreSettings) => void;
}

export const ShippingTab: React.FC<ShippingTabProps> = ({ settingsForm, setSettingsForm }) => {
  const { setStoreSettings, showToast, baseCurrency } = useStore();

  return (
    <AdminPanel
      className="max-w-2xl"
      title="Shipping"
      description="Set delivery fees and the free shipping threshold."
    >
      <div className="space-y-4 text-xs">
        <div>
          <label htmlFor="shipping-tab-field-1" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Free Shipping Threshold ({baseCurrency})
          </label>
          <input
            id="shipping-tab-field-1"
            type="number"
              min="0"
            value={settingsForm.freeShippingThreshold}
            onChange={(e) =>
              setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Orders at or above this subtotal ship free on both standard and express.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-tab-field-2" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Standard Fee ({baseCurrency})
            </label>
            <input
              id="shipping-tab-field-2"
              type="number"
              min="0"
              value={settingsForm.standardShippingFee}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, standardShippingFee: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor="shipping-tab-field-3" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Express Fee ({baseCurrency})
            </label>
            <input
              id="shipping-tab-field-3"
              type="number"
              min="0"
              value={settingsForm.expressShippingFee}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, expressShippingFee: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const { freeShippingThreshold, standardShippingFee, expressShippingFee } = settingsForm;
            if (freeShippingThreshold < 0 || standardShippingFee < 0 || expressShippingFee < 0) {
              showToast('error', 'Shipping amounts cannot be negative.');
              return;
            }
            setStoreSettings(settingsForm);
            showToast('success', 'Shipping rates updated.');
          }}
          className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800"
        >
          Save Shipping Settings
        </button>
      </div>
    </AdminPanel>
  );
};
