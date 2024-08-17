import { Presenter } from '@/components/base/Presenter';
import { SelectSessionData, SelectSessionSettings } from '@/types/components/view/screen/SelectSession';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';


export class SessionPresenter extends Presenter<SelectSessionData, SelectSessionSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateModals.session, () => this.view.render({
			isActive: true,
			film: this.model.selectedMovie,
			schedule: {
				sessions: Array.from(this.model.movieSessions.values()),
				selected: this.model.selectedSession
			},
			isDisabled: !this.model.selectedSession
		}));
		emitter.on(AppStateChanges.selectedSession, () => this.view.render({
			schedule: {
				selected: this.model.selectedSession
			},
			isDisabled: !this.model.selectedSession
		}));
		// Презентер зависит и от этих событий, но в данной реализации эти события не случаются
		// emitter.on(AppStateChanges.sessions, () => this.view.render({}));
		// emitter.on(AppStateChanges.selectedMovie, () => this.view.render({}));
	}

	protected bindView(): SelectSessionSettings {
		return {
			onSelect: this.model.selectSession.bind(this.model),
			onNext: this.model.openModal.bind(this.model, AppStateModals.place),
			onClose: this.model.openModal.bind(this.model, AppStateModals.none)
		};
	}

}