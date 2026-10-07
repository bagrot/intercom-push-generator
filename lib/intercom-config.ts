export type ScenarioId = "installation_start" | "installation_reschedule" | "key_issue" | "key_issue_reschedule" | "installed_panel" | "installed_sip" | "app_outage" | "mechanical_failure" | "repair_extension" | "function_restored";
export type FieldKey = "installationDates" | "code" | "issueDates" | "sessions" | "codeOffDate" | "completionDate";
export type ScenarioDefinition = { id: ScenarioId; category: string; label: string; fields: FieldKey[]; required: FieldKey[]; addressRequired: boolean };
export type TemplateRecord = { newsTitle: string; newsBody: string; pushTitle: string; pushBody: string };

export const SCENARIOS: ScenarioDefinition[] = [
  { id: "installation_start", category: "Новый домофон", label: "Начало монтажных работ", fields: ["installationDates", "code"], required: ["installationDates"], addressRequired: true },
  { id: "installation_reschedule", category: "Новый домофон", label: "Изменения даты начала работ", fields: ["installationDates", "code"], required: ["installationDates"], addressRequired: true },
  { id: "key_issue", category: "Новый домофон", label: "Выдача ключей", fields: ["issueDates", "sessions", "codeOffDate"], required: ["issueDates"], addressRequired: true },
  { id: "key_issue_reschedule", category: "Новый домофон", label: "Перенос даты выдачи ключей", fields: ["issueDates", "sessions", "codeOffDate"], required: ["issueDates"], addressRequired: true },
  { id: "installed_panel", category: "Завершена установка", label: "Панель", fields: [], required: [], addressRequired: false },
  { id: "installed_sip", category: "Завершена установка", label: "СИП-адаптер", fields: [], required: [], addressRequired: false },
  { id: "app_outage", category: "Поломка", label: "Управление через ЭД", fields: [], required: [], addressRequired: false },
  { id: "mechanical_failure", category: "Поломка", label: "Механическая поломка", fields: ["completionDate"], required: [], addressRequired: true },
  { id: "repair_extension", category: "Поломка", label: "Продление срока работ", fields: [], required: [], addressRequired: true },
  { id: "function_restored", category: "Поломка", label: "Восстановлен функционал", fields: [], required: [], addressRequired: true },
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
};

export const TEMPLATE_VARIABLES = [
  "{{ADDRESS}}", "{{ADDRESS_SUFFIX}}", "{{INSTALLATION_PERIOD}}", "{{INSTALLATION_VERB}}", "{{CODE_PARAGRAPH}}",
  "{{CODE_CONTINUES_PARAGRAPH}}", "{{ISSUE_PERIOD}}", "{{ISSUE_EVENT}}",
  "{{SESSIONS_PARAGRAPH}}", "{{SESSIONS_RESCHEDULE_PARAGRAPH}}", "{{CODE_OFF_PARAGRAPH}}", "{{COMPLETION_SENTENCE}}",
];
