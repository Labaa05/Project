const headerPlaceHolder = document.getElementById("header-placeholder");
fetch("/components/header.html").then(res =>{
    return res.text();
}).then(html=>{
    headerPlaceHolder.innerHTML = html;
});

const footerPlaceHolder = document.getElementById("footer-placeholder");
fetch("/components/footer.html").then(res =>{
    return res.text();
}).then(html=>{
    footerPlaceHolder.innerHTML = html;
});

