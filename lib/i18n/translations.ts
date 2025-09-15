export type Language = "ru" | "en" | "ro" | "gag"

export interface Translations {
  // Common translations
  title: string
  age: string
  gender: string
  male: string
  female: string
  calculate: string
  exportPDF: string
  result: string
  results: string
  interpretation: string
  recommendations: string

  // Disclaimer
  disclaimerTitle: string
  medicalProfessionalDisclaimer: string
  confirmButton: string

  // Cardiovascular Risk Calculator
  systolicBP: string
  mmHg: string
  ldlCholesterol: string
  hdlCholesterol: string
  totalCholesterol: string
  mmolL: string
  riskFactors: string
  smoking: string
  diabetes: string
  myocardialInfarction: string
  stroke: string
  geneticPredisposition: string
  obesity: string
  chronicKidneyDisease: string
  sedentaryLifestyle: string
  riskLevel: string
  targetLDL: string
  reductionRequired: string
  nonHDLCholesterolResult: string
  calculationMethodLabel: string
  officialMethodUsed: string
  simplifiedMethodUsed: string
  insufficientData: string
  disclaimerSimplified: string
  disclaimerOfficial: string
  disclaimerRecommendation: string

  // Risk categories
  riskCategories: {
    veryLow: string
    low: string
    moderate: string
    high: string
    veryHigh: string
  }

  // GFR Calculator
  gfrCalculator: {
    title: string
    age: string
    gender: string
    male: string
    female: string
    creatinine: string
    units: string
    umoll: string
    mgdl: string
    calculate: string
    result: string
    gfrValue: string
    ckdStage: string
    interpretation: string
    recommendations: string
    exportPDF: string
    calculationMethod: string

    stages: {
      G1: string
      G2: string
      G3a: string
      G3b: string
      G4: string
      G5: string
    }

    interpretations: {
      G1: string
      G2: string
      G3a: string
      G3b: string
      G4: string
      G5: string
    }

    recommendationTexts: {
      lifestyle: string
      monitoring: string
      riskFactors: string
      specialist: string
      complications: string
      preparation: string
      replacement: string
    }
  }
}

const translations: Record<Language, Translations> = {
  ru: {
    title: "Расчет сердечно-сосудистого риска",
    age: "Возраст",
    gender: "Пол",
    male: "Мужской",
    female: "Женский",
    calculate: "Рассчитать",
    exportPDF: "Экспорт PDF",
    result: "Результат",
    results: "Результаты",
    interpretation: "Интерпретация",
    recommendations: "Рекомендации",

    disclaimerTitle: "Предупреждение для медицинских работников",
    medicalProfessionalDisclaimer:
      "Этот калькулятор предназначен исключительно для использования квалифицированными медицинскими работниками. Результаты должны интерпретироваться в контексте клинической картины пациента и не заменяют профессиональное медицинское заключение.",
    confirmButton: "Я являюсь медицинским работником",

    systolicBP: "Систолическое АД",
    mmHg: "мм рт.ст.",
    ldlCholesterol: "Холестерин ЛПНП",
    hdlCholesterol: "Холестерин ЛПВП",
    totalCholesterol: "Общий холестерин",
    mmolL: "ммоль/л",
    riskFactors: "Факторы риска",
    smoking: "Курение",
    diabetes: "Сахарный диабет",
    myocardialInfarction: "Инфаркт миокарда в анамнезе",
    stroke: "Инсульт в анамнезе",
    geneticPredisposition: "Семейная история ССЗ",
    obesity: "Ожирение",
    chronicKidneyDisease: "Хроническая болезнь почек",
    sedentaryLifestyle: "Малоподвижный образ жизни",
    riskLevel: "Уровень риска",
    targetLDL: "Целевой ЛПНП",
    reductionRequired: "Требуемое снижение",
    nonHDLCholesterolResult: "Не-ЛПВП холестерин",
    calculationMethodLabel: "Метод расчета:",
    officialMethodUsed: "Официальная методология SCORE2",
    simplifiedMethodUsed: "Упрощенная методология",
    insufficientData: "Недостаточно данных для точного расчета",
    disclaimerSimplified: "Если введен только холестерин ЛПНП, расчет риска выполняется по упрощенному алгоритму.",
    disclaimerOfficial:
      "Если введены значения общего холестерина и ЛПВП, используется официальная методология SCORE2/SCORE2-OP согласно Протоколу Министерства здравоохранения Республики Молдова от 2022 года.",
    disclaimerRecommendation: "Рекомендуется вводить значения: ЛПНП, ЛПВП и общий холестерин",

    riskCategories: {
      veryLow: "Очень низкий",
      low: "Низкий",
      moderate: "Умеренный",
      high: "Высокий",
      veryHigh: "Очень высокий",
    },

    gfrCalculator: {
      title: "Калькулятор СКФ (CKD-EPI)",
      age: "Возраст",
      gender: "Пол",
      male: "Мужской",
      female: "Женский",
      creatinine: "Креатинин",
      units: "Единицы",
      umoll: "мкмоль/л",
      mgdl: "мг/дл",
      calculate: "Рассчитать",
      result: "Результат",
      gfrValue: "Значение СКФ",
      ckdStage: "Стадия ХБП",
      interpretation: "Интерпретация",
      recommendations: "Рекомендации",
      exportPDF: "Скачать PDF",
      calculationMethod: "Формула CKD-EPI 2021 (без расовой поправки)",

      stages: {
        G1: "G1 - Нормальная или повышенная функция почек",
        G2: "G2 - Легкое снижение функции почек",
        G3a: "G3a - Умеренное снижение функции почек",
        G3b: "G3b - Значительное снижение функции почек",
        G4: "G4 - Тяжелое снижение функции почек",
        G5: "G5 - Почечная недостаточность",
      },

      interpretations: {
        G1: "Функция почек нормальная или повышенная. Рутинное наблюдение.",
        G2: "Легкое снижение функции почек. Контроль факторов риска.",
        G3a: "Умеренное снижение функции почек. Оценка и лечение осложнений ХБП.",
        G3b: "Значительное снижение функции почек. Оценка и лечение осложнений ХБП.",
        G4: "Тяжелое снижение функции почек. Подготовка к заместительной почечной терапии.",
        G5: "Почечная недостаточность. Заместительная почечная терапия (диализ или трансплантация).",
      },

      recommendationTexts: {
        lifestyle:
          "• Здоровый образ жизни\n• Сбалансированная диета с ограничением соли (<5г/день)\n• Регулярная физическая активность\n• Отказ от курения и чрезмерного употребления алкоголя",
        monitoring:
          "• Регулярный мониторинг функции почек (СКФ, креатинин)\n• Контроль артериального давления (<140/90 мм рт.ст.)\n• Мониторинг протеинурии\n• Регулярные лабораторные анализы",
        riskFactors:
          "• Контроль сахарного диабета (HbA1c <7%)\n• Лечение артериальной гипертензии\n• Коррекция дислипидемии\n• Поддержание нормального веса",
        specialist:
          "• Консультация нефролога\n• Специализированное ведение ХБП\n• Коррекция осложнений ХБП\n• Планирование дальнейшего лечения",
        complications:
          "• Лечение анемии\n• Коррекция минерально-костных нарушений\n• Контроль ацидоза\n• Профилактика сердечно-сосудистых осложнений",
        preparation:
          "• Подготовка к заместительной почечной терапии\n• Обучение пациента\n• Создание сосудистого доступа\n• Психологическая поддержка",
        replacement:
          "• Заместительная почечная терапия\n• Гемодиализ или перитонеальный диализ\n• Оценка возможности трансплантации\n• Специализированная медицинская помощь",
      },
    },
  },

  en: {
    title: "Cardiovascular Risk Assessment",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    calculate: "Calculate",
    exportPDF: "Export PDF",
    result: "Result",
    results: "Results",
    interpretation: "Interpretation",
    recommendations: "Recommendations",

    disclaimerTitle: "Medical Professional Warning",
    medicalProfessionalDisclaimer:
      "This calculator is intended exclusively for use by qualified medical professionals. Results should be interpreted in the context of the patient's clinical picture and do not replace professional medical judgment.",
    confirmButton: "I am a medical professional",

    systolicBP: "Systolic BP",
    mmHg: "mmHg",
    ldlCholesterol: "LDL Cholesterol",
    hdlCholesterol: "HDL Cholesterol",
    totalCholesterol: "Total Cholesterol",
    mmolL: "mmol/L",
    riskFactors: "Risk Factors",
    smoking: "Smoking",
    diabetes: "Diabetes",
    myocardialInfarction: "Previous Myocardial Infarction",
    stroke: "Previous Stroke",
    geneticPredisposition: "Family History of CVD",
    obesity: "Obesity",
    chronicKidneyDisease: "Chronic Kidney Disease",
    sedentaryLifestyle: "Sedentary Lifestyle",
    riskLevel: "Risk Level",
    targetLDL: "Target LDL",
    reductionRequired: "Reduction Required",
    nonHDLCholesterolResult: "Non-HDL Cholesterol",
    calculationMethodLabel: "Calculation method:",
    officialMethodUsed: "Official SCORE2 methodology",
    simplifiedMethodUsed: "Simplified methodology",
    insufficientData: "Insufficient data for accurate calculation",
    disclaimerSimplified:
      "If only LDL cholesterol is entered, risk calculation is performed using a simplified algorithm.",
    disclaimerOfficial:
      "If total cholesterol and HDL values are entered, the official SCORE2/SCORE2-OP methodology is used according to the Protocol of the Ministry of Health of the Republic of Moldova from 2022.",
    disclaimerRecommendation: "It is recommended to enter values: LDL, HDL and total cholesterol",

    riskCategories: {
      veryLow: "Very Low",
      low: "Low",
      moderate: "Moderate",
      high: "High",
      veryHigh: "Very High",
    },

    gfrCalculator: {
      title: "GFR Calculator (CKD-EPI)",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      creatinine: "Creatinine",
      units: "Units",
      umoll: "μmol/L",
      mgdl: "mg/dL",
      calculate: "Calculate",
      result: "Result",
      gfrValue: "GFR Value",
      ckdStage: "CKD Stage",
      interpretation: "Interpretation",
      recommendations: "Recommendations",
      exportPDF: "Download PDF",
      calculationMethod: "CKD-EPI 2021 formula (race-free)",

      stages: {
        G1: "G1 - Normal or high kidney function",
        G2: "G2 - Mildly decreased kidney function",
        G3a: "G3a - Mild to moderately decreased kidney function",
        G3b: "G3b - Moderately to severely decreased kidney function",
        G4: "G4 - Severely decreased kidney function",
        G5: "G5 - Kidney failure",
      },

      interpretations: {
        G1: "Normal or high kidney function. Routine monitoring.",
        G2: "Mildly decreased kidney function. Control risk factors.",
        G3a: "Mild to moderately decreased kidney function. Evaluate and treat CKD complications.",
        G3b: "Moderately to severely decreased kidney function. Evaluate and treat CKD complications.",
        G4: "Severely decreased kidney function. Prepare for renal replacement therapy.",
        G5: "Kidney failure. Renal replacement therapy (dialysis or transplantation).",
      },

      recommendationTexts: {
        lifestyle:
          "• Healthy lifestyle\n• Balanced diet with salt restriction (<5g/day)\n• Regular physical activity\n• Smoking cessation and moderate alcohol consumption",
        monitoring:
          "• Regular monitoring of kidney function (GFR, creatinine)\n• Blood pressure control (<140/90 mmHg)\n• Proteinuria monitoring\n• Regular laboratory tests",
        riskFactors:
          "• Diabetes control (HbA1c <7%)\n• Hypertension treatment\n• Dyslipidemia correction\n• Maintain normal weight",
        specialist:
          "• Nephrology consultation\n• Specialized CKD management\n• CKD complications correction\n• Treatment planning",
        complications:
          "• Anemia treatment\n• Mineral and bone disorders correction\n• Acidosis control\n• Cardiovascular complications prevention",
        preparation:
          "• Preparation for renal replacement therapy\n• Patient education\n• Vascular access creation\n• Psychological support",
        replacement:
          "• Renal replacement therapy\n• Hemodialysis or peritoneal dialysis\n• Transplantation evaluation\n• Specialized medical care",
      },
    },
  },

  ro: {
    title: "Evaluarea riscului cardiovascular",
    age: "Vârsta",
    gender: "Sex",
    male: "Masculin",
    female: "Feminin",
    calculate: "Calculează",
    exportPDF: "Export PDF",
    result: "Rezultat",
    results: "Rezultate",
    interpretation: "Interpretare",
    recommendations: "Recomandări",

    disclaimerTitle: "Avertisment pentru profesioniștii medicali",
    medicalProfessionalDisclaimer:
      "Acest calculator este destinat exclusiv utilizării de către profesioniști medicali calificați. Rezultatele trebuie interpretate în contextul tabloului clinic al pacientului și nu înlocuiesc judecata medicală profesională.",
    confirmButton: "Sunt un profesionist medical",

    systolicBP: "TA sistolică",
    mmHg: "mmHg",
    ldlCholesterol: "Colesterol LDL",
    hdlCholesterol: "Colesterol HDL",
    totalCholesterol: "Colesterol total",
    mmolL: "mmol/L",
    riskFactors: "Factori de risc",
    smoking: "Fumat",
    diabetes: "Diabet zaharat",
    myocardialInfarction: "Infarct miocardic în antecedente",
    stroke: "Accident vascular cerebral în antecedente",
    geneticPredisposition: "Istoric familial de BCV precoce",
    obesity: "Obezitate",
    chronicKidneyDisease: "Boala cronică de rinichi",
    sedentaryLifestyle: "Stil de viață sedentar",
    riskLevel: "Nivelul de risc",
    targetLDL: "LDL țintă",
    reductionRequired: "Reducere necesară",
    nonHDLCholesterolResult: "Colesterol non-HDL",
    calculationMethodLabel: "Metoda de calcul:",
    officialMethodUsed: "Metodologia oficială SCORE2",
    simplifiedMethodUsed: "Metodologia simplificată",
    insufficientData: "Date insuficiente pentru calculul precis",
    disclaimerSimplified:
      "Dacă este introdus doar colesterolul LDL, calculul riscului se efectuează folosind un algoritm simplificat.",
    disclaimerOfficial:
      "Dacă sunt introduse valorile colesterolului total și HDL, se utilizează metodologia oficială SCORE2/SCORE2-OP conform Protocolului Ministerului Sănătății al Republicii Moldova din 2022.",
    disclaimerRecommendation: "Se recomandă introducerea valorilor: LDL, HDL și colesterol total",

    riskCategories: {
      veryLow: "Foarte scăzut",
      low: "Scăzut",
      moderate: "Moderat",
      high: "Ridicat",
      veryHigh: "Foarte ridicat",
    },

    gfrCalculator: {
      title: "Calculul GFR (CKD-EPI)",
      age: "Vârsta",
      gender: "Sex",
      male: "Masculin",
      female: "Feminin",
      creatinine: "Creatinina",
      units: "Unități",
      umoll: "μmol/L",
      mgdl: "mg/dL",
      calculate: "Calculează",
      result: "Rezultat",
      gfrValue: "Valoarea GFR",
      ckdStage: "Stadiul BCR",
      interpretation: "Interpretare",
      recommendations: "Recomandări",
      exportPDF: "Descarcă PDF",
      calculationMethod: "Formula CKD-EPI 2021 (fără corecție rasială)",

      stages: {
        G1: "G1 - Funcție renală normală sau crescută",
        G2: "G2 - Funcție renală ușor scăzută",
        G3a: "G3a - Funcție renală moderat scăzută",
        G3b: "G3b - Funcție renală sever scăzută",
        G4: "G4 - Funcție renală grav scăzută",
        G5: "G5 - Insuficiență renală",
      },

      interpretations: {
        G1: "Funcție renală normală sau crescută. Monitorizare de rutină.",
        G2: "Funcție renală ușor scăzută. Controlul factorilor de risc.",
        G3a: "Funcție renală moderat scăzută. Evaluarea și tratamentul complicațiilor BCR.",
        G3b: "Funcție renală sever scăzută. Evaluarea și tratamentul complicațiilor BCR.",
        G4: "Funcție renală grav scăzută. Pregătirea pentru terapia de înlocuire renală.",
        G5: "Insuficiență renală. Terapia de înlocuire renală (dializă sau transplant).",
      },

      recommendationTexts: {
        lifestyle:
          "• Stil de viață sănătos\n• Dietă echilibrată cu restricția sării (<5g/zi)\n• Activitate fizică regulată\n• Renunțarea la fumat și consumul moderat de alcool",
        monitoring:
          "• Monitorizarea regulată a funcției renale (GFR, creatinina)\n• Controlul tensiunii arteriale (<140/90 mmHg)\n• Monitorizarea proteinuriei\n• Analize de laborator regulate",
        riskFactors:
          "• Controlul diabetului (HbA1c <7%)\n• Tratamentul hipertensiunii arteriale\n• Corecția dislipidemiei\n• Menținerea greutății normale",
        specialist:
          "• Consultația nefrologului\n• Managementul specializat al BCR\n• Corecția complicațiilor BCR\n• Planificarea tratamentului",
        complications:
          "• Tratamentul anemiei\n• Corecția tulburărilor mineral-osoase\n• Controlul acidozei\n• Prevenirea complicațiilor cardiovasculare",
        preparation:
          "• Pregătirea pentru terapia de înlocuire renală\n• Educația pacientului\n• Crearea accesului vascular\n• Suport psihologic",
        replacement:
          "• Terapia de înlocuire renală\n• Hemodializă sau dializă peritoneală\n• Evaluarea pentru transplant\n• Îngrijire medicală specializată",
      },
    },
  },

  gag: {
    title: "Kardiyovasküler risk değerlendirmesi",
    age: "Yaş",
    gender: "Cinsiyet",
    male: "Erkek",
    female: "Kadın",
    calculate: "Hesapla",
    exportPDF: "PDF İndir",
    result: "Sonuç",
    results: "Sonuçlar",
    interpretation: "Yorumlama",
    recommendations: "Öneriler",

    disclaimerTitle: "Tıp uzmanları için uyarı",
    medicalProfessionalDisclaimer:
      "Bu hesaplayıcı yalnızca nitelikli tıp uzmanları tarafından kullanılmak üzere tasarlanmıştır. Sonuçlar hastanın klinik tablosu bağlamında yorumlanmalı ve profesyonel tıbbi yargının yerini almaz.",
    confirmButton: "Ben bir tıp uzmanıyım",

    systolicBP: "Sistolik KB",
    mmHg: "mmHg",
    ldlCholesterol: "LDL Kolesterol",
    hdlCholesterol: "HDL Kolesterol",
    totalCholesterol: "Toplam Kolesterol",
    mmolL: "mmol/L",
    riskFactors: "Risk Faktörleri",
    smoking: "Sigara içmek",
    diabetes: "Diyabet",
    myocardialInfarction: "Geçmiş miyokard infarktüsü",
    stroke: "Geçmiş inme",
    geneticPredisposition: "Erken KVH aile öyküsü",
    obesity: "Obezite",
    chronicKidneyDisease: "Kronik böbrek hastalığı",
    sedentaryLifestyle: "Hareketsiz yaşam tarzı",
    riskLevel: "Risk Seviyesi",
    targetLDL: "Hedef LDL",
    reductionRequired: "Gerekli Azalma",
    nonHDLCholesterolResult: "Non-HDL Kolesterol",
    calculationMethodLabel: "Hesaplama yöntemi:",
    officialMethodUsed: "Resmi SCORE2 metodolojisi",
    simplifiedMethodUsed: "Basitleştirilmiş metodoloji",
    insufficientData: "Doğru hesaplama için yetersiz veri",
    disclaimerSimplified:
      "Yalnızca LDL kolesterol girilirse, risk hesaplaması basitleştirilmiş algoritma kullanılarak yapılır.",
    disclaimerOfficial:
      "Toplam kolesterol ve HDL değerleri girilirse, Moldova Cumhuriyeti Sağlık Bakanlığı'nın 2022 Protokolüne göre resmi SCORE2/SCORE2-OP metodolojisi kullanılır.",
    disclaimerRecommendation: "Şu değerlerin girilmesi önerilir: LDL, HDL ve toplam kolesterol",

    riskCategories: {
      veryLow: "Çok Düşük",
      low: "Düşük",
      moderate: "Orta",
      high: "Yüksek",
      veryHigh: "Çok Yüksek",
    },

    gfrCalculator: {
      title: "GFR Hesaplayıcısı (CKD-EPI)",
      age: "Yaş",
      gender: "Cinsiyet",
      male: "Erkek",
      female: "Kadın",
      creatinine: "Kreatinin",
      units: "Birimler",
      umoll: "μmol/L",
      mgdl: "mg/dL",
      calculate: "Hesapla",
      result: "Sonuç",
      gfrValue: "GFR Değeri",
      ckdStage: "KBH Evresi",
      interpretation: "Yorumlama",
      recommendations: "Öneriler",
      exportPDF: "PDF İndir",
      calculationMethod: "CKD-EPI 2021 formülü (ırk düzeltmesi olmadan)",

      stages: {
        G1: "G1 - Normal veya yüksek böbrek fonksiyonu",
        G2: "G2 - Hafif azalmış böbrek fonksiyonu",
        G3a: "G3a - Orta derecede azalmış böbrek fonksiyonu",
        G3b: "G3b - Ciddi derecede azalmış böbrek fonksiyonu",
        G4: "G4 - Ağır derecede azalmış böbrek fonksiyonu",
        G5: "G5 - Böbrek yetmezliği",
      },

      interpretations: {
        G1: "Normal veya yüksek böbrek fonksiyonu. Rutin izlem.",
        G2: "Hafif azalmış böbrek fonksiyonu. Risk faktörlerini kontrol edin.",
        G3a: "Orta derecede azalmış böbrek fonksiyonu. KBH komplikasyonlarını değerlendirin ve tedavi edin.",
        G3b: "Ciddi derecede azalmış böbrek fonksiyonu. KBH komplikasyonlarını değerlendirin ve tedavi edin.",
        G4: "Ağır derecede azalmış böbrek fonksiyonu. Böbrek replasman tedavisine hazırlanın.",
        G5: "Böbrek yetmezliği. Böbrek replasman tedavisi (diyaliz veya transplantasyon).",
      },

      recommendationTexts: {
        lifestyle:
          "• Sağlıklı yaşam tarzı\n• Tuz kısıtlaması ile dengeli diyet (<5g/gün)\n• Düzenli fiziksel aktivite\n• Sigarayı bırakma ve ılımlı alkol tüketimi",
        monitoring:
          "• Böbrek fonksiyonunun düzenli izlemi (GFR, kreatinin)\n• Kan basıncı kontrolü (<140/90 mmHg)\n• Proteinüri izlemi\n• Düzenli laboratuvar testleri",
        riskFactors:
          "• Diyabet kontrolü (HbA1c <7%)\n• Hipertansiyon tedavisi\n• Dislipidemi düzeltilmesi\n• Normal kilonun korunması",
        specialist:
          "• Nefroloji konsültasyonu\n• Uzmanlaşmış KBH yönetimi\n• KBH komplikasyonlarının düzeltilmesi\n• Tedavi planlaması",
        complications:
          "• Anemi tedavisi\n• Mineral ve kemik bozukluklarının düzeltilmesi\n• Asidoz kontrolü\n• Kardiyovasküler komplikasyonların önlenmesi",
        preparation:
          "• Böbrek replasman tedavisine hazırlık\n• Hasta eğitimi\n• Vasküler erişim oluşturma\n• Psikolojik destek",
        replacement:
          "• Böbrek replasman tedavisi\n• Hemodiyaliz veya periton diyalizi\n• Transplantasyon değerlendirmesi\n• Uzmanlaşmış tıbbi bakım",
      },
    },
  },
}

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en
}
