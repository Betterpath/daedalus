// @flow
import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Input from 'react-toolbox/lib/input/Input';
import MobxReactForm from 'mobx-react-form';
import styles from './InlineEditingInput.scss';

const messages = defineMessages({
  change: {
    id: 'inline.editing.input.change.label',
    defaultMessage: '!!!change',
    description: 'Label "change" on inline editing inputs in inactive state.'
  },
  cancel: {
    id: 'inline.editing.input.cancel.label',
    defaultMessage: '!!!cancel',
    description: 'Label "cancel" on inline editing inputs in inactive state.'
  },
});

@observer
export default class InlineEditingInput extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    inputFieldLabel: PropTypes.string.isRequired,
    inputFieldValue: PropTypes.string.isRequired,
    onStartEditing: PropTypes.func.isRequired,
    onStopEditing: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isValid: PropTypes.func.isRequired,
    validationErrorMessage: PropTypes.string.isRequired
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  validator = new MobxReactForm({
    options: {
      validateOnChange: false
    },
    fields: {
      inputField: {
        value: this.props.inputFieldValue,
        validate: [({ field }) => {
          return [this.props.isValid(field.value), this.props.validationErrorMessage];
        }]
      }
    }
  }, {});

  handleInputKeyDown = (event: KeyboardEvent) => {
    if (event.which === 13) { // ENTER key
      this.submit();
    }
    if (event.which === 27) {// ESCAPE key
      this.props.onStopEditing();
    }
  };

  submit() {
    this.validator.submit({
      onSuccess: (form) => {
        this.props.onSubmit(form.values().inputField);
        this.props.onStopEditing();
      },
      onError: (data) => {
      }
    });
  }

  render() {
    const { validator } = this;
    const {
      inputFieldLabel,
      isActive,
      onStartEditing,
      onStopEditing,
      inputFieldValue
    } = this.props;
    const { intl } = this.context;
    const inputField = validator.$('inputField');
    return (
      <div
        className={styles.component}
        onBlur={this.submit.bind(this)}
      >
        <Input
          type="text"
          label={inputFieldLabel}
          value={isActive ? inputField.value : inputFieldValue}
          onChange={inputField.onChange}
          onFocus={inputField.onFocus}
          onBlur={inputField.onBlur}
          onKeyDown={event => this.handleInputKeyDown(event)}
          error={isActive ? inputField.error : null}
          disabled={!isActive}
        />
        {!isActive && (
          <button
            className={styles.button}
            onClick={onStartEditing}
          >
            {intl.formatMessage(messages.change)}
          </button>
        )}
        {isActive && (
          <button
            className={styles.button}
            onClick={onStopEditing}
          >
            {intl.formatMessage(messages.cancel)}
          </button>
        )}
      </div>
    );
  }

}