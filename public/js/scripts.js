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
