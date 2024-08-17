import { Presenter } from '@/components/base/Presenter';
import { SuccessData, SuccessSettings } from '@/types/components/view/screen/Success';
import { AppStateEvents, ModelEmitter } from '@/types/components/model/AppStateEmitter';
import { AppState, AppStateChanges, AppStateModals } from '@/types/components/model/AppState';
import { SETTINGS } from '@/utils/constants';


export class SuccessPresenter extends Presenter<SuccessData, SuccessSettings, AppState, AppStateEvents> {
	protected bindModel(emitter: ModelEmitter<AppState, AppStateEvents>): void {
		emitter.on(AppStateModals.success, () => this.view.render({
			content: SETTINGS.successModal,
			isActive: true,
		}));
		emitter.on(AppStateChanges.modal, ({ current }) => this.view.render({
			isActive: current === AppStateModals.success,
		}));
	}

	protected bindView(): SuccessSettings {
		return {
			onClose: this.model.openModal.bind(this.model, AppStateModals.none),
		};
	}

}