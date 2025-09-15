import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Activity, Cigarette, Utensils, Scale, Droplet } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"
import { getTranslation } from "@/lib/i18n/translations"

interface DetailedRecommendationsProps {
  recommendations: string[]
  language: Language
  riskCategory: string
}

export default function DetailedRecommendations({
  recommendations,
  language,
  riskCategory,
}: DetailedRecommendationsProps) {
  // Получаем переводы напрямую из функции getTranslation
  const t = getTranslation(language)

  // Переводы для детальных рекомендаций
  const translations = {
    ru: {
      title: "Детальные рекомендации",
      subtitle: "На основе рекомендаций Европейского общества кардиологии (ESC)",
      diet: {
        title: "Диета",
        content: `
          <p><strong>Рекомендуется:</strong></p>
          <ul>
            <li>Увеличить потребление фруктов (≥200 г/день, 2-3 порции) и овощей (≥200 г/день, 2-3 порции)</li>
            <li>Употреблять рыбу 1-2 раза в неделю, особенно жирные сорта</li>
            <li>Ограничить потребление красного мяса до 350-500 г/неделю</li>
            <li>Выбирать нежирные молочные продукты</li>
            <li>Использовать цельнозерновые продукты</li>
            <li>Заменить насыщенные жиры (сливочное масло, жирное мясо) на ненасыщенные (оливковое масло, орехи)</li>
          </ul>
          <p><strong>Ограничить:</strong></p>
          <ul>
            <li>Потребление соли до <5 г/день</li>
            <li>Алкоголь (<100 г/неделю)</li>
            <li>Сахар и сладкие напитки</li>
            <li>Обработанные мясные продукты</li>
          </ul>
          <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      physicalActivity: {
        title: "Физическая активность",
        content: `
          <p><strong>Общие рекомендации:</strong></p>
          <ul>
            <li>Минимум 150-300 минут аэробной активности умеренной интенсивности в неделю</li>
            <li>ИЛИ 75-150 минут интенсивной аэробной активности в неделю</li>
            <li>ИЛИ эквивалентная комбинация</li>
            <li>Дополнительно: силовые упражнения 2 и более дней в неделю</li>
          </ul>
          <p><strong>Практические советы:</strong></p>
          <ul>
            <li>Ходьба не менее 30 минут в день (около 3 км) или 7000-10000 шагов</li>
            <li>Подъем по лестнице вместо лифта</li>
            <li>Активный отдых (плавание, велосипед, танцы)</li>
            <li>Уменьшение времени, проводимого сидя</li>
          </ul>
          <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      smokingCessation: {
        title: "Отказ от курения",
        content: `
          <p><strong>Рекомендации:</strong></p>
          <ul>
            <li>Полный отказ от всех форм табака</li>
            <li>Избегание пассивного курения</li>
            <li>Для курильщиков: обратиться за профессиональной помощью для отказа от курения</li>
            <li>Рассмотреть никотинзаместительную терапию и/или медикаментозную поддержку</li>
          </ul>
          <p><strong>Польза отказа от курения:</strong></p>
          <ul>
            <li>Снижение риска ИБС на 50% через 1 год</li>
            <li>Снижение риска инсульта до уровня некурящих через 5-15 лет</li>
          </ul>
          <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      weightReduction: {
        title: "Снижение массы тела",
        content: `
          <p><strong>Целевые показатели:</strong></p>
          <ul>
            <li>ИМТ 20-25 кг/м²</li>
            <li>Окружность талии <94 см для мужчин и <80 см для женщин</li>
          </ul>
          <p><strong>Рекомендации:</strong></p>
          <ul>
            <li>Снижение веса на 5-10% от исходного уже приносит пользу для здоровья</li>
            <li>Сочетание диеты с ограничением калорий и увеличением физической активности</li>
            <li>Постепенное снижение веса (0.5-1 кг в неделю)</li>
            <li>Долгосрочное изменение пищевых привычек</li>
          </ul>
          <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      bloodPressureControl: {
        title: "Контроль артериального давления",
        content: `
          <p><strong>Целевые показатели:</strong></p>
          <ul>
            <li>Для большинства пациентов: <140/90 мм рт.ст.</li>
            <li>При хорошей переносимости: <130/80 мм рт.ст.</li>
            <li>Для пациентов >65 лет: систолическое АД 130-139 мм рт.ст.</li>
          </ul>
          <p><strong>Немедикаментозные меры:</strong></p>
          <ul>
            <li>Ограничение потребления соли (<5 г/день)</li>
            <li>Увеличение потребления фруктов и овощей</li>
            <li>Регулярная физическая активность</li>
            <li>Поддержание нормального веса</li>
            <li>Ограничение алкоголя</li>
          </ul>
          <p><em>Источник: ESC Guidelines on arterial hypertension (2018) и ESC Guidelines on cardiovascular disease prevention (2021)</em></p>
        `,
      },
      glucoseControl: {
        title: "Контроль глюкозы",
        content: `
          <p><strong>Целевые показатели для пациентов с диабетом:</strong></p>
          <ul>
            <li>HbA1c <7% (53 ммоль/моль) для большинства пациентов</li>
            <li>Глюкоза натощак 4.4-7.2 ммоль/л</li>
            <li>Постпрандиальная глюкоза <10 ммоль/л</li>
          </ul>
          <p><strong>Рекомендации:</strong></p>
          <ul>
            <li>Регулярный мониторинг уровня глюкозы</li>
            <li>Диета с низким гликемическим индексом</li>
            <li>Регулярная физическая активность</li>
            <li>Поддержание нормального веса</li>
            <li>Прием назначенных препаратов</li>
          </ul>
          <p><em>Источник: ESC Guidelines on diabetes, pre-diabetes, and cardiovascular diseases (2019)</em></p>
        `,
      },
      highRiskWarning: {
        title: "Важное предупреждение",
        content: `
          <p>При высоком или очень высоком сердечно-сосудистом риске настоятельно рекомендуется:</p>
          <ul>
            <li>Консультация кардиолога</li>
            <li>Регулярный контроль факторов риска</li>
            <li>Рассмотрение медикаментозной терапии для снижения уровня холестерина и артериального давления</li>
          </ul>
          <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
    },
    en: {
      title: "Detailed Recommendations",
      subtitle: "Based on European Society of Cardiology (ESC) guidelines",
      diet: {
        title: "Diet",
        content: `
          <p><strong>Recommended:</strong></p>
          <ul>
            <li>Increase consumption of fruits (≥200 g/day, 2-3 servings) and vegetables (≥200 g/day, 2-3 servings)</li>
            <li>Consume fish 1-2 times per week, especially fatty fish</li>
            <li>Limit red meat consumption to 350-500 g/week</li>
            <li>Choose low-fat dairy products</li>
            <li>Use whole grain products</li>
            <li>Replace saturated fats (butter, fatty meat) with unsaturated fats (olive oil, nuts)</li>
          </ul>
          <p><strong>Limit:</strong></p>
          <ul>
            <li>Salt intake to <5 g/day</li>
            <li>Alcohol (<100 g/week)</li>
            <li>Sugar and sweetened beverages</li>
            <li>Processed meat products</li>
          </ul>
          <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      physicalActivity: {
        title: "Physical Activity",
        content: `
          <p><strong>General recommendations:</strong></p>
          <ul>
            <li>At least 150-300 minutes of moderate-intensity aerobic activity per week</li>
            <li>OR 75-150 minutes of vigorous aerobic activity per week</li>
            <li>OR an equivalent combination</li>
            <li>Additionally: muscle-strengthening activities on 2 or more days per week</li>
          </ul>
          <p><strong>Practical advice:</strong></p>
          <ul>
            <li>Walking at least 30 minutes per day (about 3 km) or 7,000-10,000 steps</li>
            <li>Taking stairs instead of elevators</li>
            <li>Active leisure activities (swimming, cycling, dancing)</li>
            <li>Reducing sitting time</li>
          </ul>
          <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      smokingCessation: {
        title: "Smoking Cessation",
        content: `
          <p><strong>Recommendations:</strong></p>
          <ul>
            <li>Complete cessation of all forms of tobacco</li>
            <li>Avoiding passive smoking</li>
            <li>For smokers: seek professional help for smoking cessation</li>
            <li>Consider nicotine replacement therapy and/or medication support</li>
          </ul>
          <p><strong>Benefits of quitting:</strong></p>
          <ul>
            <li>50% reduction in CHD risk after 1 year</li>
            <li>Stroke risk reduced to that of non-smokers after 5-15 years</li>
          </ul>
          <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      weightReduction: {
        title: "Weight Reduction",
        content: `
          <p><strong>Target indicators:</strong></p>
          <ul>
            <li>BMI 20-25 kg/m²</li>
            <li>Waist circumference <94 cm for men and <80 cm for women</li>
          </ul>
          <p><strong>Recommendations:</strong></p>
          <ul>
            <li>Weight reduction of 5-10% from baseline already provides health benefits</li>
            <li>Combination of calorie-restricted diet and increased physical activity</li>
            <li>Gradual weight loss (0.5-1 kg per week)</li>
            <li>Long-term change in eating habits</li>
          </ul>
          <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
      bloodPressureControl: {
        title: "Blood Pressure Control",
        content: `
          <p><strong>Target indicators:</strong></p>
          <ul>
            <li>For most patients: <140/90 mmHg</li>
            <li>If well tolerated: <130/80 mmHg</li>
            <li>For patients >65 years: systolic BP 130-139 mmHg</li>
          </ul>
          <p><strong>Non-pharmacological measures:</strong></p>
          <ul>
            <li>Limit salt intake (<5 g/day)</li>
            <li>Increase consumption of fruits and vegetables</li>
            <li>Regular physical activity</li>
            <li>Maintain normal weight</li>
            <li>Limit alcohol consumption</li>
          </ul>
          <p><em>Source: ESC Guidelines on arterial hypertension (2018) and ESC Guidelines on cardiovascular disease prevention (2021)</em></p>
        `,
      },
      glucoseControl: {
        title: "Glucose Control",
        content: `
          <p><strong>Target indicators for patients with diabetes:</strong></p>
          <ul>
            <li>HbA1c <7% (53 mmol/mol) for most patients</li>
            <li>Fasting glucose 4.4-7.2 mmol/L</li>
            <li>Postprandial glucose <10 mmol/L</li>
          </ul>
          <p><strong>Recommendations:</strong></p>
          <ul>
            <li>Regular monitoring of glucose levels</li>
            <li>Diet with low glycemic index</li>
            <li>Regular physical activity</li>
            <li>Maintain normal weight</li>
            <li>Take prescribed medications</li>
          </ul>
          <p><em>Source: ESC Guidelines on diabetes, pre-diabetes, and cardiovascular diseases (2019)</em></p>
        `,
      },
      highRiskWarning: {
        title: "Important Warning",
        content: `
          <p>For high or very high cardiovascular risk, it is strongly recommended to:</p>
          <ul>
            <li>Consult a cardiologist</li>
            <li>Regular monitoring of risk factors</li>
            <li>Consider medication therapy to reduce cholesterol levels and blood pressure</li>
          </ul>
          <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
        `,
      },
    },
    ro: {
      title: "Recomandări detaliate",
      subtitle: "Bazate pe ghidurile Societății Europene de Cardiologie (ESC)",
      diet: {
        title: "Dietă",
        content: `
          <p><strong>Recomandat:</strong></p>
          <ul>
            <li>Creșterea consumului de fructe (≥200 g/zi, 2-3 porții) și legume (≥200 g/zi, 2-3 porții)</li>
            <li>Consumul de pește de 1-2 ori pe săptămână, în special pește gras</li>
            <li>Limitarea consumului de carne roșie la 350-500 g/săptămână</li>
            <li>Alegerea produselor lactate cu conținut scăzut de grăsimi</li>
            <li>Utilizarea produselor din cereale integrale</li>
            <li>Înlocuirea grăsimilor saturate (unt, carne grasă) cu grăsimi nesaturate (ulei de măsline, nuci)</li>
          </ul>
          <p><strong>Limitați:</strong></p>
          <ul>
            <li>Consumul de sare la <5 g/zi</li>
            <li>Alcoolul (<100 g/săptămână)</li>
            <li>Zahărul și băuturile îndulcite</li>
            <li>Produsele din carne procesată</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
        `,
      },
      physicalActivity: {
        title: "Activitate fizică",
        content: `
          <p><strong>Recomandări generale:</strong></p>
          <ul>
            <li>Minimum 150-300 minute de activitate aerobică de intensitate moderată pe săptămână</li>
            <li>SAU 75-150 minute de activitate aerobică intensă pe săptămână</li>
            <li>SAU o combinație echivalentă</li>
            <li>Suplimentar: exerciții de întărire musculară în 2 sau mai multe zile pe săptămână</li>
          </ul>
          <p><strong>Sfaturi practice:</strong></p>
          <ul>
            <li>Mers pe jos cel puțin 30 de minute pe zi (aproximativ 3 km) sau 7.000-10.000 de pași</li>
            <li>Utilizarea scărilor în loc de ascensor</li>
            <li>Activități de agrement active (înot, ciclism, dans)</li>
            <li>Reducerea timpului petrecut în poziția șezut</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
        `,
      },
      smokingCessation: {
        title: "Renunțarea la fumat",
        content: `
          <p><strong>Recomandări:</strong></p>
          <ul>
            <li>Renunțarea completă la toate formele de tutun</li>
            <li>Evitarea fumatului pasiv</li>
            <li>Pentru fumători: solicitați ajutor profesional pentru renunțarea la fumat</li>
            <li>Luați în considerare terapia de înlocuire a nicotinei și/sau suportul medicamentos</li>
          </ul>
          <p><strong>Beneficiile renunțării:</strong></p>
          <ul>
            <li>Reducerea cu 50% a riscului de boală coronariană după 1 an</li>
            <li>Riscul de accident vascular cerebral redus la cel al nefumătorilor după 5-15 ani</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
        `,
      },
      weightReduction: {
        title: "Reducerea greutății",
        content: `
          <p><strong>Indicatori țintă:</strong></p>
          <ul>
            <li>IMC 20-25 kg/m²</li>
            <li>Circumferința taliei <94 cm pentru bărbați și <80 cm pentru femei</li>
          </ul>
          <p><strong>Recomandări:</strong></p>
          <ul>
            <li>Reducerea greutății cu 5-10% față de valoarea inițială oferă deja beneficii pentru sănătate</li>
            <li>Combinația dintre dieta cu restricție calorică și creșterea activității fizice</li>
            <li>Pierdere graduală în greutate (0,5-1 kg pe săptămână)</li>
            <li>Schimbarea pe termen lung a obiceiurilor alimentare</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
        `,
      },
      bloodPressureControl: {
        title: "Controlul tensiunii arteriale",
        content: `
          <p><strong>Indicatori țintă:</strong></p>
          <ul>
            <li>Pentru majoritatea pacienților: <140/90 mmHg</li>
            <li>Dacă este bine tolerată: <130/80 mmHg</li>
            <li>Pentru pacienții >65 ani: TA sistolică 130-139 mmHg</li>
          </ul>
          <p><strong>Măsuri nefarmacologice:</strong></p>
          <ul>
            <li>Limitarea consumului de sare (<5 g/zi)</li>
            <li>Creșterea consumului de fructe și legume</li>
            <li>Activitate fizică regulată</li>
            <li>Menținerea greutății normale</li>
            <li>Limitarea consumului de alcool</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind hipertensiunea arterială (2018) și Ghidurile ESC privind prevenția bolilor cardiovasculare (2021)</em></p>
        `,
      },
      glucoseControl: {
        title: "Controlul glicemiei",
        content: `
          <p><strong>Indicatori țintă pentru pacienții cu diabet:</strong></p>
          <ul>
            <li>HbA1c <7% (53 mmol/mol) pentru majoritatea pacienților</li>
            <li>Glicemia à jeun 4,4-7,2 mmol/L</li>
            <li>Glicemia postprandială <10 mmol/L</li>
          </ul>
          <p><strong>Recomandări:</strong></p>
          <ul>
            <li>Monitorizarea regulată a nivelurilor de glucoză</li>
            <li>Dietă cu indice glicemic scăzut</li>
            <li>Activitate fizică regulată</li>
            <li>Menținerea greutății normale</li>
            <li>Administrarea medicamentelor prescrise</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind diabetul, pre-diabetul și bolile cardiovasculare (2019)</em></p>
        `,
      },
      highRiskWarning: {
        title: "Avertisment important",
        content: `
          <p>Pentru risc cardiovascular ridicat sau foarte ridicat, se recomandă cu tărie:</p>
          <ul>
            <li>Consultarea unui cardiolog</li>
            <li>Monitorizarea regulată a factorilor de risc</li>
            <li>Luarea în considerare a terapiei medicamentoase pentru reducerea nivelurilor de colesterol și a tensiunii arteriale</li>
          </ul>
          <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
        `,
      },
    },
    gag: {
      title: "Detaylı tavsiyeler",
      subtitle: "Evropa Kardioloji Cemiyetinin (ESC) kılavuzlarına dayanarak",
      diet: {
        title: "Diyet",
        content: `
          <p><strong>Tavsiye edilir:</strong></p>
          <ul>
            <li>Meyva (günde ≥200 g, 2-3 porsiyon) ve sebze (günde ≥200 g, 2-3 porsiyon) tüketimini artırmak</li>
            <li>Haftada 1-2 kere balık tüketmek, özellikle yağlı balık</li>
            <li>Kırmızı et tüketimini haftada 350-500 g'a sınırlamak</li>
            <li>Düşük yağlı süt ürünleri seçmek</li>
            <li>Tam tahıllı ürünler kullanmak</li>
            <li>Doymuş yağları (tereyağı, yağlı et) doymamış yağlarla (zeytinyağı, kuruyemiş) değiştirmek</li>
          </ul>
          <p><strong>Sınırlamak:</strong></p>
          <ul>
            <li>Tuz tüketimini günde <5 g'a</li>
            <li>Alkol (haftada <100 g)</li>
            <li>Şeker ve tatlı içecekler</li>
            <li>İşlenmiş et ürünleri</li>
          </ul>
          <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
      physicalActivity: {
        title: "Fizik aktivlik",
        content: `
          <p><strong>Genel tavsiyeler:</strong></p>
          <ul>
            <li>Haftada en az 150-300 dakika orta yoğunlukta aerobik aktivite</li>
            <li>VEYA haftada 75-150 dakika yoğun aerobik aktivite</li>
            <li>VEYA eşdeğer bir kombinasyon</li>
            <li>Ek olarak: haftada 2 veya daha fazla gün kas güçlendirme aktiviteleri</li>
          </ul>
          <p><strong>Praktik tavsiyeler:</strong></p>
          <ul>
            <li>Günde en az 30 dakika yürüyüş (yaklaşık 3 km) veya 7.000-10.000 adım</li>
            <li>Asansör yerine merdiven kullanmak</li>
            <li>Aktif boş zaman aktiviteleri (yüzme, bisiklet, dans)</li>
            <li>Oturma süresini azaltmak</li>
          </ul>
          <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
      smokingCessation: {
        title: "Tütün içmektän vazgeçmäk",
        content: `
          <p><strong>Tavsiyeler:</strong></p>
          <ul>
            <li>Tüm tütün formlarından tamamen vazgeçmek</li>
            <li>Pasif tütün içmekten kaçınmak</li>
            <li>Tütün içenler için: tütün içmekten vazgeçmek için profesyonel yardım almak</li>
            <li>Nikotin replasman tedavisi ve/veya ilaç desteğini düşünmek</li>
          </ul>
          <p><strong>Vazgeçmenin faydaları:</strong></p>
          <ul>
            <li>1 yıl sonra koroner kalp hastalığı riskinde %50 azalma</li>
            <li>5-15 yıl sonra inme riskinin tütün içmeyenlerin seviyesine düşmesi</li>
          </ul>
          <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
      weightReduction: {
        title: "Kilo kaybı",
        content: `
          <p><strong>Hedef göstergeler:</strong></p>
          <ul>
            <li>VKİ 20-25 kg/m²</li>
            <li>Bel çevresi erkekler için <94 cm ve kadınlar için <80 cm</li>
          </ul>
          <p><strong>Tavsiyeler:</strong></p>
          <ul>
            <li>Başlangıç ağırlığından %5-10 kilo kaybı bile sağlık için fayda sağlar</li>
            <li>Kalori kısıtlamalı diyet ve artan fiziksel aktivite kombinasyonu</li>
            <li>Kademeli kilo kaybı (haftada 0,5-1 kg)</li>
            <li>Yeme alışkanlıklarında uzun vadeli değişiklik</li>
          </ul>
          <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
      bloodPressureControl: {
        title: "Kan basıncı kontrolü",
        content: `
          <p><strong>Hedef göstergeler:</strong></p>
          <ul>
            <li>Çoğu hasta için: <140/90 mmHg</li>
            <li>İyi tolere edilirse: <130/80 mmHg</li>
            <li>>65 yaş üstü hastalar için: sistolik KB 130-139 mmHg</li>
          </ul>
          <p><strong>İlaç dışı önlemler:</strong></p>
          <ul>
            <li>Tuz alımını sınırlamak (günde <5 g)</li>
            <li>Meyve ve sebze tüketimini artırmak</li>
            <li>Düzenli fiziksel aktivite</li>
            <li>Normal kilonun korunması</li>
            <li>Alkol tüketiminin sınırlanması</li>
          </ul>
          <p><em>Kaynak: ESC Arteriyel hipertansiyon kılavuzları (2018) ve ESC Kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
      glucoseControl: {
        title: "Glükoz kontrolü",
        content: `
          <p><strong>Diyabetli hastalar için hedef göstergeler:</strong></p>
          <ul>
            <li>Çoğu hasta için HbA1c <7% (53 mmol/mol)</li>
            <li>Açlık glukozu 4,4-7,2 mmol/L</li>
            <li>Yemek sonrası glukoz <10 mmol/L</li>
          </ul>
          <p><strong>Tavsiyeler:</strong></p>
          <ul>
            <li>Glukoz seviyelerinin düzenli izlenmesi</li>
            <li>Düşük glisemik indeksli diyet</li>
            <li>Düzenli fiziksel aktivite</li>
            <li>Normal kilonun korunması</li>
            <li>Reçete edilen ilaçların alınması</li>
          </ul>
          <p><em>Kaynak: ESC Diyabet, pre-diyabet ve kardiyovasküler hastalıklar kılavuzları (2019)</em></p>
        `,
      },
      highRiskWarning: {
        title: "Önemli uyarı",
        content: `
          <p>Yüksek veya çok yüksek kardiyovasküler risk için şunlar şiddetle tavsiye edilir:</p>
          <ul>
            <li>Bir kardiyoloğa danışmak</li>
            <li>Risk faktörlerinin düzenli izlenmesi</li>
            <li>Kolesterol seviyelerini ve kan basıncını düşürmek için ilaç tedavisini düşünmek</li>
          </ul>
          <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
        `,
      },
    },
  }

  // Выбираем соответствующий перевод или используем английский как запасной вариант
  const currentTranslations = translations[language] || translations.en

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>{currentTranslations.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{currentTranslations.subtitle}</p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {recommendations.includes("diet") && (
            <AccordionItem value="diet">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.diet.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.diet.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendations.includes("physicalActivity") && (
            <AccordionItem value="physicalActivity">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.physicalActivity.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.physicalActivity.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendations.includes("smokingCessation") && (
            <AccordionItem value="smokingCessation">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Cigarette className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.smokingCessation.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.smokingCessation.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendations.includes("weightReduction") && (
            <AccordionItem value="weightReduction">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.weightReduction.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.weightReduction.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendations.includes("bloodPressureControl") && (
            <AccordionItem value="bloodPressureControl">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.bloodPressureControl.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.bloodPressureControl.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendations.includes("glucoseControl") && (
            <AccordionItem value="glucoseControl">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-600" />
                  <span>{currentTranslations.glucoseControl.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.glucoseControl.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {(riskCategory === "high" || riskCategory === "veryHigh") && (
            <AccordionItem value="highRiskWarning">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>{currentTranslations.highRiskWarning.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentTranslations.highRiskWarning.content }}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
