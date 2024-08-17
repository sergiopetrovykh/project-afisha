import { EventEmitter } from '@/components/base/EventEmitter';
import { IFilmAPI } from '@/types/components/model/FilmApi';
import {
	AppState,
	AppStateChanges,
	AppStateConstructor,
	AppStateModals,
	AppStateSettings,
} from '@/types/components/model/AppState';
import { AppStateEvents } from '@/types/components/model/AppStateEmitter';

export class AppStateEmitter extends EventEmitter<AppStateEvents> {
	public model: AppState;
	protected previousModal: AppStateModals = AppStateModals.none;

	constructor(
		api: IFilmAPI,
		settings: Omit<AppStateSettings, 'onChange'>,
		Model: AppStateConstructor
	) {
		super();

		this.model = new Model(api, {
			...settings,
			onChange: this.onModelChange.bind(this),
		});
	}

	protected onModelChange(changed: AppStateChanges) {
		switch (changed) {
			case AppStateChanges.modal:
				this.emit(changed, {
					previous: this.previousModal,
					current: this.model.openedModal,
				});
				this.emit(this.model.openedModal);
				this.previousModal = this.model.openedModal;
				break;
			case AppStateChanges.basket:
				this.emit(changed, {
					total: this.model.basketTotal,
					tickets: Array.from(this.model.basket.values()),
				});
				break;
			case AppStateChanges.movies:
				this.emit(changed, Array.from(this.model.movies.values()));
				break;
			case AppStateChanges.selectedMovie:
				this.emit(changed, this.model.selectedMovie);
				break;
			case AppStateChanges.sessions:
				this.emit(changed, Array.from(this.model.movieSessions.values()));
				break;
			case AppStateChanges.selectedSession:
				this.emit(changed, this.model.selectedSession);
				break;
			case AppStateChanges.order:
				this.emit(changed, this.model.contacts);
				break;
			case AppStateChanges.modalMessage:
				this.emit(changed, {
					message: this.model.modalMessage,
					isError: this.model.isError,
				});
				break;
			default:
				break;
		}
	}
}
