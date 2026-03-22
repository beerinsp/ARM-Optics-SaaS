"use client";
import { type UseFormReturn } from "react-hook-form";
import type { OrderFormValues } from "@/lib/validations/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/i18n/context";

interface LensSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function LensSection({ form }: LensSectionProps) {
  const { register } = form;
  const { dict } = useLocale();
  const t = dict.orders;

  return (
    <div className="space-y-5">
      {/* Rx Table */}
      <div>
        <h4 className="section-label mb-3">{t.spectaclePrescription}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-2 pr-3 text-brand-400 font-medium w-10"></th>
                <th className="pb-2 px-1.5 text-center text-brand-500 font-medium text-xs">SPH</th>
                <th className="pb-2 px-1.5 text-center text-brand-500 font-medium text-xs">CYL</th>
                <th className="pb-2 px-1.5 text-center text-brand-500 font-medium text-xs">AXIS</th>
                <th className="pb-2 px-1.5 text-center text-brand-500 font-medium text-xs">ADD</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              <tr>
                <td className="pr-3 py-1 text-brand-500 font-semibold text-xs">OD</td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. -2.00" {...register("lens_od_sph")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. -0.50" {...register("lens_od_cyl")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. 90" {...register("lens_od_axis")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. +2.00" {...register("lens_od_add")} />
                </td>
              </tr>
              <tr>
                <td className="pr-3 py-1 text-brand-500 font-semibold text-xs">OS</td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. -1.50" {...register("lens_os_sph")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. -0.75" {...register("lens_os_cyl")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. 180" {...register("lens_os_axis")} />
                </td>
                <td className="px-1.5 py-1">
                  <input className="rx-cell" placeholder="e.g. +2.00" {...register("lens_os_add")} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PD */}
      <div>
        <h4 className="section-label mb-3">{t.pupillaryDistance}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t.pdRightDist}</Label>
            <input className="rx-cell" placeholder="e.g. 32.0" {...register("pd_distance_right")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.pdLeftDist}</Label>
            <input className="rx-cell" placeholder="e.g. 31.5" {...register("pd_distance_left")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.pdRightNear}</Label>
            <input className="rx-cell" placeholder="e.g. 30.0" {...register("pd_near_right")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.pdLeftNear}</Label>
            <input className="rx-cell" placeholder="e.g. 29.5" {...register("pd_near_left")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.singlePd}</Label>
            <input className="rx-cell" placeholder="e.g. 63.5" {...register("pd_single")} />
          </div>
        </div>
      </div>

      {/* Lens Product */}
      <div>
        <h4 className="section-label mb-3">{t.lensDetails}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t.lensType}</Label>
            <Input placeholder="e.g. Progressive, Single Vision" {...register("lens_type")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.lensMaterial}</Label>
            <Input placeholder="e.g. 1.60 Hi-Index, Polycarbonate" {...register("lens_material")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.lensCoating}</Label>
            <Input placeholder="e.g. AR + Blue-Light, Photochromic" {...register("lens_coating")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.lensSupplier}</Label>
            <Input placeholder="e.g. Essilor, Hoya, Zeiss" {...register("lens_supplier")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.lensSku}</Label>
            <Input placeholder="Product code" {...register("lens_gensoft_sku")} />
          </div>
        </div>
      </div>
    </div>
  );
}
