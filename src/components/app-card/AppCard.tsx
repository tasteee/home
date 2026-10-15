import './app-card.css'
import { A } from '@solidjs/router'
import type { AppEntryT } from '../../apps/registry'
import { Icon } from '../icon/Icon'

type AppCardPropsT = {
	app: AppEntryT
}

export const AppCard = (props: AppCardPropsT) => {
	return (
		<A class='app-card' href={props.app.path}>
			<span class='app-card-icon'>
				<Icon name={props.app.icon} />
			</span>

			<span class='app-card-text'>
				<span class='app-card-name'>{props.app.name}</span>
				<span class='app-card-description'>{props.app.description}</span>
			</span>
		</A>
	)
}
