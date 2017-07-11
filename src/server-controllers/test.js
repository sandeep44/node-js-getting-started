/*
This file contains any server side modules needed.
*/

module.exports = {
// Returns Hello World to the Autheicted Routes File when it is called
  test: () => {
    return new Promise((resolve) => {
      const hello = 'Hello World';
      console.log(hello);
      resolve(hello);
    });
  },
};
