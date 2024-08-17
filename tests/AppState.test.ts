import { SETTINGS } from '../src/utils/constants';
import { AppStateModel } from '../src/components/model/AppState';
import { Movie, Order, OrderResult, Session } from '../src/types/components/model/FilmApi';
import { AppState, AppStateChanges } from '../src/types/components/model/AppState';


describe('AppState', () => {
	let api: {
		getFilms: jest.Mock<Promise<Movie[]>, never>
		getFilmSchedule: jest.Mock<Promise<Session[]>, [string]>;
		orderTickets: jest.Mock<Promise<OrderResult[]>, [Order]>;
	};
	let appState: AppState;
	let onChange: jest.Mock<void, [AppStateChanges]>;

	beforeEach(() => {
		onChange = jest.fn();
		api = {
			getFilms: jest.fn<Promise<Movie[]>, never>(() => Promise.resolve([
				{
					id: '1',
					rating: 10,
					director: 'Director',
					tags: ['tag1', 'tag2'],
					title: 'Title',
					about: 'About',
					description: 'Description',
					image: 'image.jpg',
					cover: 'cover.jpg'
				},
				{
					id: '2',
					rating: 10,
					director: 'Director',
					tags: ['tag1', 'tag2'],
					title: 'Title',
					about: 'About',
					description: 'Description',
					image: 'image.jpg',
					cover: 'cover.jpg'
				}
			])),
			getFilmSchedule: jest.fn<Promise<Session[]>, [string]>(id => Promise.resolve([
				{
					id: '1',
					film: id,
					daytime: '5 Jan 2021 15:30',
					day: '05.01.2021',
					time: '15:30',
					hall: '1',
					rows: 10,
					seats: 10,
					price: 100,
					taken: ['2:3', '2:4', '2:5']
				},
				{
					id: '2',
					film: id,
					daytime: '6 Jan 2021 18:00',
					day: '06.01.2021',
					time: '18:00',
					hall: '1',
					rows: 10,
					seats: 10,
					price: 100,
					taken: ['2:3', '2:4', '2:5']
				}
			])),
			orderTickets: jest.fn<Promise<OrderResult[]>, [Order]>(order => Promise.resolve(order.tickets.map((ticket, id) => ({
				...ticket,
				id: String(id)
			})))),
		};

		appState = new AppStateModel(api, {
			...SETTINGS.appState,
			onChange
		});
	});

	it('should load movies from api', async () => {
		await appState.loadMovies();
		expect(appState.movies.size).toBe(2);
		expect(api.getFilms.mock.calls).toHaveLength(1);
		expect(onChange.mock.calls).toHaveLength(1);
		expect(onChange.mock.calls[0][0]).toBe(AppStateChanges.movies);
	});

	it('should load schedule for movie', async () => {
		await appState.loadMovies();
		await appState.loadSchedule('1');
		expect(appState.movieSessions.size).toBe(2);
		expect(api.getFilmSchedule.mock.calls).toHaveLength(1);
		expect(api.getFilmSchedule.mock.calls[0][0]).toBe('1');
		expect(onChange.mock.calls).toHaveLength(2);
		expect(onChange.mock.calls[0][0]).toBe(AppStateChanges.movies);
		expect(onChange.mock.calls[1][0]).toBe(AppStateChanges.sessions);
	});

	it('should select movie', async () => {
		await appState.loadMovies();
		appState.selectMovie('1');
		expect(onChange.mock.calls).toHaveLength(2);
		expect(onChange.mock.calls[0][0]).toBe(AppStateChanges.movies);
		expect(onChange.mock.calls[1][0]).toBe(AppStateChanges.selectedMovie);
		expect(appState.selectedMovie).toBeDefined();
		expect(appState.selectedMovie.id).toEqual('1');

		appState.selectMovie('2');
		expect(onChange.mock.calls).toHaveLength(3);
		expect(appState.selectedMovie.id).toEqual('2');

		appState.selectMovie(null);
		expect(appState.selectedMovie).toBeNull();
		expect(onChange.mock.calls).toHaveLength(4);
	});

	it('should select session', async () => {
		await appState.loadMovies();
		await appState.loadSchedule('1');
		appState.selectSession('1');
		expect(onChange.mock.calls).toHaveLength(3);
		expect(onChange.mock.calls[0][0]).toBe(AppStateChanges.movies);
		expect(onChange.mock.calls[1][0]).toBe(AppStateChanges.sessions);
		expect(onChange.mock.calls[2][0]).toBe(AppStateChanges.selectedSession);
		expect(appState.selectedSession).toBeDefined();
		expect(appState.selectedSession.id).toEqual('1');
		expect(appState.selectedSession.film).toEqual('1');

		appState.selectSession('2');
		expect(appState.selectedSession.id).toEqual('2');
		expect(onChange.mock.calls).toHaveLength(4);

		appState.selectSession(null);
		expect(appState.selectedSession).toBeNull();
		expect(onChange.mock.calls).toHaveLength(5);
	});

	it('should select place', async () => {
		await appState.loadMovies();
		await appState.loadSchedule('1');
		appState.selectSession('1');
		appState.selectPlaces([{ row: 1, seat: 1 }]);
		expect(appState.basket.size).toBe(1);
		expect(appState.basketTotal).toBe(100);
		expect(appState.basket.get('1:1:1:1')).toBeDefined();
		expect(onChange.mock.calls).toHaveLength(4);
		expect(onChange.mock.calls[3][0]).toBe(AppStateChanges.basket);

		appState.selectPlaces([{ row: 1, seat: 1 }, { row: 2, seat: 2 }]);
		expect(appState.basket.size).toBe(2);
		expect(appState.basketTotal).toBe(200);
		expect(onChange.mock.calls).toHaveLength(5);

		appState.selectPlaces([]);
		expect(appState.basket.size).toBe(0);
		expect(onChange.mock.calls).toHaveLength(6);
	});

	it('should not select taken places', async () => {
		await appState.loadMovies();
		await appState.loadSchedule('1');
		appState.selectSession('1');
		appState.selectPlaces([{ row: 2, seat: 2 }]);
		expect(appState.basket.size).toBe(1);
		expect(onChange.mock.calls).toHaveLength(4);

		expect(() => {
			appState.selectPlaces([{ row: 2, seat: 2 }, { row: 2, seat: 3 }, { row: 2, seat: 4 }])
		}).toThrow(`Place already taken: 2:3`);
		expect(appState.basket.size).toBe(1);
		expect(onChange.mock.calls).toHaveLength(4);
	});

	it('should fill and validate contacts', async () => {
		expect(appState.modalMessage).toBeNull();
		appState.fillContacts({
			email: '',
			phone: '+79999999999',
		});
		expect(onChange.mock.calls).toHaveLength(1);
		expect(onChange.mock.calls[0][0]).toBe(AppStateChanges.order);

		appState.isValidContacts();
		expect(onChange.mock.calls).toHaveLength(2);
		expect(onChange.mock.calls[1][0]).toBe(AppStateChanges.modalMessage);
		expect(appState.modalMessage).toBe('Email и телефон обязательные поля.');

		appState.fillContacts({
			email: 'test@test.ru',
			phone: '',
		});
		appState.isValidContacts();
		expect(appState.modalMessage).toBe('Email и телефон обязательные поля.');

		appState.fillContacts({
			email: 'test',
			phone: '+79999999999',
		});
		appState.isValidContacts();
		expect(appState.modalMessage).toBe('Некорректный email.');

		appState.fillContacts({
			email: 'test@test.ru',
			phone: 'test',
		});
		appState.isValidContacts();
		expect(appState.modalMessage).toBe('Некорректный телефон.');

		appState.fillContacts({
			email: 'test@test.ru',
			phone: '+79999999999',
		});
		appState.isValidContacts();
		expect(appState.modalMessage).toBeNull();
	});

	it('should order tickets', async () => {
		await appState.loadMovies();
		await appState.loadSchedule('1');
		appState.selectSession('1');
		expect(appState.isOrderReady).toBe(false);

		appState.selectPlaces([{ row: 1, seat: 1 }]);
		expect(appState.isOrderReady).toBe(false);

		appState.fillContacts({
			email: 'test@test.ru',
			phone: '+79999999999',
		});
		expect(appState.order.email).toBe('test@test.ru');
		expect(appState.order.phone).toBe('+79999999999');
		expect(appState.isOrderReady).toBe(true);

		await appState.orderTickets();
		expect(api.orderTickets.mock.calls).toHaveLength(1);
		expect(appState.basket.size).toBe(0);
		expect(appState.selectedSession).toBeNull();
		expect(appState.movieSessions.size).toBe(0);
	});
});