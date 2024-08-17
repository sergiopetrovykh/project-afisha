import { IScreenConstructor, IView } from '@/types/components/base/View';
import { ModelEmitter } from '@/types/components/model/AppStateEmitter';

export abstract class Presenter<V, S extends object, M, E> {
	protected view: IView<V>;
	protected model: M;

	constructor(View: IScreenConstructor<V, S>, emitter: ModelEmitter<M, E>) {
		this.model = emitter.model;
		this.view = new View(this.bindView());

		this.bindModel(emitter);
	}

	protected abstract bindView(): S;

	protected abstract bindModel(emitter: ModelEmitter<M, E>): void;
}