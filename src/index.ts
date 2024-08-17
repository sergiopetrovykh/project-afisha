import './scss/styles.scss';
import { API_URL, CDN_URL, SETTINGS } from './utils/constants';

import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { MainPresenter } from '@/components/presenter/Main';
import { MainScreen } from '@/components/view/screen/Main';
import { SessionPresenter } from '@/components/presenter/Session';
import { SelectSessionScreen } from '@/components/view/screen/SelectSession';
import { PlacePresenter } from '@/components/presenter/Place';
import { SelectPlacesScreen } from '@/components/view/screen/SelectPlaces';
import { BasketPresenter } from '@/components/presenter/Basket';
import { BasketScreen } from '@/components/view/screen/Basket';
import { OrderPresenter } from '@/components/presenter/Order';
import { OrderFormScreen } from '@/components/view/screen/OrderForm';
import { SuccessPresenter } from '@/components/presenter/Success';
import { SuccessScreen } from '@/components/view/screen/Success';

// Initialize the application
const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);

new MainPresenter(MainScreen, app);
new SessionPresenter(SelectSessionScreen, app);
new PlacePresenter(SelectPlacesScreen, app);
new BasketPresenter(BasketScreen, app);
new OrderPresenter(OrderFormScreen, app);
new SuccessPresenter(SuccessScreen, app);

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));