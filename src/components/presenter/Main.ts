import { MainData, MainSettings } from '@/types/components/view/screen/Main';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';
import { Presenter } from '@/components/base/Presenter';

export class MainPresenter extends Presenter<MainData, MainSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateChanges.movies, items => this.view.render({ items }));
		emitter.on(AppStateChanges.selectedMovie, item => this.view.render({ selected: item }));
		emitter.on(AppStateChanges.basket, ({ tickets }) => this.view.render({ counter: tickets.length }));
		emitter.on(AppStateChanges.modal, ({ current }) => this.view.render({ isLocked: current !== AppStateModals.none }));
	}

	protected bindView(): MainSettings {
		return {
			onSelectFilm: this.model.selectMovie.bind(this.model),
			onOpenBasket: this.model.openModal.bind(this.model, AppStateModals.basket),
			onOpenFilm: this.onOpenFilm.bind(this)
		};
	}

	async onOpenFilm(id: string) {
		await this.model.loadSchedule(id);
		this.model.openModal(AppStateModals.session);
	}
}