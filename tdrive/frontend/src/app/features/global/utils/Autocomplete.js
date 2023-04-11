import Observable from 'app/deprecated/CollectionsV1/observable.js';

class Autocomplete extends Observable {
  constructor() {
    super();
    this.observableName = 'autocompleteService';
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    this.notify();
  }

  close() {
    this.isOpen = false;
    this.notify();
  }
}

const autocompleteService = new Autocomplete();
export default autocompleteService;
