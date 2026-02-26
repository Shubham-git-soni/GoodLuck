"use client";

import { useState, useMemo, useRef } from "react";
import {
    MapPin, Building2, Navigation, Plus, Trash2, Search,
    ChevronRight, Globe, RotateCcw, Pencil, Check, X
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import locationsData from "@/lib/mock-data/locations.json";

interface State { id: string; name: string; }
interface City { id: string; name: string; stateId: string; stateName: string; }
interface Station { id: string; name: string; cityId: string; cityName: string; stateId: string; stateName: string; }

const uid = (prefix: string) => `${prefix}${Date.now()}`;

// ─── Inline Edit Row for just a name ─────────────────────────────────────────
function InlineEditRow({
    id, value, onSave, onCancel
}: { id: string; value: string; onSave: (v: string) => void; onCancel: () => void }) {
    const [val, setVal] = useState(value);
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center gap-1.5">
            <Input
                ref={ref}
                autoFocus
                className="h-7 text-sm w-40"
                value={val}
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

// ─── Action buttons: Edit + Delete ────────────────────────────────────────────
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default function LocationMasterPage() {
    const [states, setStates] = useState<State[]>(locationsData.states);
    const [cities, setCities] = useState<City[]>(locationsData.cities);
    const [stations, setStations] = useState<Station[]>(locationsData.stations);

    // ── Inline edit state (which id is being edited) ─────────────────────────
    const [editingStateId, setEditingStateId] = useState<string | null>(null);
    const [editingCityId, setEditingCityId] = useState<string | null>(null);
    const [editingStationId, setEditingStationId] = useState<string | null>(null);

    // ── Add forms ─────────────────────────────────────────────────────────────
    const [newState, setNewState] = useState("");
    const [stateSearch, setStateSearch] = useState("");

    const [cityStateId, setCityStateId] = useState("");
    const [newCity, setNewCity] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [cityStateFilter, setCityStateFilter] = useState("all");

    const [stnStateId, setStnStateId] = useState("");
    const [stnCityId, setStnCityId] = useState("");
    const [newStation, setNewStation] = useState("");
    const [stnSearch, setStnSearch] = useState("");
    const [stnStateFilter, setStnStateFilter] = useState("all");
    const [stnCityFilter, setStnCityFilter] = useState("all");

    // ── Derived ────────────────────────────────────────────────────────────────
    const citiesForState = useMemo(() => cities.filter(c => c.stateId === cityStateId), [cities, cityStateId]);
    const citiesForStnForm = useMemo(() => cities.filter(c => c.stateId === stnStateId), [cities, stnStateId]);
    const citiesForStnFilter = useMemo(() =>
        stnStateFilter === "all" ? cities : cities.filter(c => c.stateId === stnStateFilter),
        [cities, stnStateFilter]);

    const filteredStates = useMemo(() =>
        states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())), [states, stateSearch]);

    const filteredCities = useMemo(() =>
        cities.filter(c => {
            const ms = cityStateFilter === "all" || c.stateId === cityStateFilter;
            const mq = c.name.toLowerCase().includes(citySearch.toLowerCase());
            return ms && mq;
        }), [cities, citySearch, cityStateFilter]);

    const filteredStations = useMemo(() =>
        stations.filter(s => {
            const ms = stnStateFilter === "all" || s.stateId === stnStateFilter;
            const mc = stnCityFilter === "all" || s.cityId === stnCityFilter;
            const mq = s.name.toLowerCase().includes(stnSearch.toLowerCase());
            return ms && mc && mq;
        }), [stations, stnSearch, stnStateFilter, stnCityFilter]);

    // ─── STATE HANDLERS ───────────────────────────────────────────────────────
    const addState = () => {
        const name = newState.trim();
        if (!name) { toast.error("State name is required"); return; }
        if (states.some(s => s.name.toLowerCase() === name.toLowerCase())) { toast.error("State already exists"); return; }
        setStates(p => [...p, { id: uid("ST"), name }]);
        setNewState("");
        toast.success(`"${name}" added`);
    };
    const saveState = (id: string, val: string) => {
        const name = val.trim();
        if (!name) { toast.error("Name cannot be empty"); return; }
        if (states.some(s => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) { toast.error("State already exists"); return; }
        setStates(p => p.map(s => s.id === id ? { ...s, name, } : s));
        // Also update stateName in cities & stations
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
    const addCity = () => {
        const name = newCity.trim();
        if (!cityStateId) { toast.error("Please select a state"); return; }
        if (!name) { toast.error("City name is required"); return; }
        const st = states.find(s => s.id === cityStateId)!;
        if (cities.some(c => c.stateId === cityStateId && c.name.toLowerCase() === name.toLowerCase())) { toast.error("City already exists in this state"); return; }
        setCities(p => [...p, { id: uid("CT"), name, stateId: st.id, stateName: st.name }]);
        setNewCity("");
        toast.success(`"${name}" added to ${st.name}`);
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
    const addStation = () => {
        const name = newStation.trim();
        if (!stnStateId) { toast.error("Please select a state"); return; }
        if (!stnCityId) { toast.error("Please select a city"); return; }
        if (!name) { toast.error("Station name is required"); return; }
        const st = states.find(s => s.id === stnStateId)!;
        const ct = cities.find(c => c.id === stnCityId)!;
        if (stations.some(s => s.cityId === stnCityId && s.name.toLowerCase() === name.toLowerCase())) { toast.error("Station already exists in this city"); return; }
        setStations(p => [...p, { id: uid("STN"), name, cityId: ct.id, cityName: ct.name, stateId: st.id, stateName: st.name }]);
        setNewStation("");
        toast.success(`"${name}" added under ${ct.name}`);
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

    // ─── Breadcrumb pill ──────────────────────────────────────────────────────
    const Crumb = ({ label, color }: { label: string; color: string }) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>
    );

    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Location Master
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage State → City → Station hierarchy used across the entire system
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Crumb label={`${states.length} States`} color="bg-primary/10 text-primary" />
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <Crumb label={`${cities.length} Cities`} color="bg-blue-100 text-blue-700" />
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <Crumb label={`${stations.length} Stations`} color="bg-emerald-100 text-emerald-700" />
                </div>
            </div>

            <Tabs defaultValue="states">
                <TabsList className="mb-5 gap-1">
                    <TabsTrigger value="states" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> States   <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{states.length}</Badge></TabsTrigger>
                    <TabsTrigger value="cities" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Cities   <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{cities.length}</Badge></TabsTrigger>
                    <TabsTrigger value="stations" className="gap-1.5"><Navigation className="h-3.5 w-3.5" /> Stations <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{stations.length}</Badge></TabsTrigger>
                </TabsList>

                {/* ══ TAB 1 — STATES ══ */}
                <TabsContent value="states">
                    <div className="grid lg:grid-cols-3 gap-5">
                        <Card className="lg:col-span-1 self-start">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Add State</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">State Name *</Label>
                                    <Input placeholder="e.g. Madhya Pradesh" value={newState}
                                        onChange={e => setNewState(e.target.value)} onKeyDown={e => e.key === "Enter" && addState()} />
                                </div>
                                <Button className="w-full" onClick={addState}><Plus className="h-4 w-4 mr-1.5" /> Add State</Button>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-sm">All States ({filteredStates.length})</CardTitle>
                                    <div className="relative w-56">
                                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input className="pl-8 h-8 text-sm" placeholder="Search states..." value={stateSearch} onChange={e => setStateSearch(e.target.value)} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="w-12">Sr.</TableHead>
                                                <TableHead>State Name</TableHead>
                                                <TableHead className="text-center">Cities</TableHead>
                                                <TableHead className="text-center">Stations</TableHead>
                                                <TableHead className="w-20 text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStates.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No states found.</TableCell></TableRow>
                                            ) : filteredStates.map((s, i) => (
                                                <TableRow key={s.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                                    <TableCell>
                                                        {editingStateId === s.id ? (
                                                            <InlineEditRow id={s.id} value={s.name}
                                                                onSave={v => saveState(s.id, v)}
                                                                onCancel={() => setEditingStateId(null)} />
                                                        ) : (
                                                            <span className="font-semibold flex items-center gap-2">
                                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {s.name}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className="text-[10px]">{cities.filter(c => c.stateId === s.id).length}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="text-[10px]">{stations.filter(st => st.stateId === s.id).length}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {editingStateId !== s.id && (
                                                            <RowActions onEdit={() => setEditingStateId(s.id)} onDelete={() => deleteState(s.id, s.name)} />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ══ TAB 2 — CITIES ══ */}
                <TabsContent value="cities">
                    <div className="grid lg:grid-cols-3 gap-5">
                        <Card className="lg:col-span-1 self-start">
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
                                        onChange={e => setNewCity(e.target.value)} onKeyDown={e => e.key === "Enter" && addCity()} />
                                </div>
                                <Button className="w-full" onClick={addCity} disabled={!cityStateId}>
                                    <Plus className="h-4 w-4 mr-1.5" /> Add City
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <CardTitle className="text-sm">All Cities ({filteredCities.length})</CardTitle>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Select value={cityStateFilter} onValueChange={setCityStateFilter}>
                                            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All States</SelectItem>
                                                {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <div className="relative flex-1 sm:w-44">
                                            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input className="pl-8 h-8 text-sm" placeholder="Search cities..." value={citySearch} onChange={e => setCitySearch(e.target.value)} />
                                        </div>
                                        {(cityStateFilter !== "all" || citySearch) && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setCityStateFilter("all"); setCitySearch(""); }}>
                                                <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="w-12">Sr.</TableHead>
                                                <TableHead>City Name</TableHead>
                                                <TableHead>State</TableHead>
                                                <TableHead className="text-center">Stations</TableHead>
                                                <TableHead className="w-20 text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCities.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No cities found.</TableCell></TableRow>
                                            ) : filteredCities.map((c, i) => (
                                                <TableRow key={c.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                                    <TableCell>
                                                        {editingCityId === c.id ? (
                                                            <InlineEditRow id={c.id} value={c.name}
                                                                onSave={v => saveCity(c.id, v)}
                                                                onCancel={() => setEditingCityId(null)} />
                                                        ) : (
                                                            <span className="font-semibold flex items-center gap-2">
                                                                <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" /> {c.name}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] gap-1">
                                                            <MapPin className="h-2.5 w-2.5" />{c.stateName}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className="text-[10px]">{stations.filter(s => s.cityId === c.id).length}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {editingCityId !== c.id && (
                                                            <RowActions onEdit={() => setEditingCityId(c.id)} onDelete={() => deleteCity(c.id, c.name)} />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ══ TAB 3 — STATIONS ══ */}
                <TabsContent value="stations">
                    <div className="grid lg:grid-cols-3 gap-5">
                        <Card className="lg:col-span-1 self-start">
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
                                        onChange={e => setNewStation(e.target.value)} onKeyDown={e => e.key === "Enter" && addStation()} />
                                </div>
                                <Button className="w-full" onClick={addStation} disabled={!stnCityId}>
                                    <Plus className="h-4 w-4 mr-1.5" /> Add Station
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <CardTitle className="text-sm">All Stations ({filteredStations.length})</CardTitle>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <Select value={stnStateFilter} onValueChange={v => { setStnStateFilter(v); setStnCityFilter("all"); }}>
                                            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All States</SelectItem>
                                                {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={stnCityFilter} onValueChange={setStnCityFilter} disabled={stnStateFilter === "all"}>
                                            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All Cities" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Cities</SelectItem>
                                                {citiesForStnFilter.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <div className="relative flex-1 min-w-[120px]">
                                            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input className="pl-8 h-8 text-sm" placeholder="Search..." value={stnSearch} onChange={e => setStnSearch(e.target.value)} />
                                        </div>
                                        {(stnStateFilter !== "all" || stnCityFilter !== "all" || stnSearch) && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setStnStateFilter("all"); setStnCityFilter("all"); setStnSearch(""); }}>
                                                <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="w-12">Sr.</TableHead>
                                                <TableHead>Station Name</TableHead>
                                                <TableHead>City</TableHead>
                                                <TableHead>State</TableHead>
                                                <TableHead className="w-20 text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStations.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No stations found.</TableCell></TableRow>
                                            ) : filteredStations.map((s, i) => (
                                                <TableRow key={s.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                                    <TableCell>
                                                        {editingStationId === s.id ? (
                                                            <InlineEditRow id={s.id} value={s.name}
                                                                onSave={v => saveStation(s.id, v)}
                                                                onCancel={() => setEditingStationId(null)} />
                                                        ) : (
                                                            <span className="font-semibold flex items-center gap-2">
                                                                <Navigation className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {s.name}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] gap-1">
                                                            <Building2 className="h-2.5 w-2.5 text-blue-600" />{s.cityName}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-[10px] gap-1">
                                                            <MapPin className="h-2.5 w-2.5" />{s.stateName}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {editingStationId !== s.id && (
                                                            <RowActions onEdit={() => setEditingStationId(s.id)} onDelete={() => deleteStation(s.id, s.name)} />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}
