'use strict';

import addOrDeleteButton from './addOrDeleteButton';
import prop from 'mithril/stream';

// HACK
if (window.inLibraryRaw) {
  window.inLibrary = prop(window.inLibraryRaw);
}

export default { addOrDeleteButton };
