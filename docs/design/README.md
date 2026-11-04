# Дизайн

Здесь лежат ссылки на макеты в Figma, описание стиля и пояснения, где в проекте лежат иконки.

## Ссылки на Figma

| Что | Ссылка |
|---|---|
| Макеты всех экранов (Landing, создание поездки, вход по ссылке, страница поездки и вкладки, выбор аватара-животного) | https://www.figma.com/design/D8xGyTXfBSuFRWLmYy1oIj/Untitled?t=fHvTXZ7ZCBlILikp-1 |
| Логотип «ВПуть», иконки вкладок, фавиконки | https://www.figma.com/design/uiFGZNjJ7mO567Cx28AqfC/Untitled?t=fHvTXZ7ZCBlILikp-1 |
| Цвета и компоненты UI-кита (кнопки, поля, чекбоксы, карточки, модальное окно) | https://www.figma.com/design/ps39eT7o98MK2hzoG54ZYP |

Чтобы выгрузить макет из Figma файлом: выделите экран → внизу справа панель Export → PDF или PNG → Export. Готовые файлы можно класть в эту папку.

## Описание стиля

Цвета, состояния компонентов и примеры CSS: [colors-and-components.md](colors-and-components.md).
Переменные для CSS: [`frontend/src/styles/variables.css`](../../frontend/src/styles/variables.css).

## Иконки в проекте

```
frontend/
├── public/                      иконки приложения (браузер и телефон)
│   ├── favicon.ico, favicon.svg, favicon-16.png, favicon-32.png
│   ├── apple-touch-icon.png (180x180), apple-touch-icon.svg, icon-192.png
│   ├── logo.svg                 основной знак логотипа
│   └── logo/                    варианты логотипа: logo-blue, logo-white, logo-light-blue,
│                                самолёт без фона: plane-blue, plane-black, plane-white
└── src/assets/
    └── icons/                   иконки кнопок и вкладок (синие, #1b5583)
        ├── participants, route, budget, tickets, checklist   вкладки
        ├── plus, close, dots, share, arrow-right, check, retry, error, spinner
        └── white/               белые версии для тёмных кнопок (Primary)
```

Как подключить иконку в React:

```jsx
import plusIcon from "../assets/icons/plus.svg";
import plusWhite from "../assets/icons/white/plus.svg";

<button className="btn btn-primary"><img src={plusWhite} alt="" width="18" height="18" /> Добавить</button>
```

Иконки из `public/` подключаются по абсолютному пути: `<img src="/logo.svg" alt="ВПуть" />`.
Иконки нарисованы на сетке 24 px, линия 1,8 px. Размер задавайте через `width` и `height`.
