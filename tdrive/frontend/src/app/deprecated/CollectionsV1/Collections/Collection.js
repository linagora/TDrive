import Api from 'app/features/global/framework/api-service';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Number from 'app/features/global/utils/Numbers';
import MultipleSecuredConnections from './MultipleSecuredConnections.js';
import LocalStorage from 'app/features/global/framework/local-storage-service';
/** Collection
 * Act like a doctrine repository and try to be allways in sync with server in realtime
 */

export default class Collection extends Observable {
  constructor(options) {
    super();

    /*
    Doc
    object._created = false; //Created (has an id)
    object._persisted = false; //Persisted (no modification waiting to persist)
    object._updating = false; //There is modifications sent to server but waiting confirmation
    object._creating = false; //Object just created and sent to server but waiting confirmation
    object._loaded = false; //Object was loaded from http or websockets (not from cache)
    object._loaded_from = null; //Load md5 code for load origin
    object._cached = false; //Object was added to cache
    object._cached_from = null; //Load md5 code for cache origin
    object._retrying = false; //Object was not send
    object._failed = false; //Object was not send
    */

    if (!options) {
      options = {};
    }

    this.object_type = options.object_type || ''; //Used to exchange objects in websockets and provide the object type
    this.base_url = options.base_url || ''; //Used for http requests
    this.collection_id = options.collection_id || ''; //Collection identifier (board id, stream id, etc)

    this.use_cache = options.use_cache || false;
    this.use_retry = options.use_retry || false;

    this.auto_retry = options.auto_retry || false; // has to auto retry when there is a fail in save
    this.timer_send_fail = options.timer_send_fail || 5000; // timer when api call is considered to failed
    this.timeout_fail = {};

    this.client_id = Number.unid(); //Used to identify requests origins
    //this.user_id = LoginService.currentUserId || 0; //Used to identify requests user origins
    //this.user = LoginService.currentUserId?({id: LoginService.currentUserId, username: "TODO"}):{id: 0, username: "unregistered"}; //Used to identify requests user origins details

    this.min_object = options.min_object || {};
    this.max_object = options.max_object || {};

    this.known_objects_by_front_id = {};
    this.known_objects_by_id = {};
    this.objects_original_saved_by_front_id = {};

    this.waiting_to_save_by_front_id = {};
    this.waiting_to_delete_by_front_id = {};
    this.objects_buffers_by_front_id = {};
    this.ws_events_callbacks = [];
    this.total_subscribe_by_route = {};

    this.loading_first_get = true;
    this.doing_http_request = 0;
    this.did_load_first_time = {};
    this.didSubscribe = false;
    this.sources = {};
    this.sources_to_be_removed_timeout = {};
    this.sources_on_event = {};
    this._last_modified = {};

    this.connections = new MultipleSecuredConnections((event, data) => {
      Object.keys(this.sources_on_event).forEach(source_key => {
        if (this.sources_on_event[source_key].routes.indexOf(data._route) >= 0) {
          this.sources_on_event[source_key].callback(event, data);
        }
      });

      if (event === 'event') {
        if (data.multiple && data.multiple.forEach) {
          data.multiple.forEach(item => {
            this.ws_message(item);
          });
        } else {
          this.ws_message(data);
        }
      }
    });
  }

  updatedOptions() {
    this.retrieveCache();
  }

  addSource(options, _key, first_load_callback) {
    var key = _key;

    if (this.sources[key]) {
      if (this.sources_to_be_removed_timeout[key]) {
        clearTimeout(this.sources_to_be_removed_timeout[key]);
      }
      delete this.sources_to_be_removed_timeout[key];
      return;
    }

    this.sources[key] = options;
    this.sources[key].websockets = this.sources[key].websockets || [];

    var routes = [];
    var waiting_one_route = false;
    this.sources[key].websockets.forEach(websocket => {
      waiting_one_route =
        waiting_one_route ||
        this.subscribe(websocket.uri, websocket.options, this.sources[key].http_options, key);
      routes.push(websocket.uri);
    });
    this.sources[key].did_first_load = this.did_load_first_time[key] || false;

    var initHttp = data => {
      this.sources[key].did_first_load = this.did_load_first_time[key] || false;

      if (data) {
        var base_url = (this.sources[key] || {}).http_base_url;
        var request_key = JSON.stringify([
          base_url,
          this.collection_id,
          this.sources[key].http_options,
        ]);
        var res_list = this.loadData(request_key, data);
        this.sources[key].did_first_load = true;
        this.did_load_first_time[key] = true;
        if (first_load_callback) first_load_callback(res_list);
        this.notify();
      } else {
        this.reload(res => {
          if (first_load_callback) first_load_callback(res);
        }, key);
      }
    };

    this.sources_on_event[key] = {
      routes: routes,
      callback: (event, data) => {
        if (event === 'get') {
          if (data.collectionId === key) {
            initHttp(data.data);
          }
        }
        if (event === 'init' && data._route === routes[0]) {
          //Only get reload from first route to avoid duplicate reload
          initHttp();
        }
      },
    };

    if (
      routes.length === 0 ||
      (options.http_options || {})._http_force_load ||
      !waiting_one_route
    ) {
      initHttp();
    }
  }

  reload(callback, callbackForKey) {
    // eslint-disable-next-line array-callback-return
    Object.keys(this.sources).map(key => {
      if (!this.sources[key]) {
        // eslint-disable-next-line array-callback-return
        return;
      }
      this.sources[key].http_loading = true;
      this.load(
        (this.sources[key] || {}).http_base_url,
        this.sources[key].http_options,
        undefined,
        undefined,
        res => {
          if (this.sources[key]) {
            this.sources[key].http_loading = false;
            this.sources[key].did_first_load = true;
          }
          this.did_load_first_time[key] = true;
          if (callback && key === callbackForKey) callback(res);
        },
      );
    });
  }

  removeSource(_key) {
    var key = _key;
    if (!this.sources[key]) {
      return;
    }
    if (this.sources_to_be_removed_timeout[key]) {
      clearTimeout(this.sources_to_be_removed_timeout[key]);
    }
    this.sources_to_be_removed_timeout[key] = setTimeout(() => {
      // eslint-disable-next-line no-unused-vars
      var options = this.sources[key];
      this.sources[key].websockets.forEach(websocket => {
        this.unsubscribe(websocket.uri);
      });
      delete this.sources_on_event[key];
      delete this.sources[key];
    }, 10000);
  }

  sourceLoad(source_key, _options, callback) {
    if (!this.sources[source_key]) {
      return;
    }
    this.sources[source_key].http_loading = true;
    var options = {};
    Object.keys(this.sources[source_key].http_options).forEach(key => {
      options[key] = this.sources[source_key].http_options[key];
    });
    Object.keys(_options).forEach(key => {
      options[key] = _options[key];
    });
    this.load(
      (this.sources[source_key] || {}).http_base_url,
      options,
      options.offset || 0,
      options.limit || 0,
      res => {
        if (this.sources[source_key]) {
          this.sources[source_key].http_loading = false;
        }
        callback(res);
      },
    );
  }

  /**
   *
   * @param id resource identifier
   * @param whenNotFound an optional function to be called when resource is not found
   * @returns
   */
  find(id, whenNotFound = null) {
    const result = this.known_objects_by_id[id];

    if (!result && whenNotFound) {
      typeof whenNotFound === 'function' && whenNotFound(id);
    }

    return result;
  }

  findByFrontId(front_id) {
    return this.known_objects_by_front_id[front_id];
  }

  findBy(filters, orders) {
    var res = Object.keys(this.known_objects_by_front_id)
      .filter(fid => {
        if (this.known_objects_by_front_id[fid]._deleted) {
          return false;
        }
        var hidden = false;
        Object.keys(filters).forEach(filter_key => {
          var expected = filters[filter_key];
          if (expected !== undefined) {
            if (this.known_objects_by_front_id[fid][filter_key] !== expected) {
              hidden = true;
            }
          }
        });
        return !hidden;
      })
      .map(fid => {
        return this.known_objects_by_front_id[fid];
      });

    if (orders) {
      res.sort((a, b) => {
        var is_desc = false;
        var key_to_compare = false;
        Object.keys(orders).forEach(order_key => {
          if (!key_to_compare && a[order_key] !== b[order_key]) {
            is_desc = orders[order_key] === 'DESC';
            key_to_compare = order_key;
          }
        });

        if (!key_to_compare) {
          return 0;
        }

        if (typeof a[key_to_compare] === 'number') {
          if (is_desc) {
            return b[key_to_compare] - a[key_to_compare];
          }
          return a[key_to_compare] - b[key_to_compare];
        }

        if (is_desc) {
          return (b[key_to_compare] || '').localeCompare(a[key_to_compare] || '');
        }
        return (a[key_to_compare] || '').localeCompare(b[key_to_compare] || '');
      });
    }

    return res;
  }

  /** setMin
   * min_object: {key: id, value: 13} or just 13
   * set interval min for loading objects and reload new objects if interval changed and did subscribe
   */
  setMin(min_object, reload) {
    this.min_object = min_object;
    this._last_get_generated_list = undefined;

    if (this.didSubscribe && reload) {
      this.load();
    }

    return;
  }

  /** setMax
   * max_object: {key: id, value: 13} or just 13
   * set interval max for loading objects and reload new objects if interval changed and did subscribe
   */
  setMax(max_object, reload) {
    this.max_object = max_object;
    this._last_get_generated_list = undefined;

    if (this.didSubscribe && reload) {
      this.load();
    }

    return;
  }

  /** subscribe
   * Start subscription to collection and load collection
   */
  subscribe(collection_id, options, http_options, key) {
    this.didSubscribe = true;

    this.total_subscribe_by_route[collection_id] =
      (this.total_subscribe_by_route[collection_id] || 0) + 1;

    if (this.total_subscribe_by_route[collection_id] === 1) {
      var ws_identifier = collection_id || this.collection_id;
      // eslint-disable-next-line no-redeclare
      var options = options || this.options || {};
      this.connections.addConnection(ws_identifier, options, http_options, key);
      return true;
    }

    return false;
  }

  /** unsubscribe
   * Stop subscription to collection (stop realtime and auto reconnect)
   */
  unsubscribe(collection_id) {
    this.didSubscribe = false;

    this.total_subscribe_by_route[collection_id] =
      (this.total_subscribe_by_route[collection_id] || 0) - 1;

    if (this.total_subscribe_by_route[collection_id] <= 0) {
      var ws_identifier = collection_id || this.collection_id;
      this.connections.removeConnection(ws_identifier);
    }

    return;
  }

  /** load
   * Load collection from http
   */
  load(base_url, options, offset, limit, callback) {
    var data = {
      collection_id: this.collection_id,
      interval_min: this.min_object,
      interval_max: this.max_object,
      options: options,
    };

    var request_key = JSON.stringify([base_url, this.collection_id, options]);

    this.doing_http_request++;

    // eslint-disable-next-line no-redeclare
    var base_url = base_url || this.base_url;

    if (offset) data.options.offset = offset;
    if (limit) data.options.limit = limit;

    Api.post('/ajax/' + base_url + '/get', data, res => {
      if (res.data) {
        var res_list = this.loadData(request_key, res.data);

        if (callback) callback(res_list);
      }

      this.loading_first_get = false;
      this._last_get_generated_list = undefined;
      this.doing_http_request += -1;
      this.notify();

      this.updateCache();
    });
    return;
  }

  loadData(request_key, data) {
    var res_list = [];

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      item._loaded = true;
      item._loaded_from = request_key;
      this.completeObject(item, item.front_id);

      res_list.push(this.known_objects_by_id[item.id]);
    }

    Object.keys(this.known_objects_by_id).forEach(id => {
      var object = this.known_objects_by_id[id];
      if (
        object._cached &&
        !object._loaded &&
        (!object._cached_from || object._cached_from === request_key) &&
        (!object._loaded_from || object._loaded_from === request_key)
      ) {
        this.known_objects_by_id[object.id]._deleted = true;
        this.known_objects_by_front_id[object.front_id]._deleted = true;
      }
    });

    return res_list;
  }

  /** get
   * return list of objects
   */
  get(all) {
    //If nothing changed return last generated list
    if (
      this._last_get_generated_list &&
      this._last_get_count &&
      this._last_get_count === Object.keys(this.known_objects_by_front_id).length
    ) {
      return this._last_get_generated_list;
    }

    var new_last_get_generated_list = [];
    Object.keys(this.known_objects_by_front_id).forEach(front_id => {
      var obj = this.known_objects_by_front_id[front_id];

      //If in interval ?
      if (
        all ||
        (this.min_object &&
          obj[this.min_object.key || 'id'] > (this.min_object.value || this.min_object)) ||
        (this.max_object &&
          obj[this.max_object.key || 'id'] < (this.max_object.value || this.max_object))
      ) {
        new_last_get_generated_list.push(this.known_objects_by_front_id[front_id]);
      }
    });

    this._last_get_count = Object.keys(this.known_objects_by_front_id).length;
    this._last_get_generated_list = new_last_get_generated_list;

    return this._last_get_generated_list;
  }

  /** search
   * search: [{type: "contain", query: "", on: ["id", "date"]}, {type: "lower", query: "", on: "date"}]
   * types: contain, lower, greater, equal
   * return list of objects filtered
   */
  search(search, without_http) {
    if (!without_http && !this._doing_search && JSON.stringify(search) !== this._old_search) {
      this._old_search = JSON.stringify(search);
      this._doing_search = true;

      var data = {
        collection_id: this.collection_id,
        search: search,
      };

      this.doing_http_request++;

      Api.post('/ajax/' + this.base_url + '/search', data, res => {
        if (res.data) {
          res.data.forEach(item => {
            item._loaded = true;
            this.completeObject(item, item.front_id);
          });
        }

        this._doing_search = false;
        this.doing_http_request += -1;
        this.notify();
      });
    }

    var new_last_search_generated_list = [];
    Object.keys(this.known_objects_by_id).forEach(front_id => {
      var obj = this.known_objects_by_id[front_id];

      var filter_ok = true;

      search.every(filter => {
        if (filter.type === 'equal' && obj[filter.on] !== filter.query) {
          filter_ok = false;
          return false;
        }
        if (filter.type === 'lower' && obj[filter.on] > filter.query) {
          filter_ok = false;
          return false;
        }
        if (filter.type === 'greater' && obj[filter.on] < filter.query) {
          filter_ok = false;
          return false;
        }
        if (filter.type === 'contain') {
          var search_pool = '';
          if (typeof filter.on === 'object') {
            filter.on.forEach(key => {
              search_pool += ' ' + obj[key];
            });
          } else {
            // eslint-disable-next-line no-unused-vars
            search_pool = obj[filter.on];
          }
          filter_ok = false;
          return false;
        }
        return true;
      });

      if (filter_ok) {
        new_last_search_generated_list.push(this.known_objects_by_id[front_id]);
      }
    });
    this._last_get_count = Object.keys(this.known_objects_by_id).length;
    this._last_search_generated_list = new_last_search_generated_list;

    return this._last_search_generated_list;
  }

  /** edit
   * Get an editable object (view will be updated during edition because original object is modified)
   * return the requested object for edition
   */
  edit(object = null) {
    if (!object || !object.front_id) {
      object = {
        front_id: Number.unid(),
      };
      this.known_objects_by_front_id[object.front_id] = object;
    } else {
      object = this.known_objects_by_front_id[object.front_id];
      this.objects_original_saved_by_front_id[object.front_id] = this.clearObjectState(
        object,
        true,
      );
    }
    return object;
  }

  /** editCopy
   * Get a copy of the object for edition
   * return the requested object for edition
   */
  editCopy(object) {
    if (!object || !object.front_id) {
      object = {
        front_id: Number.unid(),
      };
    } else {
      object = this.clearObjectState(this.known_objects_by_front_id[object.front_id], true);
    }
    return object;
  }

  /** cancelEdit
   * If original object was modified, replace with original version before edition
   * return the original object
   */
  cancelEdit(object) {
    if (!object || !object.front_id) {
      return false;
    }
    if (!this.objects_original_saved_by_front_id[object.front_id]) {
      delete this.known_objects_by_front_id[object.front_id];
    } else {
      this.completeObject(
        this.objects_original_saved_by_front_id[object.front_id],
        object.front_id,
      );
      delete this.objects_original_saved_by_front_id[object.front_id];
    }

    this.notify();

    return this.known_objects_by_front_id[object.front_id];
  }

  /** save
   * Save object, add it if no id is requested
   * return the new object
   */
  save(object, source_key, callback = null) {
    var source = this.sources[source_key];
    var base_url = (source || {}).http_base_url || this.base_url;

    var data = {
      collection_id: this.collection_id,
      object: this.clearObjectState(object, true),
      type: this.object_type,
    };

    this.completeObject(object, object.front_id);

    if (this.waiting_to_save_by_front_id[object.front_id] && !object._retrying && !object._failed) {
      this.completeObject({}, object.front_id);
      this.object_buffer_add(object, 'save', source_key);
      this.notify();
      return;
    }

    var operation_time = new Date().getTime();
    this.known_objects_by_front_id[object.front_id].client_modification_time = operation_time;
    this.waiting_to_save_by_front_id[object.front_id] = JSON.parse(
      JSON.stringify(this.known_objects_by_front_id[object.front_id]),
    );
    this.doing_http_request++;
    this.completeObject({}, object.front_id);
    this.notify();

    var that = this;

    if (this.use_retry) {
      this.timeout_fail[object.front_id] = setTimeout(function () {
        that.retry(object);
      }, this.timer_send_fail);
    }

    if (base_url) {
      Api.post('/ajax/' + base_url + '/save', data, res => {
        if (res.data && res.data.object) {
          if (this.use_retry) {
            clearTimeout(that.timeout_fail[object.front_id]);
          }

          //Used for buffered delete
          if (res.data.object.id) {
            this.completeObject({ id: res.data.object.id }, res.data.object.front_id);
          }

          //Verify nothing more recent was done in the time interval
          if (
            this.waiting_to_delete_by_front_id[res.data.object.front_id] ||
            !(this.known_objects_by_front_id[res.data.object.front_id] || {})
              .client_modification_time ||
            (this.known_objects_by_front_id[res.data.object.front_id] || {})
              .client_modification_time <= operation_time
          ) {
            delete this.waiting_to_save_by_front_id[res.data.object.front_id];

            if (
              !this.waiting_to_delete_by_front_id[res.data.object.front_id] &&
              !this.objects_buffers_by_front_id[object.front_id]
            ) {
              res.data.object._loaded = true;
              res.data.object._retrying = false;
              res.data.object._failed = false;
              this.completeObject(res.data.object, res.data.object.front_id);
              that.updateCache();

              this.share(res.data.object);
              if (callback) callback(res.data.object);
            }
          }

          this.object_buffer_flush(res.data.object);
        } else {
          if (callback) {
            object._failed = true;
            object._updating = false;
            object._creating = false;
            this.completeObject({}, object);
            callback(object);
          }
        }

        this.doing_http_request += -1;
        this.notify();
      });
    }

    Object.keys(object).forEach(key => {
      //Remove keys only used for save
      if (key.startsWith('_once_')) {
        delete object[key];
      }
    });

    return object;
  }

  /** remove
   * Remove an object
   * return the removed object
   */
  remove(object, source_key, callback) {
    if (!this.known_objects_by_front_id[object.front_id]) {
      return;
    }

    var base_url = (this.sources[source_key] || {}).http_base_url || this.base_url;

    var data = {
      collection_id: this.collection_id,
      object: this.clearObjectState(object, true),
      type: this.object_type,
    };

    var operation_time = new Date().getTime();
    if (!this.waiting_to_delete_by_front_id[object.front_id]) {
      this.known_objects_by_front_id[object.front_id].client_modification_time = operation_time;
      this.waiting_to_delete_by_front_id[object.front_id] = JSON.parse(
        JSON.stringify(this.known_objects_by_front_id[object.front_id]),
      );
    }

    var deleted_front_id = object.front_id;
    delete this.known_objects_by_id[object.id];
    delete this.known_objects_by_front_id[object.front_id];

    this.doing_http_request++;
    this.notify();

    if (this.waiting_to_save_by_front_id[object.front_id]) {
      this.object_buffer_add(
        this.waiting_to_delete_by_front_id[object.front_id],
        'remove',
        source_key,
      );
      return;
    }

    Api.post('/ajax/' + base_url + '/remove', data, res => {
      var front_id = ((res.data || {}).object || {}).front_id || deleted_front_id;

      //Verify nothing more recent was done in the time interval
      if (
        !this.waiting_to_delete_by_front_id[front_id] ||
        this.waiting_to_delete_by_front_id[front_id].client_modification_time <= operation_time
      ) {
        delete this.waiting_to_save_by_front_id[front_id];
        delete this.waiting_to_delete_by_front_id[front_id];

        this.shareRemove(front_id);

        if (callback) callback();
      } else {
        console.log('operation cancelled because of operation time not ok');
      }

      this.doing_http_request += -1;
      this.notify();
    });

    return object;
  }

  /** getById
   * return the requested object if loaded
   */
  getById(id) {
    return this.known_objects_by_id[id];
  }

  /** getByFrontId
   * return the requested object if loaded
   */
  getByFrontId(front_id) {
    return this.known_objects_by_front_id[front_id];
  }

  /********** Private *********/

  //If object currently waiting http response, add to buffer
  object_buffer_add(object, action, http_key) {
    var front_id = object.front_id;
    if (
      this.objects_buffers_by_front_id[front_id] &&
      this.objects_buffers_by_front_id[front_id].action === 'remove'
    ) {
      return; //Cannot edit on virtually removed item
    }
    this.objects_buffers_by_front_id[front_id] = {
      object: object,
      action: action,
      http_key: http_key,
    }; //Replace old buffer by new action
  }

  //When an object finish http action, do buffer actions
  object_buffer_flush(object) {
    var front_id = object.front_id;
    var buffer =
      this.objects_buffers_by_front_id[front_id] || this.waiting_to_delete_by_front_id[front_id];
    if (!buffer) {
      return;
    }
    // eslint-disable-next-line no-redeclare
    var object = JSON.parse(JSON.stringify(buffer.object));
    if (!object.id) {
      object.id = (this.known_objects_by_front_id[front_id] || {}).id;
    }
    delete this.objects_buffers_by_front_id[front_id];
    if (buffer.action === 'remove') {
      this.remove(object, buffer.http_key);
    }
    if (buffer.action === 'save') {
      this.save(object, buffer.http_key);
    }
  }

  retry(object) {
    if (!this.use_retry) {
      return;
    }

    if (object._cached) {
      delete this.known_objects_by_id[object.id];
      delete this.known_objects_by_front_id[object.front_id];
      this.notify();
      return;
    }

    var that = this;
    if (!object._retrying) {
      // only one retry
      object._retrying = true;
      if (that.auto_retry) {
        if (object._creating) {
          that.save(object);
        } else if (object._updating) {
          // TODO: update
        }
      } else {
        that.completeObject(object, object.front_id);
        that.notify();
      }
    } else {
      object._retrying = false;
      object._failed = true;
      that.completeObject(object, object.front_id);
      if (!object._cached) {
        that.updateCache();
      }
      that.notify();
    }
  }

  //To use only on very specific cases !!!
  shareRemove(deleted_front_id) {
    this.connections.publish({
      client_id: this.client_id,
      action: 'remove',
      object_type: this.object_type,
      front_id: deleted_front_id,
    });
  }

  //To use only on very specific cases !!!
  share(object) {
    // eslint-disable-next-line no-redeclare
    var object = this.clearObjectState(object, true);
    Object.keys(object).forEach(key => {
      //Remove keys specific to user
      if (key.startsWith('_user_') || key.startsWith('_once_')) {
        delete object[key];
      }
    });

    this.connections.publish({
      client_id: this.client_id,
      action: 'save',
      object_type: this.object_type,
      object: object,
    });
  }

  ws_message(data) {
    if (data.client_id === this.client_id) {
      return;
    }
    if (data.action === 'remove') {
      var deleted_object = this.known_objects_by_front_id[data.front_id];
      if (deleted_object) {
        var deleted_id = deleted_object.id;
        delete this.known_objects_by_id[deleted_id];
        delete this.known_objects_by_front_id[data.front_id];
      }
    }
    if (data.action === 'save') {
      //Do not use other client object state
      this.clearObjectState(data.object);

      data.object._loaded = true;
      data.object._loaded_from_ws = true;
      this.completeObject(data.object, data.object.front_id);
    }
    if (data.action === 'event') {
      this.ws_events_callbacks.forEach(item => {
        item(data.data);
      });
    }
    this.notify();
  }

  publishWebsocket(data) {
    var _d = {
      action: 'event',
      data: data,
      client_id: this.client_id,
    };
    this.connections.publish(_d);
  }

  addWebsocketListener(callback) {
    this.ws_events_callbacks.push(callback);
  }

  removeWebsocketListener(callback) {
    this.ws_events_callbacks.forEach((item, i) => {
      if (item === callback) {
        delete this.ws_events_callbacks[i];
      }
    });
  }

  clearObjectState(object, copy) {
    if (copy) {
      object = JSON.parse(JSON.stringify(object));
    }

    delete object._created;
    delete object._deleted;
    delete object._updating;
    delete object._creating;
    delete object._persisted;
    delete object._cached;
    delete object._cached_from;
    delete object._loaded;
    delete object._loaded_from;
    delete object._retrying;
    delete object._failed;
    delete object._last_modified;
    delete object._loaded_from_ws;

    return object;
  }

  updateCache() {
    if (this.use_cache) {
      const collection_cache_key = this.base_url + '/' + this.collection_id;
      const collections_cache = this._getFromLocalStorage();

      collections_cache[collection_cache_key] = {
        objects: this.known_objects_by_front_id,
        last_updated: new Date().getTime(),
      };
      LocalStorage.setItem('collections_cache', collections_cache);
    }
  }

  retrieveCache() {
    let that = this;
    let changes = false;
    const collections_cache = this._getFromLocalStorage();
    const collection_cache_key = this.base_url + '/' + this.collection_id;

    //Read all cached lists and remove too old caches
    Object.keys(collections_cache).forEach(item_key => {
      var item = collections_cache[item_key];
      if (
        new Date().getTime() - item.last_updated > 20 * 24 * 60 * 60 * 1000 || //more than 20 days
        (item_key === collection_cache_key && !this.use_cache) //Cache disabled but present in collection cache
      ) {
        //Remove cache data
        delete collections_cache[item_key];
        changes = true;
      }
      Object.values(item.objects).forEach(itemOfList => {
        if (itemOfList._failed || itemOfList._retrying) {
          that.retry(itemOfList);
        }
      });
    });

    if (changes) {
      LocalStorage.setItem('collections_cache', collections_cache);
    }

    if (this.use_cache && collections_cache[collection_cache_key]) {
      var objects = collections_cache[collection_cache_key].objects;
      Object.keys(objects).forEach(front_id => {
        var item = objects[front_id];
        // this.clearObjectState(item);
        item._cached = true;
        item._loaded = false;
        item._cached_from = item._loaded_from;
        item._loaded_from = null;
        this.completeObject(item, item.front_id);
      });
      this._last_get_generated_list = undefined;
      this.notify();
    }
  }

  _getFromLocalStorage() {
    let collections_cache = LocalStorage.getItem('collections_cache');

    if (!collections_cache) {
      collections_cache = {};
    }
    if (typeof collections_cache === 'string') {
      collections_cache = JSON.parse(collections_cache);
    }

    return collections_cache;
  }

  updateObject(updated, front_id) {
    var el = this.completeObject(updated, front_id);
    this.notify();
    this.updateCache();
    return el;
  }

  removeObject(front_id) {
    var obj = this.known_objects_by_front_id[front_id];
    if (obj) {
      var id = obj.id;
      delete this.known_objects_by_id[id];
      delete this.known_objects_by_front_id[front_id];
    }
  }

  completeObject(updated, front_id) {
    if (!updated) {
      return;
    }

    if (!front_id) {
      front_id = updated.front_id;
    }

    if (!front_id && !updated.front_id && updated.id && this.known_objects_by_id[updated.id]) {
      front_id = this.known_objects_by_id[updated.id].front_id;
    }

    if (!updated.front_id && !front_id && updated.id) {
      updated.front_id = updated.id;
      front_id = updated.front_id;
    }

    var that = this;
    if (!that.known_objects_by_front_id[front_id]) {
      that.known_objects_by_front_id[front_id] = {};
    }
    if (!that.known_objects_by_id[updated.id] && updated.id) {
      that.known_objects_by_id[updated.id] = that.known_objects_by_front_id[front_id];
      that.known_objects_by_front_id[front_id].id = updated.id;
    }

    that.known_objects_by_front_id[front_id]._created =
      !!that.known_objects_by_front_id[front_id].id; //Created (has an id)
    that.known_objects_by_front_id[front_id]._updating = !!(
      that.known_objects_by_front_id[front_id].id &&
      (that.waiting_to_save_by_front_id[front_id] ||
        (that.objects_buffers_by_front_id[front_id] &&
          that.objects_buffers_by_front_id[front_id].action === 'save'))
    ); //There is modifications sent to server but waiting confirmation
    that.known_objects_by_front_id[front_id]._creating = !!(
      !that.known_objects_by_front_id[front_id].id && that.waiting_to_save_by_front_id[front_id]
    ); //Object just created and sent to server but waiting confirmation
    that.known_objects_by_front_id[front_id]._persisted = !!(
      that.known_objects_by_front_id[front_id].id &&
      !that.waiting_to_delete_by_front_id[front_id] &&
      !that.waiting_to_save_by_front_id[front_id] &&
      !that.objects_buffers_by_front_id[front_id]
    ); //Persisted (no modification waiting to persist)
    that.known_objects_by_front_id[front_id]._last_modified = new Date();
    that.known_objects_by_front_id[front_id]._deleted = false;

    Object.keys(updated).forEach(key => {
      that.known_objects_by_front_id[front_id][key] = updated[key];
    });

    return that.known_objects_by_front_id[front_id];
  }

  shouldNotify(node, listen_only = false) {
    var update = true;
    if (
      node._observable &&
      node._observable[this.observableName] &&
      node._observable[this.observableName].listen_only
    ) {
      listen_only = node._observable[this.observableName].listen_only;
    }
    update = false;
    if (listen_only.length === 0) {
      update = true;
    } else {
      // eslint-disable-next-line array-callback-return
      listen_only.map(item => {
        if (this.known_objects_by_id[item]) {
          item = this.known_objects_by_id[item].front_id || item;
        }
        if (!this.known_objects_by_front_id[item]) {
          update = true;
        } else if (
          !this._last_modified[item] ||
          !this.known_objects_by_front_id[item]._last_modified ||
          typeof this.known_objects_by_front_id[item]._last_modified.getTime !== 'function' ||
          typeof this._last_modified[item].getTime !== 'function' ||
          this.known_objects_by_front_id[item]._last_modified.getTime() >
            this._last_modified[item].getTime()
        ) {
          setTimeout(
            () => (this._last_modified[item] = this.known_objects_by_front_id[item]._last_modified),
            100,
          );
          update = true;
        }
      });
    }
    return update;
  }
}
