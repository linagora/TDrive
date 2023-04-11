/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import AutoComplete from 'components/auto-complete/auto-complete';
import Icon from 'app/components/icon/icon.jsx';
import Languages from 'app/features/global/services/languages-service';
import './picker.scss';

export default class Picker extends React.Component {
  /*
        placeholder : string,
        search : Array of search function,
        renderItem(item) : how to render item
        renderItemChoosen(item) : how to add item in input
        renderItemSimply(item) : what user will type on input and what we have to replace
        onChangeSuggested(list)
        onChange(list) :
        canCreate
        onCreate
        disableNavigationKey :
    */
  constructor(props) {
    super(props);
    this.state = {
      currentSelected: props.value || [],
      inputValue: '',
      currentList: [],
      selected: [],
    };
    this.alreadyBackspace = false;
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.outsideClickListener);
  }
  componentDidMount() {
    if (!this.props.inline) {
      this.focus();
    }

    var element = this.container;
    this.outsideClickListener = event => {
      if (!element.contains(event.target) && document.contains(event.target)) {
        this.setState({ focused: false });
      }
    };
    this.outsideClickListener = this.outsideClickListener.bind(this);
    document.addEventListener('click', this.outsideClickListener);
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.value != this.props.value) {
      nextState.currentSelected = nextProps.value;
    }
    return true;
  }
  onSelect(item) {
    this.alreadyBackspace = true;
    if (item && (item.id === undefined || item.id < 0) && item.front_id === undefined) {
      this.onCreate(item.textSearched);
      return;
    }
    var newList = this.state.currentSelected;
    for (var i = 0; i < newList.length; i++) {
      if (newList[i].id == item.id) {
        this.setState({ inputValue: '' });
        return false;
      }
    }
    newList.push(item);
    this.setState({ currentSelected: newList });
    this.setState({ inputValue: '' });
    if (this.props.onChange) {
      this.props.onChange(newList);
    }
    this.focus();
  }
  onRemove(item) {
    var newList = this.state.currentSelected;
    var index = newList.indexOf(item);
    if (index >= 0) {
      newList.splice(index, 1);
      this.setState({ currentSelected: newList });
      if (this.props.onChange) {
        this.props.onChange(newList);
      }
    }
    this.focus();
  }
  onBackspace() {
    if (this.alreadyBackspace) {
      // if already typed on backspace once
      var newList = this.state.currentSelected;
      newList.splice(newList.length - 1, 1);
      this.setState({ currentSelected: newList });
    } else {
      this.alreadyBackspace = true;
    }
  }
  onCreate(text) {
    if (this.props.onCreate) {
      var item = this.props.onCreate(text, item => {
        this.onSelect(item);
      });
    }
  }
  focus() {
    if (this.autocomplete_node) {
      this.autocomplete_node.focus();
    }
  }
  render() {
    var that = this;
    var objects = [
      <div className="picker">
        <div className={'pickerInput ' + (this.props.readOnly ? 'readOnly ' : '')}>
          {this.state.currentSelected.map(item => {
            return this.props.renderItemChoosen(item);
          })}
          {!this.props.readOnly && (
            <AutoComplete
              search={[
                (text, cb) => {
                  text = this.state.inputValue;
                  this.props.search(text, list => {
                    if (that.props.canCreate && text.length > 0) {
                      list.push({ id: -1, autocomplete_id: list.length, textSearched: text });
                    }
                    cb(list);
                  });
                },
              ]}
              renderItemChoosen={[
                item => {
                  if (item.id < 0 && this.props.canCreate) {
                    return item.textSearched;
                  } else {
                    return this.props.renderItemSimply(item);
                  }
                },
              ]}
              max={[this.props.max || 10]}
              renderItem={[() => {}]}
              regexHooked={[/(.*)/]}
              placeholder={
                this.state.currentSelected.length
                  ? ''
                  : this.props.placeholder ||
                    Languages.t('scenes.apps.drive.left.search', [], 'Search')
              }
              onChange={evt => {
                this.alreadyBackspace = false;
                this.setState({ inputValue: evt.target.value });
              }}
              onSelect={item => {
                this.onSelect(item);
              }}
              value={this.state.inputValue}
              onChangeCurrentList={(list, selected) => {
                this.setState({ currentList: list, selected: selected });
                if (this.props.onChangeSuggested) {
                  this.props.onChangeSuggested(list);
                }
              }}
              hideResult={true}
              onBackspace={() => {
                this.onBackspace();
              }}
              disableNavigationKey={this.props.disableNavigationKey}
              showResultsOnInit={true}
              onHide={() => this.setState({ focused: false })}
              ref={node => {
                this.autocomplete_node = node;
              }}
            />
          )}
        </div>
      </div>,
    ];

    if (!this.props.readOnly) {
      if (!this.props.inline) {
        objects.push(<div className="menu-text">{!!this.props.title && this.props.title}</div>);
      }

      var results = [];

      if (this.state.currentList.length > 0) {
        results = this.state.currentList.map((item, index) => {
          if (item.id < 0) {
            return (
              <div
                key={'create'}
                className={
                  'menu ' +
                  (!this.props.disableNavigationKey && item.autocomplete_id == this.state.selected
                    ? 'is_selected'
                    : '')
                }
                onClick={evt => {
                  evt.stopPropagation();
                  evt.preventDefault();
                  this.onSelect(item);
                }}
              >
                <div className="text">
                  <Icon type="plus" />
                  Create {this.props.renderItem(item.textSearched)}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                className={
                  'menu ' +
                  (!this.props.disableNavigationKey && item.autocomplete_id == this.state.selected
                    ? 'is_selected'
                    : '')
                }
                onClick={evt => {
                  evt.stopPropagation();
                  evt.preventDefault();
                  this.onSelect(item);
                }}
              >
                <div className="text">{this.props.renderItem(item)}</div>
              </div>
            );
          }
        });
      }
      if (this.props.inline) {
        results = (
          <div className={'dropmenu inline ' + (this.state.focused ? 'fade_in ' : '')}>
            {results}
          </div>
        );
      }
      objects = objects.concat(results);
    }

    objects = (
      <div
        onClick={() => {
          this.focus();
          this.setState({ focused: true });
        }}
        ref={node => (this.container = node)}
        className={
          'picker_container ' +
          (this.props.readOnly ? 'readOnly ' : '') +
          (this.props.inline ? 'inline ' : '') +
          (this.state.focused ? 'focused ' : '') +
          this.props.className
        }
      >
        {objects}
      </div>
    );

    return objects;
  }
}
