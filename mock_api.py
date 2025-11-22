from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
from datetime import datetime
from typing import Optional

app = FastAPI(title="Mock Crowd Density API", version="1.0.0")

class CCTVRequest(BaseModel):
    cctv_id: str
    zone_id: str
    timestamp: Optional[str] = None

class DensityResponse(BaseModel):
    cctv_id: str
    zone_id: str
    people_count: int
    density_level: str
    confidence: float
    timestamp: str

# Mock CCTVs per zone
ZONE_CCTVS = {
    "zone_1": ["cctv_z1_1", "cctv_z1_2"],
    "zone_2": ["cctv_z2_1", "cctv_z2_2", "cctv_z2_3"],
    "zone_3": ["cctv_z3_1", "cctv_z3_2"],
    "zone_4": ["cctv_z4_1", "cctv_z4_2", "cctv_z4_3"],
    "zone_5": ["cctv_z5_1", "cctv_z5_2"],
    "zone_6": ["cctv_z6_1", "cctv_z6_2"],
    "zone_7": ["cctv_z7_1", "cctv_z7_2", "cctv_z7_3"],
    "zone_8": ["cctv_z8_1", "cctv_z8_2"],
    "zone_9": ["cctv_z9_1", "cctv_z9_2"],
    "zone_10": ["cctv_z10_1", "cctv_z10_2", "cctv_z10_3"],
}

@app.post("/api/crowd-density/cctv", response_model=DensityResponse)
def get_cctv_density(request: CCTVRequest):
    """Mock API: Returns dummy crowd density for a CCTV camera"""

    # Validate CCTV exists in zone
    if request.zone_id in ZONE_CCTVS:
        if request.cctv_id not in ZONE_CCTVS[request.zone_id]:
            raise HTTPException(status_code=404, detail=f"CCTV {request.cctv_id} not found in zone {request.zone_id}")

    # Generate realistic density based on zone type
    zone_num = int(request.zone_id.split('_')[1])

    # Entry zones (1-3) can be busier initially
    if zone_num <= 3:
        base_density = random.randint(30, 75)
    # Main zones (4-7) vary widely
    elif zone_num <= 7:
        base_density = random.randint(15, 85)
    # Back zones (8-10) tend to be less crowded
    else:
        base_density = random.randint(10, 60)

    # Add some random variation
    people_count = max(0, int(base_density + random.gauss(0, 8)))

    # Determine density level
    if people_count < 25:
        density_level = "low"
    elif people_count < 50:
        density_level = "medium"
    elif people_count < 75:
        density_level = "high"
    else:
        density_level = "critical"

    # Confidence based on camera quality simulation
    base_confidence = random.uniform(0.80, 0.95)
    # Newer cameras (odd IDs) have higher confidence
    if int(request.cctv_id.split('_')[-1]) % 2 == 1:
        confidence = min(0.98, base_confidence + 0.1)
    else:
        confidence = base_confidence

    return DensityResponse(
        cctv_id=request.cctv_id,
        zone_id=request.zone_id,
        people_count=people_count,
        density_level=density_level,
        confidence=round(confidence, 2),
        timestamp=request.timestamp or datetime.now().isoformat()
    )

@app.get("/api/crowd-density/zones")
def get_all_zones():
    """Get all available zones and their CCTVs"""
    return {
        "zones": list(ZONE_CCTVS.keys()),
        "cctv_mapping": ZONE_CCTVS,
        "total_cctvs": sum(len(cctvs) for cctvs in ZONE_CCTVS.values())
    }

@app.post("/api/crowd-density/zones/{zone_id}")
def get_zone_densities(zone_id: str):
    """Get densities from all CCTVs in a zone"""
    if zone_id not in ZONE_CCTVS:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")

    densities = []
    for cctv_id in ZONE_CCTVS[zone_id]:
        # Simulate calling the CCTV endpoint
        cctv_data = get_cctv_density(CCTVRequest(cctv_id=cctv_id, zone_id=zone_id))
        densities.append({
            "cctv_id": cctv_data.cctv_id,
            "people_count": cctv_data.people_count,
            "density_level": cctv_data.density_level
        })

    # Calculate aggregated density
    total_people = sum(d["people_count"] for d in densities)
    avg_density = total_people / len(densities)

    return {
        "zone_id": zone_id,
        "cctv_count": len(densities),
        "total_people": total_people,
        "average_density": round(avg_density, 2),
        "density_level": "low" if avg_density < 30 else "medium" if avg_density < 65 else "high",
        "cctv_data": densities,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Mock Crowd Density API",
        "zones": len(ZONE_CCTVS),
        "total_cctvs": sum(len(cctvs) for cctvs in ZONE_CCTVS.values()),
        "timestamp": datetime.now().isoformat()
    }

# For running directly: uvicorn mock_api:app --port 8001 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
