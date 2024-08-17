# Проектная работа "Film!" — афиша фильмов

Для сборки проекта

```
npm run build
```

или

```
yarn build
```

Для запуска

```
npm run start
```

или

```
yarn start
```

## Описание проекта

Проект "Film!" реализует пример типового билетного сервиса, в данном случае для кинотеатра. Пользователь может просматривать афишу фильмов, выбирать сеанс и бронировать билеты. Проект реализован на TypeScript и представляет собой SPA (Single Page Application) с использованием API для получения данных о фильмах и сеансах.

Особенности реализации:
— в один момент времени можно бронировать билеты только на один сеанс;
— сеансы обновляются на сервере раз в сутки;
— при использовании заглушки АПИ билеты бронируются на сутки и можно видеть что места заняты;
— до оформления заказа содержимое корзины сохраняется в localStorage;
— после успешного заказа контактные данные сохраняются в localStorage и подставляются в форму заказа в следующий раз.

## Описание интерфейса

Интерфейс можно условно разделить на 3 процесса:
1. Просмотр афиши фильмов (MainScreen)
2. Выбор сеанса и мест (SelectSessionScreen, SelectPlaceScreen)
3. Оформление заказа (BasketScreen, OrderScreen, SuccessScreen)

Так как модальные окна в проекте однотипные, то их общая логика и структура вынесена в абстрактный класс ModalScreen. Все модальные окна наследуются от него и переопределяют методы для своих нужд.

## Структура проекта

.
├── src/
│   ├── common.blocks/ [Стили компонент верстки]
│   ├── components/ [Реализация]
│   │   ├── base/ [Базовый код]
│   │   ├── model/ [Модели данных и АПИ]
│   │   ├── view/ [Отображения]
│   │   │   ├── common/ [Общие]
│   │   │   ├── partial/ [Частичные]
│   │   │   ├── screen/ [Верхнеуровневые, экраны]
│   │   ├── controller/
│   ├── pages/
│   │   ├── index.html [Основная страница и шаблоны компонент]
│   ├── types/ [Типизация]
│   │   ├── components/
│   │   │   ├── base/ [Базовый код]
│   │   │   ├── model/ [Модели данных и АПИ]
│   │   │   ├── view/ [Отображения]
│   │   ├── global.d.ts [Глобальные типы, расширение окружения]
│   │   ├── settings.ts [Типизация настроек]
│   │   ├── html.ts [Типизация настроек]
│   ├── utils/
│   │   ├── constants.ts [Настройки проекта]
│   │   ├── html.ts [Утилиты для работы с DOM]
├── api.yaml [Спецификация API]

## Архитектура проекта (MVC)

Реализована единая модель данных приложения в файле `src/components/model/AppState.ts`, содержащая всю логику работы с данными и возможные действия над ними. Все изменения данных происходят через методы модели, а она в свою очередь уведомляет об изменениях через метод настроек `onChange(changes: AppStateChanges)` чтобы не зависеть от конкретного способа коммуникации между компонентами. Подключение модели к системе событий производится через обертку `src/components/model/AppStateEmitter.ts`.

Экземпляр модели передается в контроллеры, которые по факту являются обработчиками пользовательских действий и обновляют состояние модели через ее методы. Экземпляры контроллеров передаются в качестве объекта содержащего обработчики событий в верхнеуровневые отображения (экраны).

При обработке событий возникающих в AppStateEmitter производится обновление данных в верхнеуровневых отображениях. Экраны это фактически крупные сборки инкапсулирующие детали реализации интерфейса и принимающие из вне только обработчики событий и необходимые данные. Экраны внутри составлены из более мелких отображений, которые инициализируют с помощью глобальных настроек проекта и распределяют данные между вложенными отображениями через свойства и метод `render()`.

Общую цепочку взаимодействия можно представить следующим образом:

```typescript
const api = new Api(); // Инициализация API
const app = new ModelEmitter(api); // Инициализация модели и событий
const screen = new Screen( // Инициализация экрана
    // экран ждет объект с обработчиками событий, например { onClick: () => void }
	new Controller( // Инициализация контроллера
        /* { // Обработчики событий
            onClick: () => {
                app.model.value += 1;
            }
        }*/
		app.model // Передача модели в контроллер
    )
);

app.on('change:value', () => {
	screen.value = app.model.value;
});

// Screen.onClick -> Controller.onClick -> Model.value -> Screen.value
```

И таким образом соединяем между собой все компоненты приложения.

### Отображения

Отображения в проекте разделены на три типа:
- `common` — общие компоненты, не зависящие от доменной области проекта
- `partial` — частичные компоненты, реализующие доменную область проекта
- `screen` — верхнеуровневые компоненты, которые являются экранами приложения

Первые два типа (common и partial) независимо типизированы, не используют глобальных настроек напрямую и могут быть легко переносимы между проектами. Экраны (screen) же зависят от глобальных настроек и используют их для инициализации и передачи данных между вложенными отображениями, так как по факту это соединительный код для удобства вынесенные в отдельные файлы и оформленный как отображение.

Каждое отображение (кроме Screen) устроено следующим образом:

```typescript
class Component extends View<Тип_данных, Тип_настроек> {
    constructor(public element: HTMLElement, protected readonly settings: Settings) {
        super(element, settings);
        // Не переопределяем конструктор в своих отображениях!
    }
		
	protected init() {
        // Используем метод жизненного цикла, для инициализация компонента	
        // Здесь вешаем события
    }	

    set value(value: number) {
        // Устанавливаем поле данных "value" в верстке
    }
		
    render() {
        // Отрисовка компонента
        // Переопределяем только по необходимости
        return this.element;
    }
}
```

Если необходимо использовать в одном отображении другие, то передаем их через настройки, не создавая зависимость напрямую. Пример:

```typescript
interface ChildData {
    value: number;
}

interface ComponentData {
	content: ChildData;
}

interface ComponentSettings {
	contentView: IView<ChildData> // Ждем отображение принимающее данные типа ChildData
}

class Component extends View<Тип_данных, Тип_настроек> {
    set content(data: ChildData) {
        this.settings.contentView.render(data);
        // или this.settings.contentView.value = data.value; 
    }
}
```

Если нужно использовать переданное отображение как шаблон, то можно использовать метод `copy()` — копирующие конструктор, который создает новый экземпляр отображения с теми же настройками (но их можно переопределить через параметры метода).


### Модели

Модели в проекте представлены классом `AppState`, который содержит в себе все данные и логику работы с ними. Модель частично реализует паттерн "Наблюдатель", и уведомляет об изменениях через метод `onChange(changes: AppStateChanges)`. Для удобства работы с данными в модели реализованы методы для изменения данных, которые в свою очередь вызывают метод `onChange()`.

В целом типовая модель данных выглядит следующим образом:

```typescript
enum ModelChanges {
    // Изменения в модели
    value = 'change:value'
}

interface ModelSettings {
    // Настройки модели
    onChange(changes: ModelChanges): void;
}

class Model {
    constructor(
			protected api: Api, // API для работы с данными
            protected settings: ModelSettings // Настройки и обработчики событий
    ) {
        // Инициализация модели
    }

    // Методы для изменения данных
    public changeValue(value: number) {
        // Изменение данных
        this.onChange(ModelChanges.value);
    }
}
```

### Контроллеры

Контроллеры в проекте представлены классами унаследованными от `Controller`, и являются обработчиками пользовательских действий и обновляют состояние модели через ее методы. Контроллеры принимают в себя экземпляр модели и обрабатывают события, вызывая методы модели для изменения данных.

Пример контроллера:

```typescript
class Controller {
    constructor(
        protected model: Model // Модель для работы с данными
    ) {
        // Инициализация контроллера
    }

    public onClick = () => { // чтобы не потерять контекст
        // Обработка события
        this.model.changeValue(1);
    }
}
```

Обычно при использовании контроллеров бизнес-логику перераспределяют так, что в моделях не принимаются решения, а только изменяются данные с соблюдением их взаимозависимостей. В контроллерах же происходит обработка событий и принятие решений, а также обновление данных в моделях. Но это не строгое правило и в зависимости от проекта можно использовать разные подходы, например в этом проекте используется несколько реализаций архитектуры в разных ветках и чтобы не переносить много кода модель реализует практически всю логику, что несколько упрощает роль контроллеров.

