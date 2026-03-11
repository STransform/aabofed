const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:8080/api/v1/transactions/translations/dynamic?lang=en');
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Response data:", e.response.data);
        }
    }
}

test();
