import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import type { Patient, PatientStatus } from "@/types";
import { formatDate, getInitials } from "@/utils/formatters";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: PatientsPage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const defaultForm: Omit<Patient, "id"> = {
  name: "",
  age: 0,
  gender: "Male",
  email: "",
  phone: "",
  address: "",
  bloodGroup: "O+",
  chiefComplaint: "",
  lastVisit: new Date().toISOString().split("T")[0],
  status: "active",
  totalVisits: 0,
  consultationFee: 800,
};

interface PatientFormData {
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  chiefComplaint: string;
  consultationFee: string;
  status: PatientStatus;
}

function PatientAvatar({
  name,
  size = "sm",
}: { name: string; size?: "sm" | "lg" }) {
  const initials = getInitials(name);
  const sizeClass = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";

  return (
    <div
      className={`${sizeClass} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-semibold text-primary shrink-0`}
    >
      {initials}
    </div>
  );
}

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSave: (data: Omit<Patient, "id">) => void;
  mode: "add" | "edit";
}

function PatientModal({
  open,
  onClose,
  patient,
  onSave,
  mode,
}: PatientModalProps) {
  const [form, setForm] = useState<PatientFormData>(() => ({
    name: patient?.name ?? "",
    age: patient?.age ? String(patient.age) : "",
    gender: patient?.gender ?? "Male",
    email: patient?.email ?? "",
    phone: patient?.phone ?? "",
    address: patient?.address ?? "",
    bloodGroup: patient?.bloodGroup ?? "O+",
    chiefComplaint: patient?.chiefComplaint ?? "",
    consultationFee: patient?.consultationFee
      ? String(patient.consultationFee)
      : "800",
    status: patient?.status ?? "active",
  }));
  const [errors, setErrors] = useState<
    Partial<Record<keyof PatientFormData, string>>
  >({});

  const validate = (): boolean => {
    const e: Partial<Record<keyof PatientFormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || Number(form.age) <= 0) e.age = "Valid age required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...defaultForm,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      bloodGroup: form.bloodGroup,
      chiefComplaint: form.chiefComplaint.trim(),
      consultationFee: Number(form.consultationFee) || 800,
      status: form.status,
      lastVisit: patient?.lastVisit ?? new Date().toISOString().split("T")[0],
      totalVisits: patient?.totalVisits ?? 0,
    });
  };

  const set = <K extends keyof PatientFormData>(
    k: K,
    v: PatientFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === "add" ? "Add New Patient" : "Edit Patient"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Priya Nair"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-name"
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                min={1}
                max={120}
                placeholder="e.g. 35"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-age"
              />
              {errors.age && (
                <p className="text-destructive text-xs">{errors.age}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  set("gender", v as "Male" | "Female" | "Other")
                }
              >
                <SelectTrigger
                  className="glass border-white/10 bg-white/5"
                  data-ocid="patient-form-gender"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="patient@email.com"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-email"
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-phone"
              />
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Blood Group</Label>
              <Select
                value={form.bloodGroup}
                onValueChange={(v) => set("bloodGroup", v)}
              >
                <SelectTrigger
                  className="glass border-white/10 bg-white/5"
                  data-ocid="patient-form-blood-group"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fee">Consultation Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                value={form.consultationFee}
                onChange={(e) => set("consultationFee", e.target.value)}
                placeholder="800"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-fee"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Full address"
                className="glass border-white/10 bg-white/5"
                data-ocid="patient-form-address"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="complaint">Chief Complaint</Label>
              <Textarea
                id="complaint"
                value={form.chiefComplaint}
                onChange={(e) => set("chiefComplaint", e.target.value)}
                placeholder="Primary reason for visit and key symptoms…"
                rows={3}
                className="glass border-white/10 bg-white/5 resize-none"
                data-ocid="patient-form-complaint"
              />
            </div>

            {mode === "edit" && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as PatientStatus)}
                >
                  <SelectTrigger
                    className="glass border-white/10 bg-white/5"
                    data-ocid="patient-form-status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="glass border-white/20"
              data-ocid="patient-form-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-ocid="patient-form-submit">
              {mode === "add" ? "Add Patient" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PatientsPage() {
  const navigate = useNavigate();
  const { patients, isLoading, addPatient } = usePatients();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: Column<Patient>[] = [
    {
      key: "name",
      header: "Patient",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <PatientAvatar name={row.name} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.bloodGroup}</p>
          </div>
        </div>
      ),
    },
    {
      key: "age",
      header: "Age / Gender",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-foreground">{row.age} yrs</p>
          <p className="text-xs text-muted-foreground">{row.gender}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => (
        <span className="text-sm font-mono text-muted-foreground">
          {row.phone}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
          {row.email}
        </span>
      ),
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.lastVisit)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "totalVisits",
      header: "Visits",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-semibold text-foreground tabular-nums">
          {row.totalVisits}
        </span>
      ),
    },
  ];

  const handleAdd = (data: Omit<Patient, "id">) => {
    addPatient(data);
    setModalOpen(false);
    toast.success("Patient added successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      data-ocid="patients-page"
    >
      <PageHeader
        title="Patients"
        description="Manage patient records, case histories, and contact information."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Patients" }]}
        action={{
          label: "Add Patient",
          onClick: () => setModalOpen(true),
          icon: <UserPlus className="w-4 h-4" />,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DataTable<Patient & Record<string, unknown>>
          columns={columns as Column<Patient & Record<string, unknown>>[]}
          data={patients as (Patient & Record<string, unknown>)[]}
          isLoading={isLoading}
          searchPlaceholder="Search by name, email, phone…"
          searchKeys={["name", "email", "phone"]}
          onRowClick={(row) =>
            navigate({
              to: "/patients/$patientId",
              params: { patientId: row.id as string },
            })
          }
          pageSize={10}
          emptyMessage="No patients found. Add your first patient to get started."
        />
      </motion.div>

      <PatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
        mode="add"
      />
    </motion.div>
  );
}

export { PatientAvatar, PatientModal };
