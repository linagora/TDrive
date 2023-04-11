import React, { Component } from 'react';

import Observable from 'app/deprecated/CollectionsV1/observable.js';

/*
  Menus manager service, choose where to generate menu
*/
class AttributesManager extends Observable {
  constructor() {
    super();
    this.setObservableName('parameters_attributes');

    this.open = '';
  }
  toggle(id) {
    if (this.open == id) {
      this.open = '';
    } else {
      this.open = id;
    }
    this.notify();
  }
}

const service = new AttributesManager();
export default service;
