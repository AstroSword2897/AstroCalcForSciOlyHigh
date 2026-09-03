# Exam sheet — formulas 79-343

Timed lookup. Full explanations: `FORMULAS_79_TO_343.md`.

Tags: `Core` know cold · `Competition` common · `Advanced` specialist · `Reference` conversion

SI unless noted. 1 pc = 3.086e16 m. 1 AU = 1.496e11 m. σ = 5.670e-8. G = 6.674e-11. c = 2.998e8.

## Flux, luminosity, distance

**81. Inverse Square Law (Brightness)** `Core`
b = L / (4π d²)
Use: Flux from L and d, or distance from L and b. Not for extended surface brightness.
Vars: b — observed brightness / flux (W/m^2); L — luminosity = total power output (W); d — distance to the source (m); pi — ≈ 3.14159
Trap: Do not drop 4*pi (~12.6x); convert pc to m (1 pc = 3.086e16 m).

84. Luminosity from Flux and Distance = 81. L = 4π d² F

128. Distance from L and F (Euclidean inverse square) = 81. D_L = √(L / (4π F))

**101. Stellar Luminosity** `Core`
L = 4π R² σ T⁴
Use: Radius and T_eff known (or T from L and R). Not solar-unit ratios (use 99) or surface flux only (98).
Vars: L — bolometric luminosity (W); R — stellar radius (m); sigma — Stefan–Boltzmann constant; T — effective temperature (K); pi — ≈ 3.14159
Trap: Do not insert distance in place of R; forgetting 4*pi or using diameter costs a factor of 4.

**83. Luminosity from Absolute Magnitude** `Competition`
L ∝ 10^(-0.4 M)
Use: Relative luminosities from absolute M. Not apparent m (convert with distance modulus first).
Vars: L — luminosity (W), up to a calibration constant in the ∝ form; M — absolute magnitude (mag)
Trap: More luminous is more negative M; not SI watts without an M_sun zero point.

**79. Intensity** `Competition`
I = P / A
Use: Total power and area given, want W/m^2. Not for isotropic stellar flux (use b = L/(4*pi*d^2)).
Vars: I — intensity / power per unit area (W/m^2); P — total power (W); A — area the power is spread over (m^2)
Trap: Not luminosity (W); 1 W/m^2 = 1000 erg/s/cm^2, not Jy.

## Magnitudes

**87. Magnitude Difference from Flux Ratio** `Core`
m2 - m1 = -2.5 log(F2 / F1)
Use: Comparing two stars as m2 minus m1. Not m1-m2 (use 88) or one-object extinction (86).
Vars: m1, m2 — apparent magnitudes (mag); F1, F2 — fluxes (W/m^2)
Trap: Pairing m2-m1 with F1/F2 reverses bright/faint; log means log10.

88. Magnitude-Flux Relation = 87. m1 - m2 = -2.5 log10(F1 / F2)

**86. Magnitude Change from Flux Ratio (Extinction)** `Competition`
Δm = -2.5 log10(F / F_0)
Use: Extinction, eclipses, or transmission to magnitudes. Not two-star comparisons (use 87/88).
Vars: delta_m — change in magnitude (mag); positive means dimmer; F — flux after extinction (W/m^2); F_0 — flux without extinction (W/m^2)
Trap: Natural log instead of log10 inflates by 2.303; keep F and F_0 in the same bandpass.

**251. Flux Change from Magnitude Difference** `Reference`
F_2 / F_1 = 10^(-0.4 Δm)
Use: Use for any same-band brightness comparison. Invert as Delta m = -2.5 log10(F2/F1).
Vars: F₂ — flux at time 2 or for object 2 (W/m^2); F₁ — flux at time 1 or for object 1 (W/m^2); Δm — difference in magnitudes, m₂ - m₁ (magnitude)
Trap: Delta m = m2 - m1, so positive Delta m means object 2 is fainter. Flux ratio is a radius ratio only if temperature is fixed.

**246. Bolometric Correction** `Reference`
M_bol = M_V + BC
Use: Use whenever going from V photometry to total luminosity, especially hot or cool stars.
Vars: M_bol — absolute bolometric magnitude, total energy output (magnitude); M_V — absolute visual magnitude (magnitude); BC — correction factor, typically negative for hot stars (magnitude)
Trap: With M_bol = M_V + BC, BC is typically negative for both very hot and very cool stars. Apply A_V separately in the distance modulus.

## Dust and extinction

**80. Interstellar Reddening** `Competition`
E(B - V) = (B - V)_obs - (B - V)_0
Use: Dust correction once spectral type gives (B-V)_0. Not A_V (use A_V = R_V * E(B-V)).
Vars: E(B - V) — color excess / reddening (mag); (B - V)_obs — observed B−V color (mag); (B - V)_0 — intrinsic (dust-free) B−V color (mag)
Trap: R_V ~ 3.1 so A_V ~ 3.1 E(B-V); magnitudes, not a flux ratio.

**250. Extinction Correction with RV** `Competition`
A_V = R_V E(B - V)
Use: Use to turn measured E(B-V) into A_V, then into a distance-modulus correction.
Vars: A_V — extinction in visual band (magnitude); R_V — Ratio AV/E(B-V), typically 3.1 for Milky Way (dimensionless); E(B - V) — reddening, B-V color excess (magnitude)
Trap: True modulus is m_V - M_V - A_V. Also A_B = (R_V + 1) E(B-V). E(B-V) = (B-V)_obs - (B-V)_0.

**300. Extinction Relation (Visual Magnitude)** `Competition`
m_V = m_V, 0 + A_V
Use: Deredden photometry before a distance modulus; not a color excess E(B-V), and do not apply A_V to IR.
Vars: m_V — apparent visual magnitude including extinction (magnitude); m_V,0 — true visual magnitude without extinction (magnitude); A_V — extinction in visual band, absorption magnitude (magnitude)
Trap: Distance modulus is m-M = 5 log10 d_pc - 5 + A.

## Blackbodies and spectra

**106. Wien's Displacement Law** `Core`
λ_max = b / T
Use: T from peak wavelength, or lambda_max from T. Not total flux (Stefan-Boltzmann) or the B_nu peak.
Vars: lambda_max — peak wavelength (m); e.g. 400 nm = 4e-7 m; T — temperature (K); b — Wien’s constant ≈ 2.897e-3 m*K
Trap: T in K, lambda in meters (400 nm = 4e-7 m); B_nu peak is at lambda T ~ 5.10e-3 m K, not this b.

**98. Stefan-Boltzmann Law** `Core`
F = σ T⁴
Use: Total energy flux from T. Not stellar watts (use 101) or Wien peak wavelength.
Vars: F — radiative flux (W/m^2); sigma — Stefan–Boltzmann constant ≈ 5.670374419e-8 W/(m^2*K^4); T — temperature (K)
Trap: T in kelvin, not C; this F is surface flux, not the solar constant 1366 W/m^2.

**99. Stefan–Boltzmann (Luminosity Ratios vs Solar)** `Competition`
L_ratio = R_ratio² T_ratio⁴
Use: HR comparisons already in solar units. Use 101 for SI watts.
Vars: L_ratio — L / L_sun (dimensionless); R_ratio — R / R_sun (dimensionless); T_ratio — T / T_sun (dimensionless); T_sun ≈ 5778 K
Trap: Do not omit the square or fourth power; bolometric L, not V-band.

**94. Planck Law (Spectral Radiance B_nu)** `Competition`
B_nu = (2 h ν³ / c²) / (exp(h ν / (k T)) - 1)
Use: Frequency-space spectrum or full thermal shape. Use RJ (96) only if h*nu << kT.
Vars: B_nu — spectral radiance per Hz (W/(m^2*sr*Hz)); nu — frequency (Hz); T — temperature (K); h, c, k — Planck constant, speed of light, Boltzmann constant
Trap: B_nu is not B_lambda (different peaks); Lambertian flux is pi B.

**96. Rayleigh–Jeans Law (B_nu, low frequency)** `Competition`
B_nu = 2 k T ν² / c²
Use: Radio/mm tails and brightness temperature. Not optical starlight (use full Planck).
Vars: B_nu — RJ spectral radiance (W/(m^2*sr*Hz)); T — temperature (K); nu — frequency (Hz); k, c — Boltzmann constant, speed of light
Trap: Optical h nu/kT ~ 5 at 500 nm, 5772 K; do not integrate RJ for total flux (use Stefan-Boltzmann).

**95. Planck Relation (Photon Energy)** `Core`
E = h f = h c / λ
Use: Line-photon energies, photoelectric thresholds, ionization (13.6 eV). Not Wien (lambda_max from T).
Vars: E — photon energy (J); f — frequency (Hz); lambda — wavelength (m); h — Planck constant; c — speed of light
Trap: Use h not hbar (factor 2*pi); vacuum wavelength; 1 eV = 1.602e-19 J.

**102. Thermal Doppler Line Width** `Competition`
Δλ = λ √(2 k T / (m c²))
Use: Thermal line width or T from a thermally broadened line. Not bulk radial-velocity shift.
Vars: delta_lambda — wavelength width scale (m); lambda — rest wavelength of the line (m); T — gas temperature (K); m — mass of the emitting particle (kg); k — Boltzmann constant; c — speed of light
Trap: This is a 1/e width, not FWHM (~1.665x); use the atom's mass, not always m_H.

## Parallax and small angles

**146. Parallax Distance (Arcseconds)** `Core`
d = 1 / p
Use: Stellar parallax with p in arcseconds. Not a cosmological distance, and not p in radians (use AU/tan(p)).
Vars: d — distance (parsecs); p — parallax (arcseconds)
Trap: Convert milliarcseconds to arcseconds first; do not feed p in radians into this form.

148. Parallax from Distance = 146. p = 1 / d

129. Distance from Parallax (Light Years) = 146. d_ly = pc_to_ly / p

**147. Parallax Distance (Radians)** `Competition`
d = 1 AU / tan(p)
Use: Parallax given in radians, or the tangent form is wanted. Not p in arcseconds (use d(pc)=1/p).
Vars: d — distance (AU); p — parallax angle (radians); AU — astronomical unit length baseline
Trap: Mixing arcsec into this formula is off by 206265; not cosmological D_A.

**108. Angular Separation (Arcseconds)** `Competition`
theta_arcsec = 206265 (linear / distance)
Use: Binary projected separation in arcsec. Not radians (use 109) or the inverse linear size (117).
Vars: theta_arcsec — angular separation (arcsec); linear — physical separation (m); same length unit basis as distance; distance — distance to the system (m)
Trap: 206265 is arcsec per radian, not 3600 (arcsec per degree).

**109. Angular Size** `Core`
θ = d / D
Use: Answer in radians, or before *206265. Not arcsec directly (use 108) or 1.22 lambda/D (diffraction).
Vars: theta — angular size (radians); d — physical diameter / size (m); D — distance to the object (m)
Trap: D is distance, not telescope diameter; do not compare radians to catalog arcsec without *206265.

**117. Linear Separation from Angular (Arcsec)** `Competition`
linear = theta_arcsec distance / 206265
Use: Measured split in arcsec and known distance. Not unknown angle (use 108) or theta already in rad (109).
Vars: linear — physical separation (m); theta_arcsec — angular separation (arcsec); distance — distance to the system (m)
Trap: Forgetting to divide by 206265 leaves an answer ~2e5 times too big.

**118. Radians ↔ Arcseconds** `Reference`
theta_arcsec = theta_rad × 206265
Use: After 109/107/112/119 (radians) when catalogs are in arcsec. Not for linear/distance (use 108/117).
Vars: theta_arcsec — angle in arcseconds; theta_rad — angle in radians
Trap: Do not multiply a value already in arcsec by 206265 again.

## Telescopes

**107. Angular Resolution** `Core`
θ = 1.22 (λ / D)
Use: Can this telescope split a double; diffraction-limited. Not lambda/D without 1.22 (use 112) or angular size (109).
Vars: theta — minimum resolvable angle (radians); lambda — wavelength (m); D — aperture diameter (m)
Trap: D is diameter, not radius; convert rad to arcsec with *206265 (same equation as 119).

119. Rayleigh Criterion (Telescope Resolution) = 107. θ = 1.22 λ / D

**112. Diffraction Limit (Angular Resolution)** `Competition`
θ = λ / D
Use: Quick estimates or radio beam size. Use 1.22 lambda/D (107/119) if they say Rayleigh.
Vars: theta — angular resolution (radians); lambda — wavelength (m); D — aperture diameter (m)
Trap: Convert rad with *206265; D is diameter, not radius, and not source angular size (109).

**116. Light Gathering Power** `Core`
LGP = (D_obj / D_eye)²
Use: Telescope vs naked eye (or vs another aperture). Not magnification (120) or resolution (1/D).
Vars: LGP — light-gathering power ratio (dimensionless); D_obj — telescope objective diameter (m); D_eye — eye pupil diameter (m)
Trap: D_eye is the pupil, not the eyeball; do not linear-scale D (that is resolution).

**113. f-ratio** `Competition`
f_ratio = f / D
Use: Telescope speed and optical design. Not resolution (lambda/D) and not magnification (120).
Vars: f_ratio — focal ratio (dimensionless), e.g. f/10; f — focal length (m); D — aperture diameter (m)
Trap: LGP depends on D^2, not f-ratio; image scale is 206265/f(mm) arcsec/mm.

**120. Telescope Magnification** `Competition`
M = f_obj / f_eye
Use: Eyepiece choice. Use 113 for f-ratio and 116 for light grasp.
Vars: M — magnification (dimensionless); f_obj — objective focal length (m); f_eye — eyepiece focal length (m)
Trap: Not D_obj/D_eye (that is LGP/exit-pupil); f/10 is not 10x.

## Hubble and cosmology

**140. Hubble's Law** `Core`
v = H0 d
Use: Low z (z<<1, roughly z<~0.1) to convert redshift to distance. Not at high z (use D_L, D_A, or chi).
Vars: v — recessional velocity (km/s); H0 — Hubble constant (km/s/Mpc); d — distance (Mpc)
Trap: Subtract peculiar velocity inside ~10-20 Mpc; d=c z/H0 only at low z.

**139. Hubble Time** `Competition`
t_sec = 3.085677581e19 / H0
Use: Quick age/expansion-timescale estimate. Not a precision age (need the Friedmann integral).
Vars: t_sec — Hubble time (s); H0 — Hubble constant (km/s/Mpc)
Trap: Prefactor assumes H0 in km/s/Mpc, not 1/s; divide seconds by ~3.16e7 for years.

**125. Critical Density** `Core`
rho_c = 3 H0² / (8π G)
Use: Convert Omega to a physical density, or set Omega_tot=1. Not a galactic or solar-neighborhood density.
Vars: rho_c — critical density (kg/m^3); H0 — Hubble constant (often km/s/Mpc; convert carefully to SI for G); G — gravitational constant; pi — ≈ 3.14159
Trap: Convert H0 from km/s/Mpc to 1/s before combining with SI G.

**127. Density Parameter** `Competition`
Omega = ρ / rho_c
Use: Classify geometry or write a component as a fraction of rho_c. Not a galaxy's internal density.
Vars: Omega — density parameter (dimensionless); rho — actual density (kg/m^3); rho_c — critical density (kg/m^3)
Trap: Omega is dimensionless; never quote it in kg/m^3.

**156. Scale Factor a(t) Relation to Redshift z** `Competition`
a = 1 / (1 + z)
Use: Convert z to how big the universe was then, and feed a into Friedmann. Not gravitational redshift or a star's peculiar Doppler z.
Vars: a — scale factor (dimensionless); z — cosmological redshift (dimensionless)
Trap: Do not treat z as v/c at large z; this is expansion, not Doppler. Same content as 1+z=a_now/a_emit.

**169. Redshift and Scale Factor Relation** `Competition`
1 + z = a_now / a_emit
Use: Expanding-universe redshift, CMB temperature scaling, and converting z to a. Not peculiar Doppler or gravitational redshift.
Vars: z — redshift (dimensionless); a_now — scale factor today (usually 1); a_emit — scale factor at emission (< 1)
Trap: This z is not a velocity; at large z do not use v=c z. At z<<1 it accidentally looks like Doppler.

**135. Friedmann Equation** `Advanced`
(H² / H0²) = Omega_m a^(-3) + Omega_r a^(-4) + Omega_Lambda
Use: Expansion history and H(z) with a=1/(1+z). Not if curvature is present (add Omega_k/a^2).
Vars: H — Hubble parameter at scale factor a (km/(s·Mpc)); H0 — present Hubble constant; Omega_m — matter density parameter today (dimensionless); Omega_r — radiation density parameter today (dimensionless); Omega_Lambda — dark energy density parameter (dimensionless); a — scale factor (dimensionless; a = 1 today)
Trap: Drop radiation today but not at z~1000; H0 67-73 rescales H(z). H here is H(t), not a galaxy speed.

## Black holes and gravity

**157. Schwarzschild Radius** `Core`
R_s = 2 G M / c²
Use: BH size and as the unit for ISCO, photon sphere, and grav redshift. Not a Kerr horizon (smaller r+) or a WD/NS radius.
Vars: R_s — Schwarzschild radius (m); M — mass (kg); G, c — constants
Trap: Not the photon sphere (1.5 Rs) or ISCO (3 Rs).

158. Schwarzschild Radius per Solar Mass = 157. R_s = 3 km (M / M_sun)

**141. Innermost Stable Circular Orbit (ISCO)** `Competition`
r = 3 R_s
Use: Accretion-disk inner-edge and Schwarzschild efficiency. Not Kerr (prograde ISCO moves in toward 0.5 Rs) and not the photon sphere (1.5 Rs).
Vars: r — ISCO radius (m); R_s — Schwarzschild radius (m)
Trap: Wrong siblings: 1.5 Rs photon sphere, Rs horizon. Schwarzschild only.

**149. Photon Sphere Radius** `Competition`
r = 1.5 R_s
Use: Schwarzschild photon-ring / shadow order-of-magnitude. Not Kerr, not ISCO (3 Rs), and not the horizon (Rs).
Vars: r — photon sphere radius (m); R_s — Schwarzschild radius (m)
Trap: Wrong siblings: 3 Rs ISCO, Rs horizon. Schwarzschild only.

**131. Eddington Luminosity** `Core`
L_Edd = 4π G M m_p c / σ_T
Use: Quasar/AGN and X-ray binary luminosity limits. Not jets or beamed emission, and not an efficiency (pair with eps).
Vars: L_Edd — Eddington luminosity (W); M — mass of the accretor (kg); m_p — proton mass (kg); G — gravitational constant; c — speed of light (m/s); sigma_T — Thomson cross-section (m^2); ...
Trap: SI Watts vs CGS erg/s; helium/opacity change the constant; Eddington ratio is L/L_Edd, not eps.

**136. Gravitational Redshift (General)** `Competition`
λ_obs / λ_emit = (1 - R_s / r)^(-1/2)
Use: Compact objects with r not much larger than Rs. Not cosmological redshift (use a=1/(1+z)) and not the weak-field form at r~Rs.
Vars: lambda_obs — wavelength seen far away (m); lambda_emit — wavelength at emission radius (m); R_s — Schwarzschild radius (m); r — emission radius from center (m)
Trap: Wrong sibling of weak-field z~G M/(r c^2); Kerr depends on spin and angle.

**137. Gravitational Redshift (Simple Form)** `Competition`
z_grav = G M / (r c²)
Use: Sun, white dwarfs, and GPS-style weak gravity. Not at r~Rs (use exact (1-Rs/r)^(-1/2)).
Vars: z_grav — gravitational redshift (dimensionless); M — mass (kg); r — radius / distance from center (m); G, c — constants
Trap: Do not mix with Hubble redshift; error is order (Rs/r)^2.

**160. Time Dilation near a Black Hole** `Competition`
delta_t = delta_t_0 (1 - R_s / r)^(-1/2)
Use: Near black holes and compact objects, and GR tests. Not special-relativistic gamma (that is relative speed).
Vars: delta_t — time interval as measured at infinity (s); delta_t_0 — proper time for the local observer (s); R_s — Schwarzschild radius (m); r — radial coordinate of the local observer (m)
Trap: Same factor as grav redshift; weak fields expand as ~1+Rs/(2 r). GPS satellites run fast (higher potential).

**132. Einstein Radius (Microlensing)** `Advanced`
theta_E = √( (4 G M D_LS) / (c² D_L D_S) )
Use: Microlensing Einstein-angle and strong-lensing ring sizes. Not Euclidean distances at cosmological z.
Vars: theta_E — Einstein radius (radians); M — lens mass (kg); D_LS — lens–source distance (m); D_L — observer–lens distance (m); D_S — observer–source distance (m); G, c — constants
Trap: D_L here is distance to the lens, not luminosity distance; theta_E comes out in radians.

## Special relativity

**144. Lorentz Factor (Gamma)** `Core`
γ = 1 / √(1 - (v/c)²)
Use: Any SR problem with v, or converting among E, K, p, and v. Not a cosmological Hubble-flow gamma.
Vars: gamma — Lorentz factor (dimensionless); v — speed (m/s); c — speed of light (m/s)
Trap: Mismatched v and c units (km/s vs m/s); for v<<0.1c, gamma~1+(1/2)(v/c)^2.

**142. Length Contraction** `Competition`
L' = L √(1 - (v/c)²)
Use: SR length problems and muon/atmosphere path in the lab frame. Not time (use time dilation) and not cosmic a(t).
Vars: L' — contracted length in the frame where the object moves (m); L — proper length in the rest frame (m); v — relative speed (m/s); c — speed of light (m/s)
Trap: Only the parallel component shrinks; keep v and c in the same units.

**159. Time Dilation** `Competition`
delta_t' = delta_t / √(1 - (v/c)²)
Use: Muon lifetimes, twin paradox, and accelerator beams. Not gravitational time dilation (use (1-Rs/r)^(-1/2)).
Vars: delta_t' — dilated time interval (s); delta_t — proper time in the rest frame (s); v — relative speed (m/s); c — speed of light (m/s)
Trap: Do not dilate lengths with this; cosmological redshift is not this applied to galaxies.

**153. Relativistic Kinetic Energy** `Competition`
K = (γ - 1) m c²
Use: Cosmic rays, AGN jets, any non-trivial v/c. Not (1/2)m v^2 for TeV protons, and not photons (use E=p c).
Vars: K — relativistic kinetic energy (J); gamma — Lorentz factor; m — rest mass (kg); c — speed of light (m/s)
Trap: Never call K total energy; total is E. Photons have m=0.

**154. Relativistic Momentum** `Competition`
p = γ m v
Use: SR mechanics once gamma or v is known. Not p=m v at relativistic speeds, and not photons (use p=E/c).
Vars: p — relativistic momentum (kg*m/s); gamma — Lorentz factor; m — rest mass (kg); v — speed (m/s)
Trap: Photons: m=0 so this formula fails; in eV units quote p in eV/c.

**155. Relativistic Total Energy** `Competition`
E = γ m c²
Use: Relativistic energy budgets and converting gamma to E. Not photons (use E=p c=h f); do not omit rest energy if total E is wanted.
Vars: E — total energy (J); gamma — Lorentz factor; m — rest mass (kg); c — speed of light (m/s)
Trap: K=(gamma-1)m c^2 is kinetic, not total; photons have no rest frame.

## Doppler and redshift

**162. Doppler Shift** `Core`
(λ_obs - λ_rest) / λ_rest = v / c
Use: Stellar RVs, exoplanet wobbles, and galaxy motions with v<<c. Not cosmological z>~0.1 or relativistic jets (use 168).
Vars: lambda_obs — observed wavelength (m); lambda_rest — rest wavelength (m); v — radial velocity (m/s); c — speed of light (m/s)
Trap: z<<1 for v=c z; keep wavelengths in the same units.

167. Radial Velocity from Wavelength Shift = 162. v_r = (Δλ / λ) c

166. Radial Velocity from Frequency Shift = 162. v_r = (Delta_f / f) c

**170. Redshift Definition** `Core`
z = (λ_obs - λ_emit) / λ_emit
Use: Whenever observed and rest wavelengths are given. Always valid; converting z to velocity is not.
Vars: z — redshift (dimensionless); lambda_obs — observed wavelength (m); lambda_emit — emitted wavelength (m)
Trap: Do not assume z=v/c unless z<<1 (use 168 otherwise). Definition does not tell mechanism or distance.

165. Observed Wavelength from Redshift = 170. λ_obs = (1 + z) λ_emit

**171. Redshift to Velocity (Low z Approximation)** `Competition`
v = c z
Use: Only z<<1, roughly z<~0.1. Not larger spectroscopic z (use 168) and not high-z cosmology (report z and D_L).
Vars: v — recessional velocity (m/s); c — speed of light (m/s); z — redshift (dimensionless)
Trap: Exceeds c for z>1; peculiar velocities of hundreds of km/s scatter the lowest z.

**168. Recessional Velocity from Redshift (Relativistic)** `Competition`
v = c (((1 + z)² - 1) / ((1 + z)² + 1))
Use: z is not tiny (wavelength doubled, quasar lines). Not v=c z (unphysical at z>=1) and not a cosmological Hubble-flow speed.
Vars: v — recessional velocity (m/s); c — speed of light (m/s); z — redshift (dimensionless)
Trap: Expansion is not a peculiar velocity through static space; gravitational redshift is a different mechanism.

**152. Relativistic Doppler Shift** `Competition`
1 + z = γ (1 + v/c)
Use: Fast stars, jets, and spectroscopic z when v is not <<c. Not cosmological 1+z=1/a treated as a peculiar speed.
Vars: z — redshift (dimensionless); gamma — Lorentz factor (dimensionless); v — radial velocity (m/s); c — speed of light (m/s)
Trap: Not gravitational redshift and not Hubble expansion; flip the sign of v for approach.

## Planets: T, albedo, HZ, gravity

**173. Albedo** `Core`
A = F_reflected / F_incident
Use: Use Bond A for Teq, absorbed insolation, or habitability. Not for geometric albedo from magnitudes.
Vars: A — albedo (dimensionless); F_reflected — reflected flux (W/m^2); F_incident — incident flux (W/m^2)
Trap: Only (1-A) enters Teq as a weak 1/4 power.

**180. Equilibrium Temperature (from Luminosity)** `Core`
T_eq = (L_star (1 - A) / (16π σ a²))^(1/4)
Use: Use when given L_star and a. Not the T_star/R_star form (188); greenhouse is T_surface - Teq (181).
Vars: T_eq — no-atmosphere equilibrium temperature (Kelvin); L_star — bolometric stellar luminosity (W); A — reflected fraction 0–1 (dimensionless); a — Orbital Distance (meters); sigma — stefan–Boltzmann Constant (W/(m^2*K^4))
Trap: Factor of 4 assumes full-sphere heat redistribution; dayside-only raises Teq by ~19%.

**188. Planetary Equilibrium Temperature** `Core`
T_eq = T_star √(R_star / (2 a)) (1 - A)^(1 / 4)
Use: Use when T_star, R_star, and a are given. Not the L_star form (180); not HZ liquid-water orbits (182-183).
Vars: T_eq — effective radiating temperature without atmosphere (Kelvin); T_star — stellar effective temperature (Kelvin); R_star — stellar radius (meters); a — semi-major axis / star–planet distance (meters); A — fraction of incident light reflected (0–1)
Trap: A must be Bond not geometric; planet radius cancels; dayside-only +~19%.

**181. Greenhouse Effect** `Competition`
DeltaT_GH = T_surface - T_eq
Use: Use after Teq from 180 or 188 plus a measured T_surface. Not a substitute for Bond A (A already entered Teq).
Vars: ΔT_GH — temperature increase from greenhouse effect (Kelvin); T_surface — actual surface temperature (Kelvin); T_eq — equilibrium temperature without greenhouse (Kelvin)
Trap: Do not double-count clouds as both albedo and greenhouse; HZ edges already include greenhouse.

**182. Habitable Zone Inner Edge** `Competition`
a_inner = √(L_star / L_sun) × 0.95 AU
Use: Use for the liquid-water inner edge given luminosity. Not a raw Teq=273-373 K cut (180/188 only if asked for Teq).
Vars: a_inner — inner edge semi-major axis (meters); L_star — Stellar Luminosity (W)
Trap: 0.95 AU * sqrt(L/Lsun) is the Sun-like shortcut; M-dwarf coefficients shift.

**183. Habitable Zone Outer Edge** `Competition`
a_outer = √(L_star / L_sun) × 1.67 AU
Use: Use with 182 to bracket the HZ. Not where Teq hits 273 K (Teq ignores greenhouse).
Vars: a_outer — outer edge semi-major axis (meters); L_star — Stellar Luminosity (W)
Trap: Optimistic early-Mars ~1.8 AU; exam 1.67 is the conservative maximum-greenhouse number.

**174. Atmospheric Scale Height** `Core`
H = k T / (m g)
Use: Use for planetary atmospheres, transit inflation, or Jeans exobase. Not for disk thickness (use H = cs/Omega, 213).
Vars: H — pressure scale height (m); T — atmospheric temperature (K); m — mean particle mass (kg); g — surface gravity (m/s^2); k — Boltzmann constant (J/K)
Trap: m is kg per molecule, not g/mol; T in K, g in m/s^2.

**175. Average Density** `Core`
ρ = 3 M / (4π R³)
Use: Use for any spherical body given M and R. Not the rocky M-R prediction (190); 187 is the planet-framed twin.
Vars: ρ — average density of the body (kg/m^3); M — mass of the body (kg); R — radius of the body (meters)
Trap: RV gives M sin i, so exoplanet rho is often a lower limit until i is known.

**191. Surface Gravity** `Core`
g = G M / r²
Use: Use for scale height (174), Jeans, or weight. Not disk H = cs/Omega (do not plug surface g there).
Vars: g — acceleration due to gravity at surface, gravitational field strength, surface acceleration (m/s^2); M — mass of the body, planetary mass, stellar mass, compact object mass (kg); r — radius of the body, surface radius, planetary radius, stellar radius (meters)
Trap: Giants: g at the 1-bar radius; NS g ~1e12 needs GR; M in kg, r in m.

**190. Rocky Planet Mass–Radius Relation** `Competition`
R = R_earth (M / M_earth)⁰.27
Use: Use to predict R from M assuming rock, or to test if measured R is too large. Not for giants, mini-Neptunes, or degenerates.
Vars: R — planetary radius (meters); M — planetary mass (kg)
Trap: 0.27 is a 1-10 Me fit; this is a composition hypothesis, not a measurement.

## Exoplanets: transit and RV

**192. Transit Depth (Central Transit)** `Core`
delta = (R_p / R_s)²
Use: Use to convert a light-curve dip into Rp/Rstar. Not secondary eclipse; not RV mass (189).
Vars: δ — fractional drop in flux during transit (dimensionless); R_p — radius of the planet (meters); R_s — radius of the star (meters)
Trap: Distance cancels; Rp/Rs = sqrt(delta); grazing and limb darkening make a box-depth too simple.

**189. Radial Velocity Semiamplitude (Circular Orbit)** `Competition`
K = (2π G / P)^(1 / 3) M_p sin(i) / (M_s + M_p)^(2 / 3)
Use: Use for Doppler planet mass. Not transit radius (192); not the planet's own orbital speed v_K.
Vars: K — amplitude of radial velocity variation (m/s); M_p — mass of the planet (kg); M_s — mass of the star (kg); P — orbital period of planet around star (seconds); i — orbital inclination (90° = edge-on) (radians)
Trap: Face-on i=0 gives K=0; circular formula omits 1/sqrt(1-e^2).

## Escape and magnetosphere

**185. Jeans Escape Parameter** `Competition`
λ = G M m / (k T r)
Use: Use as a keep-or-lose screen before flux (184). Not energy-limited XUV flow (179); scale height (174) is kT/(m g).
Vars: lambda — gravitational / thermal energy ratio (dimensionless); M — planetary mass (kg); m — mass of escaping species (kg); T — temperature at exobase (Kelvin); r — radial distance of exobase (meters)
Trap: Use exobase r and T (thermosphere can be 700-1000 K), not the ground.

**184. Jeans Escape Flux (Thermal)** `Advanced`
Phi = n_exo c_s (1 + λ) exp(-λ)
Use: Use when you have lambda, n_exo, and thermal speed and need a particle flux. Not bulk XUV hydrodynamic escape (179).
Vars: Phi — escaping particles per area per time (1/(m^2*s)); n_exo — number density at exobase (1/m^3); c_s — characteristic thermal speed (m/s); lambda — escape parameter λ (dimensionless)
Trap: n_exo is exobase not surface density; if lambda ~2-3 this underestimates (wind regime).

**179. Energy-Limited Hydrodynamic Escape** `Advanced`
Mdot_esc = ε π R_p³ F_XUV / (G M_p K)
Use: Use for close-in exoplanets and XUV envelope stripping. Not Jeans thermal escape (184/185) or disk photoevaporation (211).
Vars: Mdot_esc — atmospheric mass-loss rate (kg/s); epsilon — heating efficiency (typically 0.1–0.3); R_p — planetary radius (meters); F_XUV — Incident X-ray/EUV flux (W/m^2); M_p — planetary mass (kg); K — tidal enhancement factor (~1)
Trap: epsilon=1 overestimates loss; integrate decaying F_XUV(t), not a present-day snapshot.

**186. Magnetopause Standoff Distance** `Advanced`
R_mp = R_p (B0² / (2 μ_0 rho_sw v_sw²))^(1 / 6)
Use: Use given surface B0 and solar-wind rho, v. Not generating B (178); not atmospheric scale height.
Vars: R_mp — subsolar magnetopause radius (meters); R_p — planetary radius (meters); B0 — equatorial surface magnetic field (Tesla); rho_sw — Solar wind mass density (kg/m^3); v_sw — Solar wind velocity (m/s); mu0 — Vacuum Permeability (N/A^2)
Trap: Venus and Mars lack global dipoles, so this equation does not apply.

## Disks and planet formation

**206. Minimum Mass Solar Nebula (MMSN) Surface Density** `Competition`
Sigma = Sigma_0 (r / AU)^(-1.5)
Use: Use as default Sigma(r) when a problem says MMSN. Feed isolation, growth, Toomre Q, and core timescales.
Vars: Sigma — disk surface density at radius r (kg/m^2); Sigma_0 — surface density at 1 AU (kg/m^2); r — heliocentric distance (meters)
Trap: 1 g/cm^2 = 10 kg/m^2; MMSN is a minimum, not a measurement.

**213. Protoplanetary Disk Scale Height** `Competition`
H = c_s / Omega
Use: Use for disk thickness, alpha, h, gaps, and eta ~(H/r)^2. Not planetary atmosphere H = kT/(m g) (174).
Vars: H — vertical e-folding thickness (meters); c_s — isothermal sound speed (m/s); Omega — orbital angular frequency (rad/s)
Trap: Do not insert stellar surface g; vertical gravity is Omega^2 z. Mixing 174 and 213 is a common error.

**196. Disk Aspect Ratio H/r** `Competition`
h = H / r
Use: Use as input to thermal/viscous gaps, Type I torques, and eta ~ h^2 (214). Not Earth atmospheric H (174).
Vars: h — Aspect Ratio (dimensionless); H — vertical scale height (meters); r — cylindrical / orbital radius (meters)
Trap: Do not use Earth H ~8 km to compute disk h.

**218. Toomre Q (Keplerian Disk)** `Competition`
Q = c_s Omega / (π G Sigma)
Use: Use to test gravitational instability vs core accretion. Not Jeans escape lambda (185) and not Stokes number.
Vars: Q — stability parameter (dimensionless); c_s — gas sound speed (m/s); Omega — Keplerian Frequency (rad/s); Sigma — disk surface density (kg/m^2)
Trap: Use gas Sigma not dust unless you have a self-gravitating pebble layer.

**193. Alpha Viscosity Prescription** `Advanced`
ν = α c_s H
Use: Use whenever a disk needs nu (viscous time, Mdot, gaps, Type II). Not a measured viscosity in m^2/s.
Vars: nu — Kinematic Viscosity (m^2/s); alpha — turbulent efficiency (typically 1e-4 to 1e-2); c_s — gas sound speed (m/s); H — disk vertical scale height (meters)
Trap: Exam 'viscous disk' wants this nu, not molecular viscosity.

**197. Gap Opening Mass (Thermal Criterion)** `Advanced`
M_p_min = M_star (H / r)³
Use: Use to decide Type I vs Type II (need both 197 and 198). Not isolation mass (202) or critical core (195).
Vars: M_p_min — mass needed to open a gap (thermal) (kg); M_star — central star mass (kg); H — disk scale height (meters); r — orbital radius (meters)
Trap: Take the stricter of thermal and viscous; partial gaps exist in between.

**198. Gap Opening Mass (Viscous Criterion)** `Advanced`
M_p_min = M_star × 40 α / (r / H)²
Use: Check with thermal (197); the planet must beat both for a clean gap and Type II.
Vars: M_p_min — mass needed to open a gap (viscous) (kg); M_star — central star mass (kg); alpha — disk turbulence parameter (dimensionless); r — orbital radius (meters); H — disk scale height (meters)
Trap: Factor 40 is calibrated; quote max of the two Mp,min when both H/r and alpha are given.

**219. Type I Migration Timescale** `Advanced`
t_I = (M_star / M_p) (M_star / (Sigma a²)) (H / a)² / Omega
Use: Use for Earth/super-Earth cores that have not opened a gap. Not for gap-opening giants (use Type II, t_II = r^2/nu).
Vars: t_I — characteristic migration time (seconds); M_star — central star mass (kg); M_p — Planet Mass (kg); Sigma — disk gas surface density (kg/m^2); a — semi-major Axis (meters); H — disk scale height (meters); ...
Trap: SI: kg, kg/m^2, m, rad/s; divide seconds by 3.156e7 for years. Omitted torque coefficients are O(1), not 1.00.

**220. Type II Migration Timescale** `Advanced`
t_II = r² / ν
Use: Use after a thermal or viscous gap-opening criterion is met. Not for low-mass no-gap planets (use Type I).
Vars: t_II — migration timescale after gap opening (seconds); r — ≈ semi-major axis (meters); nu — Kinematic Viscosity (m^2/s)
Trap: Algebraically the same as t_nu; build nu = alpha c_s H if alpha is given. Inward Type II is the exam default.

**204. Keplerian Orbital Frequency** `Competition`
Omega = √(G M_star / r³)
Use: Use Omega, not surface g, inside disk formulas. Not planetary spin Omega in the dynamo (178).
Vars: Omega — Keplerian angular frequency (rad/s); M_star — Stellar Mass (kg); r — orbital distance (meters)
Trap: Real gas is slightly sub-Keplerian (origin of eta in 214); G Msun = 1.327e20 m^3/s^2.

## Magnetic / synchrotron / pulsars

**230. Magnetic Energy Density** `Competition`
U_B = B² / (2 μ_0)
Use: Use for synchrotron U_B, magnetar budgets, and equipartition. Same number as P_B (formula 231).
Vars: U_B — energy density of the magnetic field (J/m^3); B — strength of the magnetic field (Tesla); mu_0 — permeability of free space (default in constants) (N/A^2)
Trap: SI: U_B = B^2/(2 mu_0) with tesla and mu_0 = 4 pi e-7. CGS: B^2/(8 pi) with gauss. NEVER mix.

231. Magnetic Pressure (SI) = 230. P_B = B² / (2 μ_0)

**241. Synchrotron Power** `Advanced`
P_syn = (4 / 3) σ_T c U_B γ²
Use: Use for cooling rates, population luminosity, and t_syn = energy/power. Insert SI U_B when B is tesla.
Vars: P_syn — power radiated by the electron (W); U_B — energy density of the magnetic field (J/m^3); γ — Relativistic Lorentz factor (dimensionless)
Trap: Build U_B as B^2/(2 mu_0) in SI or B^2/(8 pi) in CGS; the (4/3) sigma_T c U_B gamma^2 wrapper is valid only if U_B matches the unit system.

**240. Synchrotron Cooling Timescale** `Advanced`
t_syn = (3 m_e c μ_0) / (2σ_T B² γ)
Use: Use to compare cooling with age, escape, or acceleration. If t_syn < t_age, a cooling break exists at that gamma.
Vars: t_syn — order-of-magnitude time for significant synchrotron energy loss (seconds); B — magnetic field strength (SI) (Tesla); γ — Relativistic Lorentz factor of the electron (dimensionless)
Trap: SI (B in tesla, mu_0 = 4 pi e-7, sigma_T = 6.65e-29 m^2). CGS is t = 6 pi m_e c/(sigma_T B^2 gamma) with gauss; do not plug tesla into 6 ...

**227. Cyclotron Angular Frequency** `Competition`
omega_c = q B / m
Use: Use for Larmor motion, cyclotron lines, and as the parent of synchrotron. Not characteristic synchrotron frequency (boosted by ~gamma^2).
Vars: omega_c — Cyclotron Angular Frequency ω_c (rad/s); q — particle charge (C); B — magnetic field strength (Tesla); m — particle mass (kg)
Trap: SI: omega_c = q B/m (tesla). CGS is q B/(m c). Divide by 2 pi for cyclic frequency in Hz.

**343. Pulsar Spindown Luminosity (Newtonian)** `Competition`
L_sd = I ω ω_dot
Use: Crab-like nebula power and pulsar energy budgets; not stored magnetic energy (342) and not the radio-pulse luminosity (a tiny fraction).
Vars: L_sd — mechanical spin-down power (W); I — neutron-star moment of inertia; ~1e38 kg*m^2 in SI (= ~1e45 g*cm^2 in cgs) (kg*m^2); omega — Angular Speed ω (rad/s); omega_dot — positive magnitude of spin-down (rad/s^2)
Trap: NS I ~ 1e38 kg m^2 in SI = 1e45 g cm^2 in cgs; mixing those unit systems is a common exam error.

**342. Magnetic Energy (Uniform B Inside Sphere)** `Advanced`
U_B = (4π / 3) R³ B² / (2 μ_0)
Use: Compare U_B with rotational or gravitational energy; not a dipole exterior integral and not spindown power (343).
Vars: U_B — total in sphere (model) (J); R — star / magnetosphere volume used (m); B — typical internal field (model) (T); mu_0 — Vacuum Permeability (H/m)
Trap: SI B in Tesla (1 G = 1e-4 T); CGS energy density is B^2/(8 pi); never mix mu_0 with gauss.

**235. Pulsar Light Cylinder Radius** `Competition`
R_LC = c / omega_spin
Use: Use for pulsar magnetosphere geometry, open field lines, and polar-cap size. Not spindown luminosity (use L = I omega |omega_dot|).
Vars: R_LC — radius where corotation speed would reach c (meters); c — vacuum speed of light (m/s); omega_spin — neutron star rotation rate (rad/s)
Trap: omega_spin is rad/s, not Hz (omega = 2 pi/P). NS I ~ 1e38 kg m^2 ~ 1e45 g cm^2. Polar cap uses theta_pc ~ sqrt(R_star/R_LC).

## Stellar structure

**254. Hydrostatic Balance** `Core`
dP / dr = -G M(r)ρ(r) / r²
Use: Use whenever hydrostatic balance is stated. Combine with an EOS and mass continuity for structure.
Vars: dP_dr — change in pressure with radius (Pa/m); M — mass enclosed within radius r (kg); ρ — density at radius r (kg/m^3); r — radial distance from center (meters)
Trap: M(r) is enclosed mass, not total M, unless near the surface. Photosphere form: dP/d tau = g/kappa. Convection vs radiation is a separate ...

**253. Free-Fall Time (Uniform Sphere)** `Core`
t_dyn = √(3π / (32 G ρ))
Use: Use for cloud collapse and vs KH/nuclear times. Not free-fall from infinity onto a point mass, and not P = t_ff without a pulsation model.
Vars: t_dyn — characteristic gravitational timescale (s); G — Gravitational Constant (m^3/(kg*s^2)); rho — typical or mean density (kg/m^3)
Trap: Prefactor sqrt(3 pi/32) ~ 0.54; the rough 1/sqrt(G rho) is too long by ~2. Pulsation P ~ rho^{-1/2} is the same family, different geometry.

**255. Ideal Gas Pressure** `Competition`
P_gas = n k T
Use: Use in interiors away from degeneracy, H II regions, clouds, and atmospheres. Not degenerate WD cores (use P = K rho^{5/3}).
Vars: P_gas — pressure from ideal gas, thermal pressure (Pa); n — number density of particles, particle density (m⁻^3); k — Boltzmann Constant (J/K); T — temperature of the gas (Kelvin)
Trap: If mu is dimensionless, P = rho k T/(mu m_H); n in m^{-3} for P = n k T. Compare with radiation (1/3) a T^4. Sound: adiabatic sqrt(gamma ...

**271. Optical Depth** `Core`
τ = integral of κ ρ ds
Use: Atmospheres, nebulae, SN ejecta; needed for t_diff~tau R/c and P=g tau/kappa. Photosphere near tau~2/3.
Vars: τ — optical depth, measure of opacity along path (dimensionless); κ — mass absorption coefficient, opacity (m^2/kg); ρ — mass density (kg/m^3); s — distance along path through material (meters)
Trap: tau is dimensionless; Type Ia peak uses expanding-ejecta tau, not a static atmosphere.

**280. Radiation Pressure** `Competition`
P_rad = (1 / 3) a T⁴
Use: Compare radiation vs gas support in massive-star cores. Not radiation force on a particle (formula 238) and not Eddington L.
Vars: P_rad — pressure from radiation field (Pa); a — radiation constant, a = 4σ/c (J/(m^3*K^4)); T — temperature of the radiation field (Kelvin)
Trap: Magnetic pressure B^2/(2 mu_0) is a different reservoir; a is the radiation constant, not the scale factor.

**290. Total Energy of a Star (Virial Theorem, General)** `Competition`
E_total = -E_grav / 2
Use: Stellar energy budgets and cluster virial masses. Pair with uniform-sphere U=-3 G M^2/(5 R). Not systems with huge surface pressure or B ...
Vars: E_total — total energy of the star (J); E_grav — gravitational potential energy, binding energy (J)
Trap: Printed E_grav is the positive |U|; U itself is negative. Extra magnetic or rotational terms belong in a generalized virial.

**278. Pulsation Period vs Mean Density (P ∝ ρ⁻¹/²)** `Competition`
P = K ρ^(-0.5)
Use: Compare periods from a density ratio, or invert rho proportional to P^{-2}. Not free-fall (use t_ff=sqrt(3 pi/(32 G rho))).
Vars: P — convert days to seconds for SI (s); rho — average stellar density (kg/m^3); K — problem-specific or from model (s*kg^(1/2)/m^(3/2))
Trap: K is a calibration; do not set K=1 in SI. Density form of P~sqrt(R^3/(G M)).

**89. Mass-Luminosity Relation** `Competition`
L = M^exponent
Use: L from M (or reverse) for hydrogen-burning MS stars. Not giants, WDs, or pre-MS.
Vars: L — luminosity in solar units (L / L_sun); M — mass in solar units (M / M_sun); exponent — power-law index (often ~3.5)
Trap: Solar units, not SI kg and watts; exponent ~2.3 below ~0.5 M_sun.

**100. Stellar Lifetime** `Competition`
τ = factor (M_sun / M)^exponent
Use: How long a given-mass star lives; cluster turnoff. Use 97 when eps and f_H are given.
Vars: tau — main-sequence lifetime (years); factor — calibration prefactor (set by the formula’s solar reference); M_sun — reference solar mass (kg); M — stellar mass (kg); exponent — usually ~2.5 in this implementation
Trap: Output is years, not seconds (unlike 97); masses in the same units as M_sun.

**97. Solar Lifetime with Fusion Efficiency** `Competition`
t = (eps f_H f_available M c²) / L
Use: Problem gives eps, core fraction, and X. Use 100 if you only have mass scaling.
Vars: t — lifetime (s); eps — mass-to-energy efficiency in fusion (≈ 0.007 for pp chain); f_H — hydrogen mass fraction of the star (Sun ~ 0.73); f_available — fraction of that H that can fuse in the core (often ~0.1); M — stellar mass (kg); c — speed of light (m/s); ...
Trap: Do not set f_available = 1 (~10x too long); output is seconds (1 yr = 3.156e7 s), unlike 100.

## Cepheids

**273. Period-Luminosity (Classical Cepheid, M from P)** `Core`
M_V = -2.43 (log10(P) - 1) - 4.05
Use: Only when the problem quotes this slope and zero point. Not Type II or RR Lyrae.
Vars: M_V — Absolute Visual Magnitude (mag); P — Pulsation Period (days)
Trap: TWO Cepheid PL calibrations: this vs M_V=-2.76 log10(P)-1.4 (formula 274); they are not equivalent.

**274. Period-Luminosity Relation (Cepheids)** `Competition`
M_V = -2.76 log10(P) - 1.4
Use: Only when the problem writes this slope and intercept. Not for averaging with formula 273.
Vars: M_V — absolute visual magnitude of the Cepheid (magnitude); P — period of pulsation in days (days)
Trap: Formulas 273 and 274 are two different empirical fits, not interchangeable; P in days; still apply A_V in the distance modulus.

**278. Pulsation Period vs Mean Density (P ∝ ρ⁻¹/²)** `Competition`
P = K ρ^(-0.5)
Use: Compare periods from a density ratio, or invert rho proportional to P^{-2}. Not free-fall (use t_ff=sqrt(3 pi/(32 G rho))).
Vars: P — convert days to seconds for SI (s); rho — average stellar density (kg/m^3); K — problem-specific or from model (s*kg^(1/2)/m^(3/2))
Trap: K is a calibration; do not set K=1 in SI. Density form of P~sqrt(R^3/(G M)).

## White dwarfs

**104. White Dwarf Mass-Radius Relation** `Competition`
R ∝ 1 / M^(1/3)
Use: WD structure; heavier WD is smaller. Not MS mass-radius or near 1.4 M_sun.
Vars: R — white dwarf radius (m); M — white dwarf mass (kg)
Trap: Opposite of main-sequence (bigger when heavier); fails near Chandrasekhar ~1.4 M_sun.

**340. Chandrasekhar Limit** `Core`
M_Ch ~ = 1.4 M__sun
Use: SN Ia progenitors and WD vs denser remnant; not the neutron-star maximum (TOV ~2-3 Msun) and not main-sequence stars.
Vars: M_Ch — maximum stable white dwarf mass (M_☉)
Trap: Iron-rich (higher mu_e) lowers the limit; rotation can raise it.

**103. White Dwarf Binary Orbital Decay** `Advanced`
da/dt = -64 G³ M1 M2 (M1 + M2) / (5 c⁵ a³)
Use: WD-WD or NS-NS shrinkage rate at given a. Not time to merger (use 105, not a/|da/dt|).
Vars: da/dt — rate of change of semi-major axis (m/s); negative = shrinking; a — current semi-major axis (m); M1, M2 — white dwarf masses (kg); G, c — gravitational constant, speed of light
Trap: t_merge = a/(4|da/dt|), not a/|da/dt|; rate is m/s of a, not P-dot.

**105. White Dwarf Merger Timescale** `Advanced`
t_merge = 5 c⁵ a⁴ / (256 G³ M1 M2 (M1 + M2))
Use: How long until two WDs merge. Use 103 for instantaneous da/dt.
Vars: t_merge — time to merger (s); a — current semi-major axis (m); M1, M2 — component masses (kg); G, c — constants
Trap: Output in seconds (1 yr = 3.156e7 s); if given P, convert to a via Kepler first.

## Galaxies

**326. Tully-Fisher Relation (Spiral Galaxies)** `Competition`
L ∝ v_rot^α
Use: Spirals and late-type disks with a measured rotation speed; not ellipticals (use Faber-Jackson 316); do not insert elliptical sigma into ...
Vars: L — total luminosity of spiral galaxy (W); v_rot — maximum rotation velocity (m/s); α — power law exponent, typically ~3-4 (dimensionless)
Trap: Correct HI W_20 for inclination (divide by sin i); face-on spirals are poor TF targets.

**316. Faber-Jackson Relation (Elliptical Galaxies)** `Competition`
L ∝ σ^α
Use: Ellipticals and bulges from velocity dispersion; not spirals (use Tully-Fisher 326); prefer the fundamental plane if you have R_e, sigma,...
Vars: L — total luminosity of elliptical galaxy (W); σ — central velocity dispersion (m/s); α — power law exponent, typically ~4 (dimensionless)
Trap: Not a virial identity; do not apply to spiral disks.

**320. M-σ Relation (SMBH Mass to Bulge Velocity Dispersion)** `Competition`
M_BH ∝ σ^α
Use: Estimate M_BH from bulge sigma; not disk rotation (Tully-Fisher 326), not globular sigma, and not Faber-Jackson (316, galaxy L vs sigma).
Vars: M_BH — mass of supermassive black hole (kg); σ — velocity dispersion of galactic bulge (m/s); α — power law exponent, typically ~4-5 (dimensionless)
Trap: Use bulge (spheroid) dispersion, not disk v_rot; scatter ~0.3 dex.

**324. Surface Brightness (Exponential Disk)** `Competition`
I(r) = I_0 exp(-r / h)
Use: Fit spiral or S0 disk photometry; total L = 2 pi I_0 h^2; not NFW density (314) and not de Vaucouleurs ellipticals (r^{1/4}).
Vars: I(r) — surface brightness at radius r (W/m^2); I_0 — surface brightness at center (W/m^2); r — distance from galactic center (meters); h — exponential scale length, characteristic radius (meters)
Trap: Surface brightness is distance-independent in Euclidean space; I is light, not mass.

**321. Mass enclosed M(r) (from Rotation Curve)** `Competition`
M(r) = v² r / G
Use: Rotation velocity at a stated radius; inverse of 317; not total halo mass unless r is virial, and not pressure-supported ellipticals (use...
Vars: M(r) — total mass within radius r (kg); v — orbital velocity at radius r (m/s); r — distance from center (meters); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: Thin-disk geometry differs from the spherical estimator by a factor of order unity.

**325. Toomre Q Criterion (Disk Stability, simplified)** `Competition`
Q = (sigma_R κ) / (π G Sigma)
Use: Galactic disks (flat curve: kappa = sqrt(2) Omega); not Keplerian protoplanetary disks (use Q = c_s Omega / (pi G Sigma)) and not Jeans a...
Vars: Q — stability parameter; Q > 1 is stable (dimensionless); sigma_R — radial velocity dispersion (≈ c_s in cold disks) (m/s); kappa — epicyclic frequency (≈ Ω for Keplerian disks) (rad/s); Sigma — disk surface mass density (kg/m^2); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: kappa = Omega (Keplerian) vs sqrt(2) Omega (flat rotation curve).

**322. Mass of a Globular Cluster (Virial Theorem Applied)** `Competition`
M = (3 σ² R) / G
Use: Globulars, ellipticals, and dwarf spheroidals with LOS dispersion and size; not disks (use 321); do not mix factor 3 with 293's factor 5.
Vars: M — total mass of globular cluster (kg); σ — velocity dispersion, spread in velocities (m/s); R — characteristic radius of cluster (meters); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: Factor 3 vs 293's 5 are different potential models; unbound debris inflates sigma.

## Binaries

**332. Kepler's Third Law (Binary System)** `Core`
P² = (4π² a³) / (G(M_1 + M_2))
Use: Period from masses and separation; use 337 when knowns are P and a and the unknown is M1+M2.
Vars: P — time for one complete orbit (seconds); a — semi-major axis of the orbit (meters); M1 — mass of the first body (kg); M2 — mass of the second body (kg)
Trap: Do not insert barycentric a1 in place of relative a = a1+a2.

337. Total Mass of a Binary System (from Kepler's Third Law) = 332. M_1 + M_2 = (4π² a³) / (G P²)

**329. Binary Mass Ratio q = M₁/M₂** `Reference`
q = M1 / M2
Use: Mass ratio, Roche geometry, splitting total mass; not the spectroscopic mass function (334).
Vars: q — Mass Ratio q (dimensionless); M1 — often more massive WD (kg); M2 — Secondary Mass (kg)
Trap: Many papers define q = M_secondary/M_primary <= 1, the reciprocal if M1 is the primary.

**330. Center of Mass (Binary System)** `Competition`
M1 r1 = M2 r2
Use: Locate the CM or convert a photocenter wobble into a mass ratio; not plugging a1 into Kepler (337 needs relative a = a1+a2).
Vars: M1 — mass of first star (kg); M2 — mass of second star (kg); r1 — distance of star 1 from center of mass (meters); r2 — distance of star 2 from center of mass (meters)
Trap: Relative a in Kepler is a1+a2, not the primary's barycentric a1.

**334. Mass Function (Spectroscopic Binaries)** `Advanced`
f(M) = (M_2³ sin³ i) / (M_1 + M_2)² ∝ P K_1³
Use: SB1s, exoplanet RV, X-ray binaries with one velocity curve; if both K1 and K2 (SB2), use q=K2/K1 plus Kepler III; never treat f as equal ...
Vars: f(M) — mass function, lower limit on companion mass (kg); M₁ — mass of primary star (kg); M₂ — mass of secondary star (kg); i — orbital inclination angle (radians); P — Orbital Period (seconds); K₁ — radial velocity amplitude of primary (m/s)
Trap: Not a stellar IMF; eccentric orbits add (1-e^2)^{3/2} in the K-P-f relation.

**335. Orbital Speed from Period (Circular)** `Competition`
v = 2π r / T
Use: r and T given, want speed; not dynamical v=sqrt(G M / r) unless gravity enforces that period.
Vars: v — tangential speed (m/s); r — radius of circular path (m); T — time for one full orbit (s)
Trap: Decide whether r is a1, a2, or relative a; eccentric orbits need vis-viva, not this v.

## Everything else (by number)

**82. Jeans Mass** `Competition`
M_J = K_J (k T / (G μ m_H))^(3/2) / ρ^(1/2)
Use: Will this clump collapse, and how M_J scales with T and rho. Not Jeans length or free-fall time.
Vars: M_J — Jeans mass (kg); K_J — dimensionless prefactor (≈ 2.92 in the isothermal ideal-gas form); k — Boltzmann constant; T — cloud temperature (K); G — gravitational constant; mu — mean molecular weight (often ~2.3 in molecular clouds); ...
Trap: Include K_J ~ 2.92; n in cm^-3 is not rho (rho = n * mu * m_H).

**85. Luminosity Function (Simplified)** `Advanced`
N(L) ∝ L^(-1.35)
Use: Order-of-magnitude stellar-population counts. Not galaxy Schechter functions.
Vars: N(L) — number of stars near luminosity L (relative count); L — stellar luminosity (W)
Trap: -2.35 is dN/dM, not dN/dL.

**90. Metallicity Ratio (log10 of Mass Fractions)** `Advanced`
log_ratio = log10(Z1 / Z2)
Use: Pop I vs II when Z values are given. Not [Fe/H] unless the problem equates them.
Vars: log_ratio — log10(Z1/Z2) (dimensionless); Z1, Z2 — metal mass fractions (e.g. 0.02, 0.0002)
Trap: Do not take log10(Z1-Z2); mixing ln and log10 costs a factor 2.303.

**91. Momentum Transfer from Radiation (Radiation Pressure)** `Competition`
P_rad = F / c
Use: Force on dust, sails, simple Eddington at an absorbing surface. Not isotropic a T^4/3; not 2F/c (mirror).
Vars: P_rad — radiation pressure (Pa = N/m^2); F — radiation flux (W/m^2); c — speed of light (m/s)
Trap: Use 2F/c for a perfect mirror; F is W/m^2, not luminosity L.

**92. Photon Momentum from Energy** `Competition`
p = E / c
Use: Compton recoil or per-photon kicks. Not p = mv or radiation pressure P_rad = F/c.
Vars: p — photon momentum (kg*m/s); E — photon energy (J); c — speed of light (m/s)
Trap: Put E in joules (1 eV = 1.602e-19 J) for SI p; equivalent p = h/lambda.

**93. Photon Number Density (Blackbody)** `Competition`
n_gamma ∝ T³
Use: Scaling CMB vs stellar interiors. Not energy density (u = a T^4) or flux (F = sigma T^4).
Vars: n_gamma — photon number density (1/m^3); T — temperature (K)
Trap: Not energy density u = a T^4; in cgs n ~ 20.3 T^3 cm^-3.

**110. Arcminutes to Arcseconds** `Reference`
arcsec = arcmin × 60
Use: Catalog/FOV/seeing in arcmin, need arcsec. Not deg to arcmin (use 111) or radians (118).
Vars: arcmin — angle in arcminutes; arcsec — angle in arcseconds
Trap: Not minutes of time (RA); 60 is not a radian conversion.

**111. Degrees to Arcminutes** `Reference`
arcmin = deg × 60
Use: FOV or solar/lunar size in degrees. Not already in arcmin (use 110) or starting from radians (118).
Vars: deg — angle in degrees; arcmin — angle in arcminutes
Trap: Do not use 57.3 (degrees per radian); multiply, do not divide, going deg to arcmin.

**114. Illuminated Area vs Orbital Phase** `Competition`
A = π R² cos(π φ)
Use: This cosine convention: full at phase 0. Not phi=0 as new/dark (that sibling uses sin(pi phi)).
Vars: A — apparent illuminated area (m^2); R — planet radius (m); phi — orbital phase from 0 to 1; pi — ≈ 3.14159
Trap: phi is 0-1 phase, not degrees; wrong sibling if phi=0 is defined as dark.

**115. Index of Refraction** `Reference`
n = c / v
Use: Speed in glass/water/air, Snell, critical angle. Not gravitational deflection.
Vars: n — refractive index (dimensionless); c — speed of light in vacuum (m/s); v — speed of light in the medium (m/s)
Trap: Vacuum n=1 exactly; n is dimensionless, not magnification.

**121. Accretion Efficiency (Radiative Efficiency)** `Advanced`
eps = E_rad / (M c²)
Use: Quasar/AGN energetics and mass-to-light budgets. Not for fusion yields or ADAF flows (energy is advected, not radiated).
Vars: eps — radiative efficiency (dimensionless); E_rad — energy radiated (J); M — accreted mass (kg); c — speed of light (m/s)
Trap: Not the Eddington ratio L/L_Edd.

**122. Angular Diameter Distance** `Competition`
D_A = D / θ
Use: Turn a measured angular size into physical kpc. Not luminosity distance (use D_L for flux).
Vars: D_A — angular diameter distance (m); D — physical transverse size (m); theta — observed angular size (radians)
Trap: Euclidean d=D/theta is not cosmological D_A at high z; D_L=(1+z)^2 D_A.

**123. Black Hole Average Density** `Advanced`
ρ = 3 c⁶ / (32π G³ M²)
Use: Order-of-magnitude 'are big BHs dense?' checks. Not a real interior density, and not NS density (use M and measured R).
Vars: rho — average density (kg/m^3); M — black hole mass (kg); G — gravitational constant; c — speed of light; pi — ≈ 3.14159
Trap: This is 3M/(4 pi Rs^3) for Schwarzschild, not Kerr.

**124. Comoving Distance chi (General)** `Advanced`
χ = D_M / a
Use: Relating proper, luminosity, and angular-diameter distances. Not light-travel distance (c times lookback is smaller).
Vars: chi — comoving distance (m); D_M — proper distance at the time of interest (m); a — scale factor (dimensionless); a = 1 today in common convention
Trap: Do not use Hubble d=v/H0 at high z; flat: D_L=(1+z)chi, D_A=chi/(1+z).

**126. Curvature Density Parameter** `Advanced`
Omega_k = 1 - Omega_M - Omega_Lambda
Use: Flatness bookkeeping from Omega_M and Omega_Lambda. Not at equality or last scattering (include Omega_r).
Vars: Omega_k — curvature density parameter (dimensionless); Omega_M — matter density parameter (dimensionless); Omega_Lambda — dark energy density parameter (dimensionless)
Trap: Positive Omega_k is open (k<0); drop Omega_r only today.

**130. Distance Modulus at High Redshift (Approximate)** `Advanced`
μ = 5 log10(D_L / 10 pc)
Use: Extragalactic/high-z modulus once D_L(z) is known. Not Hubble d=v/H0 or Euclidean sqrt(L/(4 pi F)) at large z.
Vars: mu — distance modulus (mag), related to m - M; D_L — cosmological luminosity distance (parsecs)
Trap: Log argument is D_L in parsecs divided by 10 pc, not Mpc unless you add 25.

**133. Energy of a Photon in Flat Space** `Competition`
E = p c
Use: Photon kinematics and radiation pressure in flat space. Not for massive particles (keep the (m c^2)^2 term).
Vars: E — photon energy (J); p — photon momentum (kg*m/s); c — speed of light (m/s)
Trap: Not a cosmological redshift formula; SI joules vs eV and eV/c. Massive particles only approach E~p c when ultra-rel.

**134. Energy-Momentum Relation** `Competition`
E² = (p c)² + (m c²)²
Use: Cosmic-ray and collider kinematics. Not Newtonian K=p^2/(2m) once E is comparable to m c^2.
Vars: E — total energy (J); p — momentum (kg*m/s); m — rest mass (kg); c — speed of light (m/s)
Trap: If working in eV, measure p in eV/c; kinetic energy is E-m c^2, not E.

**138. Horizon Area of a Black Hole** `Competition`
A_H = 4π R_s²
Use: Horizon-size, area-theorem, and entropy-scaling questions. Not 4 pi R^2 with ISCO or photon-sphere radius.
Vars: A_H — horizon area (m^2); R_s — Schwarzschild radius (m); pi — ≈ 3.14159
Trap: Kerr horizon area is smaller for the same M; not the EHT shadow silhouette.

**143. Lookback Time (Approximate)** `Competition`
t ~= d / c
Use: Galactic, Local-Group, or low-z estimates. Not high z (use a Friedmann lookback integral).
Vars: t — lookback time (s); d — distance (m); c — speed of light (m/s)
Trap: t=d/c fails cosmologically; 1 pc=3.26 ly so t(yr)~d(ly).

**145. Matter Density Parameter** `Competition`
Omega_M = rho_M / rho_c
Use: Friedmann input and flatness partner to Omega_Lambda. Not Omega_b (baryons are only ~0.05).
Vars: Omega_M — matter density parameter (dimensionless); rho_M — matter density (kg/m^3); rho_c — critical density (kg/m^3)
Trap: A cluster baryon fraction is not Omega_M; Omega is dimensionless.

**150. Proper Distance (Current Time)** `Competition`
D_p(t_0) = χ
Use: How far is it right now, in cosmology language. Not D_L or D_A except at z~0.
Vars: D_p(t_0) — proper distance today (m); chi — comoving distance (m)
Trap: Do not use d=c z/H0 as today's proper distance at high z.

**151. Redshift from Peculiar Velocity (Non-Relativistic)** `Competition`
z = v_pec / c
Use: Galaxy peculiar velocities and splitting Doppler from cosmological z. Not converting a high cosmological z into a peculiar speed.
Vars: z — Doppler redshift (dimensionless); v_pec — peculiar velocity (m/s); c — speed of light (m/s)
Trap: Valid only for v<<c; for large peculiar v use relativistic Doppler. Not Hubble z.

**161. Vacuum Energy (Dark Energy) Density Parameter** `Competition`
Omega_Lambda = rho_Lambda / rho_c
Use: Friedmann, flatness, and why expansion is accelerating. Not a clustering matter density.
Vars: Omega_Lambda — dark energy density parameter (dimensionless); rho_Lambda — vacuum / dark energy density (kg/m^3); rho_c — critical density (kg/m^3)
Trap: Do not set Omega_Lambda=1-Omega_M if Omega_k or Omega_r is quoted nonzero.

163. Doppler Shift (Approximate) = 162. v = c (Δλ / λ)

**164. Observed Frequency from Redshift** `Competition`
f_obs = f_emit / (1 + z)
Use: Radio lines, 21-cm, and frequency-domain spectra at known z. Not v=c (Delta_f/f) at large z.
Vars: f_obs — observed frequency (Hz); f_emit — emitted frequency (Hz); z — redshift (dimensionless)
Trap: Companion of lambda_obs=(1+z) lambda_emit; do not convert a large cosmological z into a Hubble velocity.

172. Wavelength Shift from Redshift = 170. Δλ = λ_0 z

**176. Crater Counting Age** `Competition`
N = k D^(-b) t
Use: Use to date unerased surfaces (Moon, Mercury, asteroids). Not crater size from energy (177).
Vars: N — number of craters larger than D per area (1/m^2); k — impactor flux normalization (varies); D — minimum crater diameter counted (meters); b — slope (typically ~2–3); t — exposure age (seconds)
Trap: Saturation, secondaries, and LHB mean linear k*t is an exam approx.

**177. Crater Diameter (Energy Scaling)** `Competition`
D = C E^(1 / 3)
Use: Use for one crater's size from energy. Not surface age from many craters (176).
Vars: D — Crater Diameter (meters); E — kinetic energy of impact (J); C — empirical/prefactor constant (m/J^(1/3))
Trap: Real exponent is ~0.22-0.33; quote a factor of a few unless C is given.

**178. Dynamo Magnetic Field Scaling** `Advanced`
B = C √(ρ) √(Omega) F_conv^(1 / 3)
Use: Use to compare planets or stars with different spin and heat flow. Not magnetopause standoff given B0 (186).
Vars: B — characteristic field strength (Tesla); C — order-unity / fitted prefactor (dimensionless); rho — density of conducting fluid (kg/m^3); Omega — planetary spin rate (rad/s); F_conv — convective energy flux (W/m^2)
Trap: C is fitted O(1); surface dipole can be weaker than the core field.

187. Planet Density = 175. rho_p = M_p / ((4 / 3) π R_p³)

**194. Core Accretion Timescale (Planetesimal)** `Advanced`
t_core = 1e6 yr (Sigma_ref / Sigma) √(a / a_ref)
Use: Use to test whether core accretion beats gas-disk lifetime (~1-10 Myr). Not pebble routes (209-210); not M_crit itself (195).
Vars: t_core — time to grow critical core (seconds); Sigma — Solids Surface Density (kg/m^2); a — formation location (meters)
Trap: Heuristic calibration; isolation (202) can cap growth below M_crit even if t_core looks short.

**195. Critical Core Mass for Runaway Gas Accretion** `Advanced`
M_crit = M_crit0 (Mdot_core / Mdot0)^(1/4) (κ / kappa0)^(1/4)
Use: Use for how big a core is needed to make a gas giant. Not isolation mass (202) or the time to get there (194).
Vars: M_crit — mass triggering runaway gas accretion (kg); Mdot_core — planetesimal/pebble accretion rate onto core (kg/s); kappa — Envelope Opacity (m^2/kg); M_crit0 — fiducial critical mass (~10 M⊕) (kg); Mdot0 — fiducial solid accretion rate (kg/s); kappa0 — Reference Opacity (m^2/kg)
Trap: Not the final planet mass; after M_crit, KH contraction runs until gap or disk dispersal.

**199. Gravitational Focusing Factor** `Advanced`
F_g = 1 + (v_esc / v_rel)²
Use: Use inside planetesimal accretion (212). Not pebble Hill/drag capture (209-210).
Vars: F_g — cross-section enhancement (dimensionless); v_esc — escape speed from the larger body (m/s); v_rel — encounter relative speed (m/s)
Trap: vesc is from the target's surface sqrt(2GM/R), not the Hill speed.

**200. Gravitational Radius (Photoevaporation)** `Advanced`
r_g = G M_star / c_s²
Use: Use to locate EUV/X-ray disk winds and as input to 211. Not planet Hill radius or atmospheric Jeans r.
Vars: r_g — Gravitational Radius (meters); M_star — central star mass (kg); c_s — sound speed in photoionized gas (~10 km/s at 10⁴ K) (m/s)
Trap: Use T~1e4 K and mu~0.7 ionized H, not 100 K molecular-disk cs; planet Bondi uses Mp not Mstar.

**201. Hill Stability Separation** `Competition`
Delta_a_min = 2 √(3) r_Hm
Use: Use after r_Hm (207) as a two-planet crossing test. Not full N-planet chaos (~10 r_Hm) and not isolation feeding-zone width.
Vars: Delta_a_min — minimum a2−a1 for Hill stability (meters); r_Hm — Mutual Hill Radius (meters)
Trap: Circular coplanar pairs; eccentricity reduces stable Delta a; resonances can protect tighter packing.

**202. Isolation Mass** `Advanced`
M_iso = (2π Sigma a Delta_a)^(1.5) / √(M_star)
Use: Use to see if oligarchs can reach ~10 Me M_crit (195) at given Sigma and a. Not gap-opening (197-198) or M_crit itself.
Vars: M_iso — maximum oligarch mass in feeding zone (kg); Sigma — Solids Surface Density (kg/m^2); a — semi-major Axis (meters); Delta_a — annulus width (often ~10 R_H) (meters); M_star — central star mass (kg)
Trap: Supply Delta_a (often ~10 r_H); pebbles can exceed classical isolation by drifting in.

**203. Isothermal Sound Speed (Disk Gas)** `Competition`
c_s = √(k T / (μ m_p))
Use: Use for cold molecular disk gas (T~10-300 K, mu~2.3). Not adiabatic if gamma is given; not EUV wind cs (T~1e4 K, mu~0.7).
Vars: c_s — isothermal sound speed (m/s); T — gas temperature (Kelvin); mu — ≈2.3 for molecular disk gas (dimensionless); m_p — Proton Mass (kg); k — Boltzmann Constant (J/K)
Trap: mu ~2.3 not 1; do not mix cgs Boltzmann k with SI masses.

**205. Mean-Motion Resonance Location** `Competition`
a_res = a_p (p / (p + 1))^(2 / 3)
Use: Use to place Kirkwood gaps, Pluto 3:2, or migrating traps. Not Hill packing (201); not isolation feeding zones.
Vars: a_res — semi-major axis of resonant orbit (meters); a_p — semi-major axis of the perturbing planet (meters); p — integer for (p+1):p resonance (p=1 → 2:1)
Trap: This is interior first-order; exterior is a_p*((p+1)/p)^{2/3}.

**207. Mutual Hill Radius** `Competition`
r_Hm = 0.5 (a1 + a2) ((m1 + m2) / (3 M_star))^(1 / 3)
Use: Use for spacing in Hill radii and Hill-stability (201). Not Bondi rg (200); single-planet r_H if only one body.
Vars: r_Hm — Mutual Hill Radius (meters); a1 — inner planet semi-major axis (meters); a2 — outer planet semi-major axis (meters); m1 — Inner Planet Mass (kg); m2 — Outer Planet Mass (kg); M_star — central star mass (kg)
Trap: 1/3 power so mass errors barely move r_Hm; capture radius is often min(Hill, Bondi).

**208. Passive Disk Temperature (Chiang–Goldreich)** `Competition`
T = T_0 (r / r_0)^(-3 / 7)
Use: Use for T(r) when accretion heating is negligible (low Mdot, outer disk). Not planet Teq (188); not viscous-heated inner AU.
Vars: T — midplane / disk temperature at r (Kelvin); T_0 — temperature at reference radius r₀ (Kelvin); r — orbital radius (meters); r_0 — normalization radius (meters)
Trap: Passive means stellar irradiation; the same flaring makes H/r grow as r^{2/7}.

**209. Pebble Accretion Rate (2D / Hill)** `Advanced`
dM_dt = 2 Sigma_peb (r_H Omega) r_H
Use: Use when the pebble layer is thinner than r_H. Not 3D settling (210) if puffed; not planetesimal Fg (212).
Vars: dM_dt — mass growth rate (kg/s); Sigma_peb — Pebble Surface Density (kg/m^2); r_H — Planet Hill radius (meters); Omega — Keplerian Frequency (rad/s)
Trap: Isolation can be bypassed because pebbles drift in (214); still need a pebble flux.

**210. Pebble Accretion Rate (3D / Settling)** `Advanced`
dM_dt = Sigma_peb Omega r_H² √(St / α)
Use: Use when H_peb > r_H (small St or large alpha). Not 2D (209) once settled; not km-planetesimals (212).
Vars: dM_dt — mass growth rate (kg/s); Sigma_peb — Pebble Surface Density (kg/m^2); Omega — Keplerian Frequency (rad/s); r_H — Planet Hill radius (meters); St — Pebble Stokes number (dimensionless); alpha — turbulence parameter (dimensionless)
Trap: Do not mix Sigma_peb with full gas MMSN Sigma; micron dust (tiny St) is negligible.

**211. Photoevaporation Mass-Loss Rate** `Advanced`
Mdot_wind = Mdot0 √(Phi_EUV / Phi0) √(r_g / r_g0)
Use: Use for late-stage disk dispersal and transition-disk holes. Not planetary atmospheres (179 or 184).
Vars: Mdot_wind — photoevaporative mass-loss rate (kg/s); Phi_EUV — ionizing photon luminosity Φ_EUV (1/s); r_g — Gravitational Radius (meters)
Trap: Not energy-limited planetary escape; match Mdot0/Phi0/rg0 units before SI plugs.

**212. Planetesimal Accretion Growth Rate** `Advanced`
dM_dt = π R² Sigma Omega F_g
Use: Use for km-class planetesimals and oligarchs. Not pebble Hill/settling (209-210), which is faster for cm-m pebbles.
Vars: dM_dt — mass accretion rate onto protoplanet (kg/s); R — Protoplanet Radius (meters); Sigma — planetesimal (or pebble) surface density (kg/m^2); Omega — Keplerian Frequency (rad/s); F_g — gravitational focusing enhancement (dimensionless)
Trap: Sigma is solids not gas; accretion can become erosive if vrel exceeds a few times vesc.

**214. Radial Drift Velocity (Dust)** `Advanced`
v_r = -2 eta v_K / (St + 1 / St)
Use: Use for dust/pebble/boulder inspiral. Not atmospheric H from 174 to compute eta; eta comes from disk H/r (196).
Vars: v_r — radial velocity (negative = inward) (m/s); eta — ≈ (H/r)², typically ~1e-3 (dimensionless); v_K — circular orbital speed (m/s); St — dimensionless stopping time (dimensionless)
Trap: Minus sign is inward; pressure bumps reverse eta and trap pebbles.

**215. Steady Disk Accretion Rate** `Competition`
Mdot = 3π ν Sigma
Use: Use to connect alpha viscosity and Sigma to an accretion rate. Photoevaporation (211) matters when Mdot_wind ~ this Mdot.
Vars: Mdot — mass accretion rate through the disk (kg/s); nu — Kinematic Viscosity (m^2/s); Sigma — gas surface density (kg/m^2)
Trap: 3 pi assumes a steady zero-torque inner boundary; young spreading disks are not yet in this limit.

**216. Stokes Number** `Advanced`
St = t_stop Omega
Use: Use as control for radial drift (214) and 3D pebble accretion (210). Not turbulent alpha (193); not Toomre Q.
Vars: St — Stokes Number (dimensionless); t_stop — gas-drag stopping time (seconds); Omega — Keplerian Frequency (rad/s)
Trap: Epstein St proportional to size/Sigma, so the same grain has larger St in a gap.

**217. Tidal Circularization Timescale** `Advanced`
t_circ = 1 / ((21 / 2) (k2 / Q) (M_star / M_p) (R_p / a)⁵ n)
Use: Use to explain why hot Jupiters are circular while 1 AU giants are not. Not Type I/II disk migration; not tidal locking.
Vars: t_circ — e-folding time for eccentricity (seconds); k2 — degree-2 Love number (dimensionless); Q — tidal dissipation quality factor (dimensionless); M_star — Stellar Mass (kg); M_p — Planet Mass (kg); R_p — Planet Radius (meters); ...
Trap: Planet-tide e-damping for small e; circularization does not by itself shrink a.

**221. Viscous Evolution Timescale** `Advanced`
t_nu = r² / ν
Use: Use for disk lifetime vs photoevaporation or Type II. Not the dynamical time 1/Omega or atmosphere cooling time.
Vars: t_nu — characteristic viscous evolution time (seconds); r — orbital radius (meters); nu — Kinematic Viscosity (m^2/s)
Trap: Same formula as Type II; interpret as disk evolution unless a gap planet is specified. Convert to years at the end.

**222. Viscous Heating Rate (Disk)** `Advanced`
Q_plus = (9 / 4) ν Sigma Omega²
Use: Use when accretion heating, not stellar irradiation, sets midplane T. Not for passive irradiated disks (use Chiang-Goldreich T).
Vars: Q_plus — energy dissipation per unit area (W/m^2); nu — Kinematic Viscosity (m^2/s); Sigma — gas surface density (kg/m^2); Omega — Keplerian Frequency (rad/s)
Trap: The 9/4 is for Keplerian rotation only. Q_plus is W/m^2, not luminosity; integrate 2 pi r dr if you need total power.

**223. Alfvén Mach Number** `Advanced`
M_A = v / v_A
Use: Use to classify MHD flows and shocks (solar wind, jets, ISM). Not ordinary Mach number (use sound speed).
Vars: M_A — flow speed relative to Alfvén speed (dimensionless); v — plasma or shock speed (m/s); v_A — Characteristic MHD wave speed (m/s)
Trap: SI: v_A = B/sqrt(mu_0 rho) with tesla and kg/m^3. Never mix that with a CGS Alfven speed that has 4 pi.

**224. Characteristic Synchrotron Frequency** `Advanced`
nu_syn = (3 e B / (4π m_e c)) γ²
Use: Use to match an observed synchrotron peak or cooling break to B and gamma. Not cyclotron nu_c itself (boosted by ~gamma^2).
Vars: ν_syn — characteristic synchrotron frequency (Hz); B — magnetic field strength (Tesla); γ — Relativistic Lorentz factor of electron (dimensionless); e — charge of electron (C); m_e — mass of electron (kg); c — speed of light in vacuum (m/s)
Trap: Printed form has c in the denominator (CGS/gauss). SI cyclotron is eB/m_e with no c; never put tesla in a gauss formula. Thomson 6.65e-29...

**225. Cooling Break Frequency** `Advanced`
nub = (3 eB / (4π m_e c)) gammab²
Use: Use when a spectral break is from cooling, not the injection high-energy cutoff.
Vars: νb — frequency at the cooling break (Hz); B — strength of the magnetic field (Tesla); γb — Lorentz factor at the cooling break (dimensionless)
Trap: Same SI vs CGS kernel as formula 224. Compute gamma_b from cooling time first (226 and 240), then convert to frequency.

**226. Cooling Break Lorentz Factor** `Advanced`
gammab = (6π m_e c) / (σ_T B² t_age)
Use: Use to date a remnant from a cooling break. Not gamma_max (acceleration-loss balance; use Bohm limit).
Vars: γb — Lorentz factor at the cooling break (dimensionless); B — strength of the magnetic field (Tesla); t_age — age of the system (seconds)
Trap: Printed 6 pi m_e c/(sigma_T B^2 t_age) is CGS (B in gauss). SI: gamma_b = 3 m_e c mu_0/(2 sigma_T B^2 t_age) with tesla. sigma_T = 6.65e-...

**228. Gravitational-Wave Luminosity (Quadrupole, Leading Order)** `Advanced`
P_GW = (32 / 5) (G⁴ / c⁵) (M1² M2² (M1 + M2)) / a⁵
Use: Use for Hulse-Taylor, LIGO-band binaries, and merger energetics. Not isolated-pulsar spindown (use L = I omega |omega_dot|).
Vars: P_GW — gravitational-wave luminosity (W); M1 — first component mass (kg); M2 — second component mass (kg); a — orbital separation (circular approx.) (meters)
Trap: Circular-orbit only; eccentricity needs Peters factors. Crab spindown uses P ~ 33 ms and I ~ 1e38 kg m^2 (= 1e45 g cm^2), not this law.

**229. Internal Energy from Linear Period Growth** `Advanced`
E = C / t²
Use: Use only if T proportional to t is given or derived. Not isolated-pulsar spindown (use L = I omega |omega_dot|) unless connected.
Vars: E — energy at time t (J); C — C = 4π² m_star r_star²/(5α²) when T = α t and E = 4π² m_star r_star²/(5 T²) (J*s^2); t — time since linear period law reference (s)
Trap: 1e38 kg m^2 and 1e45 g cm^2 are the same NS I in SI vs CGS; never mix the unit systems.

**232. Maximum Gamma (Bohm Limit)** `Advanced`
gammamax ~ = √(6π eps / (sigmaT B xi))
Use: Use for CR/electron cutoffs in SNR, jets, GRBs when Bohm DSA is invoked. Not gamma_b (set by source age; use 226).
Vars: γmax — maximum relativistic gamma factor (dimensionless); B — strength of the magnetic field (Tesla); ξ — dimensionless efficiency parameter (dimensionless)
Trap: Printed constants look Gaussian; do not mix tesla with gauss. Rebuild from SI with sigma_T = 6.65e-29 m^2 if needed.

**233. Period Ratio from Energy Ratio (T ∝ E⁻¹/²)** `Competition`
T2_over_T1 = f^(-0.5)
Use: Use for a stated energy-fraction change without recomputing structure. Not a substitute for spindown L = I omega |omega_dot|.
Vars: T2_over_T1 — ratio of periods after/before (dimensionless); f — e.g. 0.999 if energy drops by 0.1% (dimensionless)
Trap: Type f as 0.999, not 0.1. Pulsation P ~ rho^{-1/2} is a different relation unless energy is tied to density.

**234. Power-Law Energy Spectrum** `Advanced`
N(E) = K E^(-p)
Use: Use for nonthermal CR/electron populations and to convert p into synchrotron alpha. Not the photon index itself (use 239).
Vars: N — number of particles per unit energy at energy E (particles/energy); K — constant of proportionality (varies); E — energy at which spectral density is evaluated (energy units); p — exponent describing steepness of spectrum (dimensionless)
Trap: Uncooled synchrotron: alpha = (p-1)/2. After cooling, p -> p+1 and alpha rises by 1/2. Do not confuse p (particles) with alpha (photons).

**236. Pulsar Period from Rotational vs Internal Energy** `Advanced`
T = 2π r_star √(m_star / (5 E))
Use: Use when rotational energy is set equal to internal or gravitational energy. Not the observed Crab period unless that equality is the setup.
Vars: T — Rotation Period (s); m_star — Neutron Star Mass (kg); r_star — Neutron Star Radius (m); E — energy equated to rotational KE in the problem setup (J)
Trap: 1 kg m^2 = 1e7 g cm^2, so 1e38 SI and 1e45 CGS match. Spindown is L = I omega |omega_dot| with Crab P ~ 33 ms, a different calc.

**237. Pulsar Polar Cap Angle (Dipole Order-of-Magnitude)** `Advanced`
theta_pc = √(R_star / R_LC)
Use: Use after R_LC = c/omega to estimate beam width or R_pc ~ R_star theta_pc. Not a full force-free magnetosphere.
Vars: theta_pc — half-opening angle scale (order-of-magnitude) (rad); R_star — Neutron Star Radius (meters); R_LC — Light Cylinder Radius (meters)
Trap: Result is radians (times 180/pi for degrees). NS I ~ 1e38 kg m^2 ~ 1e45 g cm^2 if spindown is also asked.

**238. Radiation Force (Thomson, Spherical Luminosity)** `Competition`
F_rad = L σ / (4π r² c)
Use: Use for radiation vs gravity, winds, dust, and setting up Eddington. Not radiation pressure on a wall (use F/c = L/(4 pi r^2 c)).
Vars: F_rad — force from photon momentum transfer (N); L — isotropic source luminosity (W); sigma — interaction cross section (e.g. Thomson) (m^2); r — radius from source (meters)
Trap: Eddington uses this sigma on ionized H (effective sigma/m per proton). L in W, sigma in m^2, r in m.

**239. Spectral Index** `Advanced`
α = (p - 1) / 2
Use: Use to read p from a measured slope, or predict radio slopes from DSA p. Not for thermal spectra or optically thick synchrotron.
Vars: α — spectral index of flux density (dimensionless); p — power-law index of particle spectrum (dimensionless)
Trap: This alpha is not disk viscosity alpha or fine-structure alpha. After cooling replace p by p+1.

**242. Accretion Luminosity (L = G M ṁ / R)** `Competition`
L = G M m_dot / R
Use: Use for WD/NS accretion when no efficiency is quoted. For black holes use L = eta m_dot c^2 with eta ~ 0.1 (no hard surface).
Vars: L — accretion luminosity (W); G — Gravitational Constant (m^3/(kg*s^2)); M — Accretor Mass (kg); m_dot — mass accretion rate (kg/s); R — radius of accretor (m)
Trap: Not fusion L ~ epsilon c^2 m_dot and not main-sequence L ~ M^3 to M^4. Efficiency epsilon < 1 is a later formula (262).

**243. Adiabatic Gradient (Ideal Gas, ∇_ad)** `Competition`
nabla_ad = (gamma_gas - 1) / gamma_gas
Use: Use with Schwarzschild: convection if nabla_rad > nabla_ad. Not the Cepheid radius-temperature coupling gamma.
Vars: nabla_ad — adiabatic d ln T / d ln P (dimensionless); gamma_gas — ratio of specific heats C_p/C_v (dimensionless)
Trap: gamma_gas is C_P/C_V. Sound speeds: adiabatic sqrt(gamma k T/mu), isothermal sqrt(k T/mu).

**244. Average Stellar Temperature** `Competition`
T_avg ∝ G M μ m_H / (k R)
Use: Use for order-of-magnitude mean/central T from M and R. Not a precise central-T solver, and not the mass-luminosity relation.
Vars: T_avg — average temperature throughout the star (Kelvin); G — newton's gravitational constant (m^3/(kg*s^2)); M — total mass of the star (kg); R — radius of the star (meters); μ — average mass per particle in units of hydrogen mass (dimensionless); m_H — mass of hydrogen atom (kg); ...
Trap: Here mu is dimensionless times m_H; some virial cards use mu in kg. Prefactors 3/10 or 1/5 depend on structure. MS is L ~ M^3.5, a differ...

**245. Binary Mass Ratio from Velocity Amplitudes** `Competition`
M_1 / M_2 = K_2 / K_1
Use: Use for double-lined (SB2) systems when both K's are measured. Not for single-lined systems (those give only a mass function).
Vars: M₁ — mass of primary star (kg); M₂ — mass of secondary star (kg); K₁ — semi-amplitude of radial velocity for primary star (m/s); K₂ — semi-amplitude of radial velocity for secondary star (m/s)
Trap: Do not swap indices: larger K belongs to smaller mass. Inclination cancels in the ratio. Eccentric orbits need (1-e^2) in the mass function.

**247. Central Pressure (Approximate)** `Competition`
P_c ∝ G M² / R⁴
Use: Use to estimate P_c from M and R, or compare MS/WD/NS. Not a precision stellar-model output.
Vars: P_c — pressure at stellar center, central pressure (Pa); G — newton's gravitational constant (m^3/(kg*s^2)); M — total mass of the star (kg); R — radius of the star (meters)
Trap: Uniform-sphere prefactors (e.g. 2 pi/3) only if quoted. This scaling does not say whether gas, radiation (1/3 a T^4), or degeneracy P = K...

**248. Convection Criterion (Schwarzschild Criterion)** `Advanced`
|dT / dr|_actual > |dT / dr|_adiabatic
Use: Use to choose radiative vs convective transport. Not Ledoux unless composition (mu) gradients are mentioned.
Vars: dT/dr — rate of temperature change with radius, temperature gradient (K/m)
Trap: Compare nabla = d ln T / d ln P, not raw dT/dr. Radiative gradient is formula 282.

**249. Energy Generation (Luminosity Gradient)** `Competition`
dL_dr = 4π r² ρ epsilon_gen
Use: Use with hydrostatic balance, mass continuity, and energy transport. Integrate through the core for surface L.
Vars: dL_dr — luminosity gradient with radius (W/m); r — radial coordinate (meters); rho — mass density (kg/m^3); epsilon_gen — power released per unit mass (nuclear) (W/kg)
Trap: Main-sequence L ~ M^{3.5} is a global result, not a substitute for this local law. epsilon often ~ rho T^nu. Pair with dM/dr = 4 pi r^2 rho.

**252. Fractional Luminosity Amplitude from Radius-Temperature Coupling** `Advanced`
L_frac = (2 - 4 γ) R_frac
Use: Use to convert fractional radius amplitude into light amplitude for Cepheids/RR Lyrae. Not the Cepheid PL mean M_V (273/274).
Vars: L_frac — Fractional Luminosity Amplitude (dimensionless); gamma — radius-Temperature Coupling (dimensionless); R_frac — Fractional Radius Amplitude (dimensionless)
Trap: This gamma is the T-R coupling, not C_P/C_V. Magnitude variation uses (4 gamma - 2) because mag is minus log flux.

**256. Isothermal Scale Height** `Competition`
H = k_B T / (m g)
Use: Planetary atmospheres, photospheres, and P(z)=P0 exp(-z/H). Not for disks without replacing g (use H=c_s/Omega).
Vars: H — characteristic vertical pressure/density scale height (m); k_B — Boltzmann Constant (J/K); T — atmospheric temperature (K); m — mean particle mass (kg); g — gravitational acceleration (m/s^2)
Trap: m is particle mass in kg; if mu is dimensionless, H = kT/(mu m_H g).

**257. Kelvin–Helmholtz Growth Rate (Shear Scaling)** `Advanced`
gamma_KH = k dv
Use: Shear at cloud-wind, jet, or disk interfaces. Not the stellar KH thermal time (use U/L), and not Rayleigh-Taylor (use sqrt(g k)).
Vars: gamma_KH — shear instability growth rate (Hz); k — spatial wavenumber (rad/m); dv — velocity difference across interface (m/s)
Trap: k=2pi/lambda; this KH is shear, not contraction time t=U_bind/L.

**258. Kelvin–Helmholtz Time from Binding Energy** `Competition`
t = U_bind / L
Use: When |U| is handed to you. Not shear KH (use k dv) and not nuclear t=E_nuc/L.
Vars: t — KH / thermal time (s); U_bind — |E_grav| or model-specific binding energy (positive) (J); L — power radiated (W)
Trap: Virial 2K+U=0 implies some texts use |U|/(2L); apply 1/2 only if asked.

**259. Kelvin–Helmholtz Timescale (general G M² / R L)** `Competition`
t = G M² / (R L)
Use: PMS contraction and historical Sun-age. Not shear KH (use k dv). If uniform-sphere |U| is given, use 3/5 (or 3/10 for |E_total|/L).
Vars: t — KH timescale (convert to years: ÷ 3.156e7) (s); G — Gravitational Constant (m^3/(kg*s^2)); M — stellar mass (kg); R — stellar radius (m); L — luminosity (W)
Trap: Same algebra as formula 289; virial 2K+U=0 implies E_total=U/2=-K.

**260. Keplerian Breakup Angular Speed (Massive Sphere)** `Competition`
omega_k = √(G M / R³)
Use: Max-spin check for NS, WD, stars, planets; P_min=2pi/Omega_k. Not the light-cylinder radius (use R_LC=c/Omega).
Vars: omega_k — Keplerian / breakup-scale rotation rate (rad/s); G — Gravitational Constant (m^3/(kg*s^2)); M — stellar / remnant mass (kg); R — equatorial radius (meters)
Trap: Ignores oblateness (true breakup is slower); I ~ 10^38 kg m^2 ~ 10^45 g cm^2 if you need (1/2)I Omega^2.

**261. Luminosity from Fusion Mass-Loss Rate** `Competition`
L = ε c² m_dot
Use: Fused mass per year to power, or invert for burn rate. Not gravitational accretion (use L=G M m_dot/R).
Vars: L — power output (W); epsilon — fraction of mass defect to energy (~0.007 for H→He order-of-magnitude; use problem value); c — speed of Light (m/s); m_dot — Mass Fusion Rate (kg/s)
Trap: m_dot is mass fused, not a wind; later stages have smaller epsilon.

**262. Luminosity from Infalling Matter** `Competition`
L = ε G M m_dot / R
Use: Accretion or meteoric Sun-power problems. Not fusion (use epsilon c^2 m_dot). BH disks use epsilon~0.06-0.4 times m_dot c^2.
Vars: L — generated luminosity (W); epsilon — fraction of GPE converted to radiation (dimensionless); G — Gravitational Constant (m^3/(kg*s^2)); M — Central Mass (kg); m_dot — Mass Infall Rate (kg/s); R — radius of star (m)
Trap: Here epsilon multiplies G M/R, not rest mass; exams sometimes omit epsilon and assume 1.

**263. Magnitude Variation for Pulsation (First Order)** `Advanced`
delta_M = (4 γ - 2) R_amp cos(ω t + φ)
Use: Sketch a light curve from a radius curve, or phase vs radius. Not Cepheid PL mean brightness (use 273/274) and not a hydro code.
Vars: delta_M — first-order magnitude variation (mag); gamma — radius-Temperature Coupling (dimensionless); R_amp — Fractional Radius Amplitude (dimensionless); omega — Angular Frequency (rad/s); t — time (s); phi — phase offset (rad)
Trap: gamma is R-T coupling, not C_P/C_V; (4 gamma-2) has the magnitude sign flip.

**264. Mass Continuity (Spherical Shell)** `Competition`
dM_dr = 4π r² ρ
Use: One of the four stellar-structure equations; convert rho(r) to M(r). Not disks (use surface density Sigma).
Vars: dM_dr — mass gradient with radius (kg/m); r — radial coordinate (meters); rho — mass density at r (kg/m^3)
Trap: Pair with dP/dr=-G M rho/r^2 and dL/dr=4 pi r^2 rho epsilon; rho in kg/m^3.

**265. Mass Loss Rate (General Form)** `Competition`
Mdot ∝ L / (v_w c)
Use: Hot-star and Wolf-Rayet winds. Not the Sun's thermal/Alfven wind, and not fusion m_dot in L=epsilon c^2 m_dot.
Vars: Ṁ — rate of mass loss, mass loss per unit time (kg/s); L — stellar luminosity (W); v_w — velocity of stellar wind (m/s); c — speed of light in vacuum (m/s)
Trap: Scaling, not full CAK; convert kg/s to Msun/yr to compare.

**266. Nebula Age from Expansion** `Competition`
t = r / v
Use: Planetary nebulae, free-expansion SNRs, nova shells from angular size plus spectroscopy. Not decelerated Sedov (use t=(2/5)r/v) and not T...
Vars: t — age of the nebula (seconds); r — current radius of the nebula (meters); v — expansion velocity of nebula (m/s)
Trap: r in m, v in m/s, then convert seconds to years; r = theta d with theta in radians.

**267. Non-Relativistic Degeneracy Pressure Scaling (P ∝ ρ⁵/³)** `Competition`
P = K_nr ρ^(5 / 3)
Use: Brown-dwarf interiors and low-mass WD cores. Not relativistic (use P=K_r rho^{4/3}, Chandrasekhar ~1.4 Msun) and not ideal gas n k T.
Vars: P — degeneracy pressure (Pa); rho — mass density (kg/m^3); K_nr — problem-specific or from textbook (SI composite)
Trap: K_nr depends on h, m_e, mu_e; Type Ia occurs when an accreting WD nears Chandrasekhar.

**268. Nuclear Energy Generation Rate (General)** `Advanced`
eps ∝ ρ T^ν
Use: Compare burning regimes or how epsilon changes if T rises 10%. Not late-stage neutrino-loss epsilon unless specified.
Vars: ε — energy generation rate per unit mass, nuclear burning rate (W/kg); ρ — mass density (kg/m^3); T — temperature (Kelvin); ν — temperature dependence exponent, varies with reaction type (dimensionless)
Trap: Density is linear here except three-body rates; plug into dL/dr=4 pi r^2 rho epsilon.

**269. Nuclear Fusion Mass Defect** `Competition`
E = Δm c²
Use: Energy per reaction or total nuclear fuel. Not the KH gravitational reservoir G M^2/R.
Vars: E — energy released from fusion reaction (J); Δm — mass difference, mass lost in reaction (kg); c — speed of light in vacuum (m/s)
Trap: Delta m in kg for E in J; M_fuel is the burnable core fraction, not the whole star.

**270. Opacity (General Relation)** `Competition`
κ = σ / m
Use: Convert Thomson or dust cross sections for optical depth and radiative gradients.
Vars: κ — opacity, mass absorption coefficient (m^2/kg); σ — interaction cross-section, scattering cross-section (m^2); m — mass of interacting particle (kg)
Trap: 1 m^2/kg = 10 cm^2/g; never mix SI and CGS. Kramers kappa ~ kappa_0 rho T^{-3.5}; electron scattering is ~constant.

**272. Orbital Decay Rate (Gravitational Radiation)** `Advanced`
da / dt = - (64 / 5) (G³ / c⁵) (M_1 M_2(M_1 + M_2) / a³)
Use: Compact-binary merger times and Hulse-Taylor. Not isolated-pulsar EM spindown (use L=I omega |omega_dot|).
Vars: da/dt — rate of change of semi-major axis, negative for decay (m/s); G — newton's gravitational constant (m^3/(kg*s^2)); c — speed of light in vacuum (m/s); M₁ — mass of first object (kg); M₂ — mass of second object (kg); a — orbital separation, semi-major axis (meters)
Trap: Circular only; eccentric binaries decay faster. SI: a in m, masses in kg, da/dt in m/s.

**275. Photon Diffusion Time (τ, Slab Scale)** `Advanced`
t_diff = τ R / c
Use: SN light-curve rise and photon escape from interiors. Not free-fall or KH time. Type Ia peak uses t_peak=sqrt(kappa M/(c v)).
Vars: t_diff — photon diffusion timescale (s); tau — effective optical depth through ejecta (dimensionless); R — characteristic thickness or radius (meters)
Trap: Some texts write t=R^2/(l c) or (3 tau R)/c; same scaling, O(1) factors.

**276. Photospheric Gas Pressure from Optical Depth** `Advanced`
P_gas = g τ / κ
Use: Atmosphere outer BC from log g and Rosseland kappa. Not central pressure (use ~G M^2/R^4).
Vars: P_gas — gas pressure at optical depth tau (Pa); g — gravitational acceleration (m/s^2); tau — optical depth, often 2/3 at photosphere (dimensionless); kappa — rosseland opacity or mass absorption coefficient (m^2/kg)
Trap: kappa in m^2/kg, P in Pa, g=GM/R^2; Kramers kappa~kappa_0 rho T^{-3.5} makes P implicit.

**277. Post-Shock Temperature (Strong Adiabatic, γ = 5/3)** `Advanced`
T = 3 μ m_H v_s² / (16 k_B)
Use: Molecular-cloud, SNR, and jet shocks if Mach is large. Not a radiative downstream equilibrium T, and not weak shocks (use full Rankine-Hu...
Vars: T — approximate immediate post-shock T (K); mu — e.g. ~2.3 for molecular gas (dimensionless); v_s — shock velocity in lab/frame of cold gas (m/s); m_H — use proton mass ~ m_H (kg); k_B — Boltzmann Constant (J/K)
Trap: v_s in m/s not km/s; mu here is dimensionless times m_H.

**279. Radial Pulsation Period Scaling** `Competition`
P = √(R³ / (G M))
Use: How P scales with M and R, or Mira/Cepheid dimensional analysis. Not a precise solar p-mode frequency.
Vars: P — characteristic radial pulsation period (s); R — stellar radius (m); G — Gravitational Constant (m^3/(kg s^2)); M — stellar mass (kg)
Trap: Missing 2pi and structure factors; P proportional to rho^{-1/2} is the density form. Do not equate numerically to t_ff.

**281. Radiation Transport Equation (Intensity Change)** `Advanced`
dI_nu / ds = -kappa_nu ρ I_nu + j_nu ρ
Use: Formal solutions, optically thin emission, or thick LTE (I->S~Planck). Not the travel time (use t_diff~tau R/c).
Vars: I_ν — radiation intensity per unit frequency and solid angle (W/(m^2*Hz*sr)); κ_ν — opacity at frequency ν, mass absorption coefficient (m^2/kg); ρ — mass density (kg/m^3); j_ν — emission coefficient, emissivity per unit mass (W/(kg*Hz*sr)); s — distance along radiation path (meters)
Trap: Frequency-dependent; kappa is per mass -- do not drop rho.

**282. Radiative Transport Temperature Gradient** `Advanced`
dT(r) / dr = - (3 κ(r)ρ(r)L(r)) / (16π acr² T³(r))
Use: nabla_rad for the Schwarzschild test. If |dT/dr|_rad exceeds adiabatic, convection carries the flux instead.
Vars: dT/dr — rate of temperature change with radius, temperature gradient (K/m); κ — mass absorption coefficient, opacity at radius r (m^2/kg); ρ — mass density at radius r (kg/m^3); L — luminosity at radius r, energy flux (W); a — radiation density constant, a = 4σ/c (J/(m^3*K^4)); c — speed of light in vacuum (m/s); ...
Trap: This is dT/dr, not nabla=d ln T/d ln P; a=4 sigma/c is the radiation constant.

**283. Radius Change from Flux Change (Pulsating Star)** `Competition`
R_2 / R_1 = √(F_2 / F_1)
Use: Only if the problem holds T fixed. Otherwise use the (2-4 gamma) coupling (formula 263/252). Not Cepheid PL mean light.
Vars: R₂ — radius at maximum or time 2 (meters); R₁ — radius at minimum or time 1 (meters); F₂ — flux at maximum or time 2 (W/m^2); F₁ — flux at minimum or time 1 (W/m^2)
Trap: F is Earth flux if distance is fixed; cooling during expansion reduces flux below pure geometry.

**284. Rayleigh–Taylor Growth Rate (Inviscid Scaling)** `Advanced`
gamma_RT = √(g k)
Use: SNR mixing and PWN filaments. Not Kelvin-Helmholtz shear (use gamma_KH~k dv) and not the Schwarzschild test.
Vars: gamma_RT — instability growth rate (1/s) (Hz); g — effective gravity / acceleration at interface (m/s^2); k — spatial wavenumber (2π/λ) (rad/m)
Trap: k=2pi/lambda; g may be gravity or a decelerating-shell acceleration.

**285. Stellar Mass from Central Temperature (General)** `Competition`
M ∝(T_c² / (rho_c G³))^(1 / 2)
Use: Dimensional mass vs central conditions. Prefer T~G M mu/(k R) plus rho~M/R^3 if you need a derivable form.
Vars: M — total mass of the star (kg); T_c — temperature at stellar center (Kelvin); ρ_c — density at stellar center (kg/m^3); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: Printed exponents are problem-specific; MS L~M^{3.5} is a separate transport-plus-burning relation.

**286. Stellar Pulsation Mechanics (Radial Oscillations)** `Competition`
d² xi(r, t) / dt² = - (1 / ρ(r)) grad P' - grad Phi'
Use: Governing-equation reminder for Cepheid/RR Lyrae/Mira, not a plug-in calculator. For numbers use P proportional to rho^{-1/2}.
Vars: ξ — radial displacement of a shell at radius r and time t (meters); r — radial distance from stellar center (meters); t — time (seconds); ρ — mass density at radius r (kg/m^3); P' — pressure perturbation from equilibrium, pressure variation (Pa); Φ' — gravitational potential perturbation, potential variation (m^2/s^2)
Trap: kappa-mechanism drives modes in ionization zones; gamma in amplitude formulas is R-T coupling, not this xi.

**287. Supernova Luminosity (Kinetic ÷ Diffusion Scaling)** `Advanced`
L_SN = E_kin / t_diff
Use: Exam scaling of brightness vs ejecta energy and trapping. Not a full Arnett curve; CC SNe may be recombination- or Ni-56-powered instead.
Vars: L_SN — emergent luminosity scale (W); E_kin — ejecta kinetic energy scale (J); t_diff — photon escape / diffusion time (s)
Trap: t_diff=tau R/c; Ni-56 decay often powers the actual watts -- this is a leak-rate scale.

**288. Temperature from Luminosity and Radius (Solar Units)** `Competition`
T = 5778 (L_ratio⁰.25) / (R_ratio⁰.5)
Use: L and R already in solar units (PMS tracks, giants). Not interior T (use virial G M mu/(k R)).
Vars: T — effective temperature (K); L_ratio — luminosity in solar units (dimensionless); R_ratio — radius in solar units (dimensionless)
Trap: L_ratio and R_ratio are dimensionless solar units, not W and m; use bolometric L (apply BC if needed).

**289. Thermal Time (Kelvin-Helmholtz, general scaling)** `Competition`
t_KH = G M² / (R L)
Use: Contraction and thermal adjustment vs t_ff and t_nuc. If binding energy is given, use t=U_bind/L. Not shear KH (use k dv).
Vars: t_KH — kelvin-Helmholtz timescale, thermal timescale (seconds); G — newton's gravitational constant (m^3/(kg*s^2)); M — total mass of the star (kg); R — radius of the star (meters); L — stellar luminosity (W)
Trap: No 3/10 baked in; virial 2K+U=0 so some books use (3/10) G M^2/(R L) for a uniform sphere.

**291. Type Ia Peak Time (Photon Diffusion Scaling)** `Advanced`
t_peak = √(κ M / (c v))
Use: SN Ia rise-time scaling. Not a full Arnett light curve, and not core-collapse recombination photospheres.
Vars: t_peak — characteristic rise/peak timescale (s); kappa — rosseland-mean or effective opacity (m^2/kg); M — ejecta mass scale (kg); c — speed of Light (m/s); v — homologous expansion velocity (m/s)
Trap: This times the peak; Ni-56 decay powers the watts. O(1) random-walk prefactors can shift t_peak by ~2.

**292. Virial Temperature (Gas Cloud)** `Competition`
T_vir = G M μ / (5 k_B R)
Use: Star-forming clouds, halo gas, and order-of-magnitude stellar interior T. Clouds much colder cannot support themselves thermally.
Vars: T_vir — equilibrium temperature (K); G — Gravitational Constant (m^3/(kg*s^2)); M — total mass of cloud (kg); mu — mean mass per particle μ (kg); k_B — Boltzmann Constant (J/K); R — radius of cloud (m)
Trap: On this card mu is mean particle mass in kg, not dimensionless; if given dimensionless mu, multiply by m_H.

**293. Virial Velocity Dispersion** `Competition`
sigma_vir = √(G M / (5 R))
Use: Estimate random motions from M and R, or invert for virial mass; not for rotating disks (use a rotation curve) and not M = 3 sigma^2 R / ...
Vars: sigma_vir — Virial Velocity Dispersion (m/s); G — Gravitational Constant (m^3/(kg*s^2)); M — Cloud Mass (kg); R — Cloud Radius (m)
Trap: Factor 5 here vs factor 3 in 322 are different potential models.

**294. κ-Mechanism (Mira-Type Stars)** `Advanced`
deltakappa / κ > 0 during compression
Use: Explain why Cepheids, RR Lyrae, and Miras pulsate; not a period-luminosity formula and not the epsilon-mechanism.
Vars: κ — mass absorption coefficient, opacity (m^2/kg); δκ — change in opacity due to compression/expansion (m^2/kg)
Trap: Qualitative inequality, not a numerical period.

**295. Boltzmann Equation (Level Population Ratio)** `Competition`
N_2 / N_1 = (g_2 / g_1) exp(-(E_2 - E_1) / kT)
Use: Relative level populations and line strength vs T; not ionization fractions (use Saha 305).
Vars: N_2 — number of atoms in upper energy level (dimensionless); N_1 — number of atoms in lower energy level (dimensionless); g_2 — statistical weight, degeneracy of upper level (dimensionless); g_1 — statistical weight, degeneracy of lower level (dimensionless); E_2 — energy of upper level (J); E_1 — energy of lower level (J); ...
Trap: LTE assumed; Saha is the ionization sibling.

**296. Bremsstrahlung Luminosity (Thermal Bremsstrahlung)** `Advanced`
L_br ∝ n_e n_i T^(1 / 2) V
Use: X-ray cluster gas, SNRs, hot H II continuum; not line cooling, synchrotron, or stellar photospheres.
Vars: L_br — luminosity from bremsstrahlung radiation (W); n_e — number density of free electrons (m⁻^3); n_i — number density of ions (m⁻^3); T — temperature of the plasma (Kelvin); V — volume of emitting region (m^3)
Trap: Scaling only; cgs emissivity ~1.4e-27 n_e n_i T^{1/2} Z^2 g_ff.

**297. Column Density** `Reference`
N = integral of n ds
Use: Convert absorption or extinction into how much stuff is in front; not a volume density.
Vars: N — number of particles per unit area, column density (m⁻^2); n — number density of particles (m⁻^3); s — distance along line of sight (meters)
Trap: Match the species (HI, H2, e-, dust) to the tracer.

**298. Dust-to-Gas Mass Ratio (General)** `Reference`
M_dust / M_gas ~ = 0.01
Use: Convert gas <-> dust in MW-like conditions; not metal-poor systems (use 303, M_dust proportional to M_gas * Z).
Vars: M_dust — mass of interstellar dust (kg); M_gas — mass of interstellar gas (kg)
Trap: Mass ratio, not number-density ratio; Z_sun ~ 0.014.

**299. Einstein Coefficient (Spontaneous Emission)** `Advanced`
A_21 = (64π⁴ ν³ / (3 c³)) |mu_21|²
Use: Radiative lifetimes t ~ 1/A, critical densities, permitted vs forbidden; not Boltzmann (295) or Saha (305).
Vars: A_21 — spontaneous emission rate, transition probability (s⁻¹); ν — frequency of emitted photon (Hz); μ_21 — transition dipole moment, matrix element (C*m); c — speed of light in vacuum (m/s)
Trap: Do not mix SI dipole units with a cgs prefactor.

**301. Gas Kinetic Temperature** `Competition`
T_kin = (2 / 3) (E_kin / k)
Use: Convert mean kinetic energy to T; not excitation T (Boltzmann) or ionization T (Saha) unless LTE.
Vars: T_kin — kinetic temperature from thermal motion (Kelvin); E_kin — average kinetic energy per particle (J); k — Boltzmann Constant (J/K)
Trap: Line FWHM includes turbulence, so a width-to-T_kin conversion is an upper bound.

**302. Magnetic Flux (Flux Freezing)** `Advanced`
Phi_B = B A = constant
Use: Collapsing clouds and flux tubes; not when resistivity, reconnection, or ambipolar diffusion lets field slip, and not a vacuum dipole.
Vars: Φ_B — magnetic flux, magnetic field times area (Wb); B — magnetic field strength (Tesla); A — area perpendicular to magnetic field (m^2)

**303. Mass of Interstellar Dust (Approximate)** `Competition`
M_dust ∝ M_gas Z
Use: Rescale dust/gas away from solar Z; not treating Z itself as a dust-to-gas ratio (use 298 for MW ~0.01).
Vars: M_dust — total mass of interstellar dust (kg); M_gas — total mass of interstellar gas (kg); Z — metallicity, abundance of heavy elements (dimensionless)
Trap: Z_sun ~ 0.014; not all metals are in grains.

**304. Recombination Time** `Competition`
t_rec = 1 / (n α)
Use: Fossil H II regions and ionization clocks; same alpha as Stromgren (307); not free-fall, cooling, or Saha.
Vars: t_rec — characteristic recombination timescale (seconds); n — number density of particles (m⁻^3); α — recombination rate coefficient (m^3/s)
Trap: Case B inside nebulae; case A if Lyman continuum is optically thin.

**305. Saha Equation (Ionization Fraction)** `Advanced`
N_ion / N_neutral = (2 / n_e) (2π m_e k T / h²)^(3 / 2) exp(-χ / kT)
Use: Which ion dominates a photosphere, and why H lines weaken in O stars; not level ratios within one ion (use Boltzmann 295).
Vars: N_ion — number of ionized atoms (dimensionless); N_neutral — number of neutral atoms (dimensionless); n_e — number density of free electrons (m⁻^3); m_e — mass of electron (kg); k — Boltzmann Constant (J/K); T — temperature (Kelvin); ...
Trap: LTE Saha fails in nebulae, where photoionization not collisions set ionization.

**306. Sound Speed in a Gas** `Competition`
c_s = √(γ k T / (μ m_H))
Use: Mach numbers, Jeans, disk scale height, Bondi, Toomre; not galaxy rotation or velocity dispersion.
Vars: c_s — speed of sound in the gas (m/s); gamma — ratio of specific heats (γ=1 isothermal; ~1.4 diatomic); k — Boltzmann Constant (J/K); T — gas temperature (Kelvin); mu — mean mass per particle in units of m_H (~2.3 molecular H₂/He); m_H — proton / hydrogen atom mass (kg)
Trap: mu ~ 0.6 ionized, ~2.3 molecular; isothermal shortcut is gamma=1.

**307. Strömgren Radius (Size of H II Region)** `Competition`
R_S = (3 N_ion / (4π n² α))^(1 / 3)
Use: Size an H II region from Q and ambient n; not density-bounded leaky nebulae or expanding bubbles.
Vars: R_S — radius of HII region, Strömgren sphere radius (meters); N_ion — rate of ionizing photons emitted (s⁻¹); n — number density of atoms (m⁻^3); α — recombination rate coefficient (m^3/s)
Trap: Same case-B alpha as 304; dust inside shrinks R_S.

**308. Thermal Energy of a Cloud** `Competition`
E_thermal = (3 / 2) N k T
Use: Energy budgets vs gravity; N is particle number (N = M/(mu m_H)), not density; not photon gas (T^4) or degenerate electrons.
Vars: E_thermal — total thermal energy of the cloud (J); N — total number of particles in cloud (dimensionless); k — Boltzmann Constant (J/K); T — temperature of the cloud (Kelvin)
Trap: Exams almost always keep 3/2 even for diatomic gas.

**309. Total Mass of a Cloud (General)** `Competition`
M = integral of ρ dV
Use: Turn a density model into a mass; not a collapse criterion (use Jeans or virial).
Vars: M — total mass of the cloud (kg); ρ — mass density (kg/m^3); V — volume of the cloud (m^3)
Trap: rho is mass density, not number density n.

**310. Zeeman Splitting (Approximate)** `Competition`
Δλ = 4.7e-13 λ_0² B
Use: Convert a measured line split into B; not flux-freezing (302) and not Doppler broadening.
Vars: delta_lambda — observed splitting of line (Angstrom); lambda_0 — rest wavelength of the line (Angstrom); B — Magnetic Field Strength (Gauss)
Trap: Not SI: do not insert Tesla or meters; radio lines usually quote Hz.

**311. Alfvén Speed (SI, ideal MHD)** `Competition`
v_A = B / √(μ_0 ρ)
Use: Magnetic support, MHD wave times, jets; compare with c_s for plasma beta; not the cgs form mixed with mu_0.
Vars: v_A — alfvén velocity (m/s); B — Magnetic Field (Tesla); rho — plasma mass density (kg/m^3); mu_0 — permeability of free space (N/A^2)
Trap: SI B in Tesla (1 G = 1e-4 T); CGS is B/sqrt(4 pi rho); never mix.

**312. Bondi–Hoyle Accretion Rate (γ = 5/3)** `Advanced`
Mdot = π G² M² ρ / (c_s³)
Use: Stationary compact object in hot still ISM; if moving, use Bondi-Hoyle-Lyttleton with c_s^2+v_rel^2; not thin-disk alpha or Eddington.
Vars: Mdot — mass accretion rate (γ = 5/3, λ = 1/4) (kg/s); M — accretor mass (kg); rho — gas density far from accretor (kg/m^3); c_s — isothermal sound speed of ambient gas (m/s)
Trap: Do not mix isothermal lambda~1.12 with this pi prefactor.

**313. Crossing Time (Dynamical Time)** `Competition`
t_cross = R / σ
Use: Dynamical clock for clusters and galaxies, and the building block of relaxation (327); for disks prefer 2 pi R / v_rot; not a relaxation ...
Vars: t_cross — time to cross system, dynamical time (seconds); R — characteristic radius of system (meters); σ — Velocity Dispersion (m/s)
Trap: Match R to the same definition used for sigma (half-mass, core, R_200 are not interchangeable).

**314. Dark Matter Density Profile (General NFW Form ρ ∝ r⁻¹)** `Advanced`
rho_DM ∝ r^(-1)
Use: Order-of-magnitude density near a halo center; not the outer r^{-3}, and not a baryonic exponential disk (324).
Vars: ρ_DM — dark matter density at radius r (kg/m^3); r — distance from halo center (meters)
Trap: Exam sheet: NFW inner slope -1, outer -3; dwarfs sometimes prefer cores.

**315. Dark Matter Mass Fraction (Approximate in a Halo)** `Advanced`
f_DM = M_DM / (M_DM + M_baryon) ~ = 0.9
Use: Halo-scale mass budgets; not the inner few kpc of a spiral (baryons can dominate) and not globular clusters.
Vars: f_DM — fraction of mass in dark matter (dimensionless); M_DM — mass in dark matter (kg); M_baryon — mass in baryonic matter (stars, gas) (kg)
Trap: Dwarfs can be even more dark-matter dominated.

**317. Galaxy Rotation Velocity (Non-Keplerian)** `Competition`
v_rot = √(G M(r) / r)
Use: Interpret rotation curves; a flat v requires M(r) proportional to r; not a single central total mass; inverse is 321.
Vars: v_rot — orbital velocity in galaxy, rotation speed (m/s); M(r) — total mass within radius r, including dark matter (kg); r — distance from galactic center (meters); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: Assumes circular orbits in a spherical (or well-averaged) potential.

**318. Gravitational Potential (General)** `Competition`
Phi = -G M / r
Use: Exterior potentials, specific energy, weak-field escape; not inside a uniform sphere (harmonic) and not NFW or exponential-disk Phi.
Vars: Φ — gravitational potential energy per unit mass (J/kg); M — mass creating the potential (kg); r — distance from mass (meters); G — newton's gravitational constant (m^3/(kg*s^2))
Trap: Phi is J/kg, not U in J; Newtonian form is invalid near a BH horizon.

**319. Jeans Length (Gravitational Stability)** `Competition`
lambda_J = √(π c_s² / (G ρ))
Use: Fragmentation of molecular clouds; not a rotating disk (use Toomre 325); use Jeans mass ~ rho lambda_J^3 for fragment mass.
Vars: λ_J — critical length for gravitational instability (meters); c_s — sound speed in the gas (m/s); G — newton's gravitational constant (m^3/(kg*s^2)); ρ — mass density (kg/m^3)
Trap: Normalizations (sqrt(pi) vs 2 pi) differ by O(1); match the sheet.

323. Schwarzschild Radius for SMBH (Same Form) = 157. R_s = 2 G M_BH / c²

**327. Two-Body Relaxation Time** `Advanced`
t_relax ∝(N / ln N) t_cross
Use: Decide collisional (globulars) vs collisionless (galaxies); compare with age; not t_cross (313) alone as a relaxation time.
Vars: t_relax — two-body relaxation timescale (seconds); N — number of stars in system (dimensionless); t_cross — dynamical crossing time (seconds)
Trap: ln N ~ 10 for globulars; galaxies still evolve by mergers and friction, not two-body.

**328. Velocity Dispersion (General)** `Competition`
σ² = <(v - <v>)²>
Use: Input to virial masses (293, 322), Faber-Jackson (316), M-sigma (320), t_cross (313), and Toomre (325); not substituting v_rot for sigma ...
Vars: σ — velocity dispersion, spread in velocities (m/s); v — individual particle velocity (m/s)
Trap: Subtract measurement error in quadrature; thermal Doppler is the microscopic version.

331. Doppler Shift Wavelength Ratio = 162. Δλ / λ = v / c

**333. Light Travel Time** `Reference`
t = d / c
Use: Ranging, pulsar timing, Romer delays, nearby lookback; not cosmological lookback at high z and not redshift (use 331/338).
Vars: t — light-crossing time (s); d — path length in vacuum (m); c — speed of Light (m/s)
Trap: Recombination and optical-depth times (304, 339) are interaction clocks, not light-travel clocks.

**336. Stellar Activity Index (R'_HK)** `Reference`
R'_HK ∝ F_core / F_bolo
Use: Magnetic activity, gyrochronology, RV-jitter flag; not bolometric luminosity and not a sunspot filling factor.
Vars: R'_HK — activity index, measure of chromospheric activity (dimensionless); F_core — flux in calcium H and K lines (W/m^2); F_bolo — total bolometric flux (W/m^2)
Trap: Ca H and K at 3934, 3968 A, not H-alpha; M dwarfs often use H-alpha or X-rays.

338. Velocity from Doppler Wavelength Shift = 162. v = c(Δλ / λ)

**339. Optical Depth for Scattering** `Competition`
tau_sc = N sigma_sc
Use: Electron or dust scattering, thin vs thick; general absorption is integral kappa rho ds; not a physical thickness in meters.
Vars: τ_sc — optical depth for scattering (dimensionless); N — number of particles per unit area (m⁻^2); σ_sc — scattering cross-section per particle (m^2)
Trap: Photosphere is tau of order 1 (exams) or 2/3 (Eddington).

**341. Illuminated Area vs Phase (φ = 0 Dark, Between Star and Observer)** `Competition`
A = π R² sin(π φ)
Use: Only when phi=0 is dark/new (planet between star and observer); sibling uses A = pi R^2 cos(pi phi) with phi=0 full; mixing conventions l...
Vars: R — Planet Radius (m); phi — 0 = between star and observer (dark toward you); 0.5 = far side (full lit) (0 to 1); A — apparent illuminated area (m^2)
Trap: Two phi=0 conventions: this sin/dark-start vs cos/full-start; A is not received flux.

