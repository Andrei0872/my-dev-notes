
(function () {
    const $ = document.querySelector.bind(document);

    $("#form").addEventListener('submit', async e => {
        e.preventDefault();
    
        const data = {}
        for(let [key, value] of new FormData($("#form")).entries()) 
            data[key] = value;

        const req = fetch('/', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        });
        
        const res = await (await req).json();
        console.log(res)
    })
})(); 