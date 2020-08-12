let db;
const databaseName = 'budgetTracker';

const request = window.indexedDB.open(databaseName, 2);

request.onupgradeneeded = event => {
    console.log(request.result)
    const db = event.target.request;
    db.createObjectStore(databaseName, { autoIncrement: true }).createIndex('statusIndex', 'status');
};

request.onsuccess = event => {
    const version = request.result.version;
    console.log(`Created ${databaseName}; v.${version}0`);

    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    };
};

request.onerror = event => {
    console.log(`Error: ${event.target.errorCode}`)
};

function checkDatabase() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(
                response => response.json()
            ).then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear();
            }
            );
        }
    }
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    store.add(record)
};

window.addEventListener('online', checkDatabase);


