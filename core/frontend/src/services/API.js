/**
 * 
 * This will take the endpoint URL, method and headers as input and return the response as JSON
 * @param {string} URL 
 * @param {string} methode
 * @param {Object} headers 
 * @returns {Promise}
 */

const API = async (URL, metode="GET" ,headers={
    "Content-Type": "application/json",
    "Accept": "application/json"
    }) => {
    // const URL = new URL(URL, "http://localhost:3000"); // Param 1 : URL, Param 2 : Base URL
    try {
        const response = await fetch(URL, {
            method: metode,
            headers: headers
        });
        const data = await response.json();
        return data;

    } catch (error) {
        console.log(`Error on fetch : ${error.message}`);
    }
}

export default API;