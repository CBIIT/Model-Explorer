import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ReduxDataDictionary from './DataDictionary';
import reducers from './reducers'
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { getModelExploreData } from './DataDictionary/dictionaryController';

const version = {"commit":"913161064b02bcef024d072873e77c8c79cc1a68","dictionary":{"commit":"520a25999fd183f6c5b7ddef2980f3e839517da5","version":"0.2.1-9-g520a259"},"version":"4.0.0-44-g9131610"};

const findObjectWithRef = (obj, updateFn, root_key = '', level = 0) => {
  // iterate over the properties
  for (var propertyName in obj) {

    if ( level === 0 ) root_key = propertyName;

    if ( propertyName === '$ref' ) {
      obj['$ref'] = updateFn(obj['$ref'], root_key);
    }

    // any object that is not a simple value
    if (obj[propertyName] !== null && typeof obj[propertyName] === 'object') {
      // recurse into the object and write back the result to the object graph
      obj[propertyName] = findObjectWithRef(obj[propertyName], updateFn, root_key, (level + 1));
    }
  }
  
  return obj;
};

// unresolveable:
// {$ref: "_terms.yaml#/file_format"}
// {$ref: "#/UUID"}

async function init() {
  const store = createStore(reducers);

  const response = await getModelExploreData();

  await Promise.all(
    [
      store.dispatch({
        type: 'RECEIVE_DICTIONARY',
        data: response.data,
      }),
      store.dispatch({
        type: 'RECEIVE_VERSION_INFO',
        data: response.version
      })
    ],
  );

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <ReduxDataDictionary />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}


init();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
