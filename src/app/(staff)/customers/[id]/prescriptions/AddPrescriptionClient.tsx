"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prescriptionSchema, type PrescriptionFormValues } from "@/lib/validations/prescription";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Save, Loader2 } from "lucide-react";
import { PRESCRIPTION_TYPE_LABELS } from "@/lib/utils";

interface Props {
  customerId: string;
}

export function AddPrescriptionClient({ customerId }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      customer_id: customerId,
      prescription_type: "distance",
      exam_date: today,
    },
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = form;
  const rxType = watch("prescription_type");

  const onSubmit = async (values: PrescriptionFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("prescriptions").insert({
      ...values,
      recorded_by: user?.id,
    });
    if (error) {
      toast.error("Failed to save prescription");
      return;
    }
    toast.success("Prescription saved");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Add Prescription
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={rxType}
                  onValueChange={(v) => setValue("prescription_type", v as PrescriptionFormValues["prescription_type"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESCRIPTION_TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Exam Date *</Label>
                <Input type="date" {...register("exam_date")} />
              </div>
              <div className="space-y-1.5">
                <Label>Next Exam Date</Label>
                <Input type="date" {...register("next_exam_date")} />
              </div>
              <div className="col-span-2 sm:col-span-3 space-y-1.5">
                <Label>Prescribing Optometrist</Label>
                <Input {...register("prescribing_optom")} placeholder="Dr. Name" />
              </div>
            </div>

            {rxType !== "contact_lens" ? (
              <>
                {/* Spectacle Rx */}
                <div>
                  <p className="section-label mb-3">Spectacle Prescription</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left pb-2 pr-3 text-dark-500 text-xs w-10"></th>
                        <th className="pb-2 px-1.5 text-center text-dark-400 text-xs">SPH</th>
                        <th className="pb-2 px-1.5 text-center text-dark-400 text-xs">CYL</th>
                        <th className="pb-2 px-1.5 text-center text-dark-400 text-xs">AXIS</th>
                        <th className="pb-2 px-1.5 text-center text-dark-400 text-xs">ADD</th>
                        <th className="pb-2 px-1.5 text-center text-dark-400 text-xs">VA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pr-3 py-1 text-dark-400 font-semibold text-xs">OD</td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="-2.00" {...register("od_sph")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="-0.50" {...register("od_cyl")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="90" {...register("od_axis")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="+2.00" {...register("od_add")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="6/6" {...register("od_va")} /></td>
                      </tr>
                      <tr>
                        <td className="pr-3 py-1 text-dark-400 font-semibold text-xs">OS</td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="-1.50" {...register("os_sph")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="-0.75" {...register("os_cyl")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="180" {...register("os_axis")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="+2.00" {...register("os_add")} /></td>
                        <td className="px-1.5 py-1"><input className="rx-cell" placeholder="6/9" {...register("os_va")} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="space-y-1.5"><Label className="text-xs">PD R (dist)</Label><input className="rx-cell" {...register("pd_distance_right")} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">PD L (dist)</Label><input className="rx-cell" {...register("pd_distance_left")} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">PD R (near)</Label><input className="rx-cell" {...register("pd_near_right")} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">PD L (near)</Label><input className="rx-cell" {...register("pd_near_left")} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Single PD</Label><input className="rx-cell" {...register("pd_single")} /></div>
                </div>
              </>
            ) : (
              /* Contact Lens Rx */
              <div className="grid grid-cols-2 gap-4">
                {(["OD", "OS"] as const).map((eye) => {
                  const prefix = eye === "OD" ? "cl_od" : "cl_os";
                  return (
                    <div key={eye} className="space-y-2">
                      <p className="section-label">{eye} ({eye === "OD" ? "Right" : "Left"})</p>
                      <div className="space-y-2">
                        <div className="space-y-1"><Label className="text-xs">Brand</Label><Input {...register(`${prefix}_brand` as keyof PrescriptionFormValues)} /></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-xs">Base Curve</Label><input className="rx-cell" {...register(`${prefix}_base_curve` as keyof PrescriptionFormValues)} /></div>
                          <div><Label className="text-xs">Diameter</Label><input className="rx-cell" {...register(`${prefix}_diameter` as keyof PrescriptionFormValues)} /></div>
                          <div><Label className="text-xs">Power</Label><input className="rx-cell" {...register(`${prefix}_power` as keyof PrescriptionFormValues)} /></div>
                          <div><Label className="text-xs">Cylinder</Label><input className="rx-cell" {...register(`${prefix}_cylinder` as keyof PrescriptionFormValues)} /></div>
                          <div className="col-span-2"><Label className="text-xs">Axis</Label><input className="rx-cell" {...register(`${prefix}_axis` as keyof PrescriptionFormValues)} /></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea className="input-base w-full h-20 resize-none" {...register("notes")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Prescription</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
