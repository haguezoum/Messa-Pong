# ft_transcendence
ping pong online game with realtime chat ...


## Usage

### since JavaScript has no built-in sleep function to pause execution, you can use a global object called `sleep(<duration>)`

```javascript
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage example
async function example() {
    console.log('Start');
    await sleep(2000); // Sleep for 2000 milliseconds (2 seconds)
    console.log('End');
}

example();
```