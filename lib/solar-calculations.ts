// Physical constants
const K_B = 1.380649e-23 // Boltzmann constant (J/K)
const Q = 1.602176634e-19 // Elementary charge (C)
const TEMP = 300 // Temperature (K)
const V_TH = (K_B * TEMP) / Q // Thermal voltage (~26 mV at 300K)

export function calculateSolarParameters(voltage: number[], current: number[]) {
  // Sort data by voltage
  const indices = Array.from({ length: voltage.length }, (_, i) => i).sort((a, b) => voltage[a] - voltage[b])

  const sortedV = indices.map((i) => voltage[i])
  const sortedI = indices.map((i) => current[i])

  // Find Isc (short circuit current) - maximum absolute current
  const maxAbsCurrent = Math.max(...sortedI.map((i) => Math.abs(i)))
  const Isc = sortedI.reduce((max, i) => (Math.abs(i) > Math.abs(max) ? i : max))

  // Find Voc (open circuit voltage) - voltage where current is closest to zero
  let Voc = 0
  let minAbsCurrent = Math.abs(sortedI[0])
  for (let i = 0; i < sortedI.length; i++) {
    if (Math.abs(sortedI[i]) < minAbsCurrent) {
      minAbsCurrent = Math.abs(sortedI[i])
      Voc = sortedV[i]
    }
  }

  // Calculate Power
  const power = sortedV.map((v, i) => v * sortedI[i])

  // Find Pmax (maximum power)
  const Pmax = Math.max(...power)
  const maxPowerIndex = power.indexOf(Pmax)
  const Vmpp = sortedV[maxPowerIndex]
  const Impp = sortedI[maxPowerIndex]

  // Calculate Fill Factor
  let FF = 0
  if (Isc !== 0 && Voc !== 0) {
    FF = Pmax / (Math.abs(Isc) * Math.abs(Voc))
    FF = Math.min(1, FF) // Cap FF at 1
  }

  // Calculate Efficiency (standard test conditions)
  // Assuming 1000 W/m² irradiance and 1 cm² cell area
  const irradiance = 1000 // W/m²
  const cellArea = 0.0001 // 1 cm² in m²
  const pinc = irradiance * cellArea // Incident power
  const Efficiency = pinc > 0 ? Pmax / pinc : 0

  return {
    Isc: Math.abs(Isc),
    Voc: Math.abs(Voc),
    Pmax: Math.abs(Pmax),
    FF: Math.max(0, Math.min(1, FF)),
    Efficiency: Math.max(0, Efficiency),
    Vmpp: Math.abs(Vmpp),
    Impp: Math.abs(Impp),
  }
}

function extractParametersLeastSquares(
  voltage: number[],
  current: number[],
  performanceParams: any,
): { Rs: number; Rsh: number; n: number; Io: number } {
  const Isc = performanceParams.Isc
  const Voc = performanceParams.Voc

  // Phase 1: Estimate Rs from high voltage region (near Voc)
  const highVoltageRegion = voltage
    .map((v, i) => ({ v, i, dist: Math.abs(v - Voc) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, Math.max(2, Math.floor(voltage.length * 0.15)))
    .map((x) => x.i)
    .sort((a, b) => a - b)

  let Rs = 0.05
  if (highVoltageRegion.length >= 2) {
    const slopes: number[] = []
    for (let i = 0; i < highVoltageRegion.length - 1; i++) {
      const i1 = highVoltageRegion[i]
      const i2 = highVoltageRegion[i + 1]
      const dV = voltage[i2] - voltage[i1]
      const dI = current[i2] - current[i1]

      if (Math.abs(dI) > 1e-8) {
        slopes.push(-dV / dI)
      }
    }
    if (slopes.length > 0) {
      Rs = slopes.reduce((a, b) => a + b, 0) / slopes.length
    }
  }

  // Phase 2: Estimate Rsh from low voltage region (near Isc)
  const lowVoltageRegion = voltage
    .map((v, i) => ({ v, i, dist: Math.abs(v) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, Math.max(2, Math.floor(voltage.length * 0.15)))
    .map((x) => x.i)
    .sort((a, b) => a - b)

  let Rsh = 1000
  if (lowVoltageRegion.length >= 2) {
    const slopes: number[] = []
    for (let i = 0; i < lowVoltageRegion.length - 1; i++) {
      const i1 = lowVoltageRegion[i]
      const i2 = lowVoltageRegion[i + 1]
      const dV = voltage[i2] - voltage[i1]
      const dI = current[i2] - current[i1]

      if (Math.abs(dI) > 1e-8) {
        slopes.push(dV / dI)
      }
    }
    if (slopes.length > 0) {
      Rsh = slopes.reduce((a, b) => a + b, 0) / slopes.length
    }
  }

  // Phase 3: Estimate ideality factor (n) and saturation current (Io)
  let n = 1.2
  let Io = 1e-12

  // Use points in the exponential region (high voltage, low current)
  const exponentialRegion = voltage
    .map((v, i) => ({ v, i, c: current[i] }))
    .filter((p) => p.v > Voc * 0.7 && p.c > 0)
    .sort((a, b) => a.v - b.v)

  if (exponentialRegion.length >= 2) {
    const p1 = exponentialRegion[0]
    const p2 = exponentialRegion[exponentialRegion.length - 1]

    const I1 = Math.abs(p1.c)
    const I2 = Math.abs(p2.c)

    if (I1 > 1e-15 && I2 > 1e-15) {
      const logRatio = Math.log(I2 / I1)
      const deltaV = p2.v - p1.v

      if (Math.abs(logRatio) > 1e-8) {
        n = (deltaV * Q) / (K_B * TEMP * logRatio)
        n = Math.max(0.5, Math.min(3, n)) // Constrain n

        // Calculate Io using first point
        const arg = (Q * p1.v) / (n * K_B * TEMP)
        if (arg < 100) {
          Io = I1 / Math.exp(arg)
        }
      }
    }
  }

  // Ensure parameters are within physical bounds
  Rs = Math.max(0.001, Math.min(Rs, 5))
  Rsh = Math.max(10, Math.min(Rsh, 100000))
  Io = Math.max(1e-18, Math.min(Io, 1e-6))

  return { Rs, Rsh, n, Io }
}

function calculateModelFitQuality(
  voltage: number[],
  current: number[],
  params: { Rs: number; Rsh: number; n: number; Io: number; Isc: number },
): number {
  let residualSS = 0
  let totalSS = 0
  let validPoints = 0

  const meanCurrent = current.reduce((a, b) => a + b, 0) / current.length

  for (let i = 0; i < voltage.length; i++) {
    const V = voltage[i]
    const I = current[i]

    // Calculate model prediction
    const arg = (Q * (V + I * params.Rs)) / (params.n * K_B * TEMP)
    let prediction = 0

    if (arg < 100) {
      prediction = params.Isc - params.Io * (Math.exp(arg) - 1) - (V + I * params.Rs) / params.Rsh
    }

    const residual = I - prediction
    const deviation = I - meanCurrent

    residualSS += residual * residual
    totalSS += deviation * deviation
    validPoints++
  }

  if (totalSS === 0) return 0

  let R2 = 1 - residualSS / totalSS
  R2 = Math.max(0, Math.min(1, R2)) // Constrain to [0, 1]

  return R2
}

export function extractSingleDiodeParameters(voltage: number[], current: number[], performanceParams: any) {
  try {
    // Get initial parameter estimates
    const params = extractParametersLeastSquares(voltage, current, performanceParams)

    // Calculate model fit quality
    const fitQuality = calculateModelFitQuality(voltage, current, {
      ...params,
      Isc: performanceParams.Isc,
    })

    return {
      Rs: Math.max(0, params.Rs),
      Rsh: Math.max(0, params.Rsh),
      n: Math.max(0.1, params.n),
      Io: Math.max(1e-20, params.Io),
      fitQuality,
    }
  } catch (error) {
    console.error("[v0] Error in parameter extraction:", error)
    return {
      Rs: 0.05,
      Rsh: 1000,
      n: 1.3,
      Io: 1e-12,
      fitQuality: 0,
    }
  }
}

// Export utility function for model calculation
export function calculateModelCurrent(
  voltage: number,
  params: { Rs: number; Rsh: number; n: number; Io: number; Isc: number },
  referenceI = 0,
): number {
  try {
    const arg = (Q * (voltage + referenceI * params.Rs)) / (params.n * K_B * TEMP)

    if (arg > 100) return 0 // Prevent overflow

    return params.Isc - params.Io * (Math.exp(arg) - 1) - (voltage + referenceI * params.Rs) / params.Rsh
  } catch {
    return 0
  }
}
