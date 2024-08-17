import { Presenter } from '@/components/base/Presenter';
import { OrderFormData, OrderFormSettings } from '@/types/components/view/screen/OrderForm';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';
import { SETTINGS } from '@/utils/constants';


export class OrderPresenter extends Presenter<OrderFormData, OrderFormSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateModals.contacts, () => this.view.render({
			header: {
				title: SETTINGS.orderModal.headerTitle,
				description: this.model.formatMovieDescription(this.model.getBasketMovie()),
			},
			contacts: this.model.contacts,
			total: this.model.formatCurrency(this.model.basketTotal),
			isError: false,
			isDisabled: !this.model.contacts.email && !this.model.contacts.phone,
			isActive: true,
		}));
		emitter.on(AppStateChanges.order, () => this.view.render({
			contacts: this.model.contacts,
			isDisabled: !this.model.contacts.email && !this.model.contacts.phone,
		}));
		emitter.on(AppStateChanges.modalMessage, () => this.view.render({
			message: this.model.modalMessage,
			isError: this.model.isError,
		}));
	}

	protected async onSubmit(): Promise<void> {
		if (this.model.isValidContacts()) {
			const result = await this.model.orderTickets();
			if (result.length > 0) {
				this.model.openModal(AppStateModals.success);
			}
		}
	}

	protected bindView(): OrderFormSettings {
		return {
			onChange: this.model.fillContacts.bind(this.model),
			onClose: this.model.openModal.bind(this.model, AppStateModals.none),
			onNext: this.onSubmit.bind(this),
			onBack: this.model.openModal.bind(this.model, AppStateModals.basket)
		};
	}

}