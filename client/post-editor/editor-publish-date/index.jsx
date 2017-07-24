/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PostSchedule from 'components/post-schedule';
import utils from 'lib/posts/utils';

export class EditorPublishDate extends React.Component {

	static propTypes = {
		post: React.PropTypes.object,
		postDate: React.PropTypes.string,
		setPostDate: React.PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false,
		};
	}

	componentWillUnmount() {
		window.removeEventListener( 'click', this.handleOutsideClick );
	}

	componentDidUpdate() {
		if ( this.state.isOpen ) {
			window.addEventListener( 'click', this.handleOutsideClick );
		} else {
			window.removeEventListener( 'click', this.handleOutsideClick );
		}
	}

	handleOutsideClick = event => {
		const targetClasses = event.target.className.split( /\s/ );
		const hasDatePickerDayClass = intersection( targetClasses, [ 'DayPicker-Day', 'date-picker__day' ] ).length > 0;
		const isChildOfPublishDate = ReactDom.findDOMNode( this.refs.editorPublishDateWrapper ).contains( event.target );

		if ( ! hasDatePickerDayClass && ! isChildOfPublishDate ) {
			this.setState( { isOpen: false } );
		}
	}

	setImmediate = () => {
		this.props.setPostDate( null );
		this.setState( { isOpen: false } );
	}

	toggleOpenState = () => {
		this.setState( { isOpen: ! this.state.isOpen } );
	}

	getHeaderDescription() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );
		const isPublished = utils.isPublished( this.props.post );

		if ( isPublished && isScheduled ) {
			return this.props.translate( 'Scheduled' );
		}

		if ( isScheduled ) {
			return this.props.translate( 'Schedule' );
		}

		if ( isPublished && isBackDated ) {
			return this.props.translate( 'Published' );
		}

		if ( isBackDated ) {
			return this.props.translate( 'Backdate' );
		}

		return this.props.translate( 'Publish Immediately' );
	}

	renderCalendarHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );

		if ( ! isScheduled && ! isBackDated ) {
			return (
				<div className="editor-publish-date__choose-header">
					{ this.props.translate( 'Choose a date to schedule' ) }
				</div>
			);
		}

		return (
			<Button borderless={ true } className="editor-publish-date__immediate" onClick={ this.setImmediate }>
				{ this.props.translate( 'Publish Immediately' ) }
			</Button>
		);
	}

	renderHeader() {
		const isScheduled = utils.isFutureDated( this.props.post );
		const isBackDated = utils.isBackDated( this.props.post );
		const className = classNames( 'editor-publish-date__header', {
			'is-scheduled': isScheduled,
			'is-back-dated': isBackDated,
		} );
		const selectedDay = this.props.post && this.props.post.date
			? this.props.post.date
			: null;

		return (
			<div className={ className } onClick={ this.toggleOpenState }>
				<Gridicon icon="calendar" size={ 18 } />
				<div className="editor-publish-date__header-wrapper">
					<div className="editor-publish-date__header-description">
						{ this.getHeaderDescription() }
					</div>
					{ ( isScheduled || isBackDated ) && (
						<div className="editor-publish-date__header-chrono">
							{ this.props.moment( selectedDay ).calendar() }
						</div>
					) }
				</div>
			</div>
		);
	}

	renderSchedule() {
		const selectedDay = this.props.post && this.props.post.date
			? this.props.post.date
			: null;

		return (
			<div className="editor-publish-date__schedule">
				{ this.renderCalendarHeader() }
				<PostSchedule
					displayInputChrono={ false }
					onDateChange={ this.props.setPostDate }
					selectedDay={ selectedDay }
					/>
			</div>
		);
	}

	render() {
		const className = classNames( 'editor-publish-date', {
			'is-open': this.state.isOpen,
		} );

		return (
			<div className={ className }>
				<div className="editor-publish-date__wrapper" ref="editorPublishDateWrapper">
					{ this.renderHeader() }
					{ this.state.isOpen && this.renderSchedule() }
				</div>
			</div>
		);
	}

}

export default localize( EditorPublishDate );