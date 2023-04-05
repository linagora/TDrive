import Api from 'app/features/global/framework/api-service';
import ws from 'app/deprecated/websocket/websocket.js';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
/** SecuredConnection
 * Create websockets encrypted connection
 */
import Globals from 'app/features/global/services/globals-tdrive-app-service';

export default class SecuredConnection {
  constructor(route, options, callback, http_options, collectionId) {
    this.ready = false;
    this.collectionId = collectionId;

    this.route = route;
    this.options = options;

    this.callback = callback;

    //Room idea
    this.websocket_id = '';

    //Store keys
    this.keys = [];
    this.keys_by_version = {};
    this.publish_buffer = [];
    this.http_options = http_options;

    this.init(http_options);

    Globals.window.CryptoAES = CryptoJS.AES;
  }

  init(http_options) {
    this.ready = false;

    this.options.get_options = http_options;

    var data = {
      collection_id: this.route,
      options: this.options,
      _grouped: true,
    };
    Api.GroupedQueryApiPost('/ajax/core/collections/init', data, res => {
      var did_get = false;

      if (res.data) {
        var data = res.data;
        this.ready = true;
        this.websocket_id = data.room_id;
        this.receiveNewKey(data.key, data.key_version, false);
        this.open();

        if (data.get) {
          this.callback('get', { collectionId: this.collectionId, data: data.get });
          did_get = true;
        }
      }

      if (!did_get) {
        this.callback('init', {});
      }
    });
  }

  open() {
    var websocket_id = this.websocket_id;
    ws.subscribe(
      'collections/' + websocket_id,
      (uri, obj) => {
        this.receiveEvent(obj);
      },
      websocket_id,
    );
    ws.onReconnect(websocket_id, () => {
      this.close();
      this.init();
    });

    this.callback('open', {});
    this.publish();
  }

  close() {
    var websocket_id = this.websocket_id;
    ws.offReconnect(websocket_id);
    ws.unsubscribe(
      'collections/' + websocket_id,
      (uri, obj) => {
        this.receiveEvent(obj);
      },
      websocket_id,
    );

    this.callback('close', {});
  }

  publish(data, callback) {
    if (!data) {
      //Read buffer

      var publish_buffer = JSON.parse(JSON.stringify(this.publish_buffer));
      this.publish_buffer = [];

      publish_buffer.forEach(item => {
        this.publish(item, callback);
      });

      return;
    }

    if (!this.ready) {
      this.publish_buffer.push(data);
      return;
    }

    var websocket_id = this.websocket_id;
    var encrypted = this.encrypt(data);
    ws.publish('collections/' + websocket_id, encrypted);

    if (callback) {
      callback();
    }
  }

  receiveEvent(event) {
    if (event.encrypted) {
      event = this.decrypt(event);
    }

    if (event.new_key) {
      this.receiveNewKey(event.new_key, event.key_version, true);
      return;
    }

    if (!event) {
      return;
    }

    this.callback('event', event);
  }

  //Receive new key as addon for previous key or as replacing key (sent by php server)
  receiveNewKey(key, version, asAddon) {
    if (asAddon) {
      var lastKey = this.keys[this.keys.length - 1];
      key = sha256(lastKey.key + key).toString(); //Mix keys
    }

    this.keys.push({
      key: key,
      version: version,
    });
    this.keys_by_version[version] = key;

    this.prepareEncryptKey();
  }

  prepareEncryptKey() {
    var lastKey = this.keys[this.keys.length - 1];

    try {
      if (this.prepared_key_original !== lastKey) {
        this.prepared_key_salt = CryptoJS.lib.WordArray.random(256);
        this.prepared_key_original = lastKey;
        this.prepared_key = CryptoJS.PBKDF2(lastKey.key, this.prepared_key_salt, {
          hasher: CryptoJS.algo.SHA512,
          keySize: 64 / 8,
          iterations: 9,
        });
      }
    } catch (e) {
      console.log(e);
    }

    return this.prepared_key;
  }

  encrypt(data) {
    var lastKey = this.keys[this.keys.length - 1];
    var prepared_key = this.prepareEncryptKey();
    if (!prepared_key) {
      prepared_key = '';
    }
    var iv = CryptoJS.lib.WordArray.random(16);

    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), prepared_key, { iv: iv });

    // eslint-disable-next-line no-redeclare
    var data = {
      encrypted: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
      iv: CryptoJS.enc.Hex.stringify(iv),
      salt: CryptoJS.enc.Hex.stringify(this.prepared_key_salt),
      key_version: lastKey.version,
    };

    return data;
  }

  decrypt(data) {
    if (!data.key_version) {
      return false;
    }
    let res = '';
    let str = '';
    try {
      if (data.public) {
        return typeof data.public === 'string' ? JSON.parse(data.public) : data.public;
      }

      var encrypted_data = data.encrypted;

      var key = this.keys_by_version[data.key_version];

      if (!key) {
        if (
          this.getKeyTimestamp(key) > this.getKeyTimestamp(this.keys[this.keys.length - 1].version)
        ) {
          //We have a old key, we have to update and request the message again
          this.init(this.http_options);
          //TODO reask lost message after init
        } else {
          //We have only newer keys, ask everybody to update
          //TODO ws.publish('collections/' + websocket_id, encrypted);
        }
        return false;
      }

      var salt = CryptoJS.enc.Hex.parse(data.salt);
      var prepared_key = CryptoJS.PBKDF2(key, salt, {
        hasher: CryptoJS.algo.SHA512,
        keySize: 64 / 8,
        iterations: 9,
      });

      var iv = CryptoJS.enc.Hex.parse(data.iv);
      var bytes = CryptoJS.AES.decrypt(encrypted_data, prepared_key, { iv: iv });
      str = bytes.toString(CryptoJS.enc.Utf8);

      if (str) {
        res = JSON.parse(str);
      } else {
        res = '';
      }
    } catch (err) {
      console.error('Unable to read encrypted websocket event', str, err.message);
    }

    return res;
  }

  getKeyTimestamp(key) {
    try {
      if (typeof key !== 'string') {
        if (key !== undefined) {
          console.log('wrong websocket key format: ', key);
        }
        return 0;
      }
      return parseInt((key || '').split('-')[1]);
    } catch (e) {
      console.log(key, e);
    }
  }
}
