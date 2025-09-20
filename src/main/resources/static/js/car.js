document.getElementById('carForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        make: document.getElementById('make').value,
        model: document.getElementById('model').value,
        year: parseInt(document.getElementById('year').value)
    };

    fetch('/cars', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(car => alert('Car added: ' + car.make + ' ' + car.model))
        .catch(error => console.error('Error:', error));
});
