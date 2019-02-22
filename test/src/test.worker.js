
console.log('Worker file loaded.');

self.postMessage({ foo: 'foo' })

self.addEventListener('message', (event) => {
  console.log('Received message:', event.data);
});
