import React, { useEffect, useState } from 'react';
import { AlertTriangle, Download, Eye, EyeOff, Loader2, Printer, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { downloadLabelPdf, printLabel, renderParcelLabel } from '../../services/parcelLabelOutput.ts';
import { Order, ParcelLabel } from '../../types/index.ts';
import { canHaveParcelLabel, getLabelContent, getMissingLabelDetails } from '../../utils/parcelLabel.ts';

const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-neutral-800 font-bold rounded-xl hover:bg-neutral-100 disabled:opacity-60';
const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl disabled:opacity-60';

export const ParcelLabelPanel: React.FC<{ order: Order }> = ({ order }) => {
  const { generateParcelLabel, recordParcelLabelPrint, showToast, storeSettings } = useStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<'print' | 'pdf' | null>(null);

  const label = order.parcelLabel;
  const isReady = canHaveParcelLabel(order);
  const missingDetails = getMissingLabelDetails(order);

  const renderLabel = (parcelLabel: ParcelLabel) =>
    renderParcelLabel(getLabelContent(order, parcelLabel, storeSettings));

  // Re-renders while open, so the preview follows edits to the order
  useEffect(() => {
    if (!isPreviewOpen || !label) return;
    let isCurrent = true;

    renderLabel(label)
      .then((canvas) => {
        if (isCurrent) setPreviewUrl(canvas.toDataURL('image/png'));
      })
      .catch((error) => {
        console.error('Label preview failed', error);
        if (isCurrent) {
          setIsPreviewOpen(false);
          showToast('error', 'The label preview could not be created. Please try again.');
        }
      });

    return () => {
      isCurrent = false;
    };
    // The renderer reads only the order, label and settings listed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewOpen, order, label, storeSettings]);

  const handlePrint = async (parcelLabel: ParcelLabel) => {
    setActiveTask('print');
    try {
      await printLabel(await renderLabel(parcelLabel));
      recordParcelLabelPrint(order.id);
    } catch (error) {
      console.error('Label printing failed', error);
      showToast('error', 'The label could not be printed. Please try again.');
    } finally {
      setActiveTask(null);
    }
  };

  const handleDownload = async (parcelLabel: ParcelLabel) => {
    setActiveTask('pdf');
    try {
      await downloadLabelPdf(await renderLabel(parcelLabel), `STEROSE-label-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Label PDF failed', error);
      showToast('error', 'The label PDF could not be created. Please try again.');
    } finally {
      setActiveTask(null);
    }
  };

  const handleGenerate = () => {
    generateParcelLabel(order.id);
    setIsPreviewOpen(true);
  };

  return (
    <section aria-label="Parcel label" className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
      <h4 className="font-bold uppercase tracking-wider text-neutral-700 text-xs flex items-center gap-2">
        <Tag className="w-4 h-4 text-neutral-800" aria-hidden="true" />
        <span>Parcel Label</span>
      </h4>

      {!isReady ? (
        <p className="text-neutral-600">
          {order.orderStatus === 'Pending Confirmation'
            ? 'Accept this order to create its parcel label.'
            : `Parcel labels are not available for ${order.orderStatus.toLowerCase()} orders.`}
        </p>
      ) : (
        <>
          {missingDetails.length > 0 && (
            <p role="alert" className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" aria-hidden="true" />
              <span>This order has no {missingDetails.join(', ')}. The label leaves it out, so check it before shipping.</span>
            </p>
          )}

          {label ? (
            <>
              <p className="text-neutral-600">
                Parcel ref <strong className="font-mono font-bold text-neutral-900">{label.parcelId}</strong>
                {' · '}Generated {new Date(label.generatedAt).toLocaleDateString()}
                {' · '}
                {label.printCount === 0
                  ? 'Not printed yet'
                  : `Printed ${label.printCount} ${label.printCount === 1 ? 'time' : 'times'}`}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(label)}
                  disabled={activeTask !== null}
                  className={PRIMARY_BUTTON}
                >
                  {activeTask === 'print' ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Printer className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{label.printCount > 0 ? 'Reprint Label' : 'Print Label'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  aria-expanded={isPreviewOpen}
                  className={SECONDARY_BUTTON}
                >
                  {isPreviewOpen ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{isPreviewOpen ? 'Hide Preview' : 'Preview Label'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(label)}
                  disabled={activeTask !== null}
                  className={SECONDARY_BUTTON}
                >
                  {activeTask === 'pdf' ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>Download PDF</span>
                </button>
              </div>

              {isPreviewOpen && (
                <figure className="pt-1 animate-in fade-in">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={`Parcel label for order ${order.orderNumber}`}
                      width={400}
                      height={600}
                      className="w-full max-w-xs h-auto mx-auto bg-white border border-neutral-300 shadow-sm"
                    />
                  ) : (
                    <div role="status" className="flex items-center justify-center py-16 text-neutral-500">
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span className="sr-only">Preparing label preview</span>
                    </div>
                  )}
                  <figcaption className="mt-2 text-center text-neutral-500">
                    Prints at 4 × 6 in. Set the paper size to 4 × 6 in if your printer asks.
                  </figcaption>
                </figure>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-neutral-600">Create the parcel label and its QR code for this order.</p>
              <button type="button" onClick={handleGenerate} className={`${PRIMARY_BUTTON} shrink-0`}>
                <Tag className="w-4 h-4" aria-hidden="true" />
                <span>Generate Label</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
