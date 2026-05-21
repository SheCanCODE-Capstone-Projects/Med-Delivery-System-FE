"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Plus, Star, Trash2, X, Pencil } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import {
  getAllLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
} from "@/services/patientApi";
import type { PatientLocationResponse } from "@/types/api";

interface LocationForm {
  label: string;
  address: string;
  latitude: string;
  longitude: string;
}

const emptyForm: LocationForm = { label: "", address: "", latitude: "", longitude: "" };

export default function LocationsPage() {
  const [locations, setLocations] = useState<PatientLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setLocations(await getAllLocations());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (loc: PatientLocationResponse) => {
    setEditingId(loc.id);
    setForm({
      label: loc.label,
      address: loc.address,
      latitude: loc.latitude != null ? String(loc.latitude) : "",
      longitude: loc.longitude != null ? String(loc.longitude) : "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.label.trim() || !form.address.trim()) {
      setFormError("Label and address are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const payload = {
        label: form.label.trim(),
        address: form.address.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };
      if (editingId != null) {
        await updateLocation(editingId, payload);
      } else {
        await addLocation(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this delivery location?")) return;
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove location");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultLocation(id);
      setLocations((prev) =>
        prev.map((l) => ({ ...l, isDefault: l.id === id }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  };

  return (
    <PatientAppShell>
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Delivery Locations</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Save addresses for faster medicine delivery.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-sm"
          >
            <Plus size={16} /> Add Location
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId != null ? "Edit Location" : "Add Location"}
                </h2>
                <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Label
                  </label>
                  <input
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Home, Work, Mom's place"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Street, city, district"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Latitude <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                      placeholder="-1.9403"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Longitude <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                      placeholder="29.8739"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
                {formError && <p className="text-sm text-rose-600">{formError}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 transition"
                  >
                    {submitting ? (
                      <Loader2 className="inline animate-spin" size={16} />
                    ) : editingId != null ? (
                      "Save Changes"
                    ) : (
                      "Add Location"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={22} />
              <span>Loading locations…</span>
            </div>
          ) : locations.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <MapPin size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No delivery locations saved yet.</p>
              <button
                onClick={openAdd}
                className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-800"
              >
                Add your first location
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{loc.label}</p>
                      {loc.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{loc.address}</p>
                    {loc.latitude != null && loc.longitude != null && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!loc.isDefault && (
                      <button
                        onClick={() => handleSetDefault(loc.id)}
                        title="Set as default"
                        className="p-2 text-slate-400 hover:text-amber-500 transition"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(loc)}
                      title="Edit location"
                      className="p-2 text-slate-400 hover:text-teal-600 transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      title="Remove location"
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientAppShell>
  );
}
