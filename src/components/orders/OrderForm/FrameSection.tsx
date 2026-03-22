"use client";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import type { OrderFormValues } from "@/lib/validations/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface FrameSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function FrameSection({ form }: FrameSectionProps) {
  const { register } = form;
  const { dict } = useLocale();
  const t = dict.orders;

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control: form.control, name: "services" });

  const {
    fields: accessoryFields,
    append: appendAccessory,
    remove: removeAccessory,
  } = useFieldArray({ control: form.control, name: "accessories" });

  return (
    <div className="space-y-5">
      {/* Frame Details */}
      <div>
        <h4 className="section-label mb-3">{t.frame}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t.frameBrand}</Label>
            <Input placeholder="e.g. Ray-Ban, Oakley, Silhouette" {...register("frame_brand")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.frameModel}</Label>
            <Input placeholder="e.g. RB2132 New Wayfarer" {...register("frame_model")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.frameColour}</Label>
            <Input placeholder="e.g. Matte Black, Tortoise" {...register("frame_colour")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.frameSize}</Label>
            <Input placeholder="e.g. 52-18-145" {...register("frame_size")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.frameSupplier}</Label>
            <Input placeholder="e.g. Luxottica, Safilo" {...register("frame_supplier")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.frameSku}</Label>
            <Input placeholder="Product code" {...register("frame_gensoft_sku")} />
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="section-label">{t.services}</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => appendService({ name: "", price: 0 })}
          >
            <Plus className="w-3.5 h-3.5" /> {t.addService}
          </Button>
        </div>
        <div className="space-y-2">
          {serviceFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder={t.serviceNamePlaceholder}
                {...register(`services.${index}.name`)}
                className="flex-1"
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-6"
                  {...register(`services.${index}.price`, { valueAsNumber: true })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-brand-400 hover:text-red-400 h-9 w-9 flex-shrink-0"
                onClick={() => removeService(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {serviceFields.length === 0 && (
            <p className="text-xs text-brand-400 py-1">{t.noServices}</p>
          )}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="section-label">{t.accessories}</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => appendAccessory({ name: "", sku: "", qty: 1, price: 0 })}
          >
            <Plus className="w-3.5 h-3.5" /> {t.addAccessory}
          </Button>
        </div>
        <div className="space-y-2">
          {accessoryFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  placeholder={t.accessoryNamePlaceholder}
                  {...register(`accessories.${index}.name`)}
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="SKU"
                  {...register(`accessories.${index}.sku`)}
                />
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  {...register(`accessories.${index}.qty`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-2 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-500 text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-6"
                  {...register(`accessories.${index}.price`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-brand-400 hover:text-red-400 h-9 w-9"
                  onClick={() => removeAccessory(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {accessoryFields.length === 0 && (
            <p className="text-xs text-brand-400 py-1">{t.noAccessories}</p>
          )}
        </div>
      </div>
    </div>
  );
}
