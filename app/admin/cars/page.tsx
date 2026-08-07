/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
// app/admin/cars/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, Pencil } from "lucide-react";
import { DataExplorer, Column } from "@/components/admin/DataExplorer";
import { PERMISSIONS } from "@/lib/permissions";
import { usePagePermission } from "@/hooks/usePermissions";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface MasterItem {
  id: string;
  name: string;
}

interface CarItem {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  licensePlate: string;
  pricePerDay: number;
  securityDeposit: number;
  imageMain?: string;
  status: "AVAILABLE" | "RESERVED" | "UNAVAILABLE" | "MAINTENANCE";
  category?: MasterItem | null;
}

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CarItem["status"] }) {
  const map: Record<
    CarItem["status"],
    { label: string; className: string }
  > = {
    AVAILABLE: {
      label: "Available",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    RESERVED: {
      label: "Reserved",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    MAINTENANCE: {
      label: "Maintenance",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    UNAVAILABLE: {
      label: "Unavailable",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
  };

  const { label, className } = map[status] ?? map.UNAVAILABLE;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function CarsPage() {
  const router = useRouter();

  // ✅ Single hook — fetches user, checks permission, exposes hasPermission
  const { loading: authLoading, hasAccess, hasPermission } =
    usePagePermission(PERMISSIONS.CARS_VIEW, "/admin");

  // ── Derived permissions ──────────────────────────────────
  const canCreateCars = hasPermission(PERMISSIONS.CARS_CREATE);
  const canEditCars = hasPermission(PERMISSIONS.CARS_EDIT);
  const canDeleteCars = hasPermission(PERMISSIONS.CARS_DELETE);

  // ── State ────────────────────────────────────────────────
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [categories, setCategories] = useState<MasterItem[]>([]);

  // ── Search debounce ──────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // ── Load categories ──────────────────────────────────────
  useEffect(() => {
    if (authLoading || !hasAccess) return;

    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    loadCategories();
  }, [authLoading, hasAccess]);

  // ── Fetch cars ───────────────────────────────────────────
  const fetchCars = useCallback(async () => {
    if (authLoading || !hasAccess) {
      setCars([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("categoryId", categoryFilter);

      const res = await fetch(`/api/admin/cars?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      const result = await res.json();

      setCars(
        res.ok && result.success && Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, hasAccess, debouncedSearch, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // ── Delete car ───────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!canDeleteCars) {
      alert("You do not have permission to delete vehicles.");
      return;
    }

    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    // Optimistic update
    const previous = cars;
    setCars((prev) => prev.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/admin/cars/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete");
    } catch (error) {
      console.error(error);
      alert("Could not delete vehicle. Rolling back.");
      setCars(previous);
    }
  };

  // ── Table columns ────────────────────────────────────────
  const columns: Column<CarItem>[] = [
    {
      header: "Vehicle",
      accessor: (car) => (
        <div className="flex items-center gap-3 min-w-35">
          <img
            src={car.imageMain || "/placeholder.png"}
            alt={`${car.manufacturer} ${car.model}`}
            className="w-10 h-10 rounded-md object-cover border bg-gray-50 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {car.manufacturer} {car.model}
            </div>
            <div className="text-xs text-gray-400">{car.year}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Plate",
      accessor: (car) => (
        <span className="font-mono text-xs text-gray-700">
          {car.licensePlate || "N/A"}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: (car) => car.category?.name ?? "Standard",
    },
    {
      header: "Status",
      accessor: (car) => <StatusBadge status={car.status} />,
    },
    {
      header: "Rate / Day",
      accessor: (car) => (
        <span className="font-medium text-gray-900">
          ₹{car.pricePerDay?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (car) => (
        <div className="inline-flex items-center gap-2 text-gray-400 justify-end w-full">
          {hasAccess && (
            <button
              onClick={() => router.push(`/admin/cars/${car.id}`)}
              className="hover:text-black p-1 hover:bg-gray-100 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {canEditCars && (
            <button
              onClick={() => router.push(`/admin/cars/${car.id}/edit`)}
              className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
              title="Edit Vehicle"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canDeleteCars && (
            <button
              onClick={() => handleDelete(car.id)}
              className="hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ── Guards ───────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-gray-500">Loading permissions...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center max-w-sm mx-auto">
          <h2 className="text-lg font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to view vehicles.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <DataExplorer<CarItem>
        title="Vehicles"
        subtitle="Overview of all active fleet vehicles."
        data={cars}
        loading={loading}
        keyExtractor={(car) => car.id}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by make, model, plate..."
        addLabel={canCreateCars ? "Add Vehicle" : undefined}
        onAdd={canCreateCars ? () => router.push("/admin/cars/new") : undefined}
        onRefresh={fetchCars}
        filters={[
          {
            key: "status",
            label: "All Statuses",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Available", value: "AVAILABLE" },
              { label: "Reserved", value: "RESERVED" },
              { label: "Maintenance", value: "MAINTENANCE" },
              { label: "Unavailable", value: "UNAVAILABLE" },
            ],
          },
          {
            key: "category",
            label: "All Categories",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map((c) => ({
              label: c.name,
              value: c.id,
            })),
          },
        ]}
        columns={columns}
        renderGridCard={(car) => (
          <div className="border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full max-w-sm mx-auto w-full">
            <div className="relative h-48 sm:h-40 md:h-44 lg:h-48 w-full bg-gray-100">
              <img
                src={car.imageMain || "/placeholder.png"}
                alt={`${car.manufacturer} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <StatusBadge status={car.status} />
              </div>
            </div>

            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-snug truncate">
                    {car.manufacturer} {car.model}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                    {car.licensePlate || "N/A"} • {car.year}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    ₹{car.pricePerDay?.toLocaleString() ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-400 block">/day</span>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-400 gap-2 flex-wrap">
                <span className="text-[11px] text-gray-500 truncate">
                  {car.category?.name ?? "Standard"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {hasAccess && (
                    <button
                      onClick={() => router.push(`/admin/cars/${car.id}`)}
                      className="p-1.5 hover:text-black hover:bg-gray-100 rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  {canEditCars && (
                    <button
                      onClick={() => router.push(`/admin/cars/${car.id}/edit`)}
                      className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  {canDeleteCars && (
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}