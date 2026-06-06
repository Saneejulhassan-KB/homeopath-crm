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
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import type { Patient, PatientStatus } from "@/types";
import { formatDate, getInitials } from "@/utils/formatters";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  Droplets,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
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
  registrationId: "",
  name: "",
  age: 0,
  gender: "Male",
  email: "",
  phone: "",
  place: "",
  address: "",
  bloodGroup: "O+",
  chiefComplaint: "",
  lastVisit: new Date().toISOString().split("T")[0],
  createdAt: new Date().toISOString().split("T")[0],
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

// ─── View Patient Modal ────────────────────────────────────────────────────

interface ViewDetail {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  accent?: boolean;
}

function DetailField({ icon, label, value, accent }: ViewDetail) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className={`w-3.5 h-3.5 shrink-0 ${accent ? "text-primary" : ""}`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-semibold truncate ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value ?? (
          <span className="text-muted-foreground italic font-normal">—</span>
        )}
      </p>
    </div>
  );
}

function ViewPatientModal({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}) {
  if (!patient) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-white/20 p-0">
        {/* Header with avatar */}
        <div className="relative flex items-center gap-4 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary shrink-0 shadow-lg">
            {getInitials(patient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground truncate">
              {patient.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {patient.registrationId}
              </span>
              <span className="text-xs text-muted-foreground">
                {patient.age} yrs · {patient.gender}
              </span>
              {patient.bloodGroup && (
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                  {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            data-ocid="patients.view-modal.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detail grid */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <DetailField
              icon={<Phone className="w-3.5 h-3.5" />}
              label="Phone"
              value={patient.phone}
            />
            <DetailField
              icon={<Mail className="w-3.5 h-3.5" />}
              label="Email"
              value={patient.email}
            />
            <DetailField
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Place"
              value={patient.place}
            />
            <DetailField
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Last Visit"
              value={formatDate(patient.lastVisit)}
            />
            <DetailField
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Total Visits"
              value={patient.totalVisits}
              accent
            />
            <DetailField
              icon={<Droplets className="w-3.5 h-3.5" />}
              label="Blood Group"
              value={patient.bloodGroup}
            />
            <DetailField
              icon={<User className="w-3.5 h-3.5" />}
              label="Age"
              value={`${patient.age} years`}
            />
            <DetailField
              icon={<User className="w-3.5 h-3.5" />}
              label="Gender"
              value={patient.gender}
            />
          </div>

          {/* Address */}
          {patient.address && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Address
              </p>
              <p className="text-sm text-foreground">{patient.address}</p>
            </div>
          )}

          {/* Chief Complaint */}
          {patient.chiefComplaint && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70 mb-1">
                Chief Complaint
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {patient.chiefComplaint}
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="glass border-white/20"
              data-ocid="patients.view-modal.close_button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Patients Page ──────────────────────────────────────────────────────────

function PatientsPage() {
  const navigate = useNavigate();
  const { patients, isLoading, addPatient, updatePatient, deletePatient } =
    usePatients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const columns: Column<Patient>[] = [
    {
      key: "registrationId",
      header: "Reg. ID",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
          {row.registrationId}
        </span>
      ),
    },
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
      key: "place",
      header: "Place",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">{row.place}</span>
        </div>
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
    {
      key: "id",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label="View patient"
            data-ocid={`patients.view_button.${row.registrationId}`}
            onClick={(e) => {
              e.stopPropagation();
              setViewPatient(row);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Edit patient"
            data-ocid={`patients.edit_button.${row.registrationId}`}
            onClick={(e) => {
              e.stopPropagation();
              setEditPatient(row);
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors duration-150"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Delete patient"
            data-ocid={`patients.delete_button.${row.registrationId}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
              setDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = (data: Omit<Patient, "id">) => {
    addPatient(data);
    setModalOpen(false);
    toast.success("Patient added successfully");
  };

  const handleEdit = (data: Omit<Patient, "id">) => {
    if (editPatient) {
      updatePatient(editPatient.id, data);
    }
    setEditModalOpen(false);
    setEditPatient(null);
    toast.success("Patient updated successfully");
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deletePatient(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast.success("Patient removed successfully");
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
          searchPlaceholder="Search by name, ID, phone, place, gender…"
          searchKeys={[
            "name",
            "registrationId",
            "phone",
            "place",
            "gender",
            "age",
            "lastVisit",
          ]}
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

      <PatientModal
        key={editPatient?.id ?? "edit"}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditPatient(null);
        }}
        patient={editPatient}
        onSave={handleEdit}
        mode="edit"
      />

      <ViewPatientModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewPatient(null);
        }}
        patient={viewPatient}
      />

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(o) => !o && setDeleteDialogOpen(false)}
      >
        <DialogContent className="max-w-sm glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Remove Patient
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="glass border-white/20"
              data-ocid="patients.delete-dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              data-ocid="patients.delete-dialog.confirm_button"
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export { PatientAvatar, PatientModal };
