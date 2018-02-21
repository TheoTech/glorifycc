'use strict';

import addOrDeleteButton from './addOrDeleteButton';
import libraryTable from './libraryTable';
import prop from 'mithril/stream';

// HACK
if (window.inLibraryRaw) {
  window.inLibrary = prop(window.inLibraryRaw);
}

export { addOrDeleteButton, libraryTable };
