"""
Global diabetes statistics sourced from the IDF Diabetes Atlas, 11th Edition (2025).
Source: International Diabetes Federation, diabetesatlas.org
"""

GLOBAL_STATS = {
    "total_adults_2024_millions": 589,
    "total_adults_2050_millions": 853,
    "prevalence_2024_pct": 11.1,
    "undiagnosed_millions": 252,
    "undiagnosed_pct": 42.8,
    "deaths_2024_millions": 3.4,
    "expenditure_2024_trillion_usd": 1.015,
    "expenditure_growth_pct": 338,
}

# Adults living with diabetes by IDF region, 2024 vs projected 2050 (millions)
REGION_DATA = [
    {"region": "Western Pacific",        "code": "WP",   "adults_2024": 215.4, "adults_2050": 253.8, "growth_pct": 18},
    {"region": "South-East Asia",        "code": "SEA",  "adults_2024": 106.9, "adults_2050": 184.5, "growth_pct": 73},
    {"region": "Middle East & N. Africa","code": "MENA", "adults_2024": 84.7,  "adults_2050": 162.6, "growth_pct": 92},
    {"region": "Europe",                 "code": "EUR",  "adults_2024": 65.6,  "adults_2050": 72.4,  "growth_pct": 21},
    {"region": "North America & Caribbean","code": "NAC","adults_2024": 56.2,  "adults_2050": 68.1,  "growth_pct": 73},
    {"region": "South & Central America","code": "SACA", "adults_2024": 35.4,  "adults_2050": 51.5,  "growth_pct": 18},
    {"region": "Africa",                 "code": "AFR",  "adults_2024": 24.6,  "adults_2050": 60.0,  "growth_pct": 142},
]

# Top countries by number of adults living with diabetes (2024, millions) - approximate, IDF Atlas 11th ed.
TOP_COUNTRIES = [
    {"country": "China", "adults_millions": 148},
    {"country": "India", "adults_millions": 89},
    {"country": "Pakistan", "adults_millions": 33},
    {"country": "USA", "adults_millions": 37},
    {"country": "Indonesia", "adults_millions": 20},
    {"country": "Brazil", "adults_millions": 16},
]

# Historical growth of global diabetes prevalence (illustrative trend, IDF Atlas editions)
HISTORICAL_TREND = [
    {"year": 2000, "millions": 151},
    {"year": 2011, "millions": 366},
    {"year": 2021, "millions": 537},
    {"year": 2024, "millions": 589},
    {"year": 2050, "millions": 853},
]

SOURCE_NOTE = "Source: IDF Diabetes Atlas, 11th Edition (2025) — diabetesatlas.org"
