import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('React test module loaded');
console.log('React:', React);
console.log('ReactDOM:', ReactDOM);

// Test if we can create a simple element
const testElement = React.createElement('div', null, 'Test');
console.log('Test element created:', testElement);

export { React, ReactDOM };