import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Activity, Cigarette, Droplet, Utensils, Clock } from "lucide-react"

export default function EducationalContent() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Понимание сердечно-сосудистого риска</CardTitle>
        <CardDescription>Узнайте о факторах, влияющих на риск сердечно-сосудистых заболеваний</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <span>Что такое система SCORE?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                SCORE (Systematic COronary Risk Evaluation) — это система оценки риска, разработанная Европейским
                обществом кардиологии. Она оценивает 10-летний риск первого фатального атеросклеротического события,
                включая инфаркт миокарда, инсульт или другое окклюзионное артериальное заболевание. Система учитывает
                возраст, пол, курение, систолическое артериальное давление и общий холестерин.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-rose-500" />
                <span>Артериальное давление и холестерин</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                Высокое артериальное давление (гипертония) и повышенный уровень холестерина являются основными факторами
                риска ССЗ. Показатели артериального давления выше 130/80 мм рт.ст. считаются повышенными. Для
                холестерина общий уровень должен быть ниже 5,0 ммоль/л, ЛПНП (плохой холестерин) ниже 3,0 ммоль/л, а
                ЛПВП (хороший холестерин) выше 1,0 ммоль/л для мужчин и 1,2 ммоль/л для женщин.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Cigarette className="h-5 w-5 text-rose-500" />
                <span>Курение</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                Курение повреждает кровеносные сосуды, снижает уровень кислорода в крови и повышает артериальное
                давление и частоту сердечных сокращений. Оно значительно увеличивает риск сердечных заболеваний,
                инсульта и заболеваний периферических сосудов. Отказ от курения может быстро снизить ваш
                сердечно-сосудистый риск, причем положительные эффекты начинаются уже через несколько часов после
                прекращения курения.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                <span>Физическая активность</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                Регулярная физическая активность укрепляет сердце, улучшает кровообращение и помогает поддерживать
                здоровый вес. Взрослым рекомендуется не менее 150 минут аэробной активности умеренной интенсивности или
                75 минут интенсивной активности в неделю, а также силовые тренировки 2 или более дней в неделю.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-rose-500" />
                <span>Питание</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                Здоровое для сердца питание включает фрукты, овощи, цельные злаки, нежирные белки и полезные жиры.
                Ограничьте потребление натрия, добавленных сахаров и насыщенных жиров. Средиземноморская диета и диета
                DASH особенно полезны для сердечно-сосудистого здоровья, они делают акцент на растительной пище, рыбе и
                оливковом масле, ограничивая красное мясо и обработанные продукты.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="flex items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500" />
                <span>Возраст и семейный анамнез</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">
                Сердечно-сосудистый риск увеличивается с возрастом, и семейный анамнез может играть значительную роль.
                Если у вас есть родственник первой степени родства (родитель или брат/сестра), у которого развилось
                сердечное заболевание до 55 лет (для мужчин) или до 65 лет (для женщин), ваш риск может быть выше. Хотя
                вы не можете изменить эти факторы, осведомленность может мотивировать к более раннему и агрессивному
                управлению модифицируемыми факторами риска.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
