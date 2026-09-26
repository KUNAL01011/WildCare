import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function LocationsPage() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data: states } = useQuery({
    queryKey: ["locations-states"],
    queryFn: async () => {
      const res = await api.get("/admin/locations/states");
      return res.data.data as string[];
    },
  });

  const { data: districts } = useQuery({
    queryKey: ["locations-districts", selectedState],
    queryFn: async () => {
      const res = await api.get(`/admin/locations/states/${selectedState}/districts`);
      return res.data.data as string[];
    },
    enabled: !!selectedState,
  });

  const { data: cities } = useQuery({
    queryKey: ["locations-cities", selectedDistrict],
    queryFn: async () => {
      const res = await api.get(`/admin/locations/districts/${selectedDistrict}/cities`);
      return res.data.data as string[];
    },
    enabled: !!selectedDistrict,
  });

  const { data: summary } = useQuery({
    queryKey: ["locations-summary", selectedState, selectedDistrict, selectedCity],
    queryFn: async () => {
      const res = await api.get("/admin/locations/summary", {
        params: {
          state: selectedState || undefined,
          district: selectedDistrict || undefined,
          city: selectedCity || undefined,
        },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Locations</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict("");
              setSelectedCity("");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All states</option>
            {states?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedCity("");
            }}
            disabled={!selectedState}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <option value="">All districts</option>
            {districts?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <option value="">All cities</option>
            {cities?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-gray-900">{summary?.reports ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Reports</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-gray-900">{summary?.bodies ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Responder Bodies</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-emerald-600">{summary?.resolved ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Resolved</p>
        </div>
      </div>
    </div>
  );
}
