import barrierTemplates from "./barrier-templates.json";

export type ProfileId = "intercom" | "barrier";
export type ScenarioId = "installation_start" | "modernization_sip" | "installation_reschedule" | "key_issue" | "key_issue_reschedule" | "installed_panel" | "installed_sip" | "app_outage" | "mechanical_failure" | "repair_extension" | "function_restored" | "barrier_new" | "barrier_operation" | "barrier_replacement" | "barrier_widget" | "barrier_entry_rules" | "barrier_maintenance" | "barrier_connection" | "barrier_plate_restored" | "barrier_plate_issues" | "barrier_radars" | "barrier_operator" | "barrier_no_quorum" | "barrier_commercial";
export type FieldKey = "installationDates" | "code" | "issueDates" | "sessions" | "codeOffDate" | "completionDate" | "barrierOperationDate" | "barrierWorkDate" | "barrierWorkTime" | "barrierOutageDates" | "barrierRadarDate";
export type ScenarioDefinition = { id: ScenarioId; profile: ProfileId; category: string; label: string; fields: FieldKey[]; required: FieldKey[]; addressRequired: boolean };
export type TemplateRecord = { newsTitle: string; newsBody: string; pushTitle: string; pushBody: string };

export const SCENARIOS: ScenarioDefinition[] = [
  { id: "installation_start", profile: "intercom", category: "Новый домофон", label: "Начало монтажных работ", fields: ["installationDates", "code"], required: ["installationDates"], addressRequired: true },
  { id: "modernization_sip", profile: "intercom", category: "Новый домофон", label: "Модернизация (СИП-адаптер)", fields: ["installationDates"], required: ["installationDates"], addressRequired: false },
  { id: "installation_reschedule", profile: "intercom", category: "Новый домофон", label: "Изменения даты начала работ", fields: ["installationDates", "code"], required: ["installationDates"], addressRequired: true },
  { id: "key_issue", profile: "intercom", category: "Новый домофон", label: "Выдача ключей", fields: ["issueDates", "sessions", "codeOffDate"], required: ["issueDates"], addressRequired: true },
  { id: "key_issue_reschedule", profile: "intercom", category: "Новый домофон", label: "Перенос даты выдачи ключей", fields: ["issueDates", "sessions", "codeOffDate"], required: ["issueDates"], addressRequired: true },
  { id: "installed_panel", profile: "intercom", category: "Завершена установка", label: "Панель", fields: [], required: [], addressRequired: false },
  { id: "installed_sip", profile: "intercom", category: "Завершена установка", label: "СИП-адаптер", fields: [], required: [], addressRequired: false },
  { id: "app_outage", profile: "intercom", category: "Поломка", label: "Управление через ЭД", fields: [], required: [], addressRequired: false },
  { id: "mechanical_failure", profile: "intercom", category: "Поломка", label: "Механическая поломка", fields: ["completionDate"], required: [], addressRequired: true },
  { id: "repair_extension", profile: "intercom", category: "Поломка", label: "Продление срока работ", fields: [], required: [], addressRequired: true },
  { id: "function_restored", profile: "intercom", category: "Поломка", label: "Восстановлен функционал", fields: [], required: [], addressRequired: true },
  { id: "barrier_new", profile: "barrier", category: "Подключение и установка", label: "Новый шлагбаум", fields: [], required: [], addressRequired: false },
  { id: "barrier_operation", profile: "barrier", category: "Подключение и установка", label: "Начало эксплуатации", fields: ["barrierOperationDate"], required: ["barrierOperationDate"], addressRequired: false },
  { id: "barrier_replacement", profile: "barrier", category: "Подключение и установка", label: "Замена шлагбаумов", fields: [], required: [], addressRequired: false },
  { id: "barrier_widget", profile: "barrier", category: "Виджет и правила", label: "Реклама виджета домофоны+шлагбаум", fields: [], required: [], addressRequired: false },
  { id: "barrier_entry_rules", profile: "barrier", category: "Виджет и правила", label: "Новые правила въезда", fields: [], required: [], addressRequired: false },
  { id: "barrier_maintenance", profile: "barrier", category: "Стрелы подняты", label: "Технические работы (стрелы подняты)", fields: ["barrierWorkDate", "barrierWorkTime"], required: ["barrierWorkDate"], addressRequired: false },
  { id: "barrier_connection", profile: "barrier", category: "Стрелы подняты", label: "Ограничения связи (стрелы подняты)", fields: ["barrierOutageDates"], required: [], addressRequired: false },
  { id: "barrier_plate_restored", profile: "barrier", category: "Распознавание ГРЗ", label: "Добавление ГРЗ (восстановлено)", fields: [], required: [], addressRequired: false },
  { id: "barrier_plate_issues", profile: "barrier", category: "Распознавание ГРЗ", label: "Проблемы с распознаванием", fields: [], required: [], addressRequired: false },
  { id: "barrier_radars", profile: "barrier", category: "Распознавание ГРЗ", label: "Отключение радаров", fields: ["barrierRadarDate"], required: [], addressRequired: false },
  { id: "barrier_operator", profile: "barrier", category: "Распознавание ГРЗ", label: "Смена ОО (обновление распознавания)", fields: [], required: [], addressRequired: false },
  { id: "barrier_no_quorum", profile: "barrier", category: "Отключение управления ЭД", label: "Нет кворума", fields: [], required: [], addressRequired: false },
  { id: "barrier_commercial", profile: "barrier", category: "Отключение управления ЭД", label: "Коммерция", fields: [], required: [], addressRequired: false },
];

const SUPPORT = "По вопросам работы домофона можно обращаться в службу технической поддержки через форму обратной связи в разделе «Еще» — «Техподдержка», категория «Домофон» или по телефону +7 (499) 652-62-11. При обращении, пожалуйста, опишите ваш вопрос максимально подробно.";
const WIDGET = "Также вы можете скачать инструкцию по установке виджета для вашего устройства. С его помощью можно открывать дверь подъезда, не заходя в приложение.\nИнструкция для iOS: https://ed.mos.ru/storage/f3350e2d-8209-4654-95e6-583cbe9116a3\nИнструкция для Android: https://ed.mos.ru/storage/76b0bf8c-c54f-419d-9bf3-af7d654611ad";

export const DEFAULT_TEMPLATES: Record<ScenarioId, TemplateRecord> = {
  installation_start: {
    newsTitle: "Установка новых домофонов и временный код",
    newsBody: "Уважаемые жители, {{INSTALLATION_PERIOD}} в вашем доме по адресу: {{ADDRESS}} будет устанавливаться новое домофонное оборудование.{{CODE_PARAGRAPH}}\n\nО дате выдачи магнитных ключей сообщим дополнительно.",
    pushTitle: "Временный код от домофона",
    pushBody: "На период работ по установке нового оборудования в вашем доме",
  },
  modernization_sip: {
    newsTitle: "Бесплатная модернизация домофонов",
    newsBody: "Уважаемые жители, {{INSTALLATION_PERIOD}} в вашем доме будут проводиться работы по бесплатной модернизации домофонного оборудования. Работы проводятся за счет организации, обслуживающей домофоны, с целью подключения системы к сервису «Умный домофон».\n\nБлагодаря модернизации вы сможете управлять домофоном со своего смартфона, в приложении «Электронный дом Москва», даже находясь вне дома:\n- получать видеозвонки от домофона на ваш смартфон;\n- открывать дверь подъезда нажатием кнопки в приложении;\n- создавать временные ссылки или коды для ваших гостей и курьеров.\n\nСтоимость оплаты за использование домофона после модернизации не изменится.",
    pushTitle: "Бесплатная модернизация",
    pushBody: "Домофон в вашем доме будет подключен к сервису «Умный домофон» с управлением через приложение «Электронный дом»",
  },
  installation_reschedule: {
    newsTitle: "Перенос сроков установки нового домофона",
    newsBody: "Работы по установке нового домофона в вашем доме по адресу: {{ADDRESS}} {{INSTALLATION_VERB}} {{INSTALLATION_PERIOD}}.\n\n{{CODE_CONTINUES_PARAGRAPH}}Приносим извинения за доставленные неудобства.",
    pushTitle: "Установка нового домофона",
    pushBody: "Сроки установки нового домофона в вашем доме перенесены. Временный код продолжает действовать.",
  },
  key_issue: {
    newsTitle: "Дата выдачи магнитных ключей от нового домофона",
    newsBody: "{{ISSUE_PERIOD}} будут выдаваться магнитные ключи от нового домофона в вашем доме по адресу: {{ADDRESS}}.{{SESSIONS_PARAGRAPH}}{{CODE_OFF_PARAGRAPH}}",
    pushTitle: "Дата выдачи ключей",
    pushBody: "{{ISSUE_PERIOD}} можно будет получить магнитные ключи от нового домофона в вашем доме",
  },
  key_issue_reschedule: {
    newsTitle: "Новая дата выдачи магнитных ключей от нового домофона",
    newsBody: "Выдача магнитных ключей от нового домофона в вашем доме по адресу: {{ADDRESS}} {{ISSUE_EVENT}}.{{SESSIONS_RESCHEDULE_PARAGRAPH}}{{CODE_OFF_PARAGRAPH}}",
    pushTitle: "Новая дата выдачи ключей",
    pushBody: "Изменилась дата выдачи магнитных ключей от нового домофона в вашем доме",
  },
  installed_panel: {
    newsTitle: "Завершены работы по установке домофона",
    newsBody: `В вашем доме{{ADDRESS_SUFFIX}} завершена установка нового домофона. Теперь управлять им можно через приложение «Электронный дом»:\n- принимать видеозвонки с домофона на свой смартфон;\n- создавать в приложении коды для входа в подъезд;\n- дистанционно открывать дверь подъезда кнопкой в приложении.\n\nДля доступа к управлению необходимо подтвердить собственность или регистрацию (прописку) по адресу в разделе «Мой дом». После этого на главной странице приложения появится кнопка «Домофон». Нажав на нее, вы сможете:\n- открыть дверь подъезда;\n- нажать значок шестеренки и сгенерировать временный код для вашего гостя.\n\n${WIDGET}\n\n${SUPPORT}`,
    pushTitle: "Домофон установлен",
    pushBody: "В вашем доме завершена установка нового домофона с управлением через приложение «Электронный дом»",
  },
  installed_sip: {
    newsTitle: "Домофон подключен к платформе «Электронный дом»",
    newsBody: `Домофон в вашем доме{{ADDRESS_SUFFIX}} подключен к управлению через приложение «Электронный дом», которое позволяет:\n- принимать видеозвонки с домофона на свой смартфон;\n- создавать в приложении одноразовые ссылки для входа в подъезд;\n- дистанционно открывать дверь подъезда кнопкой в приложении.\n\nДля доступа к управлению необходимо подтвердить собственность или регистрацию (прописку) по адресу в разделе «Мой дом». После этого на главной странице приложения появится кнопка «Домофон». Нажав на нее, вы сможете:\n- открыть дверь подъезда;\n- нажать значок шестеренки и сгенерировать одноразовую ссылку для вашего гостя.\n\n${WIDGET}\n\n${SUPPORT}`,
    pushTitle: "Домофон обновлен",
    pushBody: "Теперь управлять домофоном в вашем доме можно через приложение «Электронный дом»",
  },
  app_outage: {
    newsTitle: "Управление домофоном через приложение временно недоступно",
    newsBody: "По техническим причинам временно недоступно управление домофоном через приложение «Электронный дом» в вашем доме{{ADDRESS_SUFFIX}}.\n\nДля входа в подъезд используйте магнитный ключ и ваш индивидуальный код.",
    pushTitle: "Функционал домофона ограничен",
    pushBody: "Управление домофоном через приложение «Электронный дом» временно недоступно. Пользуйтесь магнитным ключом и кодом.",
  },
  mechanical_failure: {
    newsTitle: "Домофон не работает, дверь в подъезд открыта",
    newsBody: "Ведутся работы по восстановлению работы домофона в вашем доме по адресу: {{ADDRESS}}.{{COMPLETION_SENTENCE}}\n\nНа время ремонтных работ дверь в подъезд будет открыта.",
    pushTitle: "Домофон не работает",
    pushBody: "На время ремонтных работ дверь в подъезд будет открыта",
  },
  repair_extension: {
    newsTitle: "Ремонт домофона займет больше времени",
    newsBody: "К сожалению, ремонт домофона в вашем доме по адресу: {{ADDRESS}} займет больше времени, чем было запланировано изначально.\n\nО восстановлении работы домофона мы сообщим дополнительно. Приносим извинения за доставленные неудобства.",
    pushTitle: "Продление сроков ремонта",
    pushBody: "Работы по ремонту домофона в вашем доме продолжаются",
  },
  function_restored: {
    newsTitle: "Домофон в вашем доме работает в штатном режиме",
    newsBody: "Работа домофона в вашем доме по адресу: {{ADDRESS}} полностью восстановлена. Для входа в подъезд вы можете использовать:\n- магнитный ключ;\n- код;\n- кнопку в приложении «Электронный дом».",
    pushTitle: "Домофон работает",
    pushBody: "Работа умного домофона в вашем доме восстановлена",
  },
  ...barrierTemplates,
};

export const TEMPLATE_VARIABLES = [
  "{{ADDRESS}}", "{{ADDRESS_SUFFIX}}", "{{INSTALLATION_PERIOD}}", "{{INSTALLATION_VERB}}", "{{CODE_PARAGRAPH}}",
  "{{CODE_CONTINUES_PARAGRAPH}}", "{{ISSUE_PERIOD}}", "{{ISSUE_EVENT}}",
  "{{SESSIONS_PARAGRAPH}}", "{{SESSIONS_RESCHEDULE_PARAGRAPH}}", "{{CODE_OFF_PARAGRAPH}}", "{{COMPLETION_SENTENCE}}",
  "{{BARRIER_OPERATION_DATE}}", "{{BARRIER_OPERATION_NEXT_DATE}}", "{{BARRIER_WORK_DATE}}", "{{BARRIER_WORK_TIME}}", "{{BARRIER_OUTAGE_PERIOD}}", "{{BARRIER_RADAR_START}}",
];
