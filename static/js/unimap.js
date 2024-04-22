"use strict";
define("unimap", ["core/variables", "core/initialization"], function (
  UniMap, // This is unimap/variables: Importing module to populate global UniMap Obj with essential variables
  initialization, // Handles map initialization, loads dependencies, and augments the UniMap with functions and listeners.
) {
  UniMap.needReinit = false;
  initialization(UniMap);

  return UniMap;
});
