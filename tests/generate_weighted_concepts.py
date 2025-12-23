#!/usr/bin/env python3
"""
Generate weighted concept mapping with 10,000+ connections
Creates bidirectional links between 200+ astrophysics concepts
"""

import json
import random

# Load base concepts (first 200 from the list)
concepts_data = [
    {"name": "Stellar Evolution", "weight": 2.0},
    {"name": "Main Sequence Stars", "weight": 1.8},
    {"name": "Red Giants", "weight": 1.7},
    {"name": "White Dwarfs", "weight": 1.9},
    {"name": "Supernovae", "weight": 2.2},
    {"name": "Neutron Stars", "weight": 2.1},
    {"name": "Black Holes", "weight": 2.5},
    {"name": "Event Horizon", "weight": 2.0},
    {"name": "Singularity", "weight": 2.3},
    {"name": "Hawking Radiation", "weight": 1.9},
    {"name": "Gravitational Waves", "weight": 2.0},
    {"name": "Orbital Mechanics", "weight": 1.5},
    {"name": "Kepler's Laws", "weight": 1.6},
    {"name": "Gravitational Force", "weight": 1.8},
    {"name": "Tidal Forces", "weight": 1.7},
    {"name": "Lagrange Points", "weight": 1.5},
    {"name": "Spectroscopy", "weight": 1.2},
    {"name": "Absorption Lines", "weight": 1.1},
    {"name": "Emission Lines", "weight": 1.1},
    {"name": "Doppler Shift", "weight": 1.3},
    {"name": "Redshift", "weight": 1.4},
    {"name": "Cosmic Microwave Background", "weight": 2.0},
    {"name": "Dark Matter", "weight": 2.3},
    {"name": "Dark Energy", "weight": 2.3},
    {"name": "Galaxy Formation", "weight": 2.0},
    {"name": "Spiral Galaxies", "weight": 1.7},
    {"name": "Elliptical Galaxies", "weight": 1.7},
    {"name": "Quasars", "weight": 2.1},
    {"name": "Pulsars", "weight": 2.0},
    {"name": "Exoplanets", "weight": 1.8},
    {"name": "Transit Method", "weight": 1.5},
    {"name": "Radial Velocity Method", "weight": 1.5},
    {"name": "Gravitational Lensing", "weight": 1.9},
    {"name": "Astrometry", "weight": 1.4},
    {"name": "Cosmology", "weight": 2.5},
    {"name": "Big Bang Theory", "weight": 2.4},
    {"name": "Inflation", "weight": 2.2},
    {"name": "Hubble's Law", "weight": 2.0},
    {"name": "Dark Flow", "weight": 1.7},
    {"name": "Structure Formation", "weight": 2.0},
    {"name": "Gravitational Collapse", "weight": 2.1},
    {"name": "Accretion Disks", "weight": 1.9},
    {"name": "Protoplanetary Disks", "weight": 1.6},
    {"name": "Interstellar Medium", "weight": 1.5},
    {"name": "Molecular Clouds", "weight": 1.5},
    {"name": "Star Clusters", "weight": 1.6},
    {"name": "Open Clusters", "weight": 1.4},
    {"name": "Globular Clusters", "weight": 1.7},
    {"name": "Stellar Nucleosynthesis", "weight": 2.2},
    {"name": "Element Formation", "weight": 2.0},
    {"name": "Planetary Nebulae", "weight": 1.8},
    {"name": "Cosmic Rays", "weight": 1.8},
    {"name": "Intergalactic Medium", "weight": 1.6},
    {"name": "Supermassive Black Holes", "weight": 2.5},
    {"name": "Active Galactic Nuclei", "weight": 2.2},
    {"name": "Quasar Jets", "weight": 2.1},
    {"name": "Magnetars", "weight": 2.0},
    {"name": "White Dwarf Cooling", "weight": 1.7},
    {"name": "Neutrino Astronomy", "weight": 1.8},
    {"name": "Cosmic Inflation", "weight": 2.3},
    {"name": "Planck Epoch", "weight": 2.2},
    {"name": "Recombination Era", "weight": 2.0},
    {"name": "Matter-Radiation Equality", "weight": 1.9},
    {"name": "Galaxy Clusters", "weight": 1.8},
    {"name": "Dark Matter Halos", "weight": 2.1},
    {"name": "Baryonic Matter", "weight": 1.7},
    {"name": "Neutrino Oscillation", "weight": 1.8},
    {"name": "Supernova Remnants", "weight": 1.9},
    {"name": "Type Ia Supernova", "weight": 2.0},
    {"name": "Type II Supernova", "weight": 2.0},
    {"name": "Stellar Winds", "weight": 1.6},
    {"name": "Mass Loss", "weight": 1.5},
    {"name": "Cepheid Variables", "weight": 1.8},
    {"name": "RR Lyrae Variables", "weight": 1.7},
    {"name": "Luminosity Function", "weight": 1.6},
    {"name": "Hertzsprung-Russell Diagram", "weight": 2.0},
    {"name": "Main Sequence Turnoff", "weight": 1.8},
    {"name": "White Dwarf Mass Limit", "weight": 2.1},
    {"name": "Chandrasekhar Limit", "weight": 2.2},
    {"name": "Tolman–Oppenheimer–Volkoff Limit", "weight": 2.3},
    {"name": "Equation of State", "weight": 2.0},
    {"name": "Nuclear Fusion", "weight": 2.1},
    {"name": "Proton-Proton Chain", "weight": 1.9},
    {"name": "CNO Cycle", "weight": 1.9},
    {"name": "Stellar Lifetimes", "weight": 1.8},
    {"name": "Brown Dwarfs", "weight": 1.7},
    {"name": "Planet Formation", "weight": 1.8},
    {"name": "Gas Giants", "weight": 1.6},
    {"name": "Terrestrial Planets", "weight": 1.6},
    {"name": "Exomoon Detection", "weight": 1.4},
    {"name": "Habitable Zone", "weight": 2.0},
    {"name": "Atmospheric Composition", "weight": 1.5},
    {"name": "Planetary Migration", "weight": 1.6},
    {"name": "Ring Systems", "weight": 1.4},
    {"name": "Asteroids", "weight": 1.3},
    {"name": "Comets", "weight": 1.3},
    {"name": "Kuiper Belt", "weight": 1.5},
    {"name": "Oort Cloud", "weight": 1.5},
    {"name": "Interplanetary Medium", "weight": 1.4},
    {"name": "Solar Wind", "weight": 1.6},
    {"name": "Heliosphere", "weight": 1.5},
    {"name": "Coronal Mass Ejections", "weight": 1.7},
    {"name": "Sunspots", "weight": 1.4},
    {"name": "Solar Cycle", "weight": 1.5},
    {"name": "Magnetic Fields", "weight": 1.8},
    {"name": "Zeeman Effect", "weight": 1.5},
    {"name": "Interstellar Dust", "weight": 1.5},
    {"name": "Protostars", "weight": 1.8},
    {"name": "T Tauri Stars", "weight": 1.7},
    {"name": "Herbig-Haro Objects", "weight": 1.6},
    {"name": "Molecular Spectroscopy", "weight": 1.4},
    {"name": "Polarization", "weight": 1.3},
    {"name": "Synchrotron Radiation", "weight": 1.6},
    {"name": "Poynting–Robertson Effect", "weight": 1.5},
    {"name": "Gamma-Ray Bursts", "weight": 2.2},
    {"name": "X-Ray Binaries", "weight": 2.0},
    {"name": "Magnetohydrodynamics", "weight": 2.0},
    {"name": "Plasma Physics", "weight": 1.9},
    {"name": "Relativistic Jets", "weight": 2.1},
    {"name": "Fermi Bubbles", "weight": 2.0},
    {"name": "Large Scale Structure", "weight": 2.3},
    {"name": "Cosmic Web", "weight": 2.2},
    {"name": "Void Regions", "weight": 1.8},
    {"name": "Filamentary Structures", "weight": 2.0},
    {"name": "Galaxy Mergers", "weight": 2.1},
    {"name": "Tidal Stripping", "weight": 1.7},
    {"name": "Gravitational Interactions", "weight": 2.0},
    {"name": "Cluster Dynamics", "weight": 1.8},
    {"name": "Redshift Surveys", "weight": 1.6},
    {"name": "Luminosity Distance", "weight": 1.7},
    {"name": "Angular Diameter Distance", "weight": 1.6},
    {"name": "Lookback Time", "weight": 1.5},
    {"name": "Comoving Distance", "weight": 1.6},
    {"name": "Scale Factor", "weight": 2.0},
    {"name": "Friedmann Equations", "weight": 2.3},
    {"name": "Cosmological Constant", "weight": 2.2},
    {"name": "Hubble Parameter", "weight": 2.0},
    {"name": "Density Parameter", "weight": 2.1},
    {"name": "Critical Density", "weight": 2.0},
    {"name": "Baryon Acoustic Oscillations", "weight": 2.2},
    {"name": "Lyman-Alpha Forest", "weight": 1.9},
    {"name": "Reionization", "weight": 2.0},
    {"name": "21 cm Line", "weight": 1.8},
    {"name": "Cosmic Dawn", "weight": 2.1},
    {"name": "Epoch of Reionization", "weight": 2.0},
    {"name": "First Stars", "weight": 2.2},
    {"name": "Population III Stars", "weight": 2.2},
    {"name": "Metallicity", "weight": 1.8},
    {"name": "Chemical Evolution", "weight": 2.0},
    {"name": "Supernova Nucleosynthesis", "weight": 2.1},
    {"name": "Stellar Remnants", "weight": 2.0},
    {"name": "Binary Star Systems", "weight": 1.9},
    {"name": "Roche Lobe", "weight": 1.7},
    {"name": "Mass Transfer", "weight": 1.8},
    {"name": "Cataclysmic Variables", "weight": 1.8},
    {"name": "Type Ia Progenitors", "weight": 2.0},
    {"name": "Observational Cosmology", "weight": 2.3},
    {"name": "Galaxy Redshift Surveys", "weight": 2.0},
    {"name": "Deep Field Observations", "weight": 2.1},
    {"name": "Multi-Messenger Astronomy", "weight": 2.2},
    {"name": "Astroparticle Physics", "weight": 2.0},
    {"name": "Gravitational Lensing Surveys", "weight": 2.1},
    {"name": "Time Domain Astronomy", "weight": 2.0},
    {"name": "High Energy Astrophysics", "weight": 2.2},
    {"name": "Neutron Star Mergers", "weight": 2.3},
    {"name": "Kilonovae", "weight": 2.2},
    {"name": "Primordial Black Holes", "weight": 2.3},
    {"name": "Cosmic Inflation Models", "weight": 2.3},
    {"name": "String Cosmology", "weight": 2.2},
    {"name": "Multiverse Theories", "weight": 2.3},
    {"name": "Quantum Gravity", "weight": 2.5},
    {"name": "Loop Quantum Gravity", "weight": 2.4},
    {"name": "String Theory", "weight": 2.5},
    {"name": "Dark Sector Physics", "weight": 2.4},
    {"name": "Modified Gravity", "weight": 2.2},
    {"name": "Alternative Cosmologies", "weight": 2.1},
    {"name": "Anthropic Principle", "weight": 2.0},
    {"name": "Observational Constraints", "weight": 2.2},
    {"name": "Simulations in Cosmology", "weight": 2.1},
    {"name": "N-Body Simulations", "weight": 2.0},
    {"name": "Hydrodynamic Simulations", "weight": 2.1},
    {"name": "orbital mechanics", "weight": 1.5},
    {"name": "kepler", "weight": 1.6},
    {"name": "gravity", "weight": 1.8},
    {"name": "orbital period", "weight": 1.5},
    {"name": "semi-major axis", "weight": 1.4},
    {"name": "luminosity", "weight": 2.0},
    {"name": "temperature", "weight": 1.8},
    {"name": "wavelength", "weight": 1.6},
    {"name": "stefan-boltzmann", "weight": 2.0},
    {"name": "wien", "weight": 1.8},
    {"name": "parallax", "weight": 1.7},
    {"name": "distance", "weight": 1.6},
    {"name": "magnitude", "weight": 1.7},
    {"name": "apparent magnitude", "weight": 1.7},
    {"name": "absolute magnitude", "weight": 1.7},
    {"name": "redshift", "weight": 1.9},
    {"name": "doppler", "weight": 1.6},
    {"name": "radial velocity", "weight": 1.7},
    {"name": "hubble", "weight": 2.0},
    {"name": "black hole", "weight": 2.5},
    {"name": "schwarzschild", "weight": 2.3},
    {"name": "event horizon", "weight": 2.0},
    {"name": "gravitational", "weight": 2.0},
    {"name": "relativistic", "weight": 2.1},
    {"name": "exoplanet", "weight": 1.8},
    {"name": "transit", "weight": 1.6},
    {"name": "habitable zone", "weight": 2.0},
    {"name": "equilibrium temperature", "weight": 1.7},
    {"name": "telescope", "weight": 1.5},
    {"name": "angular resolution", "weight": 1.6},
    {"name": "rayleigh", "weight": 1.5},
    {"name": "magnification", "weight": 1.4},
    {"name": "galaxy", "weight": 1.9},
    {"name": "rotation curve", "weight": 1.8},
    {"name": "dark matter", "weight": 2.3},
    {"name": "virial", "weight": 1.9},
    {"name": "tully-fisher", "weight": 1.9},
    {"name": "stellar", "weight": 1.9},
    {"name": "mass", "weight": 1.8},
    {"name": "lifetime", "weight": 1.7},
    {"name": "main sequence", "weight": 1.8},
    {"name": "hr diagram", "weight": 2.0},
    {"name": "spectroscopy", "weight": 1.5},
    {"name": "absorption", "weight": 1.3},
    {"name": "emission", "weight": 1.3},
    {"name": "boltzmann", "weight": 1.9},
    {"name": "saha", "weight": 1.8},
    {"name": "synchrotron", "weight": 1.9},
    {"name": "compton", "weight": 1.8},
    {"name": "bremsstrahlung", "weight": 1.8},
    {"name": "accretion", "weight": 1.9},
    {"name": "high energy", "weight": 2.0}
]

# Ensure we have exactly 200 concepts
while len(concepts_data) < 200:
    concepts_data.append({
        "name": f"concept_{len(concepts_data)+1}",
        "weight": round(random.uniform(0.8, 2.5), 1)
    })

# Initialize all concepts with empty linked arrays
for concept in concepts_data:
    concept["linked"] = []

# Generate 10,000 bidirectional connections
total_links = 10000
links_created = 0
max_links_per_concept = 100  # Prevent any single concept from having too many links

print(f"Generating {total_links} bidirectional connections...")

while links_created < total_links:
    a_idx = random.randint(0, len(concepts_data) - 1)
    b_idx = random.randint(0, len(concepts_data) - 1)
    
    if a_idx == b_idx:
        continue
    
    concept_a = concepts_data[a_idx]
    concept_b = concepts_data[b_idx]
    
    # Check if link already exists
    if concept_b["name"] in concept_a["linked"]:
        continue
    
    # Check max links per concept
    if len(concept_a["linked"]) >= max_links_per_concept:
        continue
    if len(concept_b["linked"]) >= max_links_per_concept:
        continue
    
    # Create bidirectional link
    concept_a["linked"].append(concept_b["name"])
    concept_b["linked"].append(concept_a["name"])
    links_created += 1
    
    if links_created % 1000 == 0:
        print(f"  Created {links_created}/{total_links} links...")

# Create output structure
output = {
    "version": "2.1.0",
    "totalConcepts": len(concepts_data),
    "totalConnections": links_created,
    "concepts": concepts_data
}

# Save to JSON
output_file = "weighted_concept_mapping.json"
with open(output_file, "w") as f:
    json.dump(output, f, indent=2)

print(f"\n✅ Generated weighted concept mapping:")
print(f"   Concepts: {len(concepts_data)}")
print(f"   Connections: {links_created}")
print(f"   Average links per concept: {links_created * 2 / len(concepts_data):.1f}")
print(f"📁 Saved to: {output_file}")

# Verify connections
print(f"\n📊 Connection Statistics:")
link_counts = [len(c["linked"]) for c in concepts_data]
print(f"   Min links: {min(link_counts)}")
print(f"   Max links: {max(link_counts)}")
print(f"   Avg links: {sum(link_counts) / len(link_counts):.1f}")
