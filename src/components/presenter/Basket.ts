import { Presenter } from '@/components/base/Presenter';
import { BasketData, BasketSettings } from '@/types/components/view/screen/Basket';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';
import { SETTINGS } from '@/utils/constants';


export class BasketPresenter extends Presenter<BasketData, BasketSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateModals.basket, () => this.view.render({
			header: {
				title: SETTINGS.basketModal.headerTitle,
				description: this.model.basket.size
					? this.model.formatMovieDescription(this.model.getBasketMovie())
					: '',
			},
			tickets: Array.from(this.model.basket.values()).map((ticket) => {
				return this.model.formatTicketDescription(ticket);
			}),
			total: this.model.formatCurrency(this.model.basketTotal),
			isDisabled: this.model.basket.size === 0,
			isActive: true,
		}));
		emitter.on(AppStateChanges.basket, () => this.view.render({
			tickets: Array.from(this.model.basket.values()).map((ticket) => {
				return this.model.formatTicketDescription(ticket);
			}),
			total: this.model.formatCurrency(this.model.basketTotal),
			isDisabled: this.model.basket.size === 0,
		}));
	}

	protected bindView(): BasketSettings {
		return {
			onRemove: this.onRemove.bind(this),
			onClose: this.model.openModal.bind(this.model, AppStateModals.none),
			onNext: this.model.openModal.bind(this.model, AppStateModals.contacts),
			onBack: this.onBack.bind(this),
		};
	}

	protected onRemove(ticketId: string): void {
		this.model.removeTicket(ticketId);
		this.model.persistState();
	}

	protected onBack(): void {
		if (this.model.selectedSession && this.model.selectedMovie) {
			this.model.openModal(AppStateModals.place);
		}
	}
}