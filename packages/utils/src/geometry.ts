/**
 * Geometry Utilities
 *
 * Shared geometric math for custom extrusion profile calculations.
 * Used for cross-section area, perimeter, and weight calculations.
 */

/** Calculate cross-sectional area of a hollow rectangle (extrusion profile) */
export function hollowRectArea(
  outerWidth: number,
  outerHeight: number,
  wallThickness: number
): number {
  const innerWidth = outerWidth - 2 * wallThickness
  const innerHeight = outerHeight - 2 * wallThickness
  if (innerWidth <= 0 || innerHeight <= 0) {
    return outerWidth * outerHeight // solid profile
  }
  return outerWidth * outerHeight - innerWidth * innerHeight
}

/** Calculate perimeter of a rectangle */
export function rectPerimeter(width: number, height: number): number {
  return 2 * (width + height)
}

/** Calculate weight per metre (kg/m) given area in mm² and density in g/cm³ */
export function weightPerMetre(areaMm2: number, densityGCm3: number): number {
  // area in mm² * 1m = volume in mm³
  // convert mm³ to cm³: / 1000
  // multiply by density g/cm³, convert g to kg: / 1000
  return (areaMm2 * densityGCm3) / 1_000_000
}

/** Common material densities (g/cm³) */
export const MATERIAL_DENSITIES = {
  EPDM: 1.15,
  SILICONE: 1.10,
  NEOPRENE: 1.23,
  NATURAL_RUBBER: 0.93,
  VITON: 1.80,
  TPE: 1.05,
} as const
