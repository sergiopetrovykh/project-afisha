import { Presenter } from '@/components/base/Presenter';
import { SelectPlacesData, SelectPlacesSettings } from '@/types/components/view/screen/SelectPlaces';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';
import { SETTINGS } from '@/utils/constants';
import { SelectedPlace } from '@/types/components/view/partial/Places';


export class PlacePresenter extends Presenter<SelectPlacesData, SelectPlacesSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateModals.place, () => this.view.render({
			header: {
				title: SETTINGS.placesModal.headerTitle,
				description: this.model.formatMovieDescription({
					title: this.model.selectedMovie.title,
					day: this.model.selectedSession.day,
					time: this.model.selectedSession.time,
				}),
			},
			places: {
				hall: {
					rows: this.model.selectedSession.rows,
					seats: this.model.selectedSession.seats,
				},
				selected: Array.from(this.model.basket.values()),
				taken: this.model.selectedSession.taken,
			},
			isActive: true,
			isDisabled: this.model.basket.size === 0,
		}));
		emitter.on(AppStateChanges.basket, () => this.view.render({
			isDisabled: this.model.basket.size === 0,
			places: {
				selected: Array.from(this.model.basket.values()),
			},
		}));
	}

	protected bindView(): SelectPlacesSettings {
		return {
			onSelect: this.onSelect.bind(this),
			onClose: this.model.openModal.bind(this.model, AppStateModals.none),
			onNext: this.model.openModal.bind(this.model, AppStateModals.basket),
			onBack: this.model.openModal.bind(this.model, AppStateModals.session)
		};
	}

	protected onSelect(places: SelectedPlace[]): void {
		this.model.selectPlaces(places);
		this.model.persistState();
	}
}