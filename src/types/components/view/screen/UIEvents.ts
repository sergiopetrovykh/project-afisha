import { SelectedPlace } from '@/types/components/view/partial/Places';
import { OrderData } from '@/types/components/view/partial/Order';


export enum UIActions {
	selectMovie = 'ui:selectMovie',
	openMovie = 'ui:openMovie',
	selectSession = 'ui:selectSession',
	openPlaces = 'ui:openPlaces',
	selectPlaces = 'ui:selectPlaces',
	openBasket = 'ui:openBasket',
	removeTicket = 'ui:removeTicket',
	makeOrder = 'ui:makeOrder',
	fillContacts = 'ui:fillContacts',
	payOrder = 'ui:payOrder',
	closeModal = 'ui:closeModal',
	goBack = 'ui:goBack',
}

export interface UIEvents {
	[UIActions.selectMovie]: string;
	[UIActions.openMovie]: string;
	[UIActions.selectSession]: string;
	[UIActions.openPlaces]: void;
	[UIActions.selectPlaces]: SelectedPlace[];
	[UIActions.openBasket]: void;
	[UIActions.removeTicket]: string;
	[UIActions.makeOrder]: void;
	[UIActions.fillContacts]: OrderData;
	[UIActions.payOrder]: void;
	[UIActions.closeModal]: void;
	[UIActions.goBack]: void;
}