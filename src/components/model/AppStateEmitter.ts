import { IFilmAPI } from '@/types/components/model/FilmApi';
import {
	AppState,
	AppStateChanges,
	AppStateConstructor,
	AppStateModals,
	AppStateSettings,
} from '@/types/components/model/AppState';
import { AppStateEvents } from '@/types/components/model/AppStateEmitter';
import { Emitter } from '@/types/components/base/EventEmitter';

export class AppStateEmitter<E extends AppStateEvents> {
	public model: AppState;
	protected previousModal: AppStateModals = AppStateModals.none;

	constructor(
		protected broker: Emitter<E>,
		api: IFilmAPI,
		settings: Omit<AppStateSettings, 'onChange'>,
		Model: AppStateConstructor
	) {
		this.model = new Model(api, {
			...settings,
			onChange: this.onModelChange.bind(this),
		});
	}

	protected onModelChange(changed: AppStateChanges) {
		switch (changed) {
			case AppStateChanges.modal:
				this.broker.emit(changed, {
					previous: this.previousModal,
					current: this.model.openedModal,
				});
				this.broker.emit(this.model.openedModal);
				this.previousModal = this.model.openedModal;
				break;
			case AppStateChanges.basket:
				this.broker.emit(changed, {
					total: this.model.basketTotal,
					tickets: Array.from(this.model.basket.values()),
				});
				break;
			case AppStateChanges.movies:
				this.broker.emit(changed, Array.from(this.model.movies.values()));
				break;
			case AppStateChanges.selectedMovie:
				this.broker.emit(changed, this.model.selectedMovie);
				break;
			case AppStateChanges.sessions:
				this.broker.emit(changed, Array.from(this.model.movieSessions.values()));
				break;
			case AppStateChanges.selectedSession:
				this.broker.emit(changed, this.model.selectedSession);
				break;
			case AppStateChanges.order:
				this.broker.emit(changed, this.model.contacts);
				break;
			case AppStateChanges.modalMessage:
				this.broker.emit(changed, {
					message: this.model.modalMessage,
					isError: this.model.isError,
				});
				break;
			default:
				break;
		}
	}
}
