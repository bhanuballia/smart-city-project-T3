from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel
import math

app = FastAPI(
    title="Smart City Optimizer",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


@app.get("/")
def root():
    return {"status": "ok", "service": "optimizer"}


class Location(BaseModel):
    lat: float
    lng: float


class Stop(BaseModel):
    id: str
    demand: float
    service_minutes: float = 2.0
    location: Location


class Truck(BaseModel):
    id: str
    capacity: float
    max_minutes: float = 480.0


class WasteRoutingRequest(BaseModel):
    depot: Location
    stops: List[Stop]
    trucks: List[Truck]


class EnergyDevice(BaseModel):
    id: str
    power_kw: float
    deferrable: bool = False
    duration_slots: int = 0  # number of slots needed if deferrable


class EnergyBalanceRequest(BaseModel):
    price_per_slot: List[float]
    forecast_load_kw: List[float]
    devices: List[EnergyDevice]
    peak_threshold_kw: Optional[float] = None


def haversine_minutes(a: Location, b: Location, speed_kmph: float = 30.0) -> float:
    R = 6371.0
    dlat = math.radians(b.lat - a.lat)
    dlon = math.radians(b.lng - a.lng)
    sa = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(a.lat))
        * math.cos(math.radians(b.lat))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(sa ** 0.5, (1 - sa) ** 0.5)
    km = R * c
    hours = km / speed_kmph
    return hours * 60.0


def two_opt(route: List[Stop], depot: Location) -> List[Stop]:
    if len(route) < 4:
        return route
    best = route[:]
    improved = True
    while improved:
        improved = False
        for i in range(1, len(best) - 2):
            for j in range(i + 1, len(best)):
                new_route = best[:]
                new_route[i:j] = reversed(best[i:j])
                if route_cost(new_route, depot) < route_cost(best, depot):
                    best = new_route
                    improved = True
    return best


def route_cost(route: List[Stop], depot: Location) -> float:
    minutes = 0.0
    curr = depot
    for s in route:
        minutes += haversine_minutes(curr, s.location)
        minutes += s.service_minutes
        curr = s.location
    minutes += haversine_minutes(curr, depot)
    return minutes


@app.post("/waste-routing")
def waste_routing(req: WasteRoutingRequest):
    stops = req.stops[:]
    # Sweep by angle from depot
    def angle(s: Stop) -> float:
        return math.atan2(s.location.lat - req.depot.lat, s.location.lng - req.depot.lng)

    stops.sort(key=angle)
    routes = []
    i = 0
    truck_idx = 0
    while i < len(stops) and truck_idx < len(req.trucks):
        truck = req.trucks[truck_idx]
        load = 0.0
        route = []
        while i < len(stops):
            if load + stops[i].demand <= truck.capacity:
                route.append(stops[i])
                load += stops[i].demand
                i += 1
            else:
                break
        route = two_opt(route, req.depot)
        total_minutes = route_cost(route, req.depot)
        routes.append({
            "truck_id": truck.id,
            "stops": [s.id for s in route],
            "load": load,
            "minutes": total_minutes,
        })
        truck_idx += 1
    return {
        "num_routes": len(routes),
        "routes": routes,
    }


@app.post("/energy-balance")
def energy_balance(req: EnergyBalanceRequest):
    T = len(req.price_per_slot)
    load = req.forecast_load_kw[:]
    # simple peak threshold rule
    threshold = req.peak_threshold_kw or (max(load) * 0.9)

    schedule = {d.id: [0] * T for d in req.devices}
    remaining = {d.id: d.duration_slots for d in req.devices if d.deferrable and d.duration_slots > 0}

    # Greedy: schedule deferrable loads in cheapest slots first
    cheap_order = sorted(range(T), key=lambda t: req.price_per_slot[t])
    for dev in req.devices:
        if dev.deferrable and dev.duration_slots > 0:
            for t in cheap_order:
                if remaining[dev.id] <= 0:
                    break
                # avoid exceeding threshold
                if load[t] + dev.power_kw <= threshold:
                    schedule[dev.id][t] = 1
                    load[t] += dev.power_kw
                    remaining[dev.id] -= 1

    peak = max(load)
    cost = sum(p * l for p, l in zip(req.price_per_slot, load))
    return {
        "scheduled_load_kw": load,
        "peak_kw": peak,
        "energy_cost": cost,
        "device_schedule": schedule,
    }


