# Astronomy Formulas 79-343

Study / reference guide. For timed lookup use `FORMULAS_79_TO_343_EXAM.md`.

How to read an entry
- `Core` — know cold
- `Competition` — common on tests
- `Advanced` — specialist or multi-step
- `Reference` — conversion or definition
Routine formulas are equation + use when + variables + trap. Harder ones also keep scaling, typical values, and cues.

## Abbreviations

- MS — main sequence
- WD — white dwarf
- NS — neutron star
- BH / SMBH — black hole / supermassive black hole
- RV — radial velocity
- HZ — habitable zone
- RJ — Rayleigh–Jeans (low-frequency blackbody)
- LGP — light-gathering power
- Teq — equilibrium temperature
- PL — period–luminosity
- ISM — interstellar medium
- GMC — giant molecular cloud
- SNR / PWN / AGN / GRB — supernova remnant / pulsar wind nebula / active galactic nucleus / gamma-ray burst
- SI — meter-kilogram-second units (this calculator)
- cgs — centimeter-gram-second units (older papers; do not mix with SI)
- dex — factor of 10 on a log10 scale (2 dex = x100)
- pc, AU, ly — parsec, astronomical unit, light-year
- FWHM — full width at half maximum

## Find by task

Given a spectrum or color / want T
: 94, 96, 106, 98, 102, 244, 288

Given luminosity and distance (or flux)
: 81 (and 84, 128), 101, 83

Given magnitudes
: 87 (and 88, 251), 86, 83, 246

Dust, reddening, extinction
: 80, 250, 300

Given parallax
: 146 (and 148, 129, 147)

Telescope: resolve, collect light, magnify
: 107 (and 119, 112), 116, 113, 120

Small angles (arcsec, size, distance)
: 108, 109, 117, 118, 110, 111

Blackbody flux / stellar L from R and T
: 98, 99, 101, 106

Photon energy or momentum
: 95, 92, 133

Hubble / expansion / redshift as cosmology
: 140, 139, 156, 169, 125, 135

Black holes (size, ISCO, Eddington, redshift)
: 157 (and 158, 323), 141, 149, 131, 136, 137, 160

Special relativity
: 144, 142, 159, 153, 154, 155, 152, 168

Doppler / spectroscopic velocity
: 162 (and 163, 166, 167, 331, 338), 170, 171, 168, 152

Planet temperature, albedo, greenhouse, HZ
: 173, 180, 188, 181, 182, 183, 174

Exoplanet detection (transit, RV)
: 192, 189

Atmosphere escape
: 185, 184, 179

Mean density, gravity, rocky M–R
: 175 (and 187), 191, 190

Disks, Toomre, planet formation
: 206, 213, 218, 325, 193, 197, 198, 219, 220

Magnetic energy / synchrotron
: 230 (and 231), 241, 240, 227, 342

Stellar structure (hydrostatic, virial, free-fall)
: 254, 253, 255, 271, 290, 292, 278

Cepheids / pulsation
: 273, 274, 278, 279

White dwarfs / SN Ia
: 104, 340, 103, 105, 291

Galaxies (Tully–Fisher, Faber–Jackson, M–σ)
: 326, 316, 320, 324, 321

Binaries / Kepler mass
: 332 (and 337), 329, 330, 334, 189

## Contents

- Flux, magnitudes, blackbodies, WDs — 79 to 106
- Telescopes and optics — 107 to 120
- Cosmology and relativity — 121 to 161
- Doppler and spectroscopy — 162 to 172
- Planets and exoplanets — 173 to 192
- Planet formation and disks — 193 to 222
- High-energy and magnetic — 223 to 241
- Stellar structure — 242 to 292
- Lines, Saha, ISM — 293 to 310
- Galaxies and dark matter — 311 to 328
- Binaries — 329 to 338
- Remaining compact-object / phase — 339 to 343

## Radiation and stellar properties

### Flux and inverse square

**79. Intensity** `Competition`

I = P / A

Use when: Total power and area given, want W/m^2. Not for isotropic stellar flux (use b = L/(4*pi*d^2)).

Variables:
- I — intensity / power per unit area (W/m^2)
- P — total power (W)
- A — area the power is spread over (m^2)

**Watch out:** Not luminosity (W); 1 W/m^2 = 1000 erg/s/cm^2, not Jy.

Cues: intensity; power per area; energy flux

**80. Interstellar Reddening** `Competition`

E(B - V) = (B - V)_obs - (B - V)_0

Use when: Dust correction once spectral type gives (B-V)_0. Not A_V (use A_V = R_V * E(B-V)).

Variables:
- E(B - V) — color excess / reddening (mag)
- (B - V)_obs — observed B−V color (mag)
- (B - V)_0 — intrinsic (dust-free) B−V color (mag)

**Watch out:** R_V ~ 3.1 so A_V ~ 3.1 E(B-V); magnitudes, not a flux ratio.

Cues: interstellar reddening; color excess; dust reddening

**81. Inverse Square Law (Brightness)** `Core`

b = L / (4π d²)

Equivalent forms:
- L = 4 π d² F   (84, solve for luminosity)
- D_L = √(L / (4 π F))   (128, nearby Euclidean distance; not cosmological D_L)

Physical meaning: Bolometric flux of an isotropic point source at distance d.

Use when: Flux from L and d, or distance from L and b. Not for extended surface brightness.

Scaling / intuition: Double d and brightness drops by 4; Sun at 1 AU is ~1366 W/m^2.

Variables:
- b — observed brightness / flux (W/m^2)
- L — luminosity = total power output (W)
- d — distance to the source (m)

Typical values: Sun L = 3.828e26 W at 1 AU gives ~1366 W/m^2.

**Watch out:** Do not drop 4*pi (~12.6x); convert pc to m (1 pc = 3.086e16 m).

Cues: inverse square law; brightness from luminosity

See also: flux from luminosity; distance modulus

### Jeans mass

**82. Jeans Mass** `Competition`

M_J = K_J (k T / (G μ m_H))^(3/2) / ρ^(1/2)

Physical meaning: Minimum uniform-cloud mass that can collapse against thermal pressure.

Use when: Will this clump collapse, and how M_J scales with T and rho. Not Jeans length or free-fall time.

Scaling / intuition: M_J scales as T^(3/2)/rho^(1/2): colder or denser gas collapses at lower mass.

Variables:
- M_J — Jeans mass (kg)
- K_J — dimensionless prefactor (≈ 2.92 in the isothermal ideal-gas form)
- k — Boltzmann constant
- T — cloud temperature (K)
- G — gravitational constant
- mu — mean molecular weight (often ~2.3 in molecular clouds)
- m_H — hydrogen atom mass (kg)
- rho — cloud density (kg/m^3)

Typical values: T ~ 10-15 K, mu ~ 2.3; at T=15 K and rho=5e-20 kg/m^3, M_J is tens of M_sun.

**Watch out:** Include K_J ~ 2.92; n in cm^-3 is not rho (rho = n * mu * m_H).

Cues: Jeans mass; minimum mass to collapse; M_J vs T and rho

See also: Jeans length; free-fall time

### Magnitudes and fluxes

**83. Luminosity from Absolute Magnitude** `Competition`

L ∝ 10^(-0.4 M)

Use when: Relative luminosities from absolute M. Not apparent m (convert with distance modulus first).

Variables:
- L — luminosity (W), up to a calibration constant in the ∝ form
- M — absolute magnitude (mag)

**Watch out:** More luminous is more negative M; not SI watts without an M_sun zero point.

Cues: luminosity from absolute magnitude; magnitude to luminosity

**84. Luminosity from Flux and Distance** `Competition` · same as 81

L = 4π d² F

Same relation as **81. Inverse Square Law (Brightness)**. Use that entry for meaning, traps, and cues.

**Watch out:** Forgetting 4*pi underpredicts L by 12.6; convert pc to m (1 pc = 3.086e16 m).

**85. Luminosity Function (Simplified)** `Advanced`

N(L) ∝ L^(-1.35)

Use when: Order-of-magnitude stellar-population counts. Not galaxy Schechter functions.

Variables:
- N(L) — number of stars near luminosity L (relative count)
- L — stellar luminosity (W)

**Watch out:** -2.35 is dN/dM, not dN/dL.

Cues: luminosity function; Salpeter; stellar luminosity distribution

**86. Magnitude Change from Flux Ratio (Extinction)** `Competition`

Δm = -2.5 log10(F / F_0)

Use when: Extinction, eclipses, or transmission to magnitudes. Not two-star comparisons (use 87/88).

Variables:
- delta_m — change in magnitude (mag); positive means dimmer
- F — flux after extinction (W/m^2)
- F_0 — flux without extinction (W/m^2)

**Watch out:** Natural log instead of log10 inflates by 2.303; keep F and F_0 in the same bandpass.

See also: Same Pogson scale as 87; here F/F_0 is one object's flux drop (extinction).

Cues: brightness decreased 25%; extinction magnitude change

**87. Magnitude Difference from Flux Ratio** `Core`

m2 - m1 = -2.5 log(F2 / F1)

Equivalent forms:
- m1 - m2 = -2.5 log10(F1 / F2)   (88, same law, indices swapped)
- F2 / F1 = 10^(-0.4 Δm)   (251, invert for a flux ratio)

Physical meaning: Two-object magnitude difference m2-m1 from flux ratio F2/F1.

Use when: Comparing two stars as m2 minus m1. Not m1-m2 (use 88) or one-object extinction (86).

Scaling / intuition: F2/F1 = 100 implies m2-m1 = -5 (star 2 is 5 mag brighter).

Variables:
- m1, m2 — apparent magnitudes (mag)
- F1, F2 — fluxes (W/m^2)

Typical values: Flux ratios 2.512, 6.31, and 100 map to 1, 2, and 5 mag.

**Watch out:** Pairing m2-m1 with F1/F2 reverses bright/faint; log means log10.

Cues: magnitude difference; flux to magnitude

See also: magnitude–flux relation; flux ratio from magnitudes

**88. Magnitude-Flux Relation** `Competition` · same as 87

m1 - m2 = -2.5 log10(F1 / F2)

Same relation as **87. Magnitude Difference from Flux Ratio**. Use that entry for meaning, traps, and cues.

**Watch out:** Writing log10(F2/F1) with m1-m2 is the usual sign error.

### Stellar scaling

**89. Mass-Luminosity Relation** `Competition`

L = M^exponent

Physical meaning: Main-sequence L = M^exponent in solar units, often exponent ~3.5.

Use when: L from M (or reverse) for hydrogen-burning MS stars. Not giants, WDs, or pre-MS.

Scaling / intuition: A 2 M_sun star is ~11 L_sun (2^3.5), not twice as luminous.

Variables:
- L — luminosity in solar units (L / L_sun)
- M — mass in solar units (M / M_sun)
- exponent — power-law index (often ~3.5)

Typical values: Exponent ~3.5 for ~0.1-20 M_sun; 10 M_sun ~ 3160 L_sun.

**Watch out:** Solar units, not SI kg and watts; exponent ~2.3 below ~0.5 M_sun.

Cues: mass luminosity relation; L from M

See also: stellar lifetime; HR diagram

**90. Metallicity Ratio (log10 of Mass Fractions)** `Advanced`

log_ratio = log10(Z1 / Z2)

Use when: Pop I vs II when Z values are given. Not [Fe/H] unless the problem equates them.

Variables:
- log_ratio — log10(Z1/Z2) (dimensionless)
- Z1, Z2 — metal mass fractions (e.g. 0.02, 0.0002)

**Watch out:** Do not take log10(Z1-Z2); mixing ln and log10 costs a factor 2.303.

Cues: Pop I vs Pop II metallicity; log Z ratio

### Photons, Planck, Rayleigh–Jeans

**91. Momentum Transfer from Radiation (Radiation Pressure)** `Competition`

P_rad = F / c

Use when: Force on dust, sails, simple Eddington at an absorbing surface. Not isotropic a T^4/3; not 2F/c (mirror).

Variables:
- P_rad — radiation pressure (Pa = N/m^2)
- F — radiation flux (W/m^2)
- c — speed of light (m/s)

**Watch out:** Use 2F/c for a perfect mirror; F is W/m^2, not luminosity L.

Cues: radiation pressure; photon pressure

**92. Photon Momentum from Energy** `Competition`

p = E / c

Use when: Compton recoil or per-photon kicks. Not p = mv or radiation pressure P_rad = F/c.

Variables:
- p — photon momentum (kg*m/s)
- E — photon energy (J)
- c — speed of light (m/s)

**Watch out:** Put E in joules (1 eV = 1.602e-19 J) for SI p; equivalent p = h/lambda.

Cues: photon momentum; momentum from energy

**93. Photon Number Density (Blackbody)** `Competition`

n_gamma ∝ T³

Use when: Scaling CMB vs stellar interiors. Not energy density (u = a T^4) or flux (F = sigma T^4).

Variables:
- n_gamma — photon number density (1/m^3)
- T — temperature (K)

**Watch out:** Not energy density u = a T^4; in cgs n ~ 20.3 T^3 cm^-3.

Cues: photon number density; blackbody photons

**94. Planck Law (Spectral Radiance B_nu)** `Competition`

B_nu = (2 h ν³ / c²) / (exp(h ν / (k T)) - 1)

Physical meaning: Planck spectral radiance per Hz: power per area per sr per Hz from a blackbody.

Use when: Frequency-space spectrum or full thermal shape. Use RJ (96) only if h*nu << kT.

Scaling / intuition: Rises as nu^2, then cuts off; B_nu peaks at nu_max/T ~ 5.88e10 Hz/K.

Variables:
- B_nu — spectral radiance per Hz (W/(m^2*sr*Hz))
- nu — frequency (Hz)
- T — temperature (K)
- h, c, k — Planck constant, speed of light, Boltzmann constant

Typical values: h nu_max/kT ~ 2.821 so nu_max/T ~ 5.88e10 Hz/K (not Wien b/T).

**Watch out:** B_nu is not B_lambda (different peaks); Lambertian flux is pi B.

Cues: Planck law frequency; B_nu

See also: wavelength Planck; Rayleigh–Jeans; Wien

**95. Planck Relation (Photon Energy)** `Core`

E = h f = h c / λ

Use when: Line-photon energies, photoelectric thresholds, ionization (13.6 eV). Not Wien (lambda_max from T).

Variables:
- E — photon energy (J)
- f — frequency (Hz)
- lambda — wavelength (m)
- h — Planck constant
- c — speed of light

**Watch out:** Use h not hbar (factor 2*pi); vacuum wavelength; 1 eV = 1.602e-19 J.

Cues: photon energy; E = hf; E = hc/lambda

**96. Rayleigh–Jeans Law (B_nu, low frequency)** `Competition`

B_nu = 2 k T ν² / c²

Physical meaning: Low-frequency Planck limit (h*nu << kT): B_nu = 2 k T nu^2 / c^2.

Use when: Radio/mm tails and brightness temperature. Not optical starlight (use full Planck).

Scaling / intuition: Double T, double B_nu; double nu, quadruple B_nu.

Variables:
- B_nu — RJ spectral radiance (W/(m^2*sr*Hz))
- T — temperature (K)
- nu — frequency (Hz)
- k, c — Boltzmann constant, speed of light

Typical values: Sun kT/h ~ 1.20e14 Hz (~2.5 mm); CMB kT/h ~ 56.8 GHz.

**Watch out:** Optical h nu/kT ~ 5 at 500 nm, 5772 K; do not integrate RJ for total flux (use Stefan-Boltzmann).

Cues: Rayleigh Jeans; low frequency blackbody

See also: full Planck; Wien

### Stefan–Boltzmann and stellar lifetimes

**97. Solar Lifetime with Fusion Efficiency** `Competition`

t = (eps f_H f_available M c²) / L

Use when: Problem gives eps, core fraction, and X. Use 100 if you only have mass scaling.

Variables:
- t — lifetime (s)
- eps — mass-to-energy efficiency in fusion (≈ 0.007 for pp chain)
- f_H — hydrogen mass fraction of the star (Sun ~ 0.73)
- f_available — fraction of that H that can fuse in the core (often ~0.1)
- M — stellar mass (kg)
- c — speed of light (m/s)
- L — luminosity (W)

**Watch out:** Do not set f_available = 1 (~10x too long); output is seconds (1 yr = 3.156e7 s), unlike 100.

Cues: solar lifetime; fusion efficiency lifetime; pp chain lifetime

**98. Stefan-Boltzmann Law** `Core`

F = σ T⁴

Physical meaning: Blackbody surface flux F = sigma T^4.

Use when: Total energy flux from T. Not stellar watts (use 101) or Wien peak wavelength.

Scaling / intuition: Twice as hot means 16x the flux; 10% hotter means ~46% more flux.

Variables:
- F — radiative flux (W/m^2)
- sigma — Stefan–Boltzmann constant ≈ 5.670374419e-8 W/(m^2*K^4)
- T — temperature (K)

Typical values: Sun T~5772 K: F ~ 6.32e7 W/m^2; Earth T_eff ~255 K: ~240 W/m^2; sigma = 5.67e-8.

**Watch out:** T in kelvin, not C; this F is surface flux, not the solar constant 1366 W/m^2.

Cues: Stefan Boltzmann law; flux from temperature

See also: Family: 99 is the solar-unit ratio; 101 is L = 4πR²σT⁴. stellar luminosity L = 4*pi*R^2*sigma*T^4; Wien; Planck

**99. Stefan–Boltzmann (Luminosity Ratios vs Solar)** `Competition`

L_ratio = R_ratio² T_ratio⁴

Use when: HR comparisons already in solar units. Use 101 for SI watts.

Variables:
- L_ratio — L / L_sun (dimensionless)
- R_ratio — R / R_sun (dimensionless)
- T_ratio — T / T_sun (dimensionless); T_sun ≈ 5778 K

**Watch out:** Do not omit the square or fourth power; bolometric L, not V-band.

See also: Uses 98 on a sphere, divided by the Sun. Full SI form is 101.

Cues: luminosity ratio radius temperature solar

**100. Stellar Lifetime** `Competition`

τ = factor (M_sun / M)^exponent

Use when: How long a given-mass star lives; cluster turnoff. Use 97 when eps and f_H are given.

Variables:
- tau — main-sequence lifetime (years)
- factor — calibration prefactor (set by the formula’s solar reference)
- M_sun — reference solar mass (kg)
- M — stellar mass (kg)
- exponent — usually ~2.5 in this implementation

**Watch out:** Output is years, not seconds (unlike 97); masses in the same units as M_sun.

Cues: stellar lifetime; main sequence lifetime

**101. Stellar Luminosity** `Core`

L = 4π R² σ T⁴

Physical meaning: Bolometric luminosity of a spherical blackbody: 4*pi*R^2 * sigma T^4.

Use when: Radius and T_eff known (or T from L and R). Not solar-unit ratios (use 99) or surface flux only (98).

Scaling / intuition: Doubling R multiplies L by 4; doubling T multiplies L by 16.

Variables:
- L — bolometric luminosity (W)
- R — stellar radius (m)
- sigma — Stefan–Boltzmann constant
- T — effective temperature (K)

Typical values: Sun: R=6.957e8 m, T=5772 K, L=3.828e26 W; Sirius A ~25 L_sun; Betelgeuse ~1e5 L_sun.

**Watch out:** Do not insert distance in place of R; forgetting 4*pi or using diameter costs a factor of 4.

Cues: stellar luminosity; L = 4 pi R^2 sigma T^4

See also: Surface flux is 98; solar-unit shortcut is 99. solar-ratio form; flux; distance modulus

### Thermal line width

**102. Thermal Doppler Line Width** `Competition`

Δλ = λ √(2 k T / (m c²))

Use when: Thermal line width or T from a thermally broadened line. Not bulk radial-velocity shift.

Variables:
- delta_lambda — wavelength width scale (m)
- lambda — rest wavelength of the line (m)
- T — gas temperature (K)
- m — mass of the emitting particle (kg)
- k — Boltzmann constant
- c — speed of light

**Watch out:** This is a 1/e width, not FWHM (~1.665x); use the atom's mass, not always m_H.

Cues: thermal line broadening; Doppler broadening

### White dwarfs

**103. White Dwarf Binary Orbital Decay** `Advanced`

da/dt = -64 G³ M1 M2 (M1 + M2) / (5 c⁵ a³)

Use when: WD-WD or NS-NS shrinkage rate at given a. Not time to merger (use 105, not a/|da/dt|).

Variables:
- da/dt — rate of change of semi-major axis (m/s); negative = shrinking
- a — current semi-major axis (m)
- M1, M2 — white dwarf masses (kg)
- G, c — gravitational constant, speed of light

**Watch out:** t_merge = a/(4|da/dt|), not a/|da/dt|; rate is m/s of a, not P-dot.

Cues: orbital decay rate; GW decay white dwarf

**104. White Dwarf Mass-Radius Relation** `Competition`

R ∝ 1 / M^(1/3)

Physical meaning: Non-relativistic degenerate M-R: R scales as 1/M^(1/3) (more massive WD is smaller).

Use when: WD structure; heavier WD is smaller. Not MS mass-radius or near 1.4 M_sun.

Scaling / intuition: Double the mass and radius falls by 2^(1/3) ~ 1.26 (21% shrink).

Variables:
- R — white dwarf radius (m)
- M — white dwarf mass (kg)

Typical values: 0.6 M_sun CO WD: R ~ 0.01 R_sun ~ Earth (~6370 km); Sirius B: ~1.02 M_sun, ~0.0084 R_sun.

**Watch out:** Opposite of main-sequence (bigger when heavier); fails near Chandrasekhar ~1.4 M_sun.

Cues: white dwarf mass radius; denser when more massive

See also: Chandrasekhar limit; degeneracy pressure

**105. White Dwarf Merger Timescale** `Advanced`

t_merge = 5 c⁵ a⁴ / (256 G³ M1 M2 (M1 + M2))

Use when: How long until two WDs merge. Use 103 for instantaneous da/dt.

Variables:
- t_merge — time to merger (s)
- a — current semi-major axis (m)
- M1, M2 — component masses (kg)
- G, c — constants

**Watch out:** Output in seconds (1 yr = 3.156e7 s); if given P, convert to a via Kepler first.

Cues: merger timescale; time until white dwarfs merge

### Wien's law

**106. Wien's Displacement Law** `Core`

λ_max = b / T

Physical meaning: Peak of B_lambda at lambda_max = b/T with b = 2.8978e-3 m K.

Use when: T from peak wavelength, or lambda_max from T. Not total flux (Stefan-Boltzmann) or the B_nu peak.

Scaling / intuition: Sun ~5772 K peaks at ~502 nm (green); hotter means bluer.

Variables:
- lambda_max — peak wavelength (m); e.g. 400 nm = 4e-7 m
- T — temperature (K)
- b — Wien’s constant ≈ 2.897e-3 m*K

Typical values: b = 2.8978e-3 m K; 30000 K O star ~97 nm; 3000 K M star ~966 nm; CMB 2.725 K ~1.06 mm.

**Watch out:** T in K, lambda in meters (400 nm = 4e-7 m); B_nu peak is at lambda T ~ 5.10e-3 m K, not this b.

Cues: temperature from spectrum; Wien’s law

See also: Planck; Stefan–Boltzmann; color index

## Telescopes and optics

### Telescope resolution

**107. Angular Resolution** `Core`

θ = 1.22 (λ / D)

Equivalent forms:
- θ = 1.22 λ / D   (119, identical Rayleigh form)
- θ = λ / D   (112, order-of-magnitude; drop 1.22)

Physical meaning: Rayleigh resolution: two points just split at Airy radius 1.22 lambda/D radians.

Use when: Can this telescope split a double; diffraction-limited. Not lambda/D without 1.22 (use 112) or angular size (109).

Scaling / intuition: Bigger D or shorter lambda sharpens; Hubble 2.4 m at 500 nm is ~0.052 arcsec.

Variables:
- theta — minimum resolvable angle (radians)
- lambda — wavelength (m)
- D — aperture diameter (m)

Typical values: HST 2.4 m, 500 nm: theta ~ 2.5e-7 rad ~ 0.052 arcsec; eye D~2.5 mm: ~1 arcmin.

**Watch out:** D is diameter, not radius; convert rad to arcsec with *206265 (same equation as 119).

Cues: angular resolution; telescope resolution

See also: diffraction limit ~ lambda/D; arcsecond conversion

**108. Angular Separation (Arcseconds)** `Competition`

theta_arcsec = 206265 (linear / distance)

Use when: Binary projected separation in arcsec. Not radians (use 109) or the inverse linear size (117).

Variables:
- theta_arcsec — angular separation (arcsec)
- linear — physical separation (m); same length unit basis as distance
- distance — distance to the system (m)

**Watch out:** 206265 is arcsec per radian, not 3600 (arcsec per degree).

Cues: angular separation in arcseconds; detectable from ground?

**109. Angular Size** `Core`

θ = d / D

Use when: Answer in radians, or before *206265. Not arcsec directly (use 108) or 1.22 lambda/D (diffraction).

Variables:
- theta — angular size (radians)
- d — physical diameter / size (m)
- D — distance to the object (m)

**Watch out:** D is distance, not telescope diameter; do not compare radians to catalog arcsec without *206265.

Cues: angular size; angular diameter

**110. Arcminutes to Arcseconds** `Reference`

arcsec = arcmin × 60

Use when: Catalog/FOV/seeing in arcmin, need arcsec. Not deg to arcmin (use 111) or radians (118).

Variables:
- arcmin — angle in arcminutes
- arcsec — angle in arcseconds

**Watch out:** Not minutes of time (RA); 60 is not a radian conversion.

Cues: arcminutes to arcseconds

**111. Degrees to Arcminutes** `Reference`

arcmin = deg × 60

Use when: FOV or solar/lunar size in degrees. Not already in arcmin (use 110) or starting from radians (118).

Variables:
- deg — angle in degrees
- arcmin — angle in arcminutes

**Watch out:** Do not use 57.3 (degrees per radian); multiply, do not divide, going deg to arcmin.

Cues: degrees to arcminutes

**112. Diffraction Limit (Angular Resolution)** `Competition`

θ = λ / D

Use when: Quick estimates or radio beam size. Use 1.22 lambda/D (107/119) if they say Rayleigh.

Variables:
- theta — angular resolution (radians)
- lambda — wavelength (m)
- D — aperture diameter (m)

**Watch out:** Convert rad with *206265; D is diameter, not radius, and not source angular size (109).

See also: Rayleigh circular aperture is 1.22 λ/D (107 / 119).

Cues: diffraction limit; angular resolution limit

### Telescope optics and phase

**113. f-ratio** `Competition`

f_ratio = f / D

Use when: Telescope speed and optical design. Not resolution (lambda/D) and not magnification (120).

Variables:
- f_ratio — focal ratio (dimensionless), e.g. f/10
- f — focal length (m)
- D — aperture diameter (m)

**Watch out:** LGP depends on D^2, not f-ratio; image scale is 206265/f(mm) arcsec/mm.

Cues: f-ratio; f-number; telescope speed

**114. Illuminated Area vs Orbital Phase** `Competition`

A = π R² cos(π φ)

Physical meaning: Projected sunlit area A = pi R^2 cos(pi phi) with phi in [0,1].

Use when: This cosine convention: full at phase 0. Not phi=0 as new/dark (that sibling uses sin(pi phi)).

Scaling / intuition: A = pi R^2 at phi=0 (full) and A=0 at phi=0.5 (new).

Variables:
- A — apparent illuminated area (m^2)
- R — planet radius (m)
- phi — orbital phase from 0 to 1

Typical values: At phi=0.25, cos(pi*0.25)=0.707 of the full disk.

**Watch out:** phi is 0-1 phase, not degrees; wrong sibling if phi=0 is defined as dark.

Cues: illuminated area vs phase; lit disk area

See also: Opposite phase zero from 341 (there φ=0 is dark / inferior conjunction). alternate dark-start illuminated-area formula

**115. Index of Refraction** `Reference`

n = c / v

Use when: Speed in glass/water/air, Snell, critical angle. Not gravitational deflection.

Variables:
- n — refractive index (dimensionless)
- c — speed of light in vacuum (m/s)
- v — speed of light in the medium (m/s)

**Watch out:** Vacuum n=1 exactly; n is dimensionless, not magnification.

Cues: refractive index; light speed in medium

**116. Light Gathering Power** `Core`

LGP = (D_obj / D_eye)²

Use when: Telescope vs naked eye (or vs another aperture). Not magnification (120) or resolution (1/D).

Variables:
- LGP — light-gathering power ratio (dimensionless)
- D_obj — telescope objective diameter (m)
- D_eye — eye pupil diameter (m)

**Watch out:** D_eye is the pupil, not the eyeball; do not linear-scale D (that is resolution).

Cues: light gathering power; telescope vs eye

**117. Linear Separation from Angular (Arcsec)** `Competition`

linear = theta_arcsec distance / 206265

Use when: Measured split in arcsec and known distance. Not unknown angle (use 108) or theta already in rad (109).

Variables:
- linear — physical separation (m)
- theta_arcsec — angular separation (arcsec)
- distance — distance to the system (m)

**Watch out:** Forgetting to divide by 206265 leaves an answer ~2e5 times too big.

Cues: linear separation from angular; separation in AU

**118. Radians ↔ Arcseconds** `Reference`

theta_arcsec = theta_rad × 206265

Use when: After 109/107/112/119 (radians) when catalogs are in arcsec. Not for linear/distance (use 108/117).

Variables:
- theta_arcsec — angle in arcseconds
- theta_rad — angle in radians

**Watch out:** Do not multiply a value already in arcsec by 206265 again.

Cues: radians to arcsec; 206265

**119. Rayleigh Criterion (Telescope Resolution)** `Competition` · same as 107

θ = 1.22 λ / D

Same relation as **107. Angular Resolution**. Use that entry for meaning, traps, and cues.

**Watch out:** D is diameter, not radius or focal length; convert with 118 (same equation as 107).

**120. Telescope Magnification** `Competition`

M = f_obj / f_eye

Use when: Eyepiece choice. Use 113 for f-ratio and 116 for light grasp.

Variables:
- M — magnification (dimensionless)
- f_obj — objective focal length (m)
- f_eye — eyepiece focal length (m)

**Watch out:** Not D_obj/D_eye (that is LGP/exit-pupil); f/10 is not 10x.

Cues: telescope magnification; eyepiece focal length

## Cosmology and relativity

### Accretion and black-hole scales

**121. Accretion Efficiency (Radiative Efficiency)** `Advanced`

eps = E_rad / (M c²)

Physical meaning: Fraction of accreted rest-mass energy that comes out as radiation.

Use when: Quasar/AGN energetics and mass-to-light budgets. Not for fusion yields or ADAF flows (energy is advected, not radiated).

Scaling / intuition: Thin-disk eps ~0.057 (Schwarzschild) to ~0.4 (max Kerr); H fusion is only ~0.007.

Variables:
- eps — radiative efficiency (dimensionless)
- E_rad — energy radiated (J)
- M — accreted mass (kg)
- c — speed of light (m/s)

Typical values: SciOly uses eps~0.1; 1 Msun at 10% radiates ~1.8e46 J.

**Watch out:** Not the Eddington ratio L/L_Edd.

Cues: accretion efficiency; radiative efficiency

See also: Eddington luminosity; Schwarzschild radius

**122. Angular Diameter Distance** `Competition`

D_A = D / θ

Use when: Turn a measured angular size into physical kpc. Not luminosity distance (use D_L for flux).

Variables:
- D_A — angular diameter distance (m)
- D — physical transverse size (m)
- theta — observed angular size (radians)

**Watch out:** Euclidean d=D/theta is not cosmological D_A at high z; D_L=(1+z)^2 D_A.

Cues: angular diameter distance; size from angle

**123. Black Hole Average Density** `Advanced`

ρ = 3 c⁶ / (32π G³ M²)

Use when: Order-of-magnitude 'are big BHs dense?' checks. Not a real interior density, and not NS density (use M and measured R).

Variables:
- rho — average density (kg/m^3)
- M — black hole mass (kg)
- G — gravitational constant
- c — speed of light

**Watch out:** This is 3M/(4 pi Rs^3) for Schwarzschild, not Kerr.

Cues: black hole density; average density black hole

### Cosmological distances

**124. Comoving Distance chi (General)** `Advanced`

χ = D_M / a

Use when: Relating proper, luminosity, and angular-diameter distances. Not light-travel distance (c times lookback is smaller).

Variables:
- chi — comoving distance (m)
- D_M — proper distance at the time of interest (m)
- a — scale factor (dimensionless); a = 1 today in common convention

**Watch out:** Do not use Hubble d=v/H0 at high z; flat: D_L=(1+z)chi, D_A=chi/(1+z).

Cues: comoving distance; distance that doesn’t change with expansion

**125. Critical Density** `Core`

rho_c = 3 H0² / (8π G)

Physical meaning: Density that makes a Friedmann universe spatially flat.

Use when: Convert Omega to a physical density, or set Omega_tot=1. Not a galactic or solar-neighborhood density.

Scaling / intuition: Faster H0 needs larger rho_c (scales as H0^2); today only a few H atoms per m^3.

Variables:
- rho_c — critical density (kg/m^3)
- H0 — Hubble constant (often km/s/Mpc; convert carefully to SI for G)
- G — gravitational constant

Typical values: H0=70: rho_c~9.2e-27 kg/m^3; H0 67-73 shifts rho_c by ~10-20%.

**Watch out:** Convert H0 from km/s/Mpc to 1/s before combining with SI G.

Cues: critical density; flat universe density

See also: density parameter Omega; Friedmann equation

**126. Curvature Density Parameter** `Advanced`

Omega_k = 1 - Omega_M - Omega_Lambda

Use when: Flatness bookkeeping from Omega_M and Omega_Lambda. Not at equality or last scattering (include Omega_r).

Variables:
- Omega_k — curvature density parameter (dimensionless)
- Omega_M — matter density parameter (dimensionless)
- Omega_Lambda — dark energy density parameter (dimensionless)

**Watch out:** Positive Omega_k is open (k<0); drop Omega_r only today.

Cues: is the universe flat; curvature parameter

**127. Density Parameter** `Competition`

Omega = ρ / rho_c

Use when: Classify geometry or write a component as a fraction of rho_c. Not a galaxy's internal density.

Variables:
- Omega — density parameter (dimensionless)
- rho — actual density (kg/m^3)
- rho_c — critical density (kg/m^3)

**Watch out:** Omega is dimensionless; never quote it in kg/m^3.

Cues: density parameter; actual vs critical density

**128. Distance from L and F (Euclidean inverse square)** `Competition` · same as 81

D_L = √(L / (4π F))

Same relation as **81. Inverse Square Law (Brightness)**. Use that entry for meaning, traps, and cues.

**Watch out:** Symbol D_L is historical; cosmological D_L=(1+z)D_M.

**129. Distance from Parallax (Light Years)** `Competition` · same as 146

d_ly = pc_to_ly / p

Same relation as **146. Parallax Distance (Arcseconds)**. Use that entry for meaning, traps, and cues.

**Watch out:** Convert mas first: 20 mas=0.02 arcsec; do not invert p still in mas. Sibling of d(pc)=1/p.

**130. Distance Modulus at High Redshift (Approximate)** `Advanced`

μ = 5 log10(D_L / 10 pc)

Use when: Extragalactic/high-z modulus once D_L(z) is known. Not Hubble d=v/H0 or Euclidean sqrt(L/(4 pi F)) at large z.

Variables:
- mu — distance modulus (mag), related to m - M
- D_L — cosmological luminosity distance (parsecs)

**Watch out:** Log argument is D_L in parsecs divided by 10 pc, not Mpc unless you add 25.

Cues: high redshift distance modulus; cosmological modulus

### Eddington and lensing

**131. Eddington Luminosity** `Core`

L_Edd = 4π G M m_p c / σ_T

Physical meaning: Spherical-accretion cap where radiation pressure on ionized gas balances gravity.

Use when: Quasar/AGN and X-ray binary luminosity limits. Not jets or beamed emission, and not an efficiency (pair with eps).

Scaling / intuition: Linear in M: more mass, higher cap.

Variables:
- L_Edd — Eddington luminosity (W)
- M — mass of the accretor (kg)
- m_p — proton mass (kg)
- G — gravitational constant
- c — speed of light (m/s)
- sigma_T — Thomson cross-section (m^2)

Typical values: 1.26e31 W per Msun (~1.3e38 erg/s per Msun); 1e8 Msun ~1e39 W.

**Watch out:** SI Watts vs CGS erg/s; helium/opacity change the constant; Eddington ratio is L/L_Edd, not eps.

Cues: Eddington luminosity; Eddington limit

See also: accretion efficiency; Schwarzschild radius

**132. Einstein Radius (Microlensing)** `Advanced`

theta_E = √( (4 G M D_LS) / (c² D_L D_S) )

Physical meaning: Characteristic angular scale of a point-mass gravitational lens.

Use when: Microlensing Einstein-angle and strong-lensing ring sizes. Not Euclidean distances at cosmological z.

Scaling / intuition: Heavier lens or better distances means a larger ring; Galactic stellar ~mas, clusters ~arcsec.

Variables:
- theta_E — Einstein radius (radians)
- M — lens mass (kg)
- D_LS — lens–source distance (m)
- D_L — observer–lens distance (m)
- D_S — observer–source distance (m)
- G, c — constants

Typical values: Galactic: D_S~8 kpc, M~0.5 Msun gives theta_E~0.5 mas.

**Watch out:** D_L here is distance to the lens, not luminosity distance; theta_E comes out in radians.

Cues: Einstein radius; microlensing angle

See also: lensing geometry; Schwarzschild scale

### Relativistic energy

**133. Energy of a Photon in Flat Space** `Competition`

E = p c

Use when: Photon kinematics and radiation pressure in flat space. Not for massive particles (keep the (m c^2)^2 term).

Variables:
- E — photon energy (J)
- p — photon momentum (kg*m/s)
- c — speed of light (m/s)

**Watch out:** Not a cosmological redshift formula; SI joules vs eV and eV/c. Massive particles only approach E~p c when ultra-rel.

Cues: photon energy from momentum

**134. Energy-Momentum Relation** `Competition`

E² = (p c)² + (m c²)²

Use when: Cosmic-ray and collider kinematics. Not Newtonian K=p^2/(2m) once E is comparable to m c^2.

Variables:
- E — total energy (J)
- p — momentum (kg*m/s)
- m — rest mass (kg)
- c — speed of light (m/s)

**Watch out:** If working in eV, measure p in eV/c; kinetic energy is E-m c^2, not E.

Cues: energy momentum relation; relativistic E and p

### Friedmann, Hubble, redshift gravity

**135. Friedmann Equation** `Advanced`

(H² / H0²) = Omega_m a^(-3) + Omega_r a^(-4) + Omega_Lambda

Physical meaning: Expansion rate H(a) in a flat universe from today's density parameters.

Use when: Expansion history and H(z) with a=1/(1+z). Not if curvature is present (add Omega_k/a^2).

Scaling / intuition: Early radiation (a^-4), then matter (a^-3), then Lambda wins.

Variables:
- H — Hubble parameter at scale factor a (km/(s·Mpc))
- H0 — present Hubble constant
- Omega_m — matter density parameter today (dimensionless)
- Omega_r — radiation density parameter today (dimensionless)
- Omega_Lambda — dark energy density parameter (dimensionless)
- a — scale factor (dimensionless; a = 1 today)

Typical values: Omega_m~0.3, Omega_Lambda~0.7, Omega_r~9e-5; matter-radiation equality z~3400; Lambda-matter z~0.3.

**Watch out:** Drop radiation today but not at z~1000; H0 67-73 rescales H(z). H here is H(t), not a galaxy speed.

Cues: Friedmann equation; H vs a

See also: critical density; Omega parameters; scale factor–redshift

**136. Gravitational Redshift (General)** `Competition`

λ_obs / λ_emit = (1 - R_s / r)^(-1/2)

Physical meaning: Exact Schwarzschild stretch of light climbing out of a gravity well.

Use when: Compact objects with r not much larger than Rs. Not cosmological redshift (use a=1/(1+z)) and not the weak-field form at r~Rs.

Scaling / intuition: Closer to the hole, larger observed wavelength; at r=2 Rs the stretch is sqrt(2)~1.41.

Variables:
- lambda_obs — wavelength seen far away (m)
- lambda_emit — wavelength at emission radius (m)
- R_s — Schwarzschild radius (m)
- r — emission radius from center (m)

Typical values: NS surface z typically 0.2-0.4; Rs~3 km per Msun.

**Watch out:** Wrong sibling of weak-field z~G M/(r c^2); Kerr depends on spin and angle.

Cues: gravitational redshift; redshift near black hole

See also: Schwarzschild radius; gravitational time dilation

**137. Gravitational Redshift (Simple Form)** `Competition`

z_grav = G M / (r c²)

Use when: Sun, white dwarfs, and GPS-style weak gravity. Not at r~Rs (use exact (1-Rs/r)^(-1/2)).

Variables:
- z_grav — gravitational redshift (dimensionless)
- M — mass (kg)
- r — radius / distance from center (m)
- G, c — constants

**Watch out:** Do not mix with Hubble redshift; error is order (Rs/r)^2.

Cues: weak field gravitational redshift

**138. Horizon Area of a Black Hole** `Competition`

A_H = 4π R_s²

Use when: Horizon-size, area-theorem, and entropy-scaling questions. Not 4 pi R^2 with ISCO or photon-sphere radius.

Variables:
- A_H — horizon area (m^2)
- R_s — Schwarzschild radius (m)

**Watch out:** Kerr horizon area is smaller for the same M; not the EHT shadow silhouette.

Cues: black hole horizon area; event horizon area

**139. Hubble Time** `Competition`

t_sec = 3.085677581e19 / H0

Use when: Quick age/expansion-timescale estimate. Not a precision age (need the Friedmann integral).

Variables:
- t_sec — Hubble time (s)
- H0 — Hubble constant (km/s/Mpc)

**Watch out:** Prefactor assumes H0 in km/s/Mpc, not 1/s; divide seconds by ~3.16e7 for years.

Cues: Hubble time; time since recession began

**140. Hubble's Law** `Core`

v = H0 d

Physical meaning: Local linear expansion: recession speed proportional to distance.

Use when: Low z (z<<1, roughly z<~0.1) to convert redshift to distance. Not at high z (use D_L, D_A, or chi).

Scaling / intuition: Twice as far, twice the recession speed, in this regime only.

Variables:
- v — recessional velocity (km/s)
- H0 — Hubble constant (km/s/Mpc)
- d — distance (Mpc)

Typical values: 100 Mpc at H0=70 recedes at 7000 km/s (z~0.023). H0 67-73 km/s/Mpc.

**Watch out:** Subtract peculiar velocity inside ~10-20 Mpc; d=c z/H0 only at low z.

Cues: Hubble law; recessional velocity; distance from Hubble

See also: redshift; luminosity distance; lookback time

### ISCO

**141. Innermost Stable Circular Orbit (ISCO)** `Competition`

r = 3 R_s

Physical meaning: Innermost stable circular orbit of massive particles around a Schwarzschild hole.

Use when: Accretion-disk inner-edge and Schwarzschild efficiency. Not Kerr (prograde ISCO moves in toward 0.5 Rs) and not the photon sphere (1.5 Rs).

Scaling / intuition: Last safe parking orbit; a smaller ISCO (spin) raises eps from ~0.06 toward ~0.4.

Variables:
- r — ISCO radius (m)
- R_s — Schwarzschild radius (m)

Typical values: 3 Rs = 6 G M/c^2 ~9 km per solar mass.

**Watch out:** Wrong siblings: 1.5 Rs photon sphere, Rs horizon. Schwarzschild only.

Cues: ISCO; innermost stable orbit

See also: Schwarzschild radius; photon sphere; accretion efficiency

### Special relativity

**142. Length Contraction** `Competition`

L' = L √(1 - (v/c)²)

Use when: SR length problems and muon/atmosphere path in the lab frame. Not time (use time dilation) and not cosmic a(t).

Variables:
- L' — contracted length in the frame where the object moves (m)
- L — proper length in the rest frame (m)
- v — relative speed (m/s)
- c — speed of light (m/s)

**Watch out:** Only the parallel component shrinks; keep v and c in the same units.

Cues: length contraction; Lorentz contraction

**143. Lookback Time (Approximate)** `Competition`

t ~= d / c

Use when: Galactic, Local-Group, or low-z estimates. Not high z (use a Friedmann lookback integral).

Variables:
- t — lookback time (s)
- d — distance (m)
- c — speed of light (m/s)

**Watch out:** t=d/c fails cosmologically; 1 pc=3.26 ly so t(yr)~d(ly).

Cues: lookback time; time since light emitted

**144. Lorentz Factor (Gamma)** `Core`

γ = 1 / √(1 - (v/c)²)

Physical meaning: Master special-relativity multiplier: 1 at rest, diverges as v approaches c.

Use when: Any SR problem with v, or converting among E, K, p, and v. Not a cosmological Hubble-flow gamma.

Scaling / intuition: gamma=1.005 at 0.1c, 1.15 at 0.5c, 2.3 at 0.9c, 7.1 at 0.99c.

Variables:
- gamma — Lorentz factor (dimensionless)
- v — speed (m/s)
- c — speed of light (m/s)

Typical values: Cosmic rays and AGN jets can have gamma of 1e6 or more.

**Watch out:** Mismatched v and c units (km/s vs m/s); for v<<0.1c, gamma~1+(1/2)(v/c)^2.

Cues: Lorentz factor; gamma

See also: E = gamma m c^2; time dilation; length contraction

### Parallax and density parameters

**145. Matter Density Parameter** `Competition`

Omega_M = rho_M / rho_c

Use when: Friedmann input and flatness partner to Omega_Lambda. Not Omega_b (baryons are only ~0.05).

Variables:
- Omega_M — matter density parameter (dimensionless)
- rho_M — matter density (kg/m^3)
- rho_c — critical density (kg/m^3)

**Watch out:** A cluster baryon fraction is not Omega_M; Omega is dimensionless.

Cues: matter density parameter; Omega_M

**146. Parallax Distance (Arcseconds)** `Core`

d = 1 / p

Equivalent forms:
- p = 1 / d   (148, invert; p in arcsec, d in pc)
- d = 1 AU / tan(p)   (147, p in radians; for tiny p, tan p ≈ p)
- d_ly ≈ 3.26156 / p   (129, same parallax in light-years)

Physical meaning: Distance in parsecs is 1 over parallax in arcseconds.

Use when: Stellar parallax with p in arcseconds. Not a cosmological distance, and not p in radians (use AU/tan(p)).

Scaling / intuition: p=1 arcsec -> 1 pc; p=0.1 arcsec -> 10 pc; p=1 mas -> 1 kpc.

Variables:
- d — distance (parsecs)
- p — parallax (arcseconds)

Typical values: 1 pc=3.26 ly; 8 mas=0.008 arcsec -> 125 pc.

**Watch out:** Convert milliarcseconds to arcseconds first; do not feed p in radians into this form.

Cues: parallax distance; distance from parallax

See also: parallax from distance; distance in ly

**147. Parallax Distance (Radians)** `Competition`

d = 1 AU / tan(p)

Use when: Parallax given in radians, or the tangent form is wanted. Not p in arcseconds (use d(pc)=1/p).

Variables:
- d — distance (AU)
- p — parallax angle (radians)
- AU — astronomical unit length baseline

**Watch out:** Mixing arcsec into this formula is off by 206265; not cosmological D_A.

Cues: parallax in radians; AU / tan(p)

**148. Parallax from Distance** `Competition` · same as 146

p = 1 / d

Same relation as **146. Parallax Distance (Arcseconds)**. Use that entry for meaning, traps, and cues.

**Watch out:** Keep d in parsecs, not ly or AU; proper motion is a different mas/yr shift.

### Photon sphere and proper distance

**149. Photon Sphere Radius** `Competition`

r = 1.5 R_s

Physical meaning: Unstable circular photon orbit around a Schwarzschild black hole.

Use when: Schwarzschild photon-ring / shadow order-of-magnitude. Not Kerr, not ISCO (3 Rs), and not the horizon (Rs).

Scaling / intuition: A nudge sends light to infinity or into the hole; the shadow diameter is ~5.2 Rs.

Variables:
- r — photon sphere radius (m)
- R_s — Schwarzschild radius (m)

Typical values: 1.5 Rs=3 G M/c^2 ~4.5 km per Msun; Sgr A* (~4e6 Msun) 1.5 Rs ~1.8e7 km.

**Watch out:** Wrong siblings: 3 Rs ISCO, Rs horizon. Schwarzschild only.

Cues: photon sphere; light orbit black hole

See also: ISCO; Schwarzschild radius

**150. Proper Distance (Current Time)** `Competition`

D_p(t_0) = χ

Use when: How far is it right now, in cosmology language. Not D_L or D_A except at z~0.

Variables:
- D_p(t_0) — proper distance today (m)
- chi — comoving distance (m)

**Watch out:** Do not use d=c z/H0 as today's proper distance at high z.

Cues: proper distance today; present distance

### Redshift, SR energy, Schwarzschild, Omegas

**151. Redshift from Peculiar Velocity (Non-Relativistic)** `Competition`

z = v_pec / c

Use when: Galaxy peculiar velocities and splitting Doppler from cosmological z. Not converting a high cosmological z into a peculiar speed.

Variables:
- z — Doppler redshift (dimensionless)
- v_pec — peculiar velocity (m/s)
- c — speed of light (m/s)

**Watch out:** Valid only for v<<c; for large peculiar v use relativistic Doppler. Not Hubble z.

Cues: peculiar velocity redshift; local Doppler redshift

**152. Relativistic Doppler Shift** `Competition`

1 + z = γ (1 + v/c)

Physical meaning: Longitudinal SR Doppler for a receding source: wavelength stretch plus time dilation.

Use when: Fast stars, jets, and spectroscopic z when v is not <<c. Not cosmological 1+z=1/a treated as a peculiar speed.

Scaling / intuition: Small v/c recovers z~v/c; as v->c, z->infinity while v stays below c.

Variables:
- z — redshift (dimensionless)
- gamma — Lorentz factor (dimensionless)
- v — radial velocity (m/s)
- c — speed of light (m/s)

Typical values: Invert with v/c=((1+z)^2-1)/((1+z)^2+1).

**Watch out:** Not gravitational redshift and not Hubble expansion; flip the sign of v for approach.

Cues: relativistic Doppler; high-speed redshift

See also: gamma; classical Doppler

**153. Relativistic Kinetic Energy** `Competition`

K = (γ - 1) m c²

Use when: Cosmic rays, AGN jets, any non-trivial v/c. Not (1/2)m v^2 for TeV protons, and not photons (use E=p c).

Variables:
- K — relativistic kinetic energy (J)
- gamma — Lorentz factor
- m — rest mass (kg)
- c — speed of light (m/s)

**Watch out:** Never call K total energy; total is E. Photons have m=0.

Cues: relativistic kinetic energy

**154. Relativistic Momentum** `Competition`

p = γ m v

Use when: SR mechanics once gamma or v is known. Not p=m v at relativistic speeds, and not photons (use p=E/c).

Variables:
- p — relativistic momentum (kg*m/s)
- gamma — Lorentz factor
- m — rest mass (kg)
- v — speed (m/s)

**Watch out:** Photons: m=0 so this formula fails; in eV units quote p in eV/c.

Cues: relativistic momentum

**155. Relativistic Total Energy** `Competition`

E = γ m c²

Use when: Relativistic energy budgets and converting gamma to E. Not photons (use E=p c=h f); do not omit rest energy if total E is wanted.

Variables:
- E — total energy (J)
- gamma — Lorentz factor
- m — rest mass (kg)
- c — speed of light (m/s)

**Watch out:** K=(gamma-1)m c^2 is kinetic, not total; photons have no rest frame.

Cues: relativistic total energy; E = gamma m c^2

**156. Scale Factor a(t) Relation to Redshift z** `Competition`

a = 1 / (1 + z)

Use when: Convert z to how big the universe was then, and feed a into Friedmann. Not gravitational redshift or a star's peculiar Doppler z.

Variables:
- a — scale factor (dimensionless)
- z — cosmological redshift (dimensionless)

**Watch out:** Do not treat z as v/c at large z; this is expansion, not Doppler. Same content as 1+z=a_now/a_emit.

Cues: scale factor from redshift; a = 1/(1+z)

**157. Schwarzschild Radius** `Core`

R_s = 2 G M / c²

Equivalent forms:
- R_s ≈ 3 km × (M / M_sun)   (158, exam rule of thumb; exact 2.95 km)
- R_s = 2 G M_BH / c²   (323, same formula for an SMBH)

Physical meaning: Event-horizon radius of a non-rotating black hole.

Use when: BH size and as the unit for ISCO, photon sphere, and grav redshift. Not a Kerr horizon (smaller r+) or a WD/NS radius.

Scaling / intuition: More mass, bigger horizon, linearly.

Variables:
- R_s — Schwarzschild radius (m)
- M — mass (kg)
- G, c — constants

Typical values: Rs~3 km per Msun (exact 2.95 km); Earth ~9 mm; Sgr A* 4e6 Msun ~0.08 AU.

**Watch out:** Not the photon sphere (1.5 Rs) or ISCO (3 Rs).

Cues: Schwarzschild radius; event horizon

See also: R_s ≈ 3 km *(M/M_sun); ISCO; photon sphere

**158. Schwarzschild Radius per Solar Mass** `Competition` · same as 157

R_s = 3 km (M / M_sun)

Same relation as **157. Schwarzschild Radius**. Use that entry for meaning, traps, and cues.

**Watch out:** Not a neutron-star radius (~10-15 km is not a horizon); Kerr outer horizon is smaller.

**159. Time Dilation** `Competition`

delta_t' = delta_t / √(1 - (v/c)²)

Use when: Muon lifetimes, twin paradox, and accelerator beams. Not gravitational time dilation (use (1-Rs/r)^(-1/2)).

Variables:
- delta_t' — dilated time interval (s)
- delta_t — proper time in the rest frame (s)
- v — relative speed (m/s)
- c — speed of light (m/s)

**Watch out:** Do not dilate lengths with this; cosmological redshift is not this applied to galaxies.

Cues: time dilation; special relativity time

**160. Time Dilation near a Black Hole** `Competition`

delta_t = delta_t_0 (1 - R_s / r)^(-1/2)

Use when: Near black holes and compact objects, and GR tests. Not special-relativistic gamma (that is relative speed).

Variables:
- delta_t — time interval as measured at infinity (s)
- delta_t_0 — proper time for the local observer (s)
- R_s — Schwarzschild radius (m)
- r — radial coordinate of the local observer (m)

**Watch out:** Same factor as grav redshift; weak fields expand as ~1+Rs/(2 r). GPS satellites run fast (higher potential).

Cues: gravitational time dilation; time near black hole

**161. Vacuum Energy (Dark Energy) Density Parameter** `Competition`

Omega_Lambda = rho_Lambda / rho_c

Use when: Friedmann, flatness, and why expansion is accelerating. Not a clustering matter density.

Variables:
- Omega_Lambda — dark energy density parameter (dimensionless)
- rho_Lambda — vacuum / dark energy density (kg/m^3)
- rho_c — critical density (kg/m^3)

**Watch out:** Do not set Omega_Lambda=1-Omega_M if Omega_k or Omega_r is quoted nonzero.

Cues: dark energy density parameter; Omega_Lambda

## Doppler and spectroscopy

### Doppler and spectroscopic redshift

**162. Doppler Shift** `Core`

(λ_obs - λ_rest) / λ_rest = v / c

Equivalent forms:
- v = c (Δλ / λ)   (163, 167, 338; same non-rel law solved for v)
- Δλ / λ = v / c   (331, ratio form)
- v_r = c (Δf / f)   (166, frequency form; approaching → Δf > 0)

Physical meaning: Non-relativistic Doppler: fractional wavelength shift equals radial velocity over c.

Use when: Stellar RVs, exoplanet wobbles, and galaxy motions with v<<c. Not cosmological z>~0.1 or relativistic jets (use 168).

Scaling / intuition: A 1% stretch means v~0.01 c ~3000 km/s.

Variables:
- lambda_obs — observed wavelength (m)
- lambda_rest — rest wavelength (m)
- v — radial velocity (m/s)
- c — speed of light (m/s)

Typical values: Stellar RVs km/s to tens of km/s (z~1e-5); exoplanet K can be m/s (~1e-8 fractional).

**Watch out:** z<<1 for v=c z; keep wavelengths in the same units.

Cues: Doppler shift; radial velocity from wavelength

See also: approximate v = c Delta_lambda/lambda; relativistic forms

**163. Doppler Shift (Approximate)** `Competition` · same as 162

v = c (Δλ / λ)

Same relation as **162. Doppler Shift**. Use that entry for meaning, traps, and cues.

**Watch out:** Do not mix nm with angstroms; z<<1 only. Identical to 162 and 167 at low z.

**164. Observed Frequency from Redshift** `Competition`

f_obs = f_emit / (1 + z)

Use when: Radio lines, 21-cm, and frequency-domain spectra at known z. Not v=c (Delta_f/f) at large z.

Variables:
- f_obs — observed frequency (Hz)
- f_emit — emitted frequency (Hz)
- z — redshift (dimensionless)

**Watch out:** Companion of lambda_obs=(1+z) lambda_emit; do not convert a large cosmological z into a Hubble velocity.

Cues: observed frequency from redshift

**165. Observed Wavelength from Redshift** `Competition` · same as 170

λ_obs = (1 + z) λ_emit

Same relation as **170. Redshift Definition**. Use that entry for meaning, traps, and cues.

**Watch out:** This alone does not give a distance; cosmological z is a=1/(1+z), not a peculiar speed.

**166. Radial Velocity from Frequency Shift** `Competition` · same as 162

v_r = (Delta_f / f) c

Same relation as **162. Doppler Shift**. Use that entry for meaning, traps, and cues.

**Watch out:** Sign of Delta_f depends on convention; |Delta_f/f|=|Delta_lambda/lambda| only at small z.

**167. Radial Velocity from Wavelength Shift** `Competition` · same as 162

v_r = (Δλ / λ) c

Same relation as **162. Doppler Shift**. Use that entry for meaning, traps, and cues.

**Watch out:** Convert all wavelengths to one unit; wavelength doubling is not v=c. z<<1 for v=c z.

**168. Recessional Velocity from Redshift (Relativistic)** `Competition`

v = c (((1 + z)² - 1) / ((1 + z)² + 1))

Physical meaning: Special-relativistic inversion of Doppler z; unique recession speed in (-c, c).

Use when: z is not tiny (wavelength doubled, quasar lines). Not v=c z (unphysical at z>=1) and not a cosmological Hubble-flow speed.

Scaling / intuition: z=1 gives v=0.6c, not c; z=3 gives v=0.8c.

Variables:
- v — recessional velocity (m/s)
- c — speed of light (m/s)
- z — redshift (dimensionless)

Typical values: z=0.1 already differs from c z by a few percent; z<<1 recovers v=c z.

**Watch out:** Expansion is not a peculiar velocity through static space; gravitational redshift is a different mechanism.

Cues: relativistic recessional velocity; large-z velocity

See also: low-z v = c z; redshift definition

**169. Redshift and Scale Factor Relation** `Competition`

1 + z = a_now / a_emit

Use when: Expanding-universe redshift, CMB temperature scaling, and converting z to a. Not peculiar Doppler or gravitational redshift.

Variables:
- z — redshift (dimensionless)
- a_now — scale factor today (usually 1)
- a_emit — scale factor at emission (< 1)

**Watch out:** This z is not a velocity; at large z do not use v=c z. At z<<1 it accidentally looks like Doppler.

Cues: redshift scale factor; expansion redshift

**170. Redshift Definition** `Core`

z = (λ_obs - λ_emit) / λ_emit

Equivalent forms:
- λ_obs = (1 + z) λ_emit   (165)
- Δλ = λ_0 z   (172)

Physical meaning: Fractional wavelength change; the definition of redshift.

Use when: Whenever observed and rest wavelengths are given. Always valid; converting z to velocity is not.

Scaling / intuition: z=0 means no shift; z=0.01 is a 1% stretch; z=1 doubles the wavelength.

Variables:
- z — redshift (dimensionless)
- lambda_obs — observed wavelength (m)
- lambda_emit — emitted wavelength (m)

Typical values: 1+z=lambda_obs/lambda_emit=f_emit/f_obs; cosmologically 1+z=1/a.

**Watch out:** Do not assume z=v/c unless z<<1 (use 168 otherwise). Definition does not tell mechanism or distance.

Cues: calculate redshift; redshift from wavelengths

See also: Doppler; cosmological a–z; observed wavelength

**171. Redshift to Velocity (Low z Approximation)** `Competition`

v = c z

Use when: Only z<<1, roughly z<~0.1. Not larger spectroscopic z (use 168) and not high-z cosmology (report z and D_L).

Variables:
- v — recessional velocity (m/s)
- c — speed of light (m/s)
- z — redshift (dimensionless)

**Watch out:** Exceeds c for z>1; peculiar velocities of hundreds of km/s scatter the lowest z.

Cues: velocity from redshift; low z; blueshift approaching

**172. Wavelength Shift from Redshift** `Competition` · same as 170

Δλ = λ_0 z

Same relation as **170. Redshift Definition**. Use that entry for meaning, traps, and cues.

**Watch out:** Units of Delta_lambda match lambda_0; for cosmological z that is not small, do not then use v=c z.

## Planetary science and exoplanets

### Albedo, atmospheres, habitable zone

**173. Albedo** `Core`

A = F_reflected / F_incident

Use when: Use Bond A for Teq, absorbed insolation, or habitability. Not for geometric albedo from magnitudes.

Variables:
- A — albedo (dimensionless)
- F_reflected — reflected flux (W/m^2)
- F_incident — incident flux (W/m^2)

**Watch out:** Only (1-A) enters Teq as a weak 1/4 power.

Cues: albedo; reflectivity

**174. Atmospheric Scale Height** `Core`

H = k T / (m g)

Physical meaning: Atmospheric pressure e-folding length H = kT/(m g) for an isothermal ideal gas.

Use when: Use for planetary atmospheres, transit inflation, or Jeans exobase. Not for disk thickness (use H = cs/Omega, 213).

Scaling / intuition: Earth H ~8 km, so most mass sits in the first couple of scale heights.

Variables:
- H — pressure scale height (m)
- T — atmospheric temperature (K)
- m — mean particle mass (kg)
- g — surface gravity (m/s^2)
- k — Boltzmann constant (J/K)

Typical values: Earth ~8 km; mu ~28 for N2 air vs ~2.3 for H2/He.

**Watch out:** m is kg per molecule, not g/mol; T in K, g in m/s^2.

Cues: atmospheric scale height; how thick is the atmosphere

See also: surface gravity; Jeans escape; disk scale height

**175. Average Density** `Core`

ρ = 3 M / (4π R³)

Equivalent forms:
- ρ = M / ((4/3) π R³)   (187, identical mean density for a planet)

Use when: Use for any spherical body given M and R. Not the rocky M-R prediction (190); 187 is the planet-framed twin.

Variables:
- ρ — average density of the body (kg/m^3)
- M — mass of the body (kg)
- R — radius of the body (meters)

**Watch out:** RV gives M sin i, so exoplanet rho is often a lower limit until i is known.

Cues: average density; what is the density; density of object; calculate density; find density; mean density; bulk density; density from mass volume

**176. Crater Counting Age** `Competition`

N = k D^(-b) t

Use when: Use to date unerased surfaces (Moon, Mercury, asteroids). Not crater size from energy (177).

Variables:
- N — number of craters larger than D per area (1/m^2)
- k — impactor flux normalization (varies)
- D — minimum crater diameter counted (meters)
- b — slope (typically ~2–3)
- t — exposure age (seconds)

**Watch out:** Saturation, secondaries, and LHB mean linear k*t is an exam approx.

Cues: crater counting age; surface age from craters; crater density age

**177. Crater Diameter (Energy Scaling)** `Competition`

D = C E^(1 / 3)

Use when: Use for one crater's size from energy. Not surface age from many craters (176).

Variables:
- D — Crater Diameter (meters)
- E — kinetic energy of impact (J)
- C — empirical/prefactor constant (m/J^(1/3))

**Watch out:** Real exponent is ~0.22-0.33; quote a factor of a few unless C is given.

Cues: crater diameter energy; impact energy from crater size

**178. Dynamo Magnetic Field Scaling** `Advanced`

B = C √(ρ) √(Omega) F_conv^(1 / 3)

Use when: Use to compare planets or stars with different spin and heat flow. Not magnetopause standoff given B0 (186).

Variables:
- B — characteristic field strength (Tesla)
- C — order-unity / fitted prefactor (dimensionless)
- rho — density of conducting fluid (kg/m^3)
- Omega — planetary spin rate (rad/s)
- F_conv — convective energy flux (W/m^2)

**Watch out:** C is fitted O(1); surface dipole can be weaker than the core field.

Cues: dynamo field scaling; magnetic field from rotation convection

**179. Energy-Limited Hydrodynamic Escape** `Advanced`

Mdot_esc = ε π R_p³ F_XUV / (G M_p K)

Physical meaning: Mass-loss rate if a fraction epsilon of XUV power lifts atmosphere out of the planet's gravity well.

Use when: Use for close-in exoplanets and XUV envelope stripping. Not Jeans thermal escape (184/185) or disk photoevaporation (211).

Scaling / intuition: Loss scales as R^3/M and F_XUV; a few-Earth-mass envelope can strip in ~100 Myr (radius valley ~1.5-2 Re).

Variables:
- Mdot_esc — atmospheric mass-loss rate (kg/s)
- epsilon — heating efficiency (typically 0.1–0.3)
- R_p — planetary radius (meters)
- F_XUV — Incident X-ray/EUV flux (W/m^2)
- M_p — planetary mass (kg)
- K — tidal enhancement factor (~1)

Typical values: epsilon typically 0.1-0.3, not 1.

**Watch out:** epsilon=1 overestimates loss; integrate decaying F_XUV(t), not a present-day snapshot.

Cues: energy limited escape; XUV mass loss planet; hydrodynamic escape rate

See also: Jeans Escape Parameter; Photoevaporation Mass-Loss Rate; Rocky Planet Mass–Radius Relation; Jeans Escape Flux (Thermal)

**180. Equilibrium Temperature (from Luminosity)** `Core`

T_eq = (L_star (1 - A) / (16π σ a²))^(1/4)

Physical meaning: Airless fast-rotator blackbody Teq from stellar luminosity and orbital distance.

Use when: Use when given L_star and a. Not the T_star/R_star form (188); greenhouse is T_surface - Teq (181).

Scaling / intuition: Earth A~0.3 lands near 255 K, about 33 K colder than the 288 K surface.

Variables:
- T_eq — no-atmosphere equilibrium temperature (Kelvin)
- L_star — bolometric stellar luminosity (W)
- A — reflected fraction 0–1 (dimensionless)
- a — Orbital Distance (meters)
- sigma — stefan–Boltzmann Constant (W/(m^2*K^4))

Typical values: Earth Teq ~255 K vs T_surface 288 K.

**Watch out:** Factor of 4 assumes full-sphere heat redistribution; dayside-only raises Teq by ~19%.

Cues: equilibrium temperature luminosity; Teq from L star; planet temperature luminosity

See also: Same Teq physics as 188 if L_star = 4π R_star² σ T_star⁴. Planetary Equilibrium Temperature; Habitable Zone Inner Edge; Stefan-Boltzmann Law; Habitable Zone Outer Edge

**181. Greenhouse Effect** `Competition`

DeltaT_GH = T_surface - T_eq

Use when: Use after Teq from 180 or 188 plus a measured T_surface. Not a substitute for Bond A (A already entered Teq).

Variables:
- ΔT_GH — temperature increase from greenhouse effect (Kelvin)
- T_surface — actual surface temperature (Kelvin)
- T_eq — equilibrium temperature without greenhouse (Kelvin)

**Watch out:** Do not double-count clouds as both albedo and greenhouse; HZ edges already include greenhouse.

Cues: greenhouse effect

**182. Habitable Zone Inner Edge** `Competition`

a_inner = √(L_star / L_sun) × 0.95 AU

Use when: Use for the liquid-water inner edge given luminosity. Not a raw Teq=273-373 K cut (180/188 only if asked for Teq).

Variables:
- a_inner — inner edge semi-major axis (meters)
- L_star — Stellar Luminosity (W)

**Watch out:** 0.95 AU * sqrt(L/Lsun) is the Sun-like shortcut; M-dwarf coefficients shift.

Cues: habitable zone inner edge; runaway greenhouse distance; HZ inner

**183. Habitable Zone Outer Edge** `Competition`

a_outer = √(L_star / L_sun) × 1.67 AU

Use when: Use with 182 to bracket the HZ. Not where Teq hits 273 K (Teq ignores greenhouse).

Variables:
- a_outer — outer edge semi-major axis (meters)
- L_star — Stellar Luminosity (W)

**Watch out:** Optimistic early-Mars ~1.8 AU; exam 1.67 is the conservative maximum-greenhouse number.

Cues: habitable zone outer edge; maximum greenhouse distance; HZ outer

### Escape, magnetic field, exoplanet observables

**184. Jeans Escape Flux (Thermal)** `Advanced`

Phi = n_exo c_s (1 + λ) exp(-λ)

Use when: Use when you have lambda, n_exo, and thermal speed and need a particle flux. Not bulk XUV hydrodynamic escape (179).

Variables:
- Phi — escaping particles per area per time (1/(m^2*s))
- n_exo — number density at exobase (1/m^3)
- c_s — characteristic thermal speed (m/s)
- lambda — escape parameter λ (dimensionless)

**Watch out:** n_exo is exobase not surface density; if lambda ~2-3 this underestimates (wind regime).

Cues: Jeans escape flux; thermal escape rate; exobase escape

**185. Jeans Escape Parameter** `Competition`

λ = G M m / (k T r)

Physical meaning: Jeans parameter is gravitational binding energy over thermal energy per particle at radius r.

Use when: Use as a keep-or-lose screen before flux (184). Not energy-limited XUV flow (179); scale height (174) is kT/(m g).

Scaling / intuition: Gyr retention typically needs lambda >~15-20; lambda ~10 is significant Jeans; lambda ~2-3 is blow-off.

Variables:
- lambda — gravitational / thermal energy ratio (dimensionless)
- M — planetary mass (kg)
- m — mass of escaping species (kg)
- T — temperature at exobase (Kelvin)
- r — radial distance of exobase (meters)

Typical values: lambda >15-20 to keep air over Gyr; H is ~14x easier to lose than N2.

**Watch out:** Use exobase r and T (thermosphere can be 700-1000 K), not the ground.

Cues: Jeans parameter; can planet keep atmosphere; thermal escape lambda

See also: Escape Velocity; Jeans Escape Flux (Thermal); Energy-Limited Hydrodynamic Escape; Atmospheric Scale Height

**186. Magnetopause Standoff Distance** `Advanced`

R_mp = R_p (B0² / (2 μ_0 rho_sw v_sw²))^(1 / 6)

Use when: Use given surface B0 and solar-wind rho, v. Not generating B (178); not atmospheric scale height.

Variables:
- R_mp — subsolar magnetopause radius (meters)
- R_p — planetary radius (meters)
- B0 — equatorial surface magnetic field (Tesla)
- rho_sw — Solar wind mass density (kg/m^3)
- v_sw — Solar wind velocity (m/s)
- mu0 — Vacuum Permeability (N/A^2)

**Watch out:** Venus and Mars lack global dipoles, so this equation does not apply.

Cues: magnetopause distance; standoff distance; solar wind magnetosphere

**187. Planet Density** `Competition` · same as 175

rho_p = M_p / ((4 / 3) π R_p³)

Same relation as **175. Average Density**. Use that entry for meaning, traps, and cues.

**Watch out:** Quote 5500 kg/m^3 not 5.5 unless the problem uses cgs; density inherits M sin i uncertainty.

**188. Planetary Equilibrium Temperature** `Core`

T_eq = T_star √(R_star / (2 a)) (1 - A)^(1 / 4)

Physical meaning: Airless blackbody Teq from T_star, R_star, and a, with Bond A as (1-A)^{1/4}.

Use when: Use when T_star, R_star, and a are given. Not the L_star form (180); not HZ liquid-water orbits (182-183).

Scaling / intuition: Earth Teq ~255 K vs surface 288 K; Teq falls only as a^{-1/2}.

Variables:
- T_eq — effective radiating temperature without atmosphere (Kelvin)
- T_star — stellar effective temperature (Kelvin)
- R_star — stellar radius (meters)
- a — semi-major axis / star–planet distance (meters)
- A — fraction of incident light reflected (0–1)

Typical values: Earth Teq ~255 K vs 288 K surface; Venus high A keeps Teq Earth-like.

**Watch out:** A must be Bond not geometric; planet radius cancels; dayside-only +~19%.

Cues: equilibrium temperature planet; planet temperature no atmosphere; Teq from stellar temperature; bond albedo temperature

See also: Same Teq physics as 180 written with T_star and R_star. Equilibrium Temperature (from Luminosity); Habitable Zone Inner Edge; Habitable Zone Outer Edge; Greenhouse Effect; Albedo; Stefan-Boltzmann Law

**189. Radial Velocity Semiamplitude (Circular Orbit)** `Competition`

K = (2π G / P)^(1 / 3) M_p sin(i) / (M_s + M_p)^(2 / 3)

Physical meaning: Semiamplitude of the star's line-of-sight reflex orbit; the observable is Mp sin i.

Use when: Use for Doppler planet mass. Not transit radius (192); not the planet's own orbital speed v_K.

Scaling / intuition: Jupiter yanks the Sun at ~12.5 m/s; Earth only ~9 cm/s.

Variables:
- K — amplitude of radial velocity variation (m/s)
- M_p — mass of the planet (kg)
- M_s — mass of the star (kg)
- P — orbital period of planet around star (seconds)
- i — orbital inclination (90° = edge-on) (radians)

Typical values: Jupiter 12.5 m/s; Earth 9 cm/s (0.09 m/s).

**Watch out:** Face-on i=0 gives K=0; circular formula omits 1/sqrt(1-e^2).

Cues: radial velocity amplitude; exoplanet radial velocity; stellar wobble; radial velocity exoplanet; planet mass from radial velocity; orbital speed from radial velocity; v_max radial velocity; radial velocity curve

See also: Kepler's Third Law; Kepler's Third Law (Binary System); Doppler Shift; Mass Function (Spectroscopic Binaries)

**190. Rocky Planet Mass–Radius Relation** `Competition`

R = R_earth (M / M_earth)⁰.27

Physical meaning: Earth-like rock/iron follows R/Re ~ (M/Me)^{0.27} because self-gravity compresses the interior.

Use when: Use to predict R from M assuming rock, or to test if measured R is too large. Not for giants, mini-Neptunes, or degenerates.

Scaling / intuition: A 10 Me rocky planet is only ~1.8 Re, not 10^{1/3}~2.15.

Variables:
- R — planetary radius (meters)
- M — planetary mass (kg)

Typical values: 10 Me rock ~1.8 Re; 2.5 Re at 8 Me is already too puffy for pure rock.

**Watch out:** 0.27 is a 1-10 Me fit; this is a composition hypothesis, not a measurement.

Cues: rocky mass radius; Earth composition radius from mass; super Earth radius

See also: Average Density; Surface Gravity; Planet Density; White Dwarf Mass-Radius Relation; Energy-Limited Hydrodynamic Escape

**191. Surface Gravity** `Core`

g = G M / r²

Use when: Use for scale height (174), Jeans, or weight. Not disk H = cs/Omega (do not plug surface g there).

Variables:
- g — acceleration due to gravity at surface, gravitational field strength, surface acceleration (m/s^2)
- M — mass of the body, planetary mass, stellar mass, compact object mass (kg)
- r — radius of the body, surface radius, planetary radius, stellar radius (meters)

**Watch out:** Giants: g at the 1-bar radius; NS g ~1e12 needs GR; M in kg, r in m.

Cues: surface gravity; what is the gravity; gravitational acceleration; gravity at surface; surface gravitational field; calculate surface gravity; find surface gravity; gravity of planet

**192. Transit Depth (Central Transit)** `Core`

delta = (R_p / R_s)²

Physical meaning: Fractional blocked stellar flux equals the area ratio (Rp/Rstar)^2 for a central transit.

Use when: Use to convert a light-curve dip into Rp/Rstar. Not secondary eclipse; not RV mass (189).

Scaling / intuition: Jupiter over the Sun is ~1%; Earth over the Sun is ~84 ppm.

Variables:
- δ — fractional drop in flux during transit (dimensionless)
- R_p — radius of the planet (meters)
- R_s — radius of the star (meters)

Typical values: Jupiter 1% (10000 ppm); Earth 84 ppm.

**Watch out:** Distance cancels; Rp/Rs = sqrt(delta); grazing and limb darkening make a box-depth too simple.

Cues: transit depth; planetary transit; exoplanet transit; flux drop transit; exoplanet radius from transit; planet radius from light curve; transit light curve; calculate planet radius

See also: Average Density; Planetary Equilibrium Temperature; Planet Density

## Planet formation

### Disk viscosity, gaps, MMSN

**193. Alpha Viscosity Prescription** `Advanced`

ν = α c_s H

Use when: Use whenever a disk needs nu (viscous time, Mdot, gaps, Type II). Not a measured viscosity in m^2/s.

Variables:
- nu — Kinematic Viscosity (m^2/s)
- alpha — turbulent efficiency (typically 1e-4 to 1e-2)
- c_s — gas sound speed (m/s)
- H — disk vertical scale height (meters)

**Watch out:** Exam 'viscous disk' wants this nu, not molecular viscosity.

Cues: alpha viscosity; Shakura Sunyaev; nu alpha cs H

**194. Core Accretion Timescale (Planetesimal)** `Advanced`

t_core = 1e6 yr (Sigma_ref / Sigma) √(a / a_ref)

Use when: Use to test whether core accretion beats gas-disk lifetime (~1-10 Myr). Not pebble routes (209-210); not M_crit itself (195).

Variables:
- t_core — time to grow critical core (seconds)
- Sigma — Solids Surface Density (kg/m^2)
- a — formation location (meters)

**Watch out:** Heuristic calibration; isolation (202) can cap growth below M_crit even if t_core looks short.

Cues: core accretion timescale; time to grow giant planet core; planetesimal core growth

**195. Critical Core Mass for Runaway Gas Accretion** `Advanced`

M_crit = M_crit0 (Mdot_core / Mdot0)^(1/4) (κ / kappa0)^(1/4)

Use when: Use for how big a core is needed to make a gas giant. Not isolation mass (202) or the time to get there (194).

Variables:
- M_crit — mass triggering runaway gas accretion (kg)
- Mdot_core — planetesimal/pebble accretion rate onto core (kg/s)
- kappa — Envelope Opacity (m^2/kg)
- M_crit0 — fiducial critical mass (~10 M⊕) (kg)
- Mdot0 — fiducial solid accretion rate (kg/s)
- kappa0 — Reference Opacity (m^2/kg)

**Watch out:** Not the final planet mass; after M_crit, KH contraction runs until gap or disk dispersal.

Cues: critical core mass; runaway gas accretion mass; 10 earth mass core

**196. Disk Aspect Ratio H/r** `Competition`

h = H / r

Use when: Use as input to thermal/viscous gaps, Type I torques, and eta ~ h^2 (214). Not Earth atmospheric H (174).

Variables:
- h — Aspect Ratio (dimensionless)
- H — vertical scale height (meters)
- r — cylindrical / orbital radius (meters)

**Watch out:** Do not use Earth H ~8 km to compute disk h.

Cues: disk aspect ratio; H over r; how thin is the disk

**197. Gap Opening Mass (Thermal Criterion)** `Advanced`

M_p_min = M_star (H / r)³

Use when: Use to decide Type I vs Type II (need both 197 and 198). Not isolation mass (202) or critical core (195).

Variables:
- M_p_min — mass needed to open a gap (thermal) (kg)
- M_star — central star mass (kg)
- H — disk scale height (meters)
- r — orbital radius (meters)

**Watch out:** Take the stricter of thermal and viscous; partial gaps exist in between.

Cues: gap opening thermal; mass to open gap H/r; thermal gap criterion

**198. Gap Opening Mass (Viscous Criterion)** `Advanced`

M_p_min = M_star × 40 α / (r / H)²

Use when: Check with thermal (197); the planet must beat both for a clean gap and Type II.

Variables:
- M_p_min — mass needed to open a gap (viscous) (kg)
- M_star — central star mass (kg)
- alpha — disk turbulence parameter (dimensionless)
- r — orbital radius (meters)
- H — disk scale height (meters)

**Watch out:** Factor 40 is calibrated; quote max of the two Mp,min when both H/r and alpha are given.

Cues: gap opening viscous; 40 alpha gap; viscous gap criterion

**199. Gravitational Focusing Factor** `Advanced`

F_g = 1 + (v_esc / v_rel)²

Use when: Use inside planetesimal accretion (212). Not pebble Hill/drag capture (209-210).

Variables:
- F_g — cross-section enhancement (dimensionless)
- v_esc — escape speed from the larger body (m/s)
- v_rel — encounter relative speed (m/s)

**Watch out:** vesc is from the target's surface sqrt(2GM/R), not the Hill speed.

Cues: gravitational focusing; focusing factor collisions; runaway growth focusing

**200. Gravitational Radius (Photoevaporation)** `Advanced`

r_g = G M_star / c_s²

Use when: Use to locate EUV/X-ray disk winds and as input to 211. Not planet Hill radius or atmospheric Jeans r.

Variables:
- r_g — Gravitational Radius (meters)
- M_star — central star mass (kg)
- c_s — sound speed in photoionized gas (~10 km/s at 10⁴ K) (m/s)

**Watch out:** Use T~1e4 K and mu~0.7 ionized H, not 100 K molecular-disk cs; planet Bondi uses Mp not Mstar.

Cues: gravitational radius photoevaporation; rg GM cs2

**201. Hill Stability Separation** `Competition`

Delta_a_min = 2 √(3) r_Hm

Use when: Use after r_Hm (207) as a two-planet crossing test. Not full N-planet chaos (~10 r_Hm) and not isolation feeding-zone width.

Variables:
- Delta_a_min — minimum a2−a1 for Hill stability (meters)
- r_Hm — Mutual Hill Radius (meters)

**Watch out:** Circular coplanar pairs; eccentricity reduces stable Delta a; resonances can protect tighter packing.

Cues: Hill stability; minimum planet separation; 2 sqrt 3 mutual hill

**202. Isolation Mass** `Advanced`

M_iso = (2π Sigma a Delta_a)^(1.5) / √(M_star)

Use when: Use to see if oligarchs can reach ~10 Me M_crit (195) at given Sigma and a. Not gap-opening (197-198) or M_crit itself.

Variables:
- M_iso — maximum oligarch mass in feeding zone (kg)
- Sigma — Solids Surface Density (kg/m^2)
- a — semi-major Axis (meters)
- Delta_a — annulus width (often ~10 R_H) (meters)
- M_star — central star mass (kg)

**Watch out:** Supply Delta_a (often ~10 r_H); pebbles can exceed classical isolation by drifting in.

Cues: isolation mass; feeding zone mass; oligarchic isolation

**203. Isothermal Sound Speed (Disk Gas)** `Competition`

c_s = √(k T / (μ m_p))

Use when: Use for cold molecular disk gas (T~10-300 K, mu~2.3). Not adiabatic if gamma is given; not EUV wind cs (T~1e4 K, mu~0.7).

Variables:
- c_s — isothermal sound speed (m/s)
- T — gas temperature (Kelvin)
- mu — ≈2.3 for molecular disk gas (dimensionless)
- m_p — Proton Mass (kg)
- k — Boltzmann Constant (J/K)

**Watch out:** mu ~2.3 not 1; do not mix cgs Boltzmann k with SI masses.

Cues: isothermal sound speed; molecular disk sound speed

**204. Keplerian Orbital Frequency** `Competition`

Omega = √(G M_star / r³)

Use when: Use Omega, not surface g, inside disk formulas. Not planetary spin Omega in the dynamo (178).

Variables:
- Omega — Keplerian angular frequency (rad/s)
- M_star — Stellar Mass (kg)
- r — orbital distance (meters)

**Watch out:** Real gas is slightly sub-Keplerian (origin of eta in 214); G Msun = 1.327e20 m^3/s^2.

Cues: keplerian frequency; orbital angular frequency; Omega sqrt GM r3

**205. Mean-Motion Resonance Location** `Competition`

a_res = a_p (p / (p + 1))^(2 / 3)

Use when: Use to place Kirkwood gaps, Pluto 3:2, or migrating traps. Not Hill packing (201); not isolation feeding zones.

Variables:
- a_res — semi-major axis of resonant orbit (meters)
- a_p — semi-major axis of the perturbing planet (meters)
- p — integer for (p+1):p resonance (p=1 → 2:1)

**Watch out:** This is interior first-order; exterior is a_p*((p+1)/p)^{2/3}.

Cues: mean motion resonance location; 2:1 resonance distance; where is the resonance

**206. Minimum Mass Solar Nebula (MMSN) Surface Density** `Competition`

Sigma = Sigma_0 (r / AU)^(-1.5)

Use when: Use as default Sigma(r) when a problem says MMSN. Feed isolation, growth, Toomre Q, and core timescales.

Variables:
- Sigma — disk surface density at radius r (kg/m^2)
- Sigma_0 — surface density at 1 AU (kg/m^2)
- r — heliocentric distance (meters)

**Watch out:** 1 g/cm^2 = 10 kg/m^2; MMSN is a minimum, not a measurement.

Cues: MMSN surface density; minimum mass solar nebula; disk surface density power law

### Migration, pebbles, Toomre, accretion

**207. Mutual Hill Radius** `Competition`

r_Hm = 0.5 (a1 + a2) ((m1 + m2) / (3 M_star))^(1 / 3)

Use when: Use for spacing in Hill radii and Hill-stability (201). Not Bondi rg (200); single-planet r_H if only one body.

Variables:
- r_Hm — Mutual Hill Radius (meters)
- a1 — inner planet semi-major axis (meters)
- a2 — outer planet semi-major axis (meters)
- m1 — Inner Planet Mass (kg)
- m2 — Outer Planet Mass (kg)
- M_star — central star mass (kg)

**Watch out:** 1/3 power so mass errors barely move r_Hm; capture radius is often min(Hill, Bondi).

Cues: mutual hill radius; two planet hill radius

**208. Passive Disk Temperature (Chiang–Goldreich)** `Competition`

T = T_0 (r / r_0)^(-3 / 7)

Use when: Use for T(r) when accretion heating is negligible (low Mdot, outer disk). Not planet Teq (188); not viscous-heated inner AU.

Variables:
- T — midplane / disk temperature at r (Kelvin)
- T_0 — temperature at reference radius r₀ (Kelvin)
- r — orbital radius (meters)
- r_0 — normalization radius (meters)

**Watch out:** Passive means stellar irradiation; the same flaring makes H/r grow as r^{2/7}.

Cues: passive disk temperature; Chiang Goldreich; temperature r to the -3/7

**209. Pebble Accretion Rate (2D / Hill)** `Advanced`

dM_dt = 2 Sigma_peb (r_H Omega) r_H

Use when: Use when the pebble layer is thinner than r_H. Not 3D settling (210) if puffed; not planetesimal Fg (212).

Variables:
- dM_dt — mass growth rate (kg/s)
- Sigma_peb — Pebble Surface Density (kg/m^2)
- r_H — Planet Hill radius (meters)
- Omega — Keplerian Frequency (rad/s)

**Watch out:** Isolation can be bypassed because pebbles drift in (214); still need a pebble flux.

Cues: pebble accretion 2D; Hill pebble accretion; fast core growth pebbles

**210. Pebble Accretion Rate (3D / Settling)** `Advanced`

dM_dt = Sigma_peb Omega r_H² √(St / α)

Use when: Use when H_peb > r_H (small St or large alpha). Not 2D (209) once settled; not km-planetesimals (212).

Variables:
- dM_dt — mass growth rate (kg/s)
- Sigma_peb — Pebble Surface Density (kg/m^2)
- Omega — Keplerian Frequency (rad/s)
- r_H — Planet Hill radius (meters)
- St — Pebble Stokes number (dimensionless)
- alpha — turbulence parameter (dimensionless)

**Watch out:** Do not mix Sigma_peb with full gas MMSN Sigma; micron dust (tiny St) is negligible.

Cues: pebble accretion 3D; settling pebble accretion; St alpha pebble

**211. Photoevaporation Mass-Loss Rate** `Advanced`

Mdot_wind = Mdot0 √(Phi_EUV / Phi0) √(r_g / r_g0)

Use when: Use for late-stage disk dispersal and transition-disk holes. Not planetary atmospheres (179 or 184).

Variables:
- Mdot_wind — photoevaporative mass-loss rate (kg/s)
- Phi_EUV — ionizing photon luminosity Φ_EUV (1/s)
- r_g — Gravitational Radius (meters)

**Watch out:** Not energy-limited planetary escape; match Mdot0/Phi0/rg0 units before SI plugs.

Cues: photoevaporation mass loss; EUV disk wind; disk dispersal rate

**212. Planetesimal Accretion Growth Rate** `Advanced`

dM_dt = π R² Sigma Omega F_g

Use when: Use for km-class planetesimals and oligarchs. Not pebble Hill/settling (209-210), which is faster for cm-m pebbles.

Variables:
- dM_dt — mass accretion rate onto protoplanet (kg/s)
- R — Protoplanet Radius (meters)
- Sigma — planetesimal (or pebble) surface density (kg/m^2)
- Omega — Keplerian Frequency (rad/s)
- F_g — gravitational focusing enhancement (dimensionless)

**Watch out:** Sigma is solids not gas; accretion can become erosive if vrel exceeds a few times vesc.

Cues: planetesimal growth rate; embryo accretion rate; dM/dt pi R2 Sigma

**213. Protoplanetary Disk Scale Height** `Competition`

H = c_s / Omega

Use when: Use for disk thickness, alpha, h, gaps, and eta ~(H/r)^2. Not planetary atmosphere H = kT/(m g) (174).

Variables:
- H — vertical e-folding thickness (meters)
- c_s — isothermal sound speed (m/s)
- Omega — orbital angular frequency (rad/s)

**Watch out:** Do not insert stellar surface g; vertical gravity is Omega^2 z. Mixing 174 and 213 is a common error.

Cues: disk scale height; protoplanetary disk thickness; H equals cs over Omega

**214. Radial Drift Velocity (Dust)** `Advanced`

v_r = -2 eta v_K / (St + 1 / St)

Use when: Use for dust/pebble/boulder inspiral. Not atmospheric H from 174 to compute eta; eta comes from disk H/r (196).

Variables:
- v_r — radial velocity (negative = inward) (m/s)
- eta — ≈ (H/r)², typically ~1e-3 (dimensionless)
- v_K — circular orbital speed (m/s)
- St — dimensionless stopping time (dimensionless)

**Watch out:** Minus sign is inward; pressure bumps reverse eta and trap pebbles.

Cues: radial drift velocity; dust drift St; meter size barrier

**215. Steady Disk Accretion Rate** `Competition`

Mdot = 3π ν Sigma

Use when: Use to connect alpha viscosity and Sigma to an accretion rate. Photoevaporation (211) matters when Mdot_wind ~ this Mdot.

Variables:
- Mdot — mass accretion rate through the disk (kg/s)
- nu — Kinematic Viscosity (m^2/s)
- Sigma — gas surface density (kg/m^2)

**Watch out:** 3 pi assumes a steady zero-torque inner boundary; young spreading disks are not yet in this limit.

Cues: steady accretion rate; Mdot 3 pi nu Sigma; disk mass accretion

**216. Stokes Number** `Advanced`

St = t_stop Omega

Use when: Use as control for radial drift (214) and 3D pebble accretion (210). Not turbulent alpha (193); not Toomre Q.

Variables:
- St — Stokes Number (dimensionless)
- t_stop — gas-drag stopping time (seconds)
- Omega — Keplerian Frequency (rad/s)

**Watch out:** Epstein St proportional to size/Sigma, so the same grain has larger St in a gap.

Cues: Stokes number; stopping time Omega; dust coupling St

**217. Tidal Circularization Timescale** `Advanced`

t_circ = 1 / ((21 / 2) (k2 / Q) (M_star / M_p) (R_p / a)⁵ n)

Use when: Use to explain why hot Jupiters are circular while 1 AU giants are not. Not Type I/II disk migration; not tidal locking.

Variables:
- t_circ — e-folding time for eccentricity (seconds)
- k2 — degree-2 Love number (dimensionless)
- Q — tidal dissipation quality factor (dimensionless)
- M_star — Stellar Mass (kg)
- M_p — Planet Mass (kg)
- R_p — Planet Radius (meters)
- a — orbital distance (meters)
- n — orbital mean motion 2π/P (rad/s)

**Watch out:** Planet-tide e-damping for small e; circularization does not by itself shrink a.

Cues: tidal circularization; eccentricity damping time; hot jupiter circularize

**218. Toomre Q (Keplerian Disk)** `Competition`

Q = c_s Omega / (π G Sigma)

Physical meaning: Disk gravitational stability Q = cs Omega / (pi G Sigma); Q>1 stable, Q<1 can fragment.

Use when: Use to test gravitational instability vs core accretion. Not Jeans escape lambda (185) and not Stokes number.

Scaling / intuition: MMSN inner disks have Q of several (stable); massive outer disks at tens of AU can approach Q~1.

Variables:
- Q — stability parameter (dimensionless)
- c_s — gas sound speed (m/s)
- Omega — Keplerian Frequency (rad/s)
- Sigma — disk surface density (kg/m^2)

Typical values: Q>1 stable; Q~1 spirals; Q<1 fragmentation warning.

**Watch out:** Use gas Sigma not dust unless you have a self-gravitating pebble layer.

Cues: toomre Q keplerian; disk gravitational instability; protoplanetary Q

See also: Galactic / general form is 325 (σ_R and κ in place of c_s and Ω). Toomre Q Criterion (Disk Stability, simplified); Keplerian Orbital Frequency; Minimum Mass Solar Nebula (MMSN) Surface Density; Protoplanetary Disk Scale Height; Jeans Length (Gravitational Stability); Isothermal Sound Speed (Disk Gas)

**219. Type I Migration Timescale** `Advanced`

t_I = (M_star / M_p) (M_star / (Sigma a²)) (H / a)² / Omega

Use when: Use for Earth/super-Earth cores that have not opened a gap. Not for gap-opening giants (use Type II, t_II = r^2/nu).

Variables:
- t_I — characteristic migration time (seconds)
- M_star — central star mass (kg)
- M_p — Planet Mass (kg)
- Sigma — disk gas surface density (kg/m^2)
- a — semi-major Axis (meters)
- H — disk scale height (meters)
- Omega — Keplerian Frequency (rad/s)

**Watch out:** SI: kg, kg/m^2, m, rad/s; divide seconds by 3.156e7 for years. Omitted torque coefficients are O(1), not 1.00.

Cues: Type I migration; low mass planet migration time; density wave torque timescale

**220. Type II Migration Timescale** `Advanced`

t_II = r² / ν

Use when: Use after a thermal or viscous gap-opening criterion is met. Not for low-mass no-gap planets (use Type I).

Variables:
- t_II — migration timescale after gap opening (seconds)
- r — ≈ semi-major axis (meters)
- nu — Kinematic Viscosity (m^2/s)

**Watch out:** Algebraically the same as t_nu; build nu = alpha c_s H if alpha is given. Inward Type II is the exam default.

Cues: Type II migration; gap planet migration; viscous migration timescale

**221. Viscous Evolution Timescale** `Advanced`

t_nu = r² / ν

Use when: Use for disk lifetime vs photoevaporation or Type II. Not the dynamical time 1/Omega or atmosphere cooling time.

Variables:
- t_nu — characteristic viscous evolution time (seconds)
- r — orbital radius (meters)
- nu — Kinematic Viscosity (m^2/s)

**Watch out:** Same formula as Type II; interpret as disk evolution unless a gap planet is specified. Convert to years at the end.

Cues: viscous timescale; disk lifetime viscosity; r squared over nu

**222. Viscous Heating Rate (Disk)** `Advanced`

Q_plus = (9 / 4) ν Sigma Omega²

Use when: Use when accretion heating, not stellar irradiation, sets midplane T. Not for passive irradiated disks (use Chiang-Goldreich T).

Variables:
- Q_plus — energy dissipation per unit area (W/m^2)
- nu — Kinematic Viscosity (m^2/s)
- Sigma — gas surface density (kg/m^2)
- Omega — Keplerian Frequency (rad/s)

**Watch out:** The 9/4 is for Keplerian rotation only. Q_plus is W/m^2, not luminosity; integrate 2 pi r dr if you need total power.

Cues: viscous heating; disk dissipation rate; Q plus viscosity

## High-energy astrophysics

### Magnetic fields and synchrotron setup

**223. Alfvén Mach Number** `Advanced`

M_A = v / v_A

Use when: Use to classify MHD flows and shocks (solar wind, jets, ISM). Not ordinary Mach number (use sound speed).

Variables:
- M_A — flow speed relative to Alfvén speed (dimensionless)
- v — plasma or shock speed (m/s)
- v_A — Characteristic MHD wave speed (m/s)

**Watch out:** SI: v_A = B/sqrt(mu_0 rho) with tesla and kg/m^3. Never mix that with a CGS Alfven speed that has 4 pi.

Cues: alfven mach; M_A MHD; v over alfven speed

**224. Characteristic Synchrotron Frequency** `Advanced`

nu_syn = (3 e B / (4π m_e c)) γ²

Use when: Use to match an observed synchrotron peak or cooling break to B and gamma. Not cyclotron nu_c itself (boosted by ~gamma^2).

Variables:
- ν_syn — characteristic synchrotron frequency (Hz)
- B — magnetic field strength (Tesla)
- γ — Relativistic Lorentz factor of electron (dimensionless)
- e — charge of electron (C)
- m_e — mass of electron (kg)
- c — speed of light in vacuum (m/s)

**Watch out:** Printed form has c in the denominator (CGS/gauss). SI cyclotron is eB/m_e with no c; never put tesla in a gauss formula. Thomson 6.65e-29 m^2 is for power/cooling, not this.

Cues: synchrotron frequency; characteristic synchrotron frequency; calculate synchrotron frequency; synchrotron emission frequency

**225. Cooling Break Frequency** `Advanced`

nub = (3 eB / (4π m_e c)) gammab²

Use when: Use when a spectral break is from cooling, not the injection high-energy cutoff.

Variables:
- νb — frequency at the cooling break (Hz)
- B — strength of the magnetic field (Tesla)
- γb — Lorentz factor at the cooling break (dimensionless)

**Watch out:** Same SI vs CGS kernel as formula 224. Compute gamma_b from cooling time first (226 and 240), then convert to frequency.

Cues: cooling break frequency

**226. Cooling Break Lorentz Factor** `Advanced`

gammab = (6π m_e c) / (σ_T B² t_age)

Use when: Use to date a remnant from a cooling break. Not gamma_max (acceleration-loss balance; use Bohm limit).

Variables:
- γb — Lorentz factor at the cooling break (dimensionless)
- B — strength of the magnetic field (Tesla)
- t_age — age of the system (seconds)

**Watch out:** Printed 6 pi m_e c/(sigma_T B^2 t_age) is CGS (B in gauss). SI: gamma_b = 3 m_e c mu_0/(2 sigma_T B^2 t_age) with tesla. sigma_T = 6.65e-29 m^2.

Cues: cooling break lorentz factor

**227. Cyclotron Angular Frequency** `Competition`

omega_c = q B / m

Use when: Use for Larmor motion, cyclotron lines, and as the parent of synchrotron. Not characteristic synchrotron frequency (boosted by ~gamma^2).

Variables:
- omega_c — Cyclotron Angular Frequency ω_c (rad/s)
- q — particle charge (C)
- B — magnetic field strength (Tesla)
- m — particle mass (kg)

**Watch out:** SI: omega_c = q B/m (tesla). CGS is q B/(m c). Divide by 2 pi for cyclic frequency in Hz.

Cues: cyclotron frequency; gyrofrequency; omega c q B m

**228. Gravitational-Wave Luminosity (Quadrupole, Leading Order)** `Advanced`

P_GW = (32 / 5) (G⁴ / c⁵) (M1² M2² (M1 + M2)) / a⁵

Use when: Use for Hulse-Taylor, LIGO-band binaries, and merger energetics. Not isolated-pulsar spindown (use L = I omega |omega_dot|).

Variables:
- P_GW — gravitational-wave luminosity (W)
- M1 — first component mass (kg)
- M2 — second component mass (kg)
- a — orbital separation (circular approx.) (meters)

**Watch out:** Circular-orbit only; eccentricity needs Peters factors. Crab spindown uses P ~ 33 ms and I ~ 1e38 kg m^2 (= 1e45 g cm^2), not this law.

Cues: gravitational wave luminosity; GW power binary; quadrupole gravitational radiation

**229. Internal Energy from Linear Period Growth** `Advanced`

E = C / t²

Use when: Use only if T proportional to t is given or derived. Not isolated-pulsar spindown (use L = I omega |omega_dot|) unless connected.

Variables:
- E — energy at time t (J)
- C — C = 4π² m_star r_star²/(5α²) when T = α t and E = 4π² m_star r_star²/(5 T²) (J*s^2)
- t — time since linear period law reference (s)

**Watch out:** 1e38 kg m^2 and 1e45 g cm^2 are the same NS I in SI vs CGS; never mix the unit systems.

Cues: energy as function of time linear period; E if period proportional to time; C over t squared energy

**230. Magnetic Energy Density** `Competition`

U_B = B² / (2 μ_0)

Equivalent forms:
- P_B = B² / (2 μ_0)   (231, magnetic pressure; same SI expression)

Physical meaning: Magnetic energy stored per unit volume (equals magnetic pressure in SI).

Use when: Use for synchrotron U_B, magnetar budgets, and equipartition. Same number as P_B (formula 231).

Scaling / intuition: Energy density climbs as B^2, so doubling the field stores four times the energy.

Variables:
- U_B — energy density of the magnetic field (J/m^3)
- B — strength of the magnetic field (Tesla)
- mu_0 — permeability of free space (default in constants) (N/A^2)

**Watch out:** SI: U_B = B^2/(2 mu_0) with tesla and mu_0 = 4 pi e-7. CGS: B^2/(8 pi) with gauss. NEVER mix.

Cues: magnetic energy density

See also: Magnetic Flux (Flux Freezing); Alfvén Speed (SI, ideal MHD); Rotational Kinetic Energy; Magnetic Energy (Uniform B Inside Sphere); Dynamo Magnetic Field Scaling

**231. Magnetic Pressure (SI)** `Competition` · same as 230

P_B = B² / (2 μ_0)

Same relation as **230. Magnetic Energy Density**. Use that entry for meaning, traps, and cues.

**Watch out:** SI: B^2/(2 mu_0) with tesla. CGS: B^2/(8 pi) with gauss. WD problems often set Delta P_gas = Delta(B^2/(2 mu_0)).

### Pulsars, synchrotron, gravitational waves

**232. Maximum Gamma (Bohm Limit)** `Advanced`

gammamax ~ = √(6π eps / (sigmaT B xi))

Use when: Use for CR/electron cutoffs in SNR, jets, GRBs when Bohm DSA is invoked. Not gamma_b (set by source age; use 226).

Variables:
- γmax — maximum relativistic gamma factor (dimensionless)
- B — strength of the magnetic field (Tesla)
- ξ — dimensionless efficiency parameter (dimensionless)

**Watch out:** Printed constants look Gaussian; do not mix tesla with gauss. Rebuild from SI with sigma_T = 6.65e-29 m^2 if needed.

Cues: maximum gamma (bohm limit)

**233. Period Ratio from Energy Ratio (T ∝ E⁻¹/²)** `Competition`

T2_over_T1 = f^(-0.5)

Use when: Use for a stated energy-fraction change without recomputing structure. Not a substitute for spindown L = I omega |omega_dot|.

Variables:
- T2_over_T1 — ratio of periods after/before (dimensionless)
- f — e.g. 0.999 if energy drops by 0.1% (dimensionless)

**Watch out:** Type f as 0.999, not 0.1. Pulsation P ~ rho^{-1/2} is a different relation unless energy is tied to density.

Cues: period change energy change pulsar; energy drops period increases; T2 over T1 from f

**234. Power-Law Energy Spectrum** `Advanced`

N(E) = K E^(-p)

Use when: Use for nonthermal CR/electron populations and to convert p into synchrotron alpha. Not the photon index itself (use 239).

Variables:
- N — number of particles per unit energy at energy E (particles/energy)
- K — constant of proportionality (varies)
- E — energy at which spectral density is evaluated (energy units)
- p — exponent describing steepness of spectrum (dimensionless)

**Watch out:** Uncooled synchrotron: alpha = (p-1)/2. After cooling, p -> p+1 and alpha rises by 1/2. Do not confuse p (particles) with alpha (photons).

Cues: power-law energy spectrum

**235. Pulsar Light Cylinder Radius** `Competition`

R_LC = c / omega_spin

Use when: Use for pulsar magnetosphere geometry, open field lines, and polar-cap size. Not spindown luminosity (use L = I omega |omega_dot|).

Variables:
- R_LC — radius where corotation speed would reach c (meters)
- c — vacuum speed of light (m/s)
- omega_spin — neutron star rotation rate (rad/s)

**Watch out:** omega_spin is rad/s, not Hz (omega = 2 pi/P). NS I ~ 1e38 kg m^2 ~ 1e45 g cm^2. Polar cap uses theta_pc ~ sqrt(R_star/R_LC).

Cues: light cylinder pulsar; R_LC c omega; pulsar corotation radius

**236. Pulsar Period from Rotational vs Internal Energy** `Advanced`

T = 2π r_star √(m_star / (5 E))

Use when: Use when rotational energy is set equal to internal or gravitational energy. Not the observed Crab period unless that equality is the setup.

Variables:
- T — Rotation Period (s)
- m_star — Neutron Star Mass (kg)
- r_star — Neutron Star Radius (m)
- E — energy equated to rotational KE in the problem setup (J)

**Watch out:** 1 kg m^2 = 1e7 g cm^2, so 1e38 SI and 1e45 CGS match. Spindown is L = I omega |omega_dot| with Crab P ~ 33 ms, a different calc.

Cues: pulsar period from internal energy; T from E neutron star; rotational KE equals internal energy

**237. Pulsar Polar Cap Angle (Dipole Order-of-Magnitude)** `Advanced`

theta_pc = √(R_star / R_LC)

Use when: Use after R_LC = c/omega to estimate beam width or R_pc ~ R_star theta_pc. Not a full force-free magnetosphere.

Variables:
- theta_pc — half-opening angle scale (order-of-magnitude) (rad)
- R_star — Neutron Star Radius (meters)
- R_LC — Light Cylinder Radius (meters)

**Watch out:** Result is radians (times 180/pi for degrees). NS I ~ 1e38 kg m^2 ~ 1e45 g cm^2 if spindown is also asked.

Cues: polar cap pulsar; theta pc sqrt R over R_LC

**238. Radiation Force (Thomson, Spherical Luminosity)** `Competition`

F_rad = L σ / (4π r² c)

Use when: Use for radiation vs gravity, winds, dust, and setting up Eddington. Not radiation pressure on a wall (use F/c = L/(4 pi r^2 c)).

Variables:
- F_rad — force from photon momentum transfer (N)
- L — isotropic source luminosity (W)
- sigma — interaction cross section (e.g. Thomson) (m^2)
- r — radius from source (meters)

**Watch out:** Eddington uses this sigma on ionized H (effective sigma/m per proton). L in W, sigma in m^2, r in m.

Cues: radiation force luminosity; thomson force L sigma; radiation pressure cross section

**239. Spectral Index** `Advanced`

α = (p - 1) / 2

Use when: Use to read p from a measured slope, or predict radio slopes from DSA p. Not for thermal spectra or optically thick synchrotron.

Variables:
- α — spectral index of flux density (dimensionless)
- p — power-law index of particle spectrum (dimensionless)

**Watch out:** This alpha is not disk viscosity alpha or fine-structure alpha. After cooling replace p by p+1.

Cues: spectral index

**240. Synchrotron Cooling Timescale** `Advanced`

t_syn = (3 m_e c μ_0) / (2σ_T B² γ)

Physical meaning: Time for a relativistic electron to lose a large fraction of its energy to synchrotron.

Use when: Use to compare cooling with age, escape, or acceleration. If t_syn < t_age, a cooling break exists at that gamma.

Scaling / intuition: Energy ~ gamma m_e c^2 over power ~ U_B gamma^2 gives t_syn ~ 1/(B^2 gamma).

Variables:
- t_syn — order-of-magnitude time for significant synchrotron energy loss (seconds)
- B — magnetic field strength (SI) (Tesla)
- γ — Relativistic Lorentz factor of the electron (dimensionless)

**Watch out:** SI (B in tesla, mu_0 = 4 pi e-7, sigma_T = 6.65e-29 m^2). CGS is t = 6 pi m_e c/(sigma_T B^2 gamma) with gauss; do not plug tesla into 6 pi. IC cooling is the same with U_rad replacing U_B.

Cues: synchrotron cooling timescale

See also: Characteristic Synchrotron Frequency

**241. Synchrotron Power** `Advanced`

P_syn = (4 / 3) σ_T c U_B γ²

Use when: Use for cooling rates, population luminosity, and t_syn = energy/power. Insert SI U_B when B is tesla.

Variables:
- P_syn — power radiated by the electron (W)
- U_B — energy density of the magnetic field (J/m^3)
- γ — Relativistic Lorentz factor (dimensionless)

**Watch out:** Build U_B as B^2/(2 mu_0) in SI or B^2/(8 pi) in CGS; the (4/3) sigma_T c U_B gamma^2 wrapper is valid only if U_B matches the unit system.

Cues: synchrotron power

## Stellar structure

### Stellar structure core equations

**242. Accretion Luminosity (L = G M ṁ / R)** `Competition`

L = G M m_dot / R

Physical meaning: Gravitational power from mass accreting onto a surface from infinity at radiative efficiency 1.

Use when: Use for WD/NS accretion when no efficiency is quoted. For black holes use L = eta m_dot c^2 with eta ~ 0.1 (no hard surface).

Scaling / intuition: Each kg drops G M/R; NS (R ~ 10 km) vastly outshines a WD (R ~ 1e4 km) at the same m_dot.

Variables:
- L — accretion luminosity (W)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — Accretor Mass (kg)
- m_dot — mass accretion rate (kg/s)
- R — radius of accretor (m)

Typical values: 1 Msun/yr ~ 6.3e22 kg/s. For NS, G M/(R c^2) ~ 0.2, so this estimate is order-of-magnitude.

**Watch out:** Not fusion L ~ epsilon c^2 m_dot and not main-sequence L ~ M^3 to M^4. Efficiency epsilon < 1 is a later formula (262).

Cues: accretion luminosity; apparent magnitude Mira B accretion; luminosity from accretion rate

See also: Escape Velocity; Bondi–Hoyle Accretion Rate (γ = 5/3); Radiation Force (Thomson, Spherical Luminosity); Specific Angular Momentum (Circular Keplerian Orbit); Steady Disk Accretion Rate

**243. Adiabatic Gradient (Ideal Gas, ∇_ad)** `Competition`

nabla_ad = (gamma_gas - 1) / gamma_gas

Use when: Use with Schwarzschild: convection if nabla_rad > nabla_ad. Not the Cepheid radius-temperature coupling gamma.

Variables:
- nabla_ad — adiabatic d ln T / d ln P (dimensionless)
- gamma_gas — ratio of specific heats C_p/C_v (dimensionless)

**Watch out:** gamma_gas is C_P/C_V. Sound speeds: adiabatic sqrt(gamma k T/mu), isothermal sqrt(k T/mu).

Cues: adiabatic gradient; nabla ad convection; gamma ideal gas star

**244. Average Stellar Temperature** `Competition`

T_avg ∝ G M μ m_H / (k R)

Use when: Use for order-of-magnitude mean/central T from M and R. Not a precise central-T solver, and not the mass-luminosity relation.

Variables:
- T_avg — average temperature throughout the star (Kelvin)
- G — newton's gravitational constant (m^3/(kg*s^2))
- M — total mass of the star (kg)
- R — radius of the star (meters)
- μ — average mass per particle in units of hydrogen mass (dimensionless)
- m_H — mass of hydrogen atom (kg)
- k — Boltzmann Constant (J/K)

**Watch out:** Here mu is dimensionless times m_H; some virial cards use mu in kg. Prefactors 3/10 or 1/5 depend on structure. MS is L ~ M^3.5, a different relation.

Cues: average stellar temperature; stellar temperature scaling; calculate average temperature; temperature mass relation

**245. Binary Mass Ratio from Velocity Amplitudes** `Competition`

M_1 / M_2 = K_2 / K_1

Use when: Use for double-lined (SB2) systems when both K's are measured. Not for single-lined systems (those give only a mass function).

Variables:
- M₁ — mass of primary star (kg)
- M₂ — mass of secondary star (kg)
- K₁ — semi-amplitude of radial velocity for primary star (m/s)
- K₂ — semi-amplitude of radial velocity for secondary star (m/s)

**Watch out:** Do not swap indices: larger K belongs to smaller mass. Inclination cancels in the ratio. Eccentric orbits need (1-e^2) in the mass function.

Cues: binary mass ratio; velocity amplitude mass ratio; spectroscopic binary mass; calculate mass from velocity

**246. Bolometric Correction** `Reference`

M_bol = M_V + BC

Use when: Use whenever going from V photometry to total luminosity, especially hot or cool stars.

Variables:
- M_bol — absolute bolometric magnitude, total energy output (magnitude)
- M_V — absolute visual magnitude (magnitude)
- BC — correction factor, typically negative for hot stars (magnitude)

**Watch out:** With M_bol = M_V + BC, BC is typically negative for both very hot and very cool stars. Apply A_V separately in the distance modulus.

Cues: bolometric correction; bolometric magnitude; visual to bolometric; calculate bolometric magnitude

**247. Central Pressure (Approximate)** `Competition`

P_c ∝ G M² / R⁴

Use when: Use to estimate P_c from M and R, or compare MS/WD/NS. Not a precision stellar-model output.

Variables:
- P_c — pressure at stellar center, central pressure (Pa)
- G — newton's gravitational constant (m^3/(kg*s^2))
- M — total mass of the star (kg)
- R — radius of the star (meters)

**Watch out:** Uniform-sphere prefactors (e.g. 2 pi/3) only if quoted. This scaling does not say whether gas, radiation (1/3 a T^4), or degeneracy P = K rho^{5/3} wins.

Cues: central pressure star; stellar central pressure; calculate central pressure; pressure at star center

**248. Convection Criterion (Schwarzschild Criterion)** `Advanced`

|dT / dr|_actual > |dT / dr|_adiabatic

Use when: Use to choose radiative vs convective transport. Not Ledoux unless composition (mu) gradients are mentioned.

Variables:
- dT/dr — rate of temperature change with radius, temperature gradient (K/m)

**Watch out:** Compare nabla = d ln T / d ln P, not raw dT/dr. Radiative gradient is formula 282.

Cues: convection criterion; schwarzschild criterion; when does convection occur; convective instability

**249. Energy Generation (Luminosity Gradient)** `Competition`

dL_dr = 4π r² ρ epsilon_gen

Use when: Use with hydrostatic balance, mass continuity, and energy transport. Integrate through the core for surface L.

Variables:
- dL_dr — luminosity gradient with radius (W/m)
- r — radial coordinate (meters)
- rho — mass density (kg/m^3)
- epsilon_gen — power released per unit mass (nuclear) (W/kg)

**Watch out:** Main-sequence L ~ M^{3.5} is a global result, not a substitute for this local law. epsilon often ~ rho T^nu. Pair with dM/dr = 4 pi r^2 rho.

Cues: dL dr stellar; luminosity shell energy generation

**250. Extinction Correction with RV** `Competition`

A_V = R_V E(B - V)

Use when: Use to turn measured E(B-V) into A_V, then into a distance-modulus correction.

Variables:
- A_V — extinction in visual band (magnitude)
- R_V — Ratio AV/E(B-V), typically 3.1 for Milky Way (dimensionless)
- E(B - V) — reddening, B-V color excess (magnitude)

**Watch out:** True modulus is m_V - M_V - A_V. Also A_B = (R_V + 1) E(B-V). E(B-V) = (B-V)_obs - (B-V)_0.

Cues: extinction correction; RV extinction; calculate AV from color excess; interstellar extinction RV

**251. Flux Change from Magnitude Difference** `Reference`

F_2 / F_1 = 10^(-0.4 Δm)

Use when: Use for any same-band brightness comparison. Invert as Delta m = -2.5 log10(F2/F1).

Variables:
- F₂ — flux at time 2 or for object 2 (W/m^2)
- F₁ — flux at time 1 or for object 1 (W/m^2)
- Δm — difference in magnitudes, m₂ - m₁ (magnitude)

**Watch out:** Delta m = m2 - m1, so positive Delta m means object 2 is fainter. Flux ratio is a radius ratio only if temperature is fixed.

Cues: flux change magnitude; magnitude difference flux; how much fainter; brightness change magnitude; calculate flux ratio from magnitude

**252. Fractional Luminosity Amplitude from Radius-Temperature Coupling** `Advanced`

L_frac = (2 - 4 γ) R_frac

Use when: Use to convert fractional radius amplitude into light amplitude for Cepheids/RR Lyrae. Not the Cepheid PL mean M_V (273/274).

Variables:
- L_frac — Fractional Luminosity Amplitude (dimensionless)
- gamma — radius-Temperature Coupling (dimensionless)
- R_frac — Fractional Radius Amplitude (dimensionless)

**Watch out:** This gamma is the T-R coupling, not C_P/C_V. Magnitude variation uses (4 gamma - 2) because mag is minus log flux.

Cues: fractional luminosity amplitude; delta T over T equals minus gamma delta R over R; 2 minus 4 gamma R

**253. Free-Fall Time (Uniform Sphere)** `Core`

t_dyn = √(3π / (32 G ρ))

Physical meaning: Time for a uniform pressureless sphere to collapse to a point.

Use when: Use for cloud collapse and vs KH/nuclear times. Not free-fall from infinity onto a point mass, and not P = t_ff without a pulsation model.

Scaling / intuition: The only gravity timescale from G and rho is 1/sqrt(G rho); denser objects collapse faster.

Variables:
- t_dyn — characteristic gravitational timescale (s)
- G — Gravitational Constant (m^3/(kg*s^2))
- rho — typical or mean density (kg/m^3)

Typical values: Problems quoting n ~ 1e4 cm^{-3} want this (convert rho = mu m_H n). NS dynamical times are milliseconds; molecular clouds, Myr.

**Watch out:** Prefactor sqrt(3 pi/32) ~ 0.54; the rough 1/sqrt(G rho) is too long by ~2. Pulsation P ~ rho^{-1/2} is the same family, different geometry.

Cues: dynamical time density; t dyn G rho; gravity timescale star; nebula collapse timescale 1e4 particles per cm3; free fall time molecular cloud density; gravitational collapse timescale uniform sphere

See also: Average Density; Hydrostatic Balance; Jeans Mass; Type Ia Peak Time (Photon Diffusion Scaling); Supernova Luminosity (Kinetic ÷ Diffusion Scaling); Pulsation Period vs Mean Density (P ∝ ρ⁻¹/²)

**254. Hydrostatic Balance** `Core`

dP / dr = -G M(r)ρ(r) / r²

Physical meaning: Outward pressure gradient exactly balances gravity at every radius in a static star or planet.

Use when: Use whenever hydrostatic balance is stated. Combine with an EOS and mass continuity for structure.

Scaling / intuition: Pressure from below minus pressure from above equals the shell's weight; compact objects need steeper dP/dr.

Variables:
- dP_dr — change in pressure with radius (Pa/m)
- M — mass enclosed within radius r (kg)
- ρ — density at radius r (kg/m^3)
- r — radial distance from center (meters)

**Watch out:** M(r) is enclosed mass, not total M, unless near the surface. Photosphere form: dP/d tau = g/kappa. Convection vs radiation is a separate test.

Cues: hydrostatic balance; pressure gradient stellar; stellar pressure gradient; pressure balance star; hydrostatic equilibrium; stellar structure pressure; calculate pressure gradient

See also: Mass Continuity (Spherical Shell); Energy Generation (Luminosity Gradient); Radiative Transport Temperature Gradient; Central Pressure (Approximate); Convection Criterion (Schwarzschild Criterion); Ideal Gas Pressure

**255. Ideal Gas Pressure** `Competition`

P_gas = n k T

Use when: Use in interiors away from degeneracy, H II regions, clouds, and atmospheres. Not degenerate WD cores (use P = K rho^{5/3}).

Variables:
- P_gas — pressure from ideal gas, thermal pressure (Pa)
- n — number density of particles, particle density (m⁻^3)
- k — Boltzmann Constant (J/K)
- T — temperature of the gas (Kelvin)

**Watch out:** If mu is dimensionless, P = rho k T/(mu m_H); n in m^{-3} for P = n k T. Compare with radiation (1/3) a T^4. Sound: adiabatic sqrt(gamma k T/mu), isothermal sqrt(k T/mu).

Cues: ideal gas pressure; gas pressure calculation; thermal pressure; pressure from temperature

**256. Isothermal Scale Height** `Competition`

H = k_B T / (m g)

Use when: Planetary atmospheres, photospheres, and P(z)=P0 exp(-z/H). Not for disks without replacing g (use H=c_s/Omega).

Variables:
- H — characteristic vertical pressure/density scale height (m)
- k_B — Boltzmann Constant (J/K)
- T — atmospheric temperature (K)
- m — mean particle mass (kg)
- g — gravitational acceleration (m/s^2)

**Watch out:** m is particle mass in kg; if mu is dimensionless, H = kT/(mu m_H g).

Cues: scale height; hydrogen helium atmosphere scale height; derive H from hydrostatic equilibrium; Janus scale height

### Timescales, fusion, opacity, optical depth

**257. Kelvin–Helmholtz Growth Rate (Shear Scaling)** `Advanced`

gamma_KH = k dv

Use when: Shear at cloud-wind, jet, or disk interfaces. Not the stellar KH thermal time (use U/L), and not Rayleigh-Taylor (use sqrt(g k)).

Variables:
- gamma_KH — shear instability growth rate (Hz)
- k — spatial wavenumber (rad/m)
- dv — velocity difference across interface (m/s)

**Watch out:** k=2pi/lambda; this KH is shear, not contraction time t=U_bind/L.

Cues: kelvin helmholtz; KH instability; shear k delta v

**258. Kelvin–Helmholtz Time from Binding Energy** `Competition`

t = U_bind / L

Use when: When |U| is handed to you. Not shear KH (use k dv) and not nuclear t=E_nuc/L.

Variables:
- t — KH / thermal time (s)
- U_bind — |E_grav| or model-specific binding energy (positive) (J)
- L — power radiated (W)

**Watch out:** Virial 2K+U=0 implies some texts use |U|/(2L); apply 1/2 only if asked.

Cues: kelvin helmholtz binding energy; thermal timescale gravitational energy over luminosity; U bind over L stellar

**259. Kelvin–Helmholtz Timescale (general G M² / R L)** `Competition`

t = G M² / (R L)

Use when: PMS contraction and historical Sun-age. Not shear KH (use k dv). If uniform-sphere |U| is given, use 3/5 (or 3/10 for |E_total|/L).

Variables:
- t — KH timescale (convert to years: ÷ 3.156e7) (s)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — stellar mass (kg)
- R — stellar radius (m)
- L — luminosity (W)

**Watch out:** Same algebra as formula 289; virial 2K+U=0 implies E_total=U/2=-K.

Cues: how many years sun last gravitational contraction; kelvin helmholtz exact; sun gravitational contraction years; kelvin helmholtz general formula

**260. Keplerian Breakup Angular Speed (Massive Sphere)** `Competition`

omega_k = √(G M / R³)

Use when: Max-spin check for NS, WD, stars, planets; P_min=2pi/Omega_k. Not the light-cylinder radius (use R_LC=c/Omega).

Variables:
- omega_k — Keplerian / breakup-scale rotation rate (rad/s)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — stellar / remnant mass (kg)
- R — equatorial radius (meters)

**Watch out:** Ignores oblateness (true breakup is slower); I ~ 10^38 kg m^2 ~ 10^45 g cm^2 if you need (1/2)I Omega^2.

Cues: neutron star max spin; breakup angular velocity; sqrt GM over R cubed omega

**261. Luminosity from Fusion Mass-Loss Rate** `Competition`

L = ε c² m_dot

Use when: Fused mass per year to power, or invert for burn rate. Not gravitational accretion (use L=G M m_dot/R).

Variables:
- L — power output (W)
- epsilon — fraction of mass defect to energy (~0.007 for H→He order-of-magnitude; use problem value)
- c — speed of Light (m/s)
- m_dot — Mass Fusion Rate (kg/s)

**Watch out:** m_dot is mass fused, not a wind; later stages have smaller epsilon.

Cues: triple alpha energy per second; red giant helium fusion luminosity mass per year; 10 minus 3 solar masses helium fused one year power

**262. Luminosity from Infalling Matter** `Competition`

L = ε G M m_dot / R

Use when: Accretion or meteoric Sun-power problems. Not fusion (use epsilon c^2 m_dot). BH disks use epsilon~0.06-0.4 times m_dot c^2.

Variables:
- L — generated luminosity (W)
- epsilon — fraction of GPE converted to radiation (dimensionless)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — Central Mass (kg)
- m_dot — Mass Infall Rate (kg/s)
- R — radius of star (m)

**Watch out:** Here epsilon multiplies G M/R, not rest mass; exams sometimes omit epsilon and assume 1.

Cues: rate of infalling matter; luminosity from infalling matter; energy released infalling mass; generate sun luminosity infall

**263. Magnitude Variation for Pulsation (First Order)** `Advanced`

delta_M = (4 γ - 2) R_amp cos(ω t + φ)

Use when: Sketch a light curve from a radius curve, or phase vs radius. Not Cepheid PL mean brightness (use 273/274) and not a hydro code.

Variables:
- delta_M — first-order magnitude variation (mag)
- gamma — radius-Temperature Coupling (dimensionless)
- R_amp — Fractional Radius Amplitude (dimensionless)
- omega — Angular Frequency (rad/s)
- t — time (s)
- phi — phase offset (rad)

**Watch out:** gamma is R-T coupling, not C_P/C_V; (4 gamma-2) has the magnitude sign flip.

Cues: delta MK pulsation; magnitude variation in terms of gamma omega phi; in phase or out of phase with radius curve

**264. Mass Continuity (Spherical Shell)** `Competition`

dM_dr = 4π r² ρ

Use when: One of the four stellar-structure equations; convert rho(r) to M(r). Not disks (use surface density Sigma).

Variables:
- dM_dr — mass gradient with radius (kg/m)
- r — radial coordinate (meters)
- rho — mass density at r (kg/m^3)

**Watch out:** Pair with dP/dr=-G M rho/r^2 and dL/dr=4 pi r^2 rho epsilon; rho in kg/m^3.

Cues: mass continuity star; dM dr 4 pi r squared rho

**265. Mass Loss Rate (General Form)** `Competition`

Mdot ∝ L / (v_w c)

Use when: Hot-star and Wolf-Rayet winds. Not the Sun's thermal/Alfven wind, and not fusion m_dot in L=epsilon c^2 m_dot.

Variables:
- Ṁ — rate of mass loss, mass loss per unit time (kg/s)
- L — stellar luminosity (W)
- v_w — velocity of stellar wind (m/s)
- c — speed of light in vacuum (m/s)

**Watch out:** Scaling, not full CAK; convert kg/s to Msun/yr to compare.

Cues: mass loss rate; stellar wind mass loss; calculate mass loss; wind mass loss

**266. Nebula Age from Expansion** `Competition`

t = r / v

Use when: Planetary nebulae, free-expansion SNRs, nova shells from angular size plus spectroscopy. Not decelerated Sedov (use t=(2/5)r/v) and not Type Ia diffusion peak.

Variables:
- t — age of the nebula (seconds)
- r — current radius of the nebula (meters)
- v — expansion velocity of nebula (m/s)

**Watch out:** r in m, v in m/s, then convert seconds to years; r = theta d with theta in radians.

Cues: nebula age; expansion age; planetary nebula age; how old is nebula; supernova remnant age

**267. Non-Relativistic Degeneracy Pressure Scaling (P ∝ ρ⁵/³)** `Competition`

P = K_nr ρ^(5 / 3)

Physical meaning: Non-relativistic electron degeneracy pressure P = K_nr rho^{5/3}, independent of T.

Use when: Brown-dwarf interiors and low-mass WD cores. Not relativistic (use P=K_r rho^{4/3}, Chandrasekhar ~1.4 Msun) and not ideal gas n k T.

Scaling / intuition: Pauli exclusion packs electrons to higher momentum; a WD can cool without collapsing.

Variables:
- P — degeneracy pressure (Pa)
- rho — mass density (kg/m^3)
- K_nr — problem-specific or from textbook (SI composite)

Typical values: Chandrasekhar ~1.4 Msun (sometimes 1.44); non-rel WD R proportional to M^{-1/3}.

**Watch out:** K_nr depends on h, m_e, mu_e; Type Ia occurs when an accreting WD nears Chandrasekhar.

Cues: white dwarf pressure center rho 5/3; electron degeneracy pressure formula; compare white dwarf brown dwarf pressure

See also: Chandrasekhar Limit; White Dwarf Mass-Radius Relation; Ideal Gas Pressure

**268. Nuclear Energy Generation Rate (General)** `Advanced`

eps ∝ ρ T^ν

Use when: Compare burning regimes or how epsilon changes if T rises 10%. Not late-stage neutrino-loss epsilon unless specified.

Variables:
- ε — energy generation rate per unit mass, nuclear burning rate (W/kg)
- ρ — mass density (kg/m^3)
- T — temperature (Kelvin)
- ν — temperature dependence exponent, varies with reaction type (dimensionless)

**Watch out:** Density is linear here except three-body rates; plug into dL/dr=4 pi r^2 rho epsilon.

Cues: nuclear energy generation; energy generation rate; nuclear burning rate; stellar energy generation

**269. Nuclear Fusion Mass Defect** `Competition`

E = Δm c²

Use when: Energy per reaction or total nuclear fuel. Not the KH gravitational reservoir G M^2/R.

Variables:
- E — energy released from fusion reaction (J)
- Δm — mass difference, mass lost in reaction (kg)
- c — speed of light in vacuum (m/s)

**Watch out:** Delta m in kg for E in J; M_fuel is the burnable core fraction, not the whole star.

Cues: nuclear fusion energy; mass defect; hydrogen fusion energy; energy from fusion; einstein mass energy

**270. Opacity (General Relation)** `Competition`

κ = σ / m

Use when: Convert Thomson or dust cross sections for optical depth and radiative gradients.

Variables:
- κ — opacity, mass absorption coefficient (m^2/kg)
- σ — interaction cross-section, scattering cross-section (m^2)
- m — mass of interacting particle (kg)

**Watch out:** 1 m^2/kg = 10 cm^2/g; never mix SI and CGS. Kramers kappa ~ kappa_0 rho T^{-3.5}; electron scattering is ~constant.

Cues: opacity; calculate opacity; mass absorption coefficient; stellar opacity

**271. Optical Depth** `Core`

τ = integral of κ ρ ds

Physical meaning: Optical depth tau = integral kappa rho ds, the number of photon mean free paths.

Use when: Atmospheres, nebulae, SN ejecta; needed for t_diff~tau R/c and P=g tau/kappa. Photosphere near tau~2/3.

Scaling / intuition: tau<<1 optically thin (see through); tau>>1 optically thick (random walk).

Variables:
- τ — optical depth, measure of opacity along path (dimensionless)
- κ — mass absorption coefficient, opacity (m^2/kg)
- ρ — mass density (kg/m^3)
- s — distance along path through material (meters)

Typical values: Photosphere tau~2/3; uniform slab tau=kappa rho s.

**Watch out:** tau is dimensionless; Type Ia peak uses expanding-ejecta tau, not a static atmosphere.

Cues: optical depth; calculate optical depth; opacity along path; radiative transfer optical depth

See also: Opacity (General Relation); Radiation Transport Equation (Intensity Change); Stellar Luminosity; Column Density; Optical Depth for Scattering; Type Ia Peak Time (Photon Diffusion Scaling)

**272. Orbital Decay Rate (Gravitational Radiation)** `Advanced`

da / dt = - (64 / 5) (G³ / c⁵) (M_1 M_2(M_1 + M_2) / a³)

Use when: Compact-binary merger times and Hulse-Taylor. Not isolated-pulsar EM spindown (use L=I omega |omega_dot|).

Variables:
- da/dt — rate of change of semi-major axis, negative for decay (m/s)
- G — newton's gravitational constant (m^3/(kg*s^2))
- c — speed of light in vacuum (m/s)
- M₁ — mass of first object (kg)
- M₂ — mass of second object (kg)
- a — orbital separation, semi-major axis (meters)

**Watch out:** Circular only; eccentric binaries decay faster. SI: a in m, masses in kg, da/dt in m/s.

Cues: orbital decay; gravitational radiation; gravitational wave decay; binary merger timescale; orbital energy loss

### Cepheids and pulsation

**273. Period-Luminosity (Classical Cepheid, M from P)** `Core`

M_V = -2.43 (log10(P) - 1) - 4.05

Physical meaning: First classical-Cepheid PL fit: M_V = -2.43(log10 P - 1) - 4.05 with P in days.

Use when: Only when the problem quotes this slope and zero point. Not Type II or RR Lyrae.

Scaling / intuition: Period tracks mean density (P proportional to rho^{-1/2}); a 10-day Cepheid has M_V=-4.05 here.

Variables:
- M_V — Absolute Visual Magnitude (mag)
- P — Pulsation Period (days)

Typical values: P=10 d => log10 P=1 => M_V=-4.05; invert log10 P = 1 - (M_V+4.05)/2.43.

**Watch out:** TWO Cepheid PL calibrations: this vs M_V=-2.76 log10(P)-1.4 (formula 274); they are not equivalent.

Cues: absolute magnitude RS Puppis period; cepheid pulsation period from magnitude; what is pulsation period cepheid

See also: This calculator also has 274 (different empirical fit). Use the one quoted. Period-Luminosity Relation (Cepheids); Temperature from Luminosity and Radius (Solar Units); Radial Pulsation Period Scaling; Fractional Luminosity Amplitude from Radius-Temperature Coupling

**274. Period-Luminosity Relation (Cepheids)** `Competition`

M_V = -2.76 log10(P) - 1.4

Physical meaning: Second Cepheid PL fit: M_V = -2.76 log10(P) - 1.4 with P in days.

Use when: Only when the problem writes this slope and intercept. Not for averaging with formula 273.

Scaling / intuition: Same P-as-luminosity physics; different surveys give different coefficients.

Variables:
- M_V — absolute visual magnitude of the Cepheid (magnitude)
- P — period of pulsation in days (days)

Typical values: Books also use other fits (e.g. M_V=-2.2 log10(P)-2.05); use whichever is quoted.

**Watch out:** Formulas 273 and 274 are two different empirical fits, not interchangeable; P in days; still apply A_V in the distance modulus.

Cues: period luminosity relation; cepheid period luminosity; cepheid distance; standard candle cepheid; calculate cepheid luminosity from period; Cepheid variable light curve distance in pc; Mv = -2.2 log10(P) - 2.05; absolute magnitude from Cepheid period in days

See also: This calculator also has 273 (different empirical fit). Use the one quoted. Distance Modulus; Stellar Luminosity; Stellar Pulsation Mechanics (Radial Oscillations)

**275. Photon Diffusion Time (τ, Slab Scale)** `Advanced`

t_diff = τ R / c

Use when: SN light-curve rise and photon escape from interiors. Not free-fall or KH time. Type Ia peak uses t_peak=sqrt(kappa M/(c v)).

Variables:
- t_diff — photon diffusion timescale (s)
- tau — effective optical depth through ejecta (dimensionless)
- R — characteristic thickness or radius (meters)

**Watch out:** Some texts write t=R^2/(l c) or (3 tau R)/c; same scaling, O(1) factors.

Cues: photon diffusion time; tau R over c; diffusion optical depth

**276. Photospheric Gas Pressure from Optical Depth** `Advanced`

P_gas = g τ / κ

Use when: Atmosphere outer BC from log g and Rosseland kappa. Not central pressure (use ~G M^2/R^4).

Variables:
- P_gas — gas pressure at optical depth tau (Pa)
- g — gravitational acceleration (m/s^2)
- tau — optical depth, often 2/3 at photosphere (dimensionless)
- kappa — rosseland opacity or mass absorption coefficient (m^2/kg)

**Watch out:** kappa in m^2/kg, P in Pa, g=GM/R^2; Kramers kappa~kappa_0 rho T^{-3.5} makes P implicit.

Cues: photospheric gas pressure; integrate dP d tau; tau 2/3 gas pressure; rosseland opacity 0.02 1 plus X

**277. Post-Shock Temperature (Strong Adiabatic, γ = 5/3)** `Advanced`

T = 3 μ m_H v_s² / (16 k_B)

Use when: Molecular-cloud, SNR, and jet shocks if Mach is large. Not a radiative downstream equilibrium T, and not weak shocks (use full Rankine-Hugoniot).

Variables:
- T — approximate immediate post-shock T (K)
- mu — e.g. ~2.3 for molecular gas (dimensionless)
- v_s — shock velocity in lab/frame of cold gas (m/s)
- m_H — use proton mass ~ m_H (kg)
- k_B — Boltzmann Constant (J/K)

**Watch out:** v_s in m/s not km/s; mu here is dimensionless times m_H.

Cues: shock temperature 20 km per s; post shock temperature molecular cloud; Orion shock band temperature; Rankine Hugoniot temperature estimate

**278. Pulsation Period vs Mean Density (P ∝ ρ⁻¹/²)** `Competition`

P = K ρ^(-0.5)

Physical meaning: Fundamental radial pulsation period P proportional to rho^{-1/2}, written P = K rho^{-0.5}.

Use when: Compare periods from a density ratio, or invert rho proportional to P^{-2}. Not free-fall (use t_ff=sqrt(3 pi/(32 G rho))).

Scaling / intuition: The star rings on a sound-crossing/free-fall time: P ~ 1/sqrt(G rho), so giants are slow.

Variables:
- P — convert days to seconds for SI (s)
- rho — average stellar density (kg/m^3)
- K — problem-specific or from model (s*kg^(1/2)/m^(3/2))

Typical values: Mira ~330 days vs RR Lyrae ~0.5 day is a standard density contrast.

**Watch out:** K is a calibration; do not set K=1 in SI. Density form of P~sqrt(R^3/(G M)).

Cues: Mira period 330 days average density; period density relation variable star; P proportional rho to minus one half

See also: Radial Pulsation Period Scaling; Free-Fall Time (Uniform Sphere); Average Density

**279. Radial Pulsation Period Scaling** `Competition`

P = √(R³ / (G M))

Use when: How P scales with M and R, or Mira/Cepheid dimensional analysis. Not a precise solar p-mode frequency.

Variables:
- P — characteristic radial pulsation period (s)
- R — stellar radius (m)
- G — Gravitational Constant (m^3/(kg s^2))
- M — stellar mass (kg)

**Watch out:** Missing 2pi and structure factors; P proportional to rho^{-1/2} is the density form. Do not equate numerically to t_ff.

Cues: mira pulsation dimensional analysis; P proportional G a M b R c; radial pulsation period scaling

### Radiation transport, virial, supernovae

**280. Radiation Pressure** `Competition`

P_rad = (1 / 3) a T⁴

Physical meaning: Radiation pressure of a thermal photon gas P_rad = (1/3) a T^4 with a=4 sigma/c.

Use when: Compare radiation vs gas support in massive-star cores. Not radiation force on a particle (formula 238) and not Eddington L.

Scaling / intuition: Photon energy density is a T^4 and ultra-relativistic P=u/3, so pressure goes as T^4.

Variables:
- P_rad — pressure from radiation field (Pa)
- a — radiation constant, a = 4σ/c (J/(m^3*K^4))
- T — temperature of the radiation field (Kelvin)

Typical values: a = 7.56e-16 J/m^3/K^4; set P_rad = n k T to find when radiation overtakes gas.

**Watch out:** Magnetic pressure B^2/(2 mu_0) is a different reservoir; a is the radiation constant, not the scale factor.

Cues: radiation pressure; pressure from radiation; calculate radiation pressure; stellar radiation pressure

See also: Ideal Gas Pressure; Stellar Luminosity; Hydrostatic Balance; Energy Density of Radiation; Momentum Transfer from Radiation (Radiation Pressure)

**281. Radiation Transport Equation (Intensity Change)** `Advanced`

dI_nu / ds = -kappa_nu ρ I_nu + j_nu ρ

Use when: Formal solutions, optically thin emission, or thick LTE (I->S~Planck). Not the travel time (use t_diff~tau R/c).

Variables:
- I_ν — radiation intensity per unit frequency and solid angle (W/(m^2*Hz*sr))
- κ_ν — opacity at frequency ν, mass absorption coefficient (m^2/kg)
- ρ — mass density (kg/m^3)
- j_ν — emission coefficient, emissivity per unit mass (W/(kg*Hz*sr))
- s — distance along radiation path (meters)

**Watch out:** Frequency-dependent; kappa is per mass -- do not drop rho.

Cues: radiation transport; radiative transfer equation; intensity change; radiation equation

**282. Radiative Transport Temperature Gradient** `Advanced`

dT(r) / dr = - (3 κ(r)ρ(r)L(r)) / (16π acr² T³(r))

Use when: nabla_rad for the Schwarzschild test. If |dT/dr|_rad exceeds adiabatic, convection carries the flux instead.

Variables:
- dT/dr — rate of temperature change with radius, temperature gradient (K/m)
- κ — mass absorption coefficient, opacity at radius r (m^2/kg)
- ρ — mass density at radius r (kg/m^3)
- L — luminosity at radius r, energy flux (W)
- a — radiation density constant, a = 4σ/c (J/(m^3*K^4))
- c — speed of light in vacuum (m/s)
- r — radial distance from stellar center (meters)
- T — temperature at radius r (Kelvin)

**Watch out:** This is dT/dr, not nabla=d ln T/d ln P; a=4 sigma/c is the radiation constant.

Cues: radiative transport temperature gradient; temperature gradient stellar interior; radiative energy transport; mira star temperature gradient; stellar temperature gradient

**283. Radius Change from Flux Change (Pulsating Star)** `Competition`

R_2 / R_1 = √(F_2 / F_1)

Use when: Only if the problem holds T fixed. Otherwise use the (2-4 gamma) coupling (formula 263/252). Not Cepheid PL mean light.

Variables:
- R₂ — radius at maximum or time 2 (meters)
- R₁ — radius at minimum or time 1 (meters)
- F₂ — flux at maximum or time 2 (W/m^2)
- F₁ — flux at minimum or time 1 (W/m^2)

**Watch out:** F is Earth flux if distance is fixed; cooling during expansion reduces flux below pure geometry.

Cues: pulsating star radius; radius change flux; cepheid radius change; variable star radius variation

**284. Rayleigh–Taylor Growth Rate (Inviscid Scaling)** `Advanced`

gamma_RT = √(g k)

Use when: SNR mixing and PWN filaments. Not Kelvin-Helmholtz shear (use gamma_KH~k dv) and not the Schwarzschild test.

Variables:
- gamma_RT — instability growth rate (1/s) (Hz)
- g — effective gravity / acceleration at interface (m/s^2)
- k — spatial wavenumber (2π/λ) (rad/m)

**Watch out:** k=2pi/lambda; g may be gravity or a decelerating-shell acceleration.

Cues: rayleigh taylor; RT instability growth; sqrt g k instability

**285. Stellar Mass from Central Temperature (General)** `Competition`

M ∝(T_c² / (rho_c G³))^(1 / 2)

Use when: Dimensional mass vs central conditions. Prefer T~G M mu/(k R) plus rho~M/R^3 if you need a derivable form.

Variables:
- M — total mass of the star (kg)
- T_c — temperature at stellar center (Kelvin)
- ρ_c — density at stellar center (kg/m^3)
- G — newton's gravitational constant (m^3/(kg*s^2))

**Watch out:** Printed exponents are problem-specific; MS L~M^{3.5} is a separate transport-plus-burning relation.

Cues: stellar mass from central temperature; mass central temperature relation; calculate stellar mass; mass temperature scaling

**286. Stellar Pulsation Mechanics (Radial Oscillations)** `Competition`

d² xi(r, t) / dt² = - (1 / ρ(r)) grad P' - grad Phi'

Use when: Governing-equation reminder for Cepheid/RR Lyrae/Mira, not a plug-in calculator. For numbers use P proportional to rho^{-1/2}.

Variables:
- ξ — radial displacement of a shell at radius r and time t (meters)
- r — radial distance from stellar center (meters)
- t — time (seconds)
- ρ — mass density at radius r (kg/m^3)
- P' — pressure perturbation from equilibrium, pressure variation (Pa)
- Φ' — gravitational potential perturbation, potential variation (m^2/s^2)

**Watch out:** kappa-mechanism drives modes in ionization zones; gamma in amplitude formulas is R-T coupling, not this xi.

Cues: stellar pulsation; radial oscillations; mira star pulsation; variable star pulsation; stellar oscillations; kappa mechanism; opacity mechanism

**287. Supernova Luminosity (Kinetic ÷ Diffusion Scaling)** `Advanced`

L_SN = E_kin / t_diff

Use when: Exam scaling of brightness vs ejecta energy and trapping. Not a full Arnett curve; CC SNe may be recombination- or Ni-56-powered instead.

Variables:
- L_SN — emergent luminosity scale (W)
- E_kin — ejecta kinetic energy scale (J)
- t_diff — photon escape / diffusion time (s)

**Watch out:** t_diff=tau R/c; Ni-56 decay often powers the actual watts -- this is a leak-rate scale.

Cues: supernova luminosity diffusion; L Ekin tdiff; ejecta energy luminosity

**288. Temperature from Luminosity and Radius (Solar Units)** `Competition`

T = 5778 (L_ratio⁰.25) / (R_ratio⁰.5)

Use when: L and R already in solar units (PMS tracks, giants). Not interior T (use virial G M mu/(k R)).

Variables:
- T — effective temperature (K)
- L_ratio — luminosity in solar units (dimensionless)
- R_ratio — radius in solar units (dimensionless)

**Watch out:** L_ratio and R_ratio are dimensionless solar units, not W and m; use bolometric L (apply BC if needed).

Cues: temperature from luminosity radius solar; radius 2.7 R sun luminosity 46.8 temperature; stellar temperature from L and R; Hayashi Henyey radius luminosity 1.5 L sun pre-main-sequence; protostar radius from luminosity solar units

**289. Thermal Time (Kelvin-Helmholtz, general scaling)** `Competition`

t_KH = G M² / (R L)

Use when: Contraction and thermal adjustment vs t_ff and t_nuc. If binding energy is given, use t=U_bind/L. Not shear KH (use k dv).

Variables:
- t_KH — kelvin-Helmholtz timescale, thermal timescale (seconds)
- G — newton's gravitational constant (m^3/(kg*s^2))
- M — total mass of the star (kg)
- R — radius of the star (meters)
- L — stellar luminosity (W)

**Watch out:** No 3/10 baked in; virial 2K+U=0 so some books use (3/10) G M^2/(R L) for a uniform sphere.

Cues: thermal time; kelvin-helmholtz timescale; contraction timescale; gravitational energy timescale; kelvin helmholtz without three tenths; KH timescale GM squared RL

**290. Total Energy of a Star (Virial Theorem, General)** `Competition`

E_total = -E_grav / 2

Use when: Stellar energy budgets and cluster virial masses. Pair with uniform-sphere U=-3 G M^2/(5 R). Not systems with huge surface pressure or B unless those terms are included.

Variables:
- E_total — total energy of the star (J)
- E_grav — gravitational potential energy, binding energy (J)

**Watch out:** Printed E_grav is the positive |U|; U itself is negative. Extra magnetic or rotational terms belong in a generalized virial.

Cues: total energy star; virial theorem; stellar total energy; gravitational energy relation

**291. Type Ia Peak Time (Photon Diffusion Scaling)** `Advanced`

t_peak = √(κ M / (c v))

Physical meaning: Type Ia peak time t_peak ~ sqrt(kappa M/(c v)) when diffusion time matches expansion time.

Use when: SN Ia rise-time scaling. Not a full Arnett light curve, and not core-collapse recombination photospheres.

Scaling / intuition: Higher kappa or M delays the leak; faster v thins ejecta sooner and peaks earlier.

Variables:
- t_peak — characteristic rise/peak timescale (s)
- kappa — rosseland-mean or effective opacity (m^2/kg)
- M — ejecta mass scale (kg)
- c — speed of Light (m/s)
- v — homologous expansion velocity (m/s)

Typical values: Chandrasekhar-mass ejecta ~1.4 Msun (sometimes 1.44) peak on the order of weeks.

**Watch out:** This times the peak; Ni-56 decay powers the watts. O(1) random-walk prefactors can shift t_peak by ~2.

Cues: type Ia light curve; SN Ia diffusion peak; supernova peak time opacity

See also: Optical Depth; Chandrasekhar Limit; Flux from Luminosity; Radiation Transport Equation (Intensity Change); Photon Diffusion Time (τ, Slab Scale); Supernova Luminosity (Kinetic ÷ Diffusion Scaling)

**292. Virial Temperature (Gas Cloud)** `Competition`

T_vir = G M μ / (5 k_B R)

Use when: Star-forming clouds, halo gas, and order-of-magnitude stellar interior T. Clouds much colder cannot support themselves thermally.

Variables:
- T_vir — equilibrium temperature (K)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — total mass of cloud (kg)
- mu — mean mass per particle μ (kg)
- k_B — Boltzmann Constant (J/K)
- R — radius of cloud (m)

**Watch out:** On this card mu is mean particle mass in kg, not dimensionless; if given dimensionless mu, multiply by m_H.

Cues: virial temperature; solve for T vir; virial theorem gas cloud; 2K plus U equals zero temperature

## Line radiation and excitation

### Line radiation, Saha, H II, ISM

**293. Virial Velocity Dispersion** `Competition`

sigma_vir = √(G M / (5 R))

Use when: Estimate random motions from M and R, or invert for virial mass; not for rotating disks (use a rotation curve) and not M = 3 sigma^2 R / G (322).

Variables:
- sigma_vir — Virial Velocity Dispersion (m/s)
- G — Gravitational Constant (m^3/(kg*s^2))
- M — Cloud Mass (kg)
- R — Cloud Radius (m)

**Watch out:** Factor 5 here vs factor 3 in 322 are different potential models.

Cues: virial velocity dispersion; solve for sigma vir; velocity dispersion virial

**294. κ-Mechanism (Mira-Type Stars)** `Advanced`

deltakappa / κ > 0 during compression

Use when: Explain why Cepheids, RR Lyrae, and Miras pulsate; not a period-luminosity formula and not the epsilon-mechanism.

Variables:
- κ — mass absorption coefficient, opacity (m^2/kg)
- δκ — change in opacity due to compression/expansion (m^2/kg)

**Watch out:** Qualitative inequality, not a numerical period.

Cues: kappa mechanism; opacity mechanism; mira kappa mechanism; pulsation driving mechanism; helium ionization opacity; mira star mechanism

**295. Boltzmann Equation (Level Population Ratio)** `Competition`

N_2 / N_1 = (g_2 / g_1) exp(-(E_2 - E_1) / kT)

Use when: Relative level populations and line strength vs T; not ionization fractions (use Saha 305).

Variables:
- N_2 — number of atoms in upper energy level (dimensionless)
- N_1 — number of atoms in lower energy level (dimensionless)
- g_2 — statistical weight, degeneracy of upper level (dimensionless)
- g_1 — statistical weight, degeneracy of lower level (dimensionless)
- E_2 — energy of upper level (J)
- E_1 — energy of lower level (J)
- k — Boltzmann Constant (J/K)
- T — temperature of the system (Kelvin)

**Watch out:** LTE assumed; Saha is the ionization sibling.

Cues: boltzmann equation; level population ratio; thermal equilibrium population; energy level population

**296. Bremsstrahlung Luminosity (Thermal Bremsstrahlung)** `Advanced`

L_br ∝ n_e n_i T^(1 / 2) V

Use when: X-ray cluster gas, SNRs, hot H II continuum; not line cooling, synchrotron, or stellar photospheres.

Variables:
- L_br — luminosity from bremsstrahlung radiation (W)
- n_e — number density of free electrons (m⁻^3)
- n_i — number density of ions (m⁻^3)
- T — temperature of the plasma (Kelvin)
- V — volume of emitting region (m^3)

**Watch out:** Scaling only; cgs emissivity ~1.4e-27 n_e n_i T^{1/2} Z^2 g_ff.

Cues: bremsstrahlung luminosity; free-free emission; thermal bremsstrahlung; bremsstrahlung radiation

**297. Column Density** `Reference`

N = integral of n ds

Use when: Convert absorption or extinction into how much stuff is in front; not a volume density.

Variables:
- N — number of particles per unit area, column density (m⁻^2)
- n — number density of particles (m⁻^3)
- s — distance along line of sight (meters)

**Watch out:** Match the species (HI, H2, e-, dust) to the tracer.

Cues: column density; calculate column density; line of sight density; particle column

**298. Dust-to-Gas Mass Ratio (General)** `Reference`

M_dust / M_gas ~ = 0.01

Use when: Convert gas <-> dust in MW-like conditions; not metal-poor systems (use 303, M_dust proportional to M_gas * Z).

Variables:
- M_dust — mass of interstellar dust (kg)
- M_gas — mass of interstellar gas (kg)

**Watch out:** Mass ratio, not number-density ratio; Z_sun ~ 0.014.

Cues: dust to gas ratio; dust gas mass ratio; ISM dust ratio; dust fraction

**299. Einstein Coefficient (Spontaneous Emission)** `Advanced`

A_21 = (64π⁴ ν³ / (3 c³)) |mu_21|²

Use when: Radiative lifetimes t ~ 1/A, critical densities, permitted vs forbidden; not Boltzmann (295) or Saha (305).

Variables:
- A_21 — spontaneous emission rate, transition probability (s⁻¹)
- ν — frequency of emitted photon (Hz)
- μ_21 — transition dipole moment, matrix element (C*m)
- c — speed of light in vacuum (m/s)

**Watch out:** Do not mix SI dipole units with a cgs prefactor.

Cues: einstein coefficient; spontaneous emission rate; transition probability; atomic emission rate

**300. Extinction Relation (Visual Magnitude)** `Competition`

m_V = m_V, 0 + A_V

Use when: Deredden photometry before a distance modulus; not a color excess E(B-V), and do not apply A_V to IR.

Variables:
- m_V — apparent visual magnitude including extinction (magnitude)
- m_V,0 — true visual magnitude without extinction (magnitude)
- A_V — extinction in visual band, absorption magnitude (magnitude)

**Watch out:** Distance modulus is m-M = 5 log10 d_pc - 5 + A.

Cues: extinction magnitude; visual extinction; dust extinction; interstellar extinction

**301. Gas Kinetic Temperature** `Competition`

T_kin = (2 / 3) (E_kin / k)

Use when: Convert mean kinetic energy to T; not excitation T (Boltzmann) or ionization T (Saha) unless LTE.

Variables:
- T_kin — kinetic temperature from thermal motion (Kelvin)
- E_kin — average kinetic energy per particle (J)
- k — Boltzmann Constant (J/K)

**Watch out:** Line FWHM includes turbulence, so a width-to-T_kin conversion is an upper bound.

Cues: kinetic temperature; gas kinetic temperature; calculate kinetic temperature; thermal temperature

**302. Magnetic Flux (Flux Freezing)** `Advanced`

Phi_B = B A = constant

Use when: Collapsing clouds and flux tubes; not when resistivity, reconnection, or ambipolar diffusion lets field slip, and not a vacuum dipole.

Variables:
- Φ_B — magnetic flux, magnetic field times area (Wb)
- B — magnetic field strength (Tesla)
- A — area perpendicular to magnetic field (m^2)

Cues: magnetic flux; flux freezing; magnetic flux conservation; frozen flux

**303. Mass of Interstellar Dust (Approximate)** `Competition`

M_dust ∝ M_gas Z

Use when: Rescale dust/gas away from solar Z; not treating Z itself as a dust-to-gas ratio (use 298 for MW ~0.01).

Variables:
- M_dust — total mass of interstellar dust (kg)
- M_gas — total mass of interstellar gas (kg)
- Z — metallicity, abundance of heavy elements (dimensionless)

**Watch out:** Z_sun ~ 0.014; not all metals are in grains.

Cues: dust mass; interstellar dust mass; calculate dust mass; dust content

**304. Recombination Time** `Competition`

t_rec = 1 / (n α)

Use when: Fossil H II regions and ionization clocks; same alpha as Stromgren (307); not free-fall, cooling, or Saha.

Variables:
- t_rec — characteristic recombination timescale (seconds)
- n — number density of particles (m⁻^3)
- α — recombination rate coefficient (m^3/s)

**Watch out:** Case B inside nebulae; case A if Lyman continuum is optically thin.

Cues: recombination time; calculate recombination time; HII recombination; ionization timescale

**305. Saha Equation (Ionization Fraction)** `Advanced`

N_ion / N_neutral = (2 / n_e) (2π m_e k T / h²)^(3 / 2) exp(-χ / kT)

Physical meaning: LTE ionization ratio N_ion/N_neutral, including free-electron phase space and 1/n_e.

Use when: Which ion dominates a photosphere, and why H lines weaken in O stars; not level ratios within one ion (use Boltzmann 295).

Scaling / intuition: Exponential wants kT ~ chi (13.6 eV for H); 1/n_e lets a thin nebula stay ionized at lower T.

Variables:
- N_ion — number of ionized atoms (dimensionless)
- N_neutral — number of neutral atoms (dimensionless)
- n_e — number density of free electrons (m⁻^3)
- m_e — mass of electron (kg)
- k — Boltzmann Constant (J/K)
- T — temperature (Kelvin)
- h — Planck Constant (J*s)
- χ — ionization energy, energy to remove electron (J)

Typical values: Solar photosphere H mostly neutral; A stars partly ionized; O stars fully ionized.

**Watch out:** LTE Saha fails in nebulae, where photoionization not collisions set ionization.

Cues: saha equation; ionization fraction; ionization equilibrium; calculate ionization

See also: Boltzmann Equation (Level Population Ratio); Gas Kinetic Temperature; Bremsstrahlung Luminosity (Thermal Bremsstrahlung); Zeeman Splitting (Approximate)

**306. Sound Speed in a Gas** `Competition`

c_s = √(γ k T / (μ m_H))

Use when: Mach numbers, Jeans, disk scale height, Bondi, Toomre; not galaxy rotation or velocity dispersion.

Variables:
- c_s — speed of sound in the gas (m/s)
- gamma — ratio of specific heats (γ=1 isothermal; ~1.4 diatomic)
- k — Boltzmann Constant (J/K)
- T — gas temperature (Kelvin)
- mu — mean mass per particle in units of m_H (~2.3 molecular H₂/He)
- m_H — proton / hydrogen atom mass (kg)

**Watch out:** mu ~ 0.6 ionized, ~2.3 molecular; isothermal shortcut is gamma=1.

Cues: sound speed; calculate sound speed; gas sound speed; ISM sound speed; disk sound speed

**307. Strömgren Radius (Size of H II Region)** `Competition`

R_S = (3 N_ion / (4π n² α))^(1 / 3)

Physical meaning: Radius of a static ionized bubble where the star's ionizing-photon rate balances recombinations.

Use when: Size an H II region from Q and ambient n; not density-bounded leaky nebulae or expanding bubbles.

Scaling / intuition: Higher Q bigger, higher n smaller (recombinations ~ n^2); drop n by 8 and R_S doubles.

Variables:
- R_S — radius of HII region, Strömgren sphere radius (meters)
- N_ion — rate of ionizing photons emitted (s⁻¹)
- n — number density of atoms (m⁻^3)
- α — recombination rate coefficient (m^3/s)

Typical values: O star N_ion ~ 1e49 s^-1 in n=100 cm^-3: R_S a few pc.

**Watch out:** Same case-B alpha as 304; dust inside shrinks R_S.

Cues: stromgren radius; HII region size; ionization radius; photoionization radius

See also: Recombination Time; Bremsstrahlung Luminosity (Thermal Bremsstrahlung); Mass of Interstellar Dust (Approximate); Dust-to-Gas Mass Ratio (General)

**308. Thermal Energy of a Cloud** `Competition`

E_thermal = (3 / 2) N k T

Use when: Energy budgets vs gravity; N is particle number (N = M/(mu m_H)), not density; not photon gas (T^4) or degenerate electrons.

Variables:
- E_thermal — total thermal energy of the cloud (J)
- N — total number of particles in cloud (dimensionless)
- k — Boltzmann Constant (J/K)
- T — temperature of the cloud (Kelvin)

**Watch out:** Exams almost always keep 3/2 even for diatomic gas.

Cues: thermal energy cloud; cloud thermal energy; ISM thermal energy; calculate thermal energy

**309. Total Mass of a Cloud (General)** `Competition`

M = integral of ρ dV

Use when: Turn a density model into a mass; not a collapse criterion (use Jeans or virial).

Variables:
- M — total mass of the cloud (kg)
- ρ — mass density (kg/m^3)
- V — volume of the cloud (m^3)

**Watch out:** rho is mass density, not number density n.

Cues: cloud mass; total mass cloud; interstellar cloud mass; calculate cloud mass

**310. Zeeman Splitting (Approximate)** `Competition`

Δλ = 4.7e-13 λ_0² B

Use when: Convert a measured line split into B; not flux-freezing (302) and not Doppler broadening.

Variables:
- delta_lambda — observed splitting of line (Angstrom)
- lambda_0 — rest wavelength of the line (Angstrom)
- B — Magnetic Field Strength (Gauss)

**Watch out:** Not SI: do not insert Tesla or meters; radio lines usually quote Hz.

Cues: zeeman splitting; H alpha zeeman splitting; upper bound delta B; spectral resolution 10 angstrom

## Galactic dynamics and dark matter

### Galaxies, dark matter, disk stability

**311. Alfvén Speed (SI, ideal MHD)** `Competition`

v_A = B / √(μ_0 ρ)

Use when: Magnetic support, MHD wave times, jets; compare with c_s for plasma beta; not the cgs form mixed with mu_0.

Variables:
- v_A — alfvén velocity (m/s)
- B — Magnetic Field (Tesla)
- rho — plasma mass density (kg/m^3)
- mu_0 — permeability of free space (N/A^2)

**Watch out:** SI B in Tesla (1 G = 1e-4 T); CGS is B/sqrt(4 pi rho); never mix.

Cues: alfven speed; alfven velocity; MHD alfven

**312. Bondi–Hoyle Accretion Rate (γ = 5/3)** `Advanced`

Mdot = π G² M² ρ / (c_s³)

Use when: Stationary compact object in hot still ISM; if moving, use Bondi-Hoyle-Lyttleton with c_s^2+v_rel^2; not thin-disk alpha or Eddington.

Variables:
- Mdot — mass accretion rate (γ = 5/3, λ = 1/4) (kg/s)
- M — accretor mass (kg)
- rho — gas density far from accretor (kg/m^3)
- c_s — isothermal sound speed of ambient gas (m/s)

**Watch out:** Do not mix isothermal lambda~1.12 with this pi prefactor.

Cues: bondi accretion; bondi capture rate; accretion from ism

**313. Crossing Time (Dynamical Time)** `Competition`

t_cross = R / σ

Use when: Dynamical clock for clusters and galaxies, and the building block of relaxation (327); for disks prefer 2 pi R / v_rot; not a relaxation time or an age.

Variables:
- t_cross — time to cross system, dynamical time (seconds)
- R — characteristic radius of system (meters)
- σ — Velocity Dispersion (m/s)

**Watch out:** Match R to the same definition used for sigma (half-mass, core, R_200 are not interchangeable).

Cues: crossing time; dynamical time; calculate crossing time; system crossing time

**314. Dark Matter Density Profile (General NFW Form ρ ∝ r⁻¹)** `Advanced`

rho_DM ∝ r^(-1)

Use when: Order-of-magnitude density near a halo center; not the outer r^{-3}, and not a baryonic exponential disk (324).

Variables:
- ρ_DM — dark matter density at radius r (kg/m^3)
- r — distance from halo center (meters)

**Watch out:** Exam sheet: NFW inner slope -1, outer -3; dwarfs sometimes prefer cores.

Cues: dark matter density; NFW profile; dark matter halo; dark matter distribution

**315. Dark Matter Mass Fraction (Approximate in a Halo)** `Advanced`

f_DM = M_DM / (M_DM + M_baryon) ~ = 0.9

Use when: Halo-scale mass budgets; not the inner few kpc of a spiral (baryons can dominate) and not globular clusters.

Variables:
- f_DM — fraction of mass in dark matter (dimensionless)
- M_DM — mass in dark matter (kg)
- M_baryon — mass in baryonic matter (stars, gas) (kg)

**Watch out:** Dwarfs can be even more dark-matter dominated.

Cues: dark matter fraction; dark matter mass fraction; dark matter dominance; fraction dark matter

**316. Faber-Jackson Relation (Elliptical Galaxies)** `Competition`

L ∝ σ^α

Use when: Ellipticals and bulges from velocity dispersion; not spirals (use Tully-Fisher 326); prefer the fundamental plane if you have R_e, sigma, and surface brightness.

Variables:
- L — total luminosity of elliptical galaxy (W)
- σ — central velocity dispersion (m/s)
- α — power law exponent, typically ~4 (dimensionless)

**Watch out:** Not a virial identity; do not apply to spiral disks.

Cues: faber-jackson relation; elliptical galaxy luminosity; velocity dispersion luminosity; faber jackson

**317. Galaxy Rotation Velocity (Non-Keplerian)** `Competition`

v_rot = √(G M(r) / r)

Use when: Interpret rotation curves; a flat v requires M(r) proportional to r; not a single central total mass; inverse is 321.

Variables:
- v_rot — orbital velocity in galaxy, rotation speed (m/s)
- M(r) — total mass within radius r, including dark matter (kg)
- r — distance from galactic center (meters)
- G — newton's gravitational constant (m^3/(kg*s^2))

**Watch out:** Assumes circular orbits in a spherical (or well-averaged) potential.

Cues: galaxy rotation velocity; rotation curve; galactic rotation; rotation speed galaxy

**318. Gravitational Potential (General)** `Competition`

Phi = -G M / r

Use when: Exterior potentials, specific energy, weak-field escape; not inside a uniform sphere (harmonic) and not NFW or exponential-disk Phi.

Variables:
- Φ — gravitational potential energy per unit mass (J/kg)
- M — mass creating the potential (kg)
- r — distance from mass (meters)
- G — newton's gravitational constant (m^3/(kg*s^2))

**Watch out:** Phi is J/kg, not U in J; Newtonian form is invalid near a BH horizon.

Cues: gravitational potential; calculate potential; potential energy; gravitational potential energy

**319. Jeans Length (Gravitational Stability)** `Competition`

lambda_J = √(π c_s² / (G ρ))

Use when: Fragmentation of molecular clouds; not a rotating disk (use Toomre 325); use Jeans mass ~ rho lambda_J^3 for fragment mass.

Variables:
- λ_J — critical length for gravitational instability (meters)
- c_s — sound speed in the gas (m/s)
- G — newton's gravitational constant (m^3/(kg*s^2))
- ρ — mass density (kg/m^3)

**Watch out:** Normalizations (sqrt(pi) vs 2 pi) differ by O(1); match the sheet.

Cues: jeans length; gravitational instability; cloud collapse scale; critical length collapse

**320. M-σ Relation (SMBH Mass to Bulge Velocity Dispersion)** `Competition`

M_BH ∝ σ^α

Physical meaning: SMBH mass scales as a power of host-bulge velocity dispersion, alpha typically 4-5.

Use when: Estimate M_BH from bulge sigma; not disk rotation (Tully-Fisher 326), not globular sigma, and not Faber-Jackson (316, galaxy L vs sigma).

Scaling / intuition: If alpha=5, doubling sigma multiplies M_BH by 32; the hole's sphere of influence is tiny compared with the bulge.

Variables:
- M_BH — mass of supermassive black hole (kg)
- σ — velocity dispersion of galactic bulge (m/s)
- α — power law exponent, typically ~4-5 (dimensionless)

Typical values: sigma=200 km/s => M_BH ~ 1e8 Msun; MW bulge ~100 km/s, ~4e6 Msun.

**Watch out:** Use bulge (spheroid) dispersion, not disk v_rot; scatter ~0.3 dex.

Cues: M-sigma relation; black hole mass velocity dispersion; SMBH mass relation; M sigma relation

See also: Velocity Dispersion (General); Schwarzschild Radius; Schwarzschild Radius for SMBH (Same Form)

**321. Mass enclosed M(r) (from Rotation Curve)** `Competition`

M(r) = v² r / G

Use when: Rotation velocity at a stated radius; inverse of 317; not total halo mass unless r is virial, and not pressure-supported ellipticals (use virial 322).

Variables:
- M(r) — total mass within radius r (kg)
- v — orbital velocity at radius r (m/s)
- r — distance from center (meters)
- G — newton's gravitational constant (m^3/(kg*s^2))

**Watch out:** Thin-disk geometry differs from the spherical estimator by a factor of order unity.

Cues: mass enclosed from rotation; galactic mass from rotation curve; calculate enclosed mass; mass within radius

**322. Mass of a Globular Cluster (Virial Theorem Applied)** `Competition`

M = (3 σ² R) / G

Use when: Globulars, ellipticals, and dwarf spheroidals with LOS dispersion and size; not disks (use 321); do not mix factor 3 with 293's factor 5.

Variables:
- M — total mass of globular cluster (kg)
- σ — velocity dispersion, spread in velocities (m/s)
- R — characteristic radius of cluster (meters)
- G — newton's gravitational constant (m^3/(kg*s^2))

**Watch out:** Factor 3 vs 293's 5 are different potential models; unbound debris inflates sigma.

Cues: globular cluster mass; cluster mass virial; calculate cluster mass; virial mass cluster

**323. Schwarzschild Radius for SMBH (Same Form)** `Competition` · same as 157

R_s = 2 G M_BH / c²

Same relation as **157. Schwarzschild Radius**. Use that entry for meaning, traps, and cues.

**Watch out:** Photon sphere and ISCO are different multiples of G M / c^2; Kerr horizon is smaller.

**324. Surface Brightness (Exponential Disk)** `Competition`

I(r) = I_0 exp(-r / h)

Use when: Fit spiral or S0 disk photometry; total L = 2 pi I_0 h^2; not NFW density (314) and not de Vaucouleurs ellipticals (r^{1/4}).

Variables:
- I(r) — surface brightness at radius r (W/m^2)
- I_0 — surface brightness at center (W/m^2)
- r — distance from galactic center (meters)
- h — exponential scale length, characteristic radius (meters)

**Watch out:** Surface brightness is distance-independent in Euclidean space; I is light, not mass.

Cues: surface brightness; exponential disk; galactic surface brightness; disk brightness profile

**325. Toomre Q Criterion (Disk Stability, simplified)** `Competition`

Q = (sigma_R κ) / (π G Sigma)

Physical meaning: Axisymmetric disk stability Q = sigma_R kappa / (pi G Sigma); Q>1 stable, Q<1 unstable.

Use when: Galactic disks (flat curve: kappa = sqrt(2) Omega); not Keplerian protoplanetary disks (use Q = c_s Omega / (pi G Sigma)) and not Jeans alone for a shearing disk.

Scaling / intuition: High dispersion, fast epicyclic restoring, or low Sigma raise Q; spirals self-regulate near Q ~ 1-2.

Variables:
- Q — stability parameter; Q > 1 is stable (dimensionless)
- sigma_R — radial velocity dispersion (≈ c_s in cold disks) (m/s)
- kappa — epicyclic frequency (≈ Ω for Keplerian disks) (rad/s)
- Sigma — disk surface mass density (kg/m^2)
- G — newton's gravitational constant (m^3/(kg*s^2))

Typical values: Molecular gas often near Q~1; old stars higher.

**Watch out:** kappa = Omega (Keplerian) vs sqrt(2) Omega (flat rotation curve).

Cues: toomre Q; disk stability; Q criterion; galactic disk stability; protoplanetary disk fragment

See also: Keplerian-disk form is 218 (c_s Ω / (π G Σ)). Jeans Length (Gravitational Stability); Toomre Q (Keplerian Disk); Keplerian Orbital Frequency; Protoplanetary Disk Scale Height; Minimum Mass Solar Nebula (MMSN) Surface Density

**326. Tully-Fisher Relation (Spiral Galaxies)** `Competition`

L ∝ v_rot^α

Physical meaning: Empirical spiral scaling L proportional to v_rot^alpha with alpha typically 3-4.

Use when: Spirals and late-type disks with a measured rotation speed; not ellipticals (use Faber-Jackson 316); do not insert elliptical sigma into this v_rot relation.

Scaling / intuition: If alpha=4, twice the rotation speed means 16 times the luminosity (~3 mag).

Variables:
- L — total luminosity of spiral galaxy (W)
- v_rot — maximum rotation velocity (m/s)
- α — power law exponent, typically ~3-4 (dimensionless)

Typical values: Luminous spirals v_max 100-250 km/s.

**Watch out:** Correct HI W_20 for inclination (divide by sin i); face-on spirals are poor TF targets.

Cues: tully-fisher relation; spiral galaxy luminosity; rotation luminosity relation; tully fisher

See also: Stellar Luminosity; Galaxy Rotation Velocity (Non-Keplerian); Faber-Jackson Relation (Elliptical Galaxies)

**327. Two-Body Relaxation Time** `Advanced`

t_relax ∝(N / ln N) t_cross

Use when: Decide collisional (globulars) vs collisionless (galaxies); compare with age; not t_cross (313) alone as a relaxation time.

Variables:
- t_relax — two-body relaxation timescale (seconds)
- N — number of stars in system (dimensionless)
- t_cross — dynamical crossing time (seconds)

**Watch out:** ln N ~ 10 for globulars; galaxies still evolve by mergers and friction, not two-body.

Cues: relaxation time; two-body relaxation; stellar relaxation; cluster relaxation

**328. Velocity Dispersion (General)** `Competition`

σ² = <(v - <v>)²>

Use when: Input to virial masses (293, 322), Faber-Jackson (316), M-sigma (320), t_cross (313), and Toomre (325); not substituting v_rot for sigma unless dispersion-supported.

Variables:
- σ — velocity dispersion, spread in velocities (m/s)
- v — individual particle velocity (m/s)

**Watch out:** Subtract measurement error in quadrature; thermal Doppler is the microscopic version.

Cues: velocity dispersion; calculate velocity dispersion; stellar velocity dispersion; dispersion velocity

## Binary systems

### Binary stars

**329. Binary Mass Ratio q = M₁/M₂** `Reference`

q = M1 / M2

Use when: Mass ratio, Roche geometry, splitting total mass; not the spectroscopic mass function (334).

Variables:
- q — Mass Ratio q (dimensionless)
- M1 — often more massive WD (kg)
- M2 — Secondary Mass (kg)

**Watch out:** Many papers define q = M_secondary/M_primary <= 1, the reciprocal if M1 is the primary.

Cues: white dwarf binary mass ratio; WDJ181058 mass ratio; M1 over M2 binary

**330. Center of Mass (Binary System)** `Competition`

M1 r1 = M2 r2

Use when: Locate the CM or convert a photocenter wobble into a mass ratio; not plugging a1 into Kepler (337 needs relative a = a1+a2).

Variables:
- M1 — mass of first star (kg)
- M2 — mass of second star (kg)
- r1 — distance of star 1 from center of mass (meters)
- r2 — distance of star 2 from center of mass (meters)

**Watch out:** Relative a in Kepler is a1+a2, not the primary's barycentric a1.

Cues: center of mass binary; center of mass binary system; position center of mass; binary center of mass; center of mass position; find center of mass; calculate center of mass

**331. Doppler Shift Wavelength Ratio** `Competition` · same as 162

Δλ / λ = v / c

Same relation as **162. Doppler Shift**. Use that entry for meaning, traps, and cues.

**Watch out:** Radio 21-cm uses Delta_nu/nu = -v/c; blueshift has negative Delta_lambda.

**332. Kepler's Third Law (Binary System)** `Core`

P² = (4π² a³) / (G(M_1 + M_2))

Equivalent forms:
- M1 + M2 = 4 π² a³ / (G P²)   (337, solve for total mass)

Physical meaning: Kepler III for two bodies: P^2 = 4 pi^2 a^3 / (G(M1+M2)) with a the relative semi-major axis.

Use when: Period from masses and separation; use 337 when knowns are P and a and the unknown is M1+M2.

Scaling / intuition: Only the mass sum sets P at a given a; two 0.5 Msun stars at 1 AU have P = 1 yr.

Variables:
- P — time for one complete orbit (seconds)
- a — semi-major axis of the orbit (meters)
- M1 — mass of the first body (kg)
- M2 — mass of the second body (kg)

Typical values: (M1+M2)/Msun = a_AU^3 / P_yr^2.

**Watch out:** Do not insert barycentric a1 in place of relative a = a1+a2.

Cues: kepler third law binary; orbital period binary; period binary system; binary orbital period; kepler binary; period from masses binary; calculate period binary; WDJ181058 white dwarf binary period 0.016 AU

See also: Kepler's Third Law; Orbital Velocity; Gravitational-Wave Frequency (Binary, Order of Magnitude); Orbital Speed from Period (Circular); Binary Mass Ratio from Velocity Amplitudes; Orbital Decay Rate (Gravitational Radiation)

**333. Light Travel Time** `Reference`

t = d / c

Use when: Ranging, pulsar timing, Romer delays, nearby lookback; not cosmological lookback at high z and not redshift (use 331/338).

Variables:
- t — light-crossing time (s)
- d — path length in vacuum (m)
- c — speed of Light (m/s)

**Watch out:** Recombination and optical-depth times (304, 339) are interaction clocks, not light-travel clocks.

Cues: light travel time; how long light takes; d over c time

**334. Mass Function (Spectroscopic Binaries)** `Advanced`

f(M) = (M_2³ sin³ i) / (M_1 + M_2)² ∝ P K_1³

Use when: SB1s, exoplanet RV, X-ray binaries with one velocity curve; if both K1 and K2 (SB2), use q=K2/K1 plus Kepler III; never treat f as equal to M2 unless M1 is negligible and i=90 deg.

Variables:
- f(M) — mass function, lower limit on companion mass (kg)
- M₁ — mass of primary star (kg)
- M₂ — mass of secondary star (kg)
- i — orbital inclination angle (radians)
- P — Orbital Period (seconds)
- K₁ — radial velocity amplitude of primary (m/s)

**Watch out:** Not a stellar IMF; eccentric orbits add (1-e^2)^{3/2} in the K-P-f relation.

Cues: mass function; binary mass function; spectroscopic binary mass; mass function binary

**335. Orbital Speed from Period (Circular)** `Competition`

v = 2π r / T

Use when: r and T given, want speed; not dynamical v=sqrt(G M / r) unless gravity enforces that period.

Variables:
- v — tangential speed (m/s)
- r — radius of circular path (m)
- T — time for one full orbit (s)

**Watch out:** Decide whether r is a1, a2, or relative a; eccentric orbits need vis-viva, not this v.

Cues: orbital velocity 2 pi r over T; speed from period radius; binary star speed

**336. Stellar Activity Index (R'_HK)** `Reference`

R'_HK ∝ F_core / F_bolo

Use when: Magnetic activity, gyrochronology, RV-jitter flag; not bolometric luminosity and not a sunspot filling factor.

Variables:
- R'_HK — activity index, measure of chromospheric activity (dimensionless)
- F_core — flux in calcium H and K lines (W/m^2)
- F_bolo — total bolometric flux (W/m^2)

**Watch out:** Ca H and K at 3934, 3968 A, not H-alpha; M dwarfs often use H-alpha or X-rays.

Cues: stellar activity index; chromospheric activity; stellar magnetic activity; activity index

**337. Total Mass of a Binary System (from Kepler's Third Law)** `Competition` · same as 332

M_1 + M_2 = (4π² a³) / (G P²)

Same relation as **332. Kepler's Third Law (Binary System)**. Use that entry for meaning, traps, and cues.

**Watch out:** a is relative, not a1; do not use P^2 = a^3 unless total mass is 1 Msun.

**338. Velocity from Doppler Wavelength Shift** `Competition` · same as 162

v = c(Δλ / λ)

Same relation as **162. Doppler Shift**. Use that entry for meaning, traps, and cues.

**Watch out:** Frequency form has the opposite sign; redshift means positive v (receding).

## Optical depth, compact objects, phase

### Scattering, Chandrasekhar, phase, magnetars

**339. Optical Depth for Scattering** `Competition`

tau_sc = N sigma_sc

Use when: Electron or dust scattering, thin vs thick; general absorption is integral kappa rho ds; not a physical thickness in meters.

Variables:
- τ_sc — optical depth for scattering (dimensionless)
- N — number of particles per unit area (m⁻^2)
- σ_sc — scattering cross-section per particle (m^2)

**Watch out:** Photosphere is tau of order 1 (exams) or 2/3 (Eddington).

Cues: optical depth scattering; scattering optical depth; calculate scattering depth; scattering opacity

**340. Chandrasekhar Limit** `Core`

M_Ch ~ = 1.4 M__sun

Physical meaning: Maximum white-dwarf mass supported by electron degeneracy, about 1.4 solar masses.

Use when: SN Ia progenitors and WD vs denser remnant; not the neutron-star maximum (TOV ~2-3 Msun) and not main-sequence stars.

Scaling / intuition: Relativistic electrons make degeneracy pressure scale as rho^{4/3}, the same power as gravity, so a maximum mass exists.

Variables:
- M_Ch — maximum stable white dwarf mass (M_☉)

Typical values: M_Ch ~ 1.4 Msun (mu_e=2); more precisely ~1.44; M_Ch ~ 1.456 (2/mu_e)^2 Msun.

**Watch out:** Iron-rich (higher mu_e) lowers the limit; rotation can raise it.

Cues: chandrasekhar limit

See also: Type Ia Peak Time (Photon Diffusion Scaling); Non-Relativistic Degeneracy Pressure Scaling (P ∝ ρ⁵/³)

**341. Illuminated Area vs Phase (φ = 0 Dark, Between Star and Observer)** `Competition`

A = π R² sin(π φ)

Physical meaning: Toy illuminated area A = pi R^2 sin(pi phi) with this calculator's dark-start phase zero.

Use when: Only when phi=0 is dark/new (planet between star and observer); sibling uses A = pi R^2 cos(pi phi) with phi=0 full; mixing conventions lights a planet at new phase.

Scaling / intuition: sin(pi phi) goes 0, 1, 0 as phi goes 0, 0.5, 1 (new-full-new if new is phi=0).

Variables:
- R — Planet Radius (m)
- phi — 0 = between star and observer (dark toward you); 0.5 = far side (full lit) (0 to 1)
- A — apparent illuminated area (m^2)

Typical values: Half-phase phi=0.25: A = pi R^2 / sqrt(2), not Lambert 50%.

**Watch out:** Two phi=0 conventions: this sin/dark-start vs cos/full-start; A is not received flux.

Cues: illuminated area sin pi phi; phase zero dark side observer; area lit planet between star and observer; Mr Brightside sin phase

See also: Opposite phase zero from 114 (there φ=0 is full / far side). Illuminated Area vs Orbital Phase

**342. Magnetic Energy (Uniform B Inside Sphere)** `Advanced`

U_B = (4π / 3) R³ B² / (2 μ_0)

Use when: Compare U_B with rotational or gravitational energy; not a dipole exterior integral and not spindown power (343).

Variables:
- U_B — total in sphere (model) (J)
- R — star / magnetosphere volume used (m)
- B — typical internal field (model) (T)
- mu_0 — Vacuum Permeability (H/m)

**Watch out:** SI B in Tesla (1 G = 1e-4 T); CGS energy density is B^2/(8 pi); never mix mu_0 with gauss.

Cues: magnetar magnetic energy 1e15 gauss; magnetic energy stored neutron star field; compare B energy to rotational energy

**343. Pulsar Spindown Luminosity (Newtonian)** `Competition`

L_sd = I ω ω_dot

Physical meaning: Newtonian rotational-energy loss rate L_sd = I omega omega_dot (omega_dot as the positive magnitude).

Use when: Crab-like nebula power and pulsar energy budgets; not stored magnetic energy (342) and not the radio-pulse luminosity (a tiny fraction).

Scaling / intuition: Most power is an unseen wind; radio is typically 1e-6 to 1e-2 of L_sd.

Variables:
- L_sd — mechanical spin-down power (W)
- I — neutron-star moment of inertia; ~1e38 kg*m^2 in SI (= ~1e45 g*cm^2 in cgs) (kg*m^2)
- omega — Angular Speed ω (rad/s)
- omega_dot — positive magnitude of spin-down (rad/s^2)

Typical values: Crab P~33 ms, L_sd ~ 1e38 erg s^-1 ~ 1e31 W.

**Watch out:** NS I ~ 1e38 kg m^2 in SI = 1e45 g cm^2 in cgs; mixing those unit systems is a common exam error.

Cues: Crab pulsar spindown luminosity; pulsar spin down power watts; rotational energy loss neutron star; M1 pulsar 33 ms luminosity spindown

See also: Pulsar Light Cylinder Radius; Rotational Velocity; Pulsar Period from Rotational vs Internal Energy; Rotational Kinetic Energy

