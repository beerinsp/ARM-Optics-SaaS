"use client";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import type { OrderFormValues } from "@/lib/validations/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface FrameSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function FrameSection({ form }: FrameSectionProps) {
  const { register } = form;

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
        <h4 className="section-label mb-3">Frame</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Input placeholder="e.g. Ray-Ban, Oakley, Silhouette" {...register("frame_brand")} />
          </div>
          <div className="space-y-1.5">
            <Label>Model / Style</Label>
            <Input placeholder="e.g. RB2132 New Wayfarer" {...register("frame_model")} />
          </div>
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <Input placeholder="e.g. Matte Black, Tortoise" {...register("frame_colour")} />
          </div>
          <div className="space-y-1.5">
            <Label>Size</Label>
            <Input placeholder="e.g. 52-18-145" {...register("frame_size")} />
          </div>
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Input placeholder="e.g. Luxottica, Safilo" {...register("frame_supplier")} />
          </div>
          <div className="space-y-1.5">
            <Label>Frame SKU (GenSoft)</Label>
            <Input placeholder="Product code" {...register("frame_gensoft_sku")} />
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="section-label">Services</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => appendService({ name: "", price: 0 })}
          >
            <Plus className="w-3.5 h-3.5" /> Add service
          </Button>
        </div>
        <div className="space-y-2">
          {serviceFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder="Service name (e.g. Contact lens fitting)"
                {...register(`services.${index}.name`)}
                className="flex-1"
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
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
                className="text-dark-500 hover:text-red-400 h-9 w-9 flex-shrink-0"
                onClick={() => removeService(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {serviceFields.length === 0 && (
            <p className="text-xs text-dark-500 py-1">No services added.</p>
          )}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="section-label">Accessories</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => appendAccessory({ name: "", sku: "", qty: 1, price: 0 })}
          >
            <Plus className="w-3.5 h-3.5" /> Add accessory
          </Button>
        </div>
        <div className="space-y-2">
          {accessoryFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  placeholder="Item name (e.g. Case, Cloth)"
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
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
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
                  className="text-dark-500 hover:text-red-400 h-9 w-9"
                  onClick={() => removeAccessory(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {accessoryFields.length === 0 && (
            <p className="text-xs text-dark-500 py-1">No accessories added.</p>
          )}
        </div>
      </div>
    </div>
  );
}
