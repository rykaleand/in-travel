# Цвета и компоненты UI-кита «ВПуть»

Макеты: https://www.figma.com/design/ps39eT7o98MK2hzoG54ZYP , файл «ВПуть · цвета и компоненты» (страницы «Палитра» и «Компоненты»). Токены в коде: `frontend/src/styles/variables.css`.

## 1. Палитра

Палитра собрана из цветов, которые уже использовались в макетах приложения и айдентике. Новые добавлены только там, где не хватало состояний (hover/active, тёмные оттенки для контрастного текста).

### Основной (brand)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-primary` | `#1b5583` | Основные кнопки, активные элементы, ссылки |
| `--color-primary-hover` | `#164a73` | Primary при наведении |
| `--color-primary-active` | `#103a5a` | Primary при нажатии |
| `--color-primary-soft` | `#9aceeb` | Активная вкладка, выбранный чип, фон аватара |
| `--color-primary-faint` | `#e1f1fa` | Светлый фон акцентных блоков |
| `--color-accent` | `#0091e6` | Фокус-кольцо, полосы прогресса, выбранный аватар, галочки |

### Нейтральные (серые)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-neutral-0` | `#ffffff` | Поверхности: карточки, поля, модальные окна |
| `--color-neutral-50` | `#f5f7f9` | Фон страницы |
| `--color-neutral-100` | `#eceff2` | Разделители, фон отключённых элементов, скелетоны |
| `--color-neutral-200` | `#dde2e7` | Границы карточек и полей |
| `--color-neutral-300` | `#c3cbd3` | Границы при наведении, усиленные границы |
| `--color-neutral-400` | `#9aa5b1` | Текст отключённых элементов, плейсхолдеры |
| `--color-neutral-600` | `#5b6672` | Второстепенный текст |
| `--color-neutral-900` | `#000000` | Основной текст |

### Успех (success)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-success` | `#84d784` | Заливка индикаторов, отметка выполнено |
| `--color-success-bg` | `#addfad` | Фон плашек: положительный баланс, «Утверждено» |
| `--color-success-strong` | `#2e7d32` | Иконки и текст успеха на светлом фоне |

### Ошибка (error)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-error` | `#cd5c5c` | Граница поля с ошибкой, иконки ошибок |
| `--color-error-hover` | `#b94a4a` | Деструктивная кнопка при наведении |
| `--color-error-bg` | `#f7dfdf` | Фон сообщений об ошибке, отрицательный баланс |
| `--color-error-strong` | `#a93c3c` | Текст ошибки на светлом фоне |

### Предупреждение (warning)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-warning` | `#fcd975` | Фон плашек: «Голосование» |
| `--color-warning-bg` | `#fff4d1` | Светлый фон предупреждений |
| `--color-warning-strong` | `#8a5a00` | Текст и иконки предупреждений |

### Информация (info)

| Токен | HEX | Назначение |
|---|---|---|
| `--color-info` | `#0091e6` | Информационные иконки и ссылки |
| `--color-info-bg` | `#e1f1fa` | Фон информационных сообщений |
| `--color-info-strong` | `#00689f` | Текст информационных сообщений |

### Алиасы

| Токен | HEX | Назначение |
|---|---|---|
| `--color-text` | `#000000` | Основной текст (= neutral-900) |
| `--color-text-muted` | `#5b6672` | Второстепенный текст (= neutral-600) |
| `--color-text-disabled` | `#9aa5b1` | Отключённый текст (= neutral-400) |
| `--color-text-on-primary` | `#ffffff` | Текст на primary |
| `--color-bg-page` | `#f5f7f9` | Фон страницы (= neutral-50) |
| `--color-bg-surface` | `#ffffff` | Поверхность (= neutral-0) |
| `--color-bg-disabled` | `#eceff2` | Фон отключённых элементов (= neutral-100) |
| `--color-border` | `#dde2e7` | Границы (= neutral-200) |
| `--color-border-strong` | `#c3cbd3` | Усиленные границы (= neutral-300) |
| `--color-divider` | `#eceff2` | Разделители (= neutral-100) |
| `--color-focus-ring` | `#0091e6` | Кольцо фокуса (= accent) |

### Замечания

- Нейтральные оттенки серые; ранее на макетах фон был слегка голубоватым, теперь страница `#f5f7f9`.
- `#84d784` (зелёный полукруг в логотипе) использован как `--color-success`, `#addfad` как фон плашек.
- Контраст: основной текст `#000` на белом 21:1; второстепенный `#5b6672` на белом ~5.9:1; `error-strong` и `success-strong` на белом выше 4.5:1.
- Не передавайте смысл только цветом: у ошибок есть иконка и текст, у балансов знак «+»/«−».

## 2. Компоненты

Все компоненты — варианты (Variants) в Figma, цвета привязаны к переменным.

### Button
Типы: Primary, Secondary, Text. Состояния: default, hover, active, disabled. Высота 44 px, радиус 10 px, текст Inter Medium 14.

| Тип | default | hover | active | disabled |
|---|---|---|---|---|
| Primary | фон `primary`, текст белый | `primary-hover` | `primary-active` | фон `bg-disabled`, текст `text-disabled` |
| Secondary | белый фон, граница `border-strong`, текст `text` | фон `neutral-50`, граница `neutral-400` | фон `neutral-100` | фон `bg-disabled`, граница `border`, текст `text-disabled` |
| Text | без фона, текст `primary` | фон `primary-faint` | фон `primary-soft` | текст `text-disabled` |

### Input
Состояния: default, focus, error, disabled. Высота 44 px, радиус 10 px, подпись над полем (Inter Medium 14), подсказка или текст ошибки под полем.

- default: граница `border-strong`, плейсхолдер `text-disabled`.
- focus: граница `accent` 2 px и кольцо `--focus-shadow`.
- error: граница `error`, сообщение `error-strong` с иконкой, фон сообщения `error-bg`.
- disabled: фон `bg-disabled`, текст `text-disabled`.

### Checkbox
Состояния: default, checked, disabled, disabled + checked. Размер 22 px, радиус 6 px. Checked: заливка `primary`, белая галочка. Для завершённых пунктов чек-листа допускается заливка `success`.

### Card (элемент списка)
Белая поверхность, граница `border`, радиус 14 px. Варианты: «Точка маршрута» (номер дня, название, статус-плашка, меню) и «Трата» (категория, кто платил, сумма).

### Modal
Заголовок (Cormorant Garamond или Inter SemiBold 20) и кнопка закрытия, содержимое, футер с кнопками «Отмена» (Secondary) и основным действием (Primary). Ширина 480 px, радиус 20 px, затемнение фона.

## 3. Использование в коде

```css
.button-primary { background: var(--color-primary); color: var(--color-text-on-primary); border-radius: var(--radius-md); }
.button-primary:hover { background: var(--color-primary-hover); }
.input:focus-visible { border-color: var(--color-accent); box-shadow: var(--focus-shadow); }
.input--error { border-color: var(--color-error); }
```
