/* eslint-disable react/prop-types */
import React from 'react';
import { Picker } from 'emoji-mart';
import Emojione from 'components/emojione/emojione';
import { getAsFrontUrl } from 'app/features/global/utils/URLUtils';
import './emoji-picker.scss';
import 'emoji-mart/css/emoji-mart.css';
import Languages from 'app/features/global/services/languages-service';
import { isArray } from 'lodash';

Picker.defaultProps.backgroundImageFn = function backgroundImageFn(set, sheetSize) {
  sheetSize = 20;
  return getAsFrontUrl(
    '/public/emoji-datasource/'.concat(set, '/sheets-256/').concat(sheetSize, '.png'),
  );
};
export default class EmojiPicker extends React.Component {
  /*
        props = {
            preferedEmoji : Array of emoji's shortname
            onChange : called when a smiley is selected
        }
    */
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      suggestions: [],
      currentTitle: '',
      availableCategories: [],
      scrollToRow: 0,
      loaded: false,
    };
    this.currentTitleIndex = 100000;
    this.clickScrollToRow = 0;
  }
  onChange(list) {
    if (list.length > 0) {
      if (this.props.onChange) {
        this.props.onChange(list[0]);
      }
      this.setState({ list: [] });
    }
  }
  renderItemChoosen(item) {
    return (
      <div className="itemResult itemResultChoosen">
        <Emojione type={(item || {}).shortname} />
      </div>
    );
  }
  renderItem(item) {
    return (
      <div className="itemResult hoverable">
        <Emojione type={item.shortname} />
      </div>
    );
  }
  scrollToCategory(category) {
    var index = 0;
    this.state.suggestions.forEach((item, i) => {
      if (item.value == category) {
        index = i;
        return false;
      }
    });
    this.clickScrollToRow = index;
    if (this.state.scrollToRow != index) {
      this.setState({ scrollToRow: index });
    } else {
      this.list_node.forceUpdateGrid();
    }
  }
  select(emoji) {
    if (this.picker) {
      this.picker.onSelect(emoji);
    } else {
      this.onChange([emoji]);
    }
  }
  getPrefered() {
    var pref = this.props.preferedEmoji || [
      ':thumbsup:',
      ':thumbsdown:',
      ':hearts:',
      ':tada:',
      ':smile:',
      ':confused:',
    ];
    if (
      typeof this.props.selected === 'string' &&
      this.props.selected &&
      pref.indexOf(this.props.selected) < 0
    ) {
      pref.unshift(this.props.selected);
    }
    if (isArray(this.props.selected)) {
      this.props.selected.forEach(s => pref.unshift(s));
    }
    return pref;
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ loaded: true });
    }, 300);
  }
  render() {
    if (!this.state.loaded) {
      return <div style={{ height: 356 }}></div>;
    }
    return (
      <div className="menu-cancel-margin">
        <Picker
          set="apple"
          i18n={{
            search: Languages.t('components.emoji_picker.input_search_placeholder'),
            notfound: Languages.t('components.emoji_picker.categories.not_found'),
            categories: {
              search: Languages.t('components.emoji_picker.categories.search_result'),
              recent: Languages.t('components.emoji_picker.categories.frequently_used'),
              people: Languages.t('components.emoji_picker.categories.smileys_and_people'),
              nature: Languages.t('components.emoji_picker.categories.animals_and_nature'),
              foods: Languages.t('components.emoji_picker.categories.food_and_drink'),
              activity: Languages.t('components.emoji_picker.categories.activity'),
              places: Languages.t('components.emoji_picker.categories.travel_and_places'),
              objects: Languages.t('components.emoji_picker.categories.objects'),
              symbols: Languages.t('components.emoji_picker.categories.symbols'),
              flags: Languages.t('components.emoji_picker.categories.flags'),
            },
          }}
          showPreview={false}
          showSkinTones={false}
          autoFocus
          perLine={6}
          onSelect={this.props.onChange}
          color={'var(--primary)'}
          emojiSize={20}
        />
      </div>
    );
  }
}
