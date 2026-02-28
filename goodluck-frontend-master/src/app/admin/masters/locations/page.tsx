"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    MapPin, Building2, Navigation, Plus, Trash2,
    Globe, Pencil, Check, X
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import locationsData from "@/lib/mock-data/locations.json";

interface State { id: string; name: string; }
interface City { id: string; name: string; stateId: string; stateName: string; }
interface Station { id: string; name: string; cityId: string; cityName: string; stateId: string; stateName: string; }

const uid = (prefix: string) => `${prefix}${Date.now()}`;

// ─── Inline Edit Row (desktop only) ──────────────────────────────────────────
function InlineEditRow({ value, onSave, onCancel }: { id: string; value: string; onSave: (v: string) => void; onCancel: () => void }) {
    const [val, setVal] = useState(value);
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center gap-1.5">
            <Input
                ref={ref} autoFocus className="h-7 text-sm w-40" value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") onSave(val); if (e.key === "Escape") onCancel(); }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => onSave(val)}>
                <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:bg-muted" onClick={onCancel}>
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default function LocationMasterPage() {
    const [states, setStates] = useState<State[]>(locationsData.states);
    const [cities, setCities] = useState<City[]>(locationsData.cities);
    const [stations, setStations] = useState<Station[]>(locationsData.stations);

    const [activeTab, setActiveTab] = useState<"states" | "cities" | "stations">("states");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // ── Inline edit state (desktop) ───────────────────────────────────────────
    const [editingStateId, setEditingStateId] = useState<string | null>(null);
    const [editingCityId, setEditingCityId] = useState<string | null>(null);
    const [editingStationId, setEditingStationId] = useState<string | null>(null);

    // ── Mobile bottom sheet state ─────────────────────────────────────────────
    type SheetMode = "add" | "edit";
    const [stateSheet, setStateSheet] = useState<{ open: boolean; mode: SheetMode; editId?: string }>({ open: false, mode: "add" });
    const [citySheet, setCitySheet] = useState<{ open: boolean; mode: SheetMode; editId?: string }>({ open: false, mode: "add" });
    const [stationSheet, setStationSheet] = useState<{ open: boolean; mode: SheetMode; editId?: string }>({ open: false, mode: "add" });

    // ── Mobile form state ─────────────────────────────────────────────────────
    const [mobileStateName, setMobileStateName] = useState("");
    const [mobileCityStateId, setMobileCityStateId] = useState("");
    const [mobileCityName, setMobileCityName] = useState("");
    const [mobileStnStateId, setMobileStnStateId] = useState("");
    const [mobileStnCityId, setMobileStnCityId] = useState("");
    const [mobileStnName, setMobileStnName] = useState("");

    // ── Desktop add forms ─────────────────────────────────────────────────────
    const [newState, setNewState] = useState("");
    const [cityStateId, setCityStateId] = useState("");
    const [newCity, setNewCity] = useState("");
    const [cityStateFilter] = useState("all");
    const [stnStateId, setStnStateId] = useState("");
    const [stnCityId, setStnCityId] = useState("");
    const [newStation, setNewStation] = useState("");

    // ── Derived ───────────────────────────────────────────────────────────────
    const citiesForState = useMemo(() => cities.filter(c => c.stateId === cityStateId), [cities, cityStateId]);
    const citiesForStnForm = useMemo(() => cities.filter(c => c.stateId === stnStateId), [cities, stnStateId]);
    const citiesForMobileCity = useMemo(() => cities.filter(c => c.stateId === mobileCityStateId), [cities, mobileCityStateId]);
    const citiesForMobileStn = useMemo(() => cities.filter(c => c.stateId === mobileStnStateId), [cities, mobileStnStateId]);

    const filteredStates = states;
    const filteredCities = useMemo(() =>
        cityStateFilter === "all" ? cities : cities.filter(c => c.stateId === cityStateFilter),
        [cities, cityStateFilter]);
    const filteredStations = stations;

    // ─── STATE HANDLERS ───────────────────────────────────────────────────────
    const addState = (name: string) => {
        const n = name.trim();
        if (!n) { toast.error("State name is required"); return false; }
        if (states.some(s => s.name.toLowerCase() === n.toLowerCase())) { toast.error("State already exists"); return false; }
        setStates(p => [...p, { id: uid("ST"), name: n }]);
        toast.success(`"${n}" added`);
        return true;
    };
    const saveState = (id: string, val: string) => {
        const name = val.trim();
        if (!name) { toast.error("Name cannot be empty"); return; }
        if (states.some(s => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) { toast.error("State already exists"); return; }
        setStates(p => p.map(s => s.id === id ? { ...s, name } : s));
        setCities(p => p.map(c => c.stateId === id ? { ...c, stateName: name } : c));
        setStations(p => p.map(s => s.stateId === id ? { ...s, stateName: name } : s));
        setEditingStateId(null);
        toast.success(`Updated to "${name}"`);
    };
    const deleteState = (id: string, name: string) => {
        if (cities.some(c => c.stateId === id)) { toast.error("Remove all cities in this state first"); return; }
        setStates(p => p.filter(s => s.id !== id));
        toast.success(`"${name}" removed`);
    };

    // ─── CITY HANDLERS ────────────────────────────────────────────────────────
    const addCity = (stateId: string, name: string) => {
        const n = name.trim();
        if (!stateId) { toast.error("Please select a state"); return false; }
        if (!n) { toast.error("City name is required"); return false; }
        const st = states.find(s => s.id === stateId)!;
        if (cities.some(c => c.stateId === stateId && c.name.toLowerCase() === n.toLowerCase())) { toast.error("City already exists in this state"); return false; }
        setCities(p => [...p, { id: uid("CT"), name: n, stateId: st.id, stateName: st.name }]);
        toast.success(`"${n}" added to ${st.name}`);
        return true;
    };
    const saveCity = (id: string, val: string) => {
        const name = val.trim();
        if (!name) { toast.error("Name cannot be empty"); return; }
        const city = cities.find(c => c.id === id)!;
        if (cities.some(c => c.id !== id && c.stateId === city.stateId && c.name.toLowerCase() === name.toLowerCase())) { toast.error("City already exists in this state"); return; }
        setCities(p => p.map(c => c.id === id ? { ...c, name } : c));
        setStations(p => p.map(s => s.cityId === id ? { ...s, cityName: name } : s));
        setEditingCityId(null);
        toast.success(`Updated to "${name}"`);
    };
    const deleteCity = (id: string, name: string) => {
        if (stations.some(s => s.cityId === id)) { toast.error("Remove all stations in this city first"); return; }
        setCities(p => p.filter(c => c.id !== id));
        toast.success(`"${name}" removed`);
    };

    // ─── STATION HANDLERS ─────────────────────────────────────────────────────
    const addStation = (stateId: string, cityId: string, name: string) => {
        const n = name.trim();
        if (!stateId) { toast.error("Please select a state"); return false; }
        if (!cityId) { toast.error("Please select a city"); return false; }
        if (!n) { toast.error("Station name is required"); return false; }
        const st = states.find(s => s.id === stateId)!;
        const ct = cities.find(c => c.id === cityId)!;
        if (stations.some(s => s.cityId === cityId && s.name.toLowerCase() === n.toLowerCase())) { toast.error("Station already exists in this city"); return false; }
        setStations(p => [...p, { id: uid("STN"), name: n, cityId: ct.id, cityName: ct.name, stateId: st.id, stateName: st.name }]);
        toast.success(`"${n}" added under ${ct.name}`);
        return true;
    };
    const saveStation = (id: string, val: string) => {
        const name = val.trim();
        if (!name) { toast.error("Name cannot be empty"); return; }
        const stn = stations.find(s => s.id === id)!;
        if (stations.some(s => s.id !== id && s.cityId === stn.cityId && s.name.toLowerCase() === name.toLowerCase())) { toast.error("Station already exists in this city"); return; }
        setStations(p => p.map(s => s.id === id ? { ...s, name } : s));
        setEditingStationId(null);
        toast.success(`Updated to "${name}"`);
    };
    const deleteStation = (id: string, name: string) => {
        setStations(p => p.filter(s => s.id !== id));
        toast.success(`"${name}" removed`);
    };

    // ── Mobile sheet openers ───────────────────────────────────────────────────
    const openStateSheet = (mode: SheetMode, row?: State) => {
        setMobileStateName(mode === "edit" ? row?.name ?? "" : "");
        setStateSheet({ open: true, mode, editId: row?.id });
    };
    const openCitySheet = (mode: SheetMode, row?: City) => {
        setMobileCityStateId(mode === "edit" ? row?.stateId ?? "" : "");
        setMobileCityName(mode === "edit" ? row?.name ?? "" : "");
        setCitySheet({ open: true, mode, editId: row?.id });
    };
    const openStationSheet = (mode: SheetMode, row?: Station) => {
        setMobileStnStateId(mode === "edit" ? row?.stateId ?? "" : "");
        setMobileStnCityId(mode === "edit" ? row?.cityId ?? "" : "");
        setMobileStnName(mode === "edit" ? row?.name ?? "" : "");
        setStationSheet({ open: true, mode, editId: row?.id });
    };

    // ── Mobile submit handlers ─────────────────────────────────────────────────
    const submitStateSheet = () => {
        if (stateSheet.mode === "add") {
            if (addState(mobileStateName)) { setStateSheet({ open: false, mode: "add" }); setMobileStateName(""); }
        } else if (stateSheet.editId) {
            saveState(stateSheet.editId, mobileStateName);
            setStateSheet({ open: false, mode: "add" });
        }
    };
    const submitCitySheet = () => {
        if (citySheet.mode === "add") {
            if (addCity(mobileCityStateId, mobileCityName)) { setCitySheet({ open: false, mode: "add" }); setMobileCityName(""); setMobileCityStateId(""); }
        } else if (citySheet.editId) {
            saveCity(citySheet.editId, mobileCityName);
            setCitySheet({ open: false, mode: "add" });
        }
    };
    const submitStationSheet = () => {
        if (stationSheet.mode === "add") {
            if (addStation(mobileStnStateId, mobileStnCityId, mobileStnName)) { setStationSheet({ open: false, mode: "add" }); setMobileStnName(""); setMobileStnStateId(""); setMobileStnCityId(""); }
        } else if (stationSheet.editId) {
            saveStation(stationSheet.editId, mobileStnName);
            setStationSheet({ open: false, mode: "add" });
        }
    };

    // ─── GRID COLUMNS & ACTIONS ───────────────────────────────────────────────
    const STATE_COLUMNS: GridColumn<State>[] = [
        {
            key: "name", header: "State Name", sortable: true, filterable: true,
            render: (val, row) => editingStateId === row.id ? (
                <InlineEditRow id={row.id} value={row.name} onSave={v => saveState(row.id, v)} onCancel={() => setEditingStateId(null)} />
            ) : (
                <span className="font-semibold flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {val}</span>
            )
        },
        { key: "citiesCount" as keyof State, header: "Cities", width: 100, align: "center", render: (_, row) => <Badge variant="secondary" className="text-[10px]">{cities.filter(c => c.stateId === row.id).length}</Badge> },
        { key: "stationsCount" as keyof State, header: "Stations", width: 100, align: "center", render: (_, row) => <Badge variant="outline" className="text-[10px]">{stations.filter(st => st.stateId === row.id).length}</Badge> },
    ];
    const stateRowActions: RowAction<State>[] = [
        {
            label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: (s) => isMobile ? openStateSheet("edit", s) : setEditingStateId(s.id)
        },
        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (s) => deleteState(s.id, s.name), danger: true },
    ];

    const CITY_COLUMNS: GridColumn<City>[] = [
        {
            key: "name", header: "City Name", sortable: true, filterable: true,
            render: (val, row) => editingCityId === row.id ? (
                <InlineEditRow id={row.id} value={row.name} onSave={v => saveCity(row.id, v)} onCancel={() => setEditingCityId(null)} />
            ) : (
                <span className="font-semibold flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" /> {val}</span>
            )
        },
        { key: "stateName", header: "State", width: 150, sortable: true, filterable: true, render: (val) => <Badge variant="outline" className="text-[10px] gap-1"><MapPin className="h-2.5 w-2.5" />{val}</Badge> },
        { key: "stationsCount" as keyof City, header: "Stations", width: 100, align: "center", render: (_, row) => <Badge variant="secondary" className="text-[10px]">{stations.filter(s => s.cityId === row.id).length}</Badge> },
    ];
    const cityRowActions: RowAction<City>[] = [
        {
            label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: (c) => isMobile ? openCitySheet("edit", c) : setEditingCityId(c.id)
        },
        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (c) => deleteCity(c.id, c.name), danger: true },
    ];

    const STATION_COLUMNS: GridColumn<Station>[] = [
        {
            key: "name", header: "Station Name", sortable: true, filterable: true,
            render: (val, row) => editingStationId === row.id ? (
                <InlineEditRow id={row.id} value={row.name} onSave={v => saveStation(row.id, v)} onCancel={() => setEditingStationId(null)} />
            ) : (
                <span className="font-semibold flex items-center gap-2"><Navigation className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {val}</span>
            )
        },
        { key: "cityName", header: "City", width: 150, sortable: true, filterable: true, render: (val) => <Badge variant="outline" className="text-[10px] gap-1"><Building2 className="h-2.5 w-2.5 text-blue-600" />{val}</Badge> },
        { key: "stateName", header: "State", width: 150, sortable: true, filterable: true, render: (val) => <Badge variant="secondary" className="text-[10px] gap-1"><MapPin className="h-2.5 w-2.5" />{val}</Badge> },
    ];
    const stationRowActions: RowAction<Station>[] = [
        {
            label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: (s) => isMobile ? openStationSheet("edit", s) : setEditingStationId(s.id)
        },
        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (s) => deleteStation(s.id, s.name), danger: true },
    ];

    // ── Shared bottom sheet shell ──────────────────────────────────────────────
    const BottomSheet = ({ open, onClose, title, children, onSubmit, submitLabel }: {
        open: boolean; onClose: () => void; title: string;
        children: React.ReactNode; onSubmit: () => void; submitLabel: string;
    }) => {
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/60" onClick={onClose} />
                <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "85dvh", display: "flex", flexDirection: "column" }}>
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 rounded-full bg-border" />
                    </div>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                        <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-5 pb-4">
                        {children}
                    </div>
                    {/* Footer */}
                    <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0 flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onClose}>Cancel</Button>
                        <Button className="flex-1 h-12 rounded-2xl font-semibold" onClick={onSubmit}>{submitLabel}</Button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Tab label helpers ──────────────────────────────────────────────────────
    const tabMeta = {
        states: { icon: <MapPin className="h-4 w-4" />, label: "States", count: states.length, color: "text-primary" },
        cities: { icon: <Building2 className="h-4 w-4" />, label: "Cities", count: cities.length, color: "text-blue-600" },
        stations: { icon: <Navigation className="h-4 w-4" />, label: "Stations", count: stations.length, color: "text-emerald-600" },
    } as const;

    const addButtonLabel = activeTab === "states" ? "Add State" : activeTab === "cities" ? "Add City" : "Add Station";
    const onMobileAdd = () => {
        if (activeTab === "states") openStateSheet("add");
        else if (activeTab === "cities") openCitySheet("add");
        else openStationSheet("add");
    };

    return (
        <PageContainer>
            {/* ── Mobile Bottom Sheets ── */}

            {/* State Sheet */}
            <BottomSheet
                open={stateSheet.open && isMobile}
                onClose={() => setStateSheet({ open: false, mode: "add" })}
                title={stateSheet.mode === "add" ? "Add State" : "Edit State"}
                onSubmit={submitStateSheet}
                submitLabel={stateSheet.mode === "add" ? "Add State" : "Save Changes"}
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>State Name <span className="text-destructive">*</span></Label>
                        <Input
                            placeholder="e.g. Madhya Pradesh"
                            value={mobileStateName}
                            onChange={e => setMobileStateName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitStateSheet()}
                        />
                    </div>
                </div>
            </BottomSheet>

            {/* City Sheet */}
            <BottomSheet
                open={citySheet.open && isMobile}
                onClose={() => setCitySheet({ open: false, mode: "add" })}
                title={citySheet.mode === "add" ? "Add City" : "Edit City"}
                onSubmit={submitCitySheet}
                submitLabel={citySheet.mode === "add" ? "Add City" : "Save Changes"}
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Select State <span className="text-destructive">*</span></Label>
                        <NativeSelect
                            value={mobileCityStateId}
                            onValueChange={v => { setMobileCityStateId(v); setMobileCityName(""); }}
                            placeholder="Choose a state"
                            disabled={citySheet.mode === "edit"}
                        >
                            {states.map(s => <NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>)}
                        </NativeSelect>
                    </div>
                    {mobileCityStateId && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
                            <MapPin className="h-3 w-3" />
                            {states.find(s => s.id === mobileCityStateId)?.name} · {citiesForMobileCity.length} cities
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label>City Name <span className="text-destructive">*</span></Label>
                        <Input
                            placeholder="e.g. Bhopal"
                            value={mobileCityName}
                            disabled={!mobileCityStateId}
                            onChange={e => setMobileCityName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitCitySheet()}
                        />
                    </div>
                </div>
            </BottomSheet>

            {/* Station Sheet */}
            <BottomSheet
                open={stationSheet.open && isMobile}
                onClose={() => setStationSheet({ open: false, mode: "add" })}
                title={stationSheet.mode === "add" ? "Add Station" : "Edit Station"}
                onSubmit={submitStationSheet}
                submitLabel={stationSheet.mode === "add" ? "Add Station" : "Save Changes"}
            >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label className="flex items-center gap-1.5">
                            <span className="h-4 w-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">1</span>
                            Select State <span className="text-destructive">*</span>
                        </Label>
                        <NativeSelect
                            value={mobileStnStateId}
                            onValueChange={v => { setMobileStnStateId(v); setMobileStnCityId(""); setMobileStnName(""); }}
                            placeholder="Choose state"
                            disabled={stationSheet.mode === "edit"}
                        >
                            {states.map(s => <NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>)}
                        </NativeSelect>
                    </div>
                    <div className="grid gap-2">
                        <Label className={`flex items-center gap-1.5 ${!mobileStnStateId ? "opacity-40" : ""}`}>
                            <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                            Select City <span className="text-destructive">*</span>
                        </Label>
                        <NativeSelect
                            value={mobileStnCityId}
                            onValueChange={v => { setMobileStnCityId(v); setMobileStnName(""); }}
                            placeholder={mobileStnStateId ? "Choose city" : "Select state first"}
                            disabled={!mobileStnStateId || stationSheet.mode === "edit"}
                        >
                            {citiesForMobileStn.map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
                        </NativeSelect>
                    </div>
                    {mobileStnCityId && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                            <Navigation className="h-3 w-3" />
                            {states.find(s => s.id === mobileStnStateId)?.name} → {cities.find(c => c.id === mobileStnCityId)?.name}
                            <span className="ml-auto text-emerald-500">{stations.filter(s => s.cityId === mobileStnCityId).length} stations</span>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label className={`flex items-center gap-1.5 ${!mobileStnCityId ? "opacity-40" : ""}`}>
                            <span className="h-4 w-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                            Station Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. Civil Lines"
                            value={mobileStnName}
                            disabled={!mobileStnCityId}
                            onChange={e => setMobileStnName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitStationSheet()}
                        />
                    </div>
                </div>
            </BottomSheet>

            {/* ── Mobile Header ── */}
            <div className="md:hidden mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" /> Location Master
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">State → City → Station hierarchy</p>
                    </div>
                    <Button size="sm" className="h-9 px-3" onClick={onMobileAdd}>
                        <Plus className="h-4 w-4 mr-1" />{activeTab === "states" ? "State" : activeTab === "cities" ? "City" : "Station"}
                    </Button>
                </div>
            </div>

            {/* ── Desktop Header ── */}
            <div className="hidden md:block mb-6">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Location Master
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage State → City → Station hierarchy used across the entire system
                </p>
            </div>

            {/* ── Tab Bar ── */}
            <div className="flex bg-muted/50 p-1 rounded-2xl mb-5 overflow-x-auto no-scrollbar border w-full md:w-max">
                {(["states", "cities", "stations"] as const).map(tab => {
                    const m = tabMeta[tab];
                    const active = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 py-2 px-4 md:px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${active ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
                        >
                            <span className={active ? m.color : ""}>{m.icon}</span>
                            {m.label}
                            <Badge variant={active ? "default" : "secondary"} className="ml-0.5 text-[10px] h-4 px-1">{m.count}</Badge>
                        </button>
                    );
                })}
            </div>

            {/* ══ TAB 1 — STATES ══ */}
            {activeTab === "states" && (
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Desktop Add Card */}
                    <Card className="hidden md:block lg:col-span-1 self-start">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Add State</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-1.5">
                                <Label className="text-xs">State Name *</Label>
                                <Input placeholder="e.g. Madhya Pradesh" value={newState}
                                    onChange={e => setNewState(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { if (addState(newState)) setNewState(""); } }} />
                            </div>
                            <Button className="w-full" onClick={() => { if (addState(newState)) setNewState(""); }}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add State
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-2">
                        <DataGrid data={filteredStates} columns={STATE_COLUMNS} rowActions={stateRowActions} density="compact" maxHeight={420} selectable rowKey="id" />
                    </div>
                </div>
            )}

            {/* ══ TAB 2 — CITIES ══ */}
            {activeTab === "cities" && (
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Desktop Add Card */}
                    <Card className="hidden md:block lg:col-span-1 self-start">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Add City</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Select State *</Label>
                                <Select value={cityStateId} onValueChange={v => { setCityStateId(v); setNewCity(""); }}>
                                    <SelectTrigger><SelectValue placeholder="Choose a state first" /></SelectTrigger>
                                    <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {cityStateId && (
                                <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary font-medium flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3" />
                                    {states.find(s => s.id === cityStateId)?.name} · {citiesForState.length} cities
                                </div>
                            )}
                            <div className="grid gap-1.5">
                                <Label className="text-xs">City Name *</Label>
                                <Input placeholder="e.g. Bhopal" value={newCity} disabled={!cityStateId}
                                    onChange={e => setNewCity(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { if (addCity(cityStateId, newCity)) setNewCity(""); } }} />
                            </div>
                            <Button className="w-full" onClick={() => { if (addCity(cityStateId, newCity)) setNewCity(""); }} disabled={!cityStateId}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add City
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-2">
                        <DataGrid data={filteredCities} columns={CITY_COLUMNS} rowActions={cityRowActions} density="compact" maxHeight={420} selectable rowKey="id" />
                    </div>
                </div>
            )}

            {/* ══ TAB 3 — STATIONS ══ */}
            {activeTab === "stations" && (
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Desktop Add Card */}
                    <Card className="hidden md:block lg:col-span-1 self-start">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Add Station</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-1.5">
                                <Label className="text-xs flex items-center gap-1.5">
                                    <span className="h-4 w-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">1</span>
                                    Select State *
                                </Label>
                                <Select value={stnStateId} onValueChange={v => { setStnStateId(v); setStnCityId(""); setNewStation(""); }}>
                                    <SelectTrigger><SelectValue placeholder="Choose state" /></SelectTrigger>
                                    <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label className={`text-xs flex items-center gap-1.5 ${!stnStateId ? "opacity-40" : ""}`}>
                                    <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                                    Select City *
                                </Label>
                                <Select value={stnCityId} onValueChange={v => { setStnCityId(v); setNewStation(""); }} disabled={!stnStateId}>
                                    <SelectTrigger><SelectValue placeholder={stnStateId ? "Choose city" : "Select state first"} /></SelectTrigger>
                                    <SelectContent>{citiesForStnForm.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {stnCityId && (
                                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                                    <Navigation className="h-3 w-3" />
                                    {states.find(s => s.id === stnStateId)?.name} → {cities.find(c => c.id === stnCityId)?.name}
                                    <span className="ml-auto text-emerald-500">{stations.filter(s => s.cityId === stnCityId).length} stations</span>
                                </div>
                            )}
                            <div className="grid gap-1.5">
                                <Label className={`text-xs flex items-center gap-1.5 ${!stnCityId ? "opacity-40" : ""}`}>
                                    <span className="h-4 w-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                                    Station Name *
                                </Label>
                                <Input placeholder="e.g. Civil Lines" value={newStation} disabled={!stnCityId}
                                    onChange={e => setNewStation(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { if (addStation(stnStateId, stnCityId, newStation)) setNewStation(""); } }} />
                            </div>
                            <Button className="w-full" onClick={() => { if (addStation(stnStateId, stnCityId, newStation)) setNewStation(""); }} disabled={!stnCityId}>
                                <Plus className="h-4 w-4 mr-1.5" /> Add Station
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-2">
                        <DataGrid data={filteredStations} columns={STATION_COLUMNS} rowActions={stationRowActions} density="compact" maxHeight={420} selectable rowKey="id" />
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
