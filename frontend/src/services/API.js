const API = async (URL, headers) => {
    // TODO : 
    // should return a promise that fetch data from the URL using the headers provided
    // should return the response as JSON
    // should handle the error if the request failed and return the error message
    // should use async/await to handle the promise returned by fetch
    // should use try/catch to handle the error

    try {
        const response = await fetch(URL, headers);
        return response.json();
    } catch (error) {

    }
}



// TODO :

    // shoud use URL object to create URL SRC: https://developer.mozilla.org/en-US/docs/Web/API/URL

    // should use fetch API to make the request , read more about fetch [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API ], [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch]

    // should use async/await to handle the promise returned by fetch