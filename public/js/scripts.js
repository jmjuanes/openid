//Send the form
function sendForm(id) {
    return document.getElementById(id).click();
}

//Show element
function hideElement(id) {
    document.getElementById(id).style.display = "none";
}

//Hide element
function showElement(id) {
    if(id == 'modal')
        document.getElementById(id).style.display = "flex";
    else
    document.getElementById(id).style.display = "block";
}

//Check the url from the add application route
function checkUrl(url, id) {
    url = document.getElementById(url).value;
    if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)
        sendForm(id);
    else
        console.log("Muy buenas tardes")
}

//Check the status of a switch and change its label and tab
function checkSwitch(id) {
    var label = id + '-label';
    if (document.getElementById(id).checked) {
        document.getElementById(label).classList.remove('dashboard-text-disabled')
    }
    else {
        document.getElementById(label).classList.add('dashboard-text-disabled');
    }
}
