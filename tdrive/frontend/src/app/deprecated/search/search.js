import React from 'react';
import Languages from 'app/features/global/services/languages-service';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Workspace from 'app/deprecated/workspaces/workspaces.jsx';
import WorkspacesApps from 'app/deprecated/workspaces/workspaces_apps.jsx';
import UserService from 'app/features/users/services/current-user-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Api from 'app/features/global/framework/api-service';
import Strings from 'app/features/global/utils/strings';
import DriveService from 'app/deprecated/Apps/Drive/Drive.js';
import CalendarService from 'app/deprecated/Apps/Calendar/Calendar.js';
import TasksService from 'app/deprecated/Apps/Tasks/Tasks.js';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class SearchService extends Observable {
  constructor() {
    super();
    this.setObservableName('SearchService');
    Globals.window.searchPopupService = this;
    this.row = [];
    this.value = '';
    this.hasFilters = true;
    this.type = 'message';
    this.options = {};
    this.scroll_id = false;
    this.results = [];
  }

  open() {
    this.isopen = true;
    this.notify();
  }

  close() {
    this.isopen = false;
    this.notify();
  }

  setValue(text) {
    this.value = text;
    this.notify();
  }

  setType(type) {
    this.type = type;
    this.notify();
  }

  setOptions(options) {
    this.options = options;
  }

  selectMessage(item, i) {}

  select(item, i) {}

  loadMore() {
    this.search(true, { more: true });
  }

  search(http, options) {
    if (!options) {
      options = {};
    }

    if (http === undefined) {
      http = true;
    }

    this.scroll_id = false;

    if (this.search_loading) {
      if (this.searchRetryTimeout) clearTimeout(this.searchRetryTimeout);
      this.searchRetryTimeout = setTimeout(() => {
        this.search();
      }, 500);
    }

    var text = this.value.replace(/  +/, ' ');
    var words = text.split(' ');
    if (http && (text || '').trim() === '' && JSON.stringify(this.options).length < 3) {
      return this.search(false);
    }
    if (
      this.previousSearchText === (text || '').trim() &&
      JSON.stringify(this.options) + this.type === this.previousSearchTextOptions
    ) {
      this.search_loading = false;
      this.search_http_loading = false;
      this.notify();
      return;
    }
    this.previousSearchTextOptions = JSON.stringify(this.options) + this.type;
    this.previousSearchText = (text || '').trim();

    this.search_loading = true;
    this.search_http_loading = true;
    this.notify();

    if (
      http &&
      ((text.length > 1 && words.length > 0) || JSON.stringify(this.options).length > 2)
    ) {
      var searchRoute = 'quicksearch';

      // eslint-disable-next-line no-redeclare
      var options = {};
      if (this.type === 'file') {
        options = this.options;
        searchRoute = 'advancedfile';
      } else if (this.type === 'message') {
        options = this.options;
        searchRoute = 'advancedbloc';
      } else if (this.type === 'event') {
        options = this.options;
        searchRoute = 'advancedevent';
      } else if (this.type === 'task') {
        options = this.options;
        searchRoute = 'advancedtask';
      }

      var workspaces_ids = undefined;
      if (options) {
        workspaces_ids = options.workspaces;
      }

      if (this.searchHTTPTimeout) clearTimeout(this.searchHTTPTimeout);
      this.searchHTTPTimeout = setTimeout(() => {
        //Load from HTTP
        Api.post(
          'globalsearch/' + searchRoute,
          {
            scroll_id: options.more ? this.scroll_id : undefined,
            group_id: Workspace.currentGroupId,
            words: words,
            workspace_id: (workspaces_ids || []).length ? workspaces_ids : undefined,
            options: options || {},
          },
          res => {
            this.search(false);

            var results = ((res || {}).data || {}).results || (res || {}).data || [];
            if (results.scroll_id !== undefined) {
              results = [];
            }
            this.scroll_id = ((res || {}).data || {}).scroll_id;

            results.forEach(item => {
              if (item.type === 'channel') {
                this.completeItemSearchText(item.channel, words);
                Collections.get('channels').completeObject(item.channel);
              }
              if (item.type === 'file') {
                this.completeItemSearchText(item.file, words);
                Collections.get('drive').completeObject(item.file);
              }
            });

            if (!options.more) {
              this.results = [];
            }

            this.results = this.results.concat(results);

            this.search_http_loading = false;
            this.notify();
          },
        );
      }, 500);
    }

    //Search in collections

    //Channels
    var res = [];
    Collections.get('channels')
      .findBy({})
      .forEach(item => {
        if (
          Object.values(item.members || [])
            .concat(Object.values(item.ext_members || []))
            .indexOf(UserService.getCurrentUserId()) >= 0
        ) {
          if (this.matchQuery(item, words, ['name'])) {
            res.push({
              type: 'channel',
              channel: item,
              workspace: Collections.get('workspaces').find(item.workspace_id),
            });
          }
        }
      });
    Collections.get('drive')
      .findBy({})
      .forEach(item => {
        if (this.matchQuery(item, words, ['name'])) {
          res.push({
            type: 'file',
            file: item,
            workspace: Collections.get('workspaces').find(item.workspace_id),
          });
        }
      });
    this.results = res;
    this.notify();

    this.search_loading = false;
  }

  isOpen() {
    return this.isopen;
  }

  completeItemSearchText(object, words) {
    object._search_text = object._search_text || '';
    words.forEach(new_word => {
      var replaced = false;
      object._search_text.split(' ').forEach(present_word => {
        if (present_word.trim() && new_word.trim().indexOf(present_word.trim()) >= 0) {
          object._search_text = object._search_text.replace(
            ' ' + present_word + ' ',
            ' ' + new_word + ' ',
          );
          replaced = true;
        }
      });
      if (!replaced) {
        object._search_text += ' ' + new_word;
      }
    });
    object._search_text += ' ';
    object._search_text = object._search_text.replace(/  +/, ' ');
  }

  matchQuery(object, words, keys) {
    return (words || []).some(word => {
      return (keys || []).concat(['_search_text']).some(key => {
        if (
          word &&
          Strings.removeAccents((object[key] || '').toLocaleLowerCase()).indexOf(
            Strings.removeAccents(word.trim().toLocaleLowerCase()),
          ) >= 0
        ) {
          return true;
        }
        return false;
      });
    });
  }
}

const search = new SearchService();
export default search;
