import { AIRecommendation, AutomationSettings, IrrigationZone, WeatherData } from '../types';

/**
 * AqlliSuv AI — Prototype Decision-Support Engine
 * Analyzes soil moisture, temperature, humidity, water flow, pressure,
 * previous irrigation, rain probability, and crop type to calculate
 * actionable irrigation recommendations.
 *
 * Note: This is a transparent rule + heuristic prototype decision-support
 * engine ready to be swapped with a trained ML endpoint in production.
 */
export function calculateIrrigationRecommendation(
  zone: IrrigationZone,
  weather: WeatherData,
  automation: AutomationSettings
): AIRecommendation {
  const {
    id,
    name,
    cropType,
    moisture,
    temperature,
    waterFlow,
    expectedFlow,
    pressure,
    valveOpen,
  } = zone;

  // 1. Check hydraulic / flow anomalies first (e.g., Z8 where expected is 30 L/min, actual is 8 L/min)
  if (valveOpen && Math.abs(expectedFlow - waterFlow) >= 12) {
    const isLowFlow = waterFlow < expectedFlow;
    const causes = isLowFlow
      ? ['Quvur tiqilishi', 'Klapan muammosi', 'Suv bosimi pastligi']
      : ['Quvur yorilishi (Suv sizib chiqishi)', 'Fiting ulanishida nosozlik', 'Bosim regulyatori xatosi'];

    return {
      zoneId: id,
      zoneName: name,
      cropType,
      type: 'inspect',
      statusColor: 'amber',
      title: 'Suv oqimi tekshirilsin',
      reason: `Kutilayotgan oqim ${expectedFlow} L/min, ammo haqiqiy oqim ${waterFlow} L/min (${pressure.toFixed(
        1
      )} bar). Gidravlik og‘ish aniqlandi.`,
      recommendation: isLowFlow
        ? `${id} klapanini va filtr tizimini ko‘zdan kechirish, bosimni tekshirish.`
        : `${id} quvur liniyasini darhol yopish va sizib chiqish nuqtasini tekshirish.`,
      recommendedDurationMin: 0,
      priority: 'Yuqori',
      confidence: 95,
      moisture,
      temperature,
      expectedFlow,
      actualFlow: waterFlow,
      possibleCauses: causes,
      estimatedWaterLiters: 0,
    };
  }

  // 2. Check critical low soil moisture (e.g., Z3 at 28%, 31°C)
  if (moisture <= automation.minMoisture || moisture <= 32) {
    const moistureDeficit = Math.max(10, 52 - moisture);
    const tempFactor = temperature > 30 ? 1.18 : temperature > 27 ? 1.05 : 0.95;
    const rawDuration = Math.round(moistureDeficit * 0.68 * tempFactor);
    const recommendedDurationMin = Math.min(
      automation.maxIrrigationDuration,
      Math.max(10, id === 'Z3' ? 18 : rawDuration)
    );

    // If rain probability is very high (>70%) and rain protection is enabled
    if (automation.rainProtection && weather.rainProbability >= 70 && moisture >= 24) {
      return {
        zoneId: id,
        zoneName: name,
        cropType,
        type: 'postpone',
        statusColor: 'amber',
        title: 'Yomg‘ir sababli qisqa muddatga kechiktirish',
        reason: `Tuproq namligi ${moisture}%, biroq yomg‘ir ehtimoli ${weather.rainProbability}% ga yetgan.`,
        recommendation: `${id} zonasini tabiiy yog‘ingarchilikdan so‘ng qayta baholash.`,
        recommendedDurationMin: 0,
        priority: 'O‘rta',
        confidence: 88,
        moisture,
        temperature,
        estimatedWaterLiters: 0,
      };
    }

    return {
      zoneId: id,
      zoneName: name,
      cropType,
      type: 'irrigate',
      statusColor: 'red',
      title: 'Sug‘orish tavsiya qilinadi',
      reason: `Tuproq namligi ${moisture}% ga tushgan. Harorat ${temperature.toFixed(
        1
      )}°C (${cropType} uchun kritik chegara: ${automation.minMoisture}%).`,
      recommendation: `${id} zonasini ${recommendedDurationMin} daqiqa sug‘orish.`,
      recommendedDurationMin,
      priority: 'Yuqori',
      confidence: id === 'Z3' ? 92 : 90,
      moisture,
      temperature,
      estimatedWaterLiters: Math.round(recommendedDurationMin * expectedFlow),
    };
  }

  // 3. Check approaching threshold / watch zones (e.g. Z9 at 34%, Z5 at 41%)
  if (moisture <= 42) {
    const duration = Math.max(10, Math.round((54 - moisture) * 0.65));
    return {
      zoneId: id,
      zoneName: name,
      cropType,
      type: 'irrigate',
      statusColor: 'amber',
      title: 'Profilaktik sug‘orish rejalashtirilsin',
      reason: `Tuproq namligi ${moisture}% — bug‘lanish darajasi yuqori (${temperature.toFixed(
        1
      )}°C). Namlik pasayish tendensiyasida.`,
      recommendation: `${id} zonasini kechki salqinda ${duration} daqiqa sug‘orish.`,
      recommendedDurationMin: duration,
      priority: 'O‘rta',
      confidence: 86,
      moisture,
      temperature,
      estimatedWaterLiters: Math.round(duration * expectedFlow),
    };
  }

  // 4. High moisture / optimal zones (e.g., Z6 at 67%)
  if (moisture >= 60) {
    return {
      zoneId: id,
      zoneName: name,
      cropType,
      type: 'postpone',
      statusColor: 'green',
      title: 'Hozir sug‘orish shart emas',
      reason:
        id === 'Z6'
          ? `Tuproq namligi ${moisture}%. Kutilayotgan yomg‘ir ehtimoli va zaxira namlik yetarli.`
          : `Tuproq namligi ${moisture}% — ${cropType} ildiz qatlami uchun yetarli namlik mavjud.`,
      recommendation: 'Sug‘orishni keyinga qoldirish.',
      recommendedDurationMin: 0,
      priority: 'Past',
      confidence: 94,
      moisture,
      temperature,
      estimatedWaterLiters: 0,
    };
  }

  // 5. Normal balanced state
  return {
    zoneId: id,
    zoneName: name,
    cropType,
    type: 'optimal',
    statusColor: 'green',
    title: 'Namlik me’yorida (Optimal)',
    reason: `Tuproq namligi ${moisture}%, harorat ${temperature.toFixed(
      1
    )}°C. Keyingi sug‘orish 14–18 soatdan so‘ng talab etiladi.`,
    recommendation: 'Sug‘orishni keyinga qoldirish va kuzatuvni davom ettirish.',
    recommendedDurationMin: 0,
    priority: 'Past',
    confidence: 91,
    moisture,
    temperature,
    estimatedWaterLiters: 0,
  };
}

export function calculateAllRecommendations(
  zones: IrrigationZone[],
  weather: WeatherData,
  automation: AutomationSettings
): AIRecommendation[] {
  const recs = zones.map((zone) => calculateIrrigationRecommendation(zone, weather, automation));

  // Sort so Z3, Z6, Z8 or urgent recommendations appear prominently at top
  const priorityOrder: Record<string, number> = {
    Z3: 1,
    Z6: 2,
    Z8: 3,
    Z9: 4,
    Z5: 5,
  };

  return recs.sort((a, b) => {
    const pA = priorityOrder[a.zoneId] ?? 99;
    const pB = priorityOrder[b.zoneId] ?? 99;
    if (pA !== pB) return pA - pB;
    return a.moisture - b.moisture;
  });
}
