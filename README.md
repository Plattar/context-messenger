<h3 align="center">
  <img src="graphics/logo.png?raw=true" alt="Plattar Logo" width="600">
</h3>

[![install size](https://packagephobia.com/badge?p=@plattar/context-messenger)](https://packagephobia.com/result?p=@plattar/context-messenger)
[![Minified](https://badgen.net/bundlephobia/min/@plattar/context-messenger)](https://bundlephobia.com/result?p=@plattar/context-messenger)
[![MinZipped](https://badgen.net/bundlephobia/minzip/@plattar/context-messenger)](https://bundlephobia.com/result?p=@plattar/context-messenger)
[![NPM](https://img.shields.io/npm/v/@plattar/context-messenger)](https://www.npmjs.com/package/@plattar/context-messenger)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/95f7fb8235314e93b2f462e13dfb4034)](https://app.codacy.com/gh/Plattar/context-messenger?utm_source=github.com&utm_medium=referral&utm_content=Plattar/context-messenger&utm_campaign=Badge_Grade)
[![License](https://img.shields.io/npm/l/@plattar/context-messenger)](https://www.npmjs.com/package/@plattar/context-messenger)

_context-messenger_ allows defining and calling functions and variables across multiple iframes.

### _Quick Use_

* ES2019 Builds via [jsDelivr](https://www.jsdelivr.com/)

```javascript
// Minified Version (Latest)
https://cdn.jsdelivr.net/npm/@plattar/context-messenger/build/es2019/plattar-context-messenger-min.js

// Non Minified Version (Latest)
https://cdn.jsdelivr.net/npm/@plattar/context-messenger/build/es2019/plattar-context-messenger.js
```

* ES2015 Builds via [jsDelivr](https://www.jsdelivr.com/)

```javascript
// Minified Version (Latest)
https://cdn.jsdelivr.net/npm/@plattar/context-messenger/build/es2015/plattar-context-messenger-min.js

// Non Minified Version (Latest)
https://cdn.jsdelivr.net/npm/@plattar/context-messenger/build/es2015/plattar-context-messenger.js
```

### _Installation_

-   Install using [npm](https://www.npmjs.com/package/@plattar/context-messenger)

```console
npm install @plattar/context-messenger
```

### _Examples_

-   Instructions on how to run example code in [Examples Folder](https://github.com/Plattar/context-messenger/tree/master/examples)

### _How to execute functions from an iframe on the parent page_

-   Define a function in the parent page that executes and returns a result

This function will then become available to be executed from other _context-messenger_ frameworks from either the parent or child iframes.

```javascript
Plattar.messenger.self.sum = (arg1, arg2) => {
  return arg1 + arg2;
};
```

From within the iframe itself that has the _context-messenger_ framework, the above function can be executed as follows. Notice that the function is executed asynchronously and handled via a Promise chain. 

```javascript
Plattar.messenger.parent.sum(1,4).then((result) => {
  console.log(result); // this will print 5
}).catch((err) => {
  console.error(err);
});
```

-   Define a function in the current context that executes and returns a result asynchronously

The _context-messenger_ framework can also handle asynchronous functions using Promises. Below we define a function that performs a sum asynchronously.

```javascript
Plattar.messenger.self.sumDelayed = (arg1, arg2) => {
  // perform the sum after 3 seconds and return the result
  return new Promise((accept, reject) => {
    setTimeout(() => {
      accept(arg1 + arg2);
    }, 3000);
  });
};
```

From within an iframe itself that has the _context-messenger_ framework, the above function can be executed as follows. Notice that nothing changes with the function execution and the results are still handled using a Promise chain. In this instance, the Promise will execute after 3 seconds.

```javascript
Plattar.messenger.parent.sumDelayed(1,4).then((result) => {
  console.log(result); // this will print 5 after 3 seconds
}).catch((err) => {
  console.error(err);
});
```

### _How to execute functions from the parent page inside of the iframe_

-   Define an iframe on the parent page that has the _context-messenger_ framework and provide some ID

```html
<iframe id="frame1" src="./your-nested-page.html"></iframe>
```

-   Define a function inside _your-nested-page.html_ file using the _context-messenger_ that returns the page background color

```javascript
Plattar.messenger.self.getBackgroundColor = () => {
  return document.body.style.backgroundColor;
};
```

-   To execute the function inside of _frame1_ do the following

```javascript
Plattar.messenger.frame1.getBackgroundColor().then((result) => {
  console.log(result); // prints the background color of the iframe
}).catch((err) => {
  console.error(err);
});
```

_context-messenger_ is designed to automatically initialise itself from other instances of _context-messenger_ that exist inside iframes and/or the parent page. Because this process is asynchronous, sometimes the iframe is not ready before calling its functions. To fix this, listen for the onload event for your desired iframe as follows.

```javascript
Plattar.messenger.onload("frame1", () => {
  // iframe with ID of frame1 has finished loading. If this is not called
  // then the iframe might not have a Messenger framework
});
```

The same can be done for the parent page to ensure its loaded before iframes can call parent functions

```javascript
Plattar.messenger.onload("parent", () => {
  // the parent page has finished loading. If this is not called
  // then the page might not have a parent page or the parent does not
  // have a Messenger framework
});
```

### _How to execute functions from the parent page inside of multiple iframes_

-   Define multiple iframes on the parent page that has the _context-messenger_ framework and provide some ID

```html
<iframe id="frame1" src="./your-nested-page.html"></iframe>
<iframe id="frame2" src="./your-nested-page.html"></iframe>
<iframe id="frame3" src="./your-nested-page.html"></iframe>
```

-   Define a function inside _your-nested-page.html_ file using the _context-messenger_ that returns the page background color

```javascript
Plattar.messenger.self.getBackgroundColor = () => {
  return document.body.style.backgroundColor;
};
```

Sometimes its easier to just call the same function on all available iframes on the page at the same time. The _context-messenger_ provides a broadcast functinality that can handle the function call and resolution for you.

```javascript
// broadcast will call getBackgroundColor() on frame1, frame2 and frame3 automatically.
// the Promise will resolve when all iframes resolve or fail the function call
Plattar.messenger.broadcast.getBackgroundColor().then((results) => {
  // results contains the returned data from all 3 iframes
  results.forEach((result) => {
    if (result.status == "fulfilled") {
      console.log(result.value); // prints the returned color 
    }
  });
});
```

For more details on how this is handled see [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

### _How to store and read variables from iframes_

Storing of variables is done using _context-messenger_ `memory` module. All variables are available to be accessed in all contexts. Note that the memory module does not allow storing functions. Use messenger module for that.

-   To store a temporary variable use the following. Temporary variables are not persistent
 and will be cleared when the javascript context ends.

```javascript
Plattar.memory.temp.my_variable = "hello world!";
```

-   Access the variable as follows from any context that has _context-messenger_

```javascript
console.log(Plattar.memory.temp.my_variable); // prints hello world!
```

-   To store a persistent variable use the following. Persistent memory uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) behind the scenes.

```javascript
Plattar.memory.perm.my_variable = "hello world!";
```

-   Access the variable as follows from any context that has _context-messenger_

```javascript
console.log(Plattar.memory.perm.my_variable); // prints hello world!
```

### _How to watch for variable changes_

_context-messenger_ `memory` module provides a `watch` function that allows detecting when the variable has changed.

-   Watch a `temp` or `perm` variable example

```javascript

// watch temp variable changes for my_temp_variable
Plattar.memory.temp.watch("my_temp_variable", (oldVar, newVar) => {
  console.log("old variable was " + oldVar);
  console.log("new variable was " + newVar);
});

// watch perm variable changes for my_perm_variable
Plattar.memory.perm.watch("my_perm_variable", (oldVar, newVar) => {
  console.log("old variable was " + oldVar);
  console.log("new variable was " + newVar);
});

// set initial variables
Plattar.memory.temp.my_temp_variable = "hello world!";
Plattar.memory.perm.my_perm_variable = "hello world!";

// initiate a variable change
Plattar.memory.temp.my_temp_variable = "hello world again!";
Plattar.memory.perm.my_perm_variable = "hello world again!";
```
