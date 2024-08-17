import './scss/styles.scss';
import { API_URL, CDN_URL, DEVELOPMENT, SETTINGS } from './utils/constants';

import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { EventEmitter } from '@/components/base/EventEmitter';
import { AppStateEvents, ModalChange } from '@/types/components/model/AppStateEmitter';
import { UIActions, UIEvents } from '@/types/components/view/screen/UIEvents';
import { MainScreen } from '@/components/view/screen/Main';
import { SelectSessionScreen } from '@/components/view/screen/SelectSession';
import { SelectPlacesScreen } from '@/components/view/screen/SelectPlaces';
import { BasketScreen } from '@/components/view/screen/Basket';
import { OrderFormScreen } from '@/components/view/screen/OrderForm';
import { SuccessScreen } from '@/components/view/screen/Success';
import { AppStateChanges, AppStateModals } from '@/types/components/model/AppState';

// Initialize the application
const api = new FilmAPI(CDN_URL, API_URL);
const broker = new EventEmitter<AppStateEvents & UIEvents>();
const app = new AppStateEmitter(broker, api, SETTINGS.appState, AppStateModel);

// Initialize the screens
const main = new MainScreen({
	onOpenBasket: broker.trigger(UIActions.openBasket),
	onSelectFilm: broker.trigger(UIActions.selectMovie),
	onOpenFilm: broker.trigger(UIActions.openMovie),
});

const modal = {
	[AppStateModals.session]: new SelectSessionScreen({
		onSelect: broker.trigger(UIActions.selectSession),
		onNext: broker.trigger(UIActions.openPlaces),
		onClose: broker.trigger(UIActions.closeModal),
	}),
	[AppStateModals.place]: new SelectPlacesScreen({
		onSelect: broker.trigger(UIActions.selectPlaces),
		onNext: broker.trigger(UIActions.openBasket),
		onClose: broker.trigger(UIActions.closeModal),
		onBack: broker.trigger(UIActions.openMovie),
	}),
	[AppStateModals.basket]: new BasketScreen({
		onRemove: broker.trigger(UIActions.removeTicket),
		onNext: broker.trigger(UIActions.makeOrder),
		onClose: broker.trigger(UIActions.closeModal),
		onBack: broker.trigger(UIActions.selectPlaces),
	}),
	[AppStateModals.contacts]: new OrderFormScreen({
		onChange: broker.trigger(UIActions.fillContacts),
		onNext: broker.trigger(UIActions.payOrder),
		onClose: broker.trigger(UIActions.closeModal),
		onBack: broker.trigger(UIActions.openBasket),
	}),
	[AppStateModals.success]: new SuccessScreen({
		onClose: broker.trigger(UIActions.closeModal),
	})
};

// subscribe to UI events
broker.on(UIActions.selectMovie, app.model.selectMovie.bind(app.model));
broker.on(UIActions.openMovie, async (id: string) => {
	await app.model.loadSchedule(id);
	app.model.openModal(AppStateModals.session);
});
broker.on(UIActions.openBasket, app.model.openModal.bind(app.model, AppStateModals.basket));
broker.on(UIActions.selectSession, app.model.selectSession.bind(app.model));
broker.on(UIActions.openPlaces, app.model.openModal.bind(app.model, AppStateModals.place));
broker.on(UIActions.selectPlaces, app.model.selectPlaces.bind(app.model));
broker.on(UIActions.removeTicket, app.model.removeTicket.bind(app.model));
broker.on(UIActions.makeOrder, app.model.openModal.bind(app.model, AppStateModals.contacts));
broker.on(UIActions.fillContacts, app.model.fillContacts.bind(app.model));
broker.on(UIActions.payOrder, async () => {
	const ticketAmount = app.model.basket.size;
	if (app.model.isValidContacts()) {
		const result = await app.model.orderTickets();
		if (result.length === ticketAmount) {
			app.model.openModal(AppStateModals.success);
		}
	}
});
broker.on(UIActions.closeModal, app.model.openModal.bind(app.model, AppStateModals.none));

// Subscribe to model events

broker.on(AppStateChanges.movies, () => {
	main.items = Array.from(app.model.movies.values());
});

broker.on(AppStateChanges.selectedMovie, () => {
	main.selected = app.model.selectedMovie;
});

broker.on(AppStateChanges.modal, ({ previous, current }: ModalChange) => {
	main.page.isLocked = current !== AppStateModals.none;
	if (previous !== AppStateModals.none) {
		modal[previous].render({ isActive: false });
	}
});

broker.on(AppStateChanges.modalMessage, () => {
	if (app.model.openedModal !== AppStateModals.none) {
		modal[app.model.openedModal].render({
			message: app.model.modalMessage,
			isError: app.model.isError,
		});
	}
});

broker.on(AppStateModals.session, () => {
	modal[AppStateModals.session].render({
		film: app.model.selectedMovie,
		schedule: {
			sessions: Array.from(app.model.movieSessions.values()),
			selected: null,
		},
		isActive: true,
		isDisabled: !app.model.selectedSession,
	});
});

broker.on(AppStateChanges.selectedSession, () => {
	modal[AppStateModals.session].isDisabled = !app.model.selectedSession;
});

broker.on(AppStateModals.place, () => {
	modal[AppStateModals.place].render({
		header: {
			title: SETTINGS.placesModal.headerTitle,
			description: app.model.formatMovieDescription({
				title: app.model.selectedMovie.title,
				day: app.model.selectedSession.day,
				time: app.model.selectedSession.time,
			}),
		},
		places: {
			hall: {
				rows: app.model.selectedSession.rows,
				seats: app.model.selectedSession.seats,
			},
			selected: Array.from(app.model.basket.values()),
			taken: app.model.selectedSession.taken,
		},
		isActive: true,
		isDisabled: app.model.basket.size === 0,
	});
});

broker.on(AppStateChanges.basket, () => {
	main.counter = app.model.basket.size;
	modal[AppStateModals.place].render({
		places: {
			selected: Array.from(app.model.basket.values()),
		},
		isDisabled: app.model.basket.size === 0,
	});
	modal[AppStateModals.basket].tickets = Array.from(
		app.model.basket.values()
	).map((ticket) => {
		return app.model.formatTicketDescription(ticket);
	});
});

broker.on(AppStateModals.basket, () => {
	modal[AppStateModals.basket].render({
		header: {
			title: SETTINGS.basketModal.headerTitle,
			description: app.model.basket.size
				? app.model.formatMovieDescription(app.model.getBasketMovie())
				: '',
		},
		tickets: Array.from(app.model.basket.values()).map((ticket) => {
			return app.model.formatTicketDescription(ticket);
		}),
		total: app.model.formatCurrency(app.model.basketTotal),
		isDisabled: app.model.basket.size === 0,
		isActive: true,
	});
});

broker.on(AppStateModals.contacts, () => {
	modal[AppStateModals.contacts].render({
		header: {
			title: SETTINGS.orderModal.headerTitle,
			description: app.model.formatMovieDescription(app.model.getBasketMovie()),
		},
		contacts: app.model.contacts,
		total: app.model.formatCurrency(app.model.basketTotal),
		isDisabled: !app.model.contacts.email && !app.model.contacts.phone,
		isActive: true,
	});
});

broker.on(AppStateChanges.order, () => {
	modal[AppStateModals.contacts].render({
		contacts: app.model.contacts,
		isDisabled: !app.model.contacts.email && !app.model.contacts.phone,
	});
});

broker.on(AppStateModals.success, () => {
	modal[AppStateModals.success].render({
		content: SETTINGS.successModal,
		isActive: true,
	});
});

if (DEVELOPMENT) {
	broker.onAll((event) => console.log(`Event: `, event));
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.__model = app.model;
}

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));