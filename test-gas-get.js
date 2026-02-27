const target = 'https://script.google.com/macros/s/AKfycbwo-UtGP7g7AXnQ5lKwzqVK_dn-b5JDdJP-8wG_m4Qn1C9NoGftJEkJABBD9SxT1u_J/exec';
const testGet = async (type) => {
    try {
        const urlToFetch = `${target}?action=get&type=${type}`;
        const res = await fetch(urlToFetch);
        const text = await res.text();
        console.log(`GET response for ${type}:`);
        try {
            const data = JSON.parse(text);
            if (data.data && data.data.length > 0) {
                console.log(data.data[0]); // Print first row to see structure
            } else {
                console.log('No data or empty returned.', data);
            }
        } catch (e) {
            console.log('Not JSON:', text.substring(0, 100));
        }
    } catch (e) {
        console.error(e);
    }
}

testGet('MasterList');
