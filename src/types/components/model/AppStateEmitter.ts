import { AppStateChanges, AppStateModals, BasketTicket } from '@/types/components/model/AppState';
import { Emitter } from '@/types/components/base/EventEmitter';
import { Contacts, Movie, Session } from '@/types/components/model/FilmApi';

// Для корректной обработки событий открытия и закрытия модальных окон
// нам нужно знать предыдущее и текущее состояние.
export type ModalChange = {
	previous: AppStateModals;
	current: AppStateModals;
};

export interface ModelEmitter<T, E> extends Emitter<E> {
	model: T;
}

export interface AppStateEvents {
	[AppStateChanges.modal]: ModalChange;
	[AppStateChanges.basket]: {
		total: number;
		tickets: BasketTicket[];
	},
	[AppStateChanges.movies]: Movie[];
	[AppStateChanges.selectedMovie]: Movie | null;
	[AppStateChanges.sessions]: Session[];
	[AppStateChanges.selectedSession]: Session | null;
	[AppStateChanges.order]: Contacts;
	[AppStateChanges.modalMessage]: {
		message: string;
		isError: boolean;
	};
	[AppStateModals.session]: never;
	[AppStateModals.place]: never;
	[AppStateModals.basket]: never;
	[AppStateModals.contacts]: never;
	[AppStateModals.success]: never;
	[AppStateModals.none]: never;
}

